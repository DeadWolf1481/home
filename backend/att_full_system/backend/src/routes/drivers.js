const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'att-secret-2024';

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

// GET /api/drivers/offers — unassigned approved reservations
router.get('/offers', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    verifyDriver(req);
    const rows = await prisma.$queryRaw`
      SELECT r.*, v.name as vehicle_name, v.price as vehicle_price
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.status = 'approved' AND (r.driver_id IS NULL)
      ORDER BY r.created_at DESC
      LIMIT 50`;
    res.json(rows);
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
    await prisma.$queryRaw`UPDATE reservations SET driver_id = ${decoded.id} WHERE id = ${id}`;
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

module.exports = router;
