const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'att-secret-2024';

function parseDriverDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)\s+(\d+):(\d+)/);
  if (match) {
    const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const month = months[match[2]];
    if (month !== undefined) {
      const d = new Date(parseInt(match[3]), month, parseInt(match[1]), parseInt(match[4]), parseInt(match[5]));
      if (!isNaN(d.getTime())) return d;
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function verifyDriver(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token');
  return jwt.verify(token, JWT_SECRET);
}

// POST /api/drivers/login
router.post('/login', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.role !== 'driver') return res.status(403).json({ error: 'Access denied' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: 'driver', email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, driver: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/drivers/me
router.get('/me', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const decoded = verifyDriver(req);
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, email: true, role: true } });
    if (!user || user.role !== 'driver') return res.status(401).json({ error: 'Not found' });
    res.json(user);
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

// GET /api/drivers/offers — unassigned approved reservations (more than 2 hours away)
router.get('/offers', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    verifyDriver(req);
    const rows = await prisma.$queryRaw`
      SELECT r.*, v.name as vehicle_name, v.price as vehicle_price
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.status = 'approved' AND r.driver_id IS NULL
      ORDER BY r.created_at DESC
      LIMIT 50`;

    // Filter out jobs that are less than 2 hours away
    const now = new Date();
    const filtered = rows.filter(r => {
      const tripDate = parseDriverDate(r.date);
      if (!tripDate) return true;
      const hoursUntil = (tripDate - now) / (1000 * 60 * 60);
      return hoursUntil > 0.5;
    });

    res.json(filtered);
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

// POST /api/drivers/offers/:id/accept — driver accepts a job
router.post('/offers/:id/accept', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const decoded = verifyDriver(req);
    const id = parseInt(req.params.id);
    // Check if already taken
    const rows = await prisma.$queryRaw`SELECT driver_id FROM reservations WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].driver_id) return res.status(409).json({ error: 'This job has already been taken' });
    // Assign driver
    await prisma.$queryRaw`UPDATE reservations SET driver_id = ${decoded.id}, driver_accepted_at = NOW() WHERE id = ${id}`;
    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Invalid token' || err.message === 'No token') return res.status(401).json({ error: 'Invalid token' });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/drivers/reservations — driver's accepted jobs
router.get('/reservations', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const decoded = verifyDriver(req);
    const rows = await prisma.$queryRaw`
      SELECT r.*, v.name as vehicle_name
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.driver_id = ${decoded.id}
      ORDER BY r.created_at DESC
      LIMIT 100`;
    res.json(rows);
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

// POST /api/drivers/reservations/:id/release — driver releases a job back to offers
router.post('/reservations/:id/release', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const decoded = verifyDriver(req);
    const id = parseInt(req.params.id);
    const rows = await prisma.$queryRaw`SELECT driver_id, status FROM reservations WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].driver_id !== decoded.id) return res.status(403).json({ error: 'Not your job' });
    if (rows[0].status === 'completed') return res.status(400).json({ error: 'Completed jobs cannot be released' });
    await prisma.$queryRaw`UPDATE reservations SET driver_id = NULL WHERE id = ${id}`;
    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Invalid token' || err.message === 'No token') return res.status(401).json({ error: 'Invalid token' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/drivers/earnings/reset — driver resets own earnings
router.post('/earnings/reset', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const decoded = verifyDriver(req);
    await prisma.$queryRaw`DELETE FROM driver_earnings WHERE driver_id = ${decoded.id}`;
    res.json({ success: true });
  } catch (err) { 
    console.error('Reset earnings error:', err.message);
    res.status(401).json({ error: err.message }); 
  }
});

// GET /api/drivers/earnings — driver's completed trip earnings
router.get('/earnings', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const decoded = verifyDriver(req);
    const rows = await prisma.$queryRaw`
      SELECT de.*, r.pickup_location, r.dropoff_location, r.date, r.reference
      FROM driver_earnings de
      LEFT JOIN reservations r ON de.reservation_id = r.id
      WHERE de.driver_id = ${decoded.id}
      ORDER BY de.earned_at DESC`;
    res.json(rows);
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

module.exports = router;
