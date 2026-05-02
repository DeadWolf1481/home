const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'att-secret-2024';

// POST /api/drivers/login
router.post('/login', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const driver = await prisma.driver.findUnique({ where: { email } });
    if (!driver) return res.status(401).json({ error: 'Invalid credentials' });
    if (driver.status !== 'active') return res.status(403).json({ error: 'Account is not active' });
    const valid = await bcrypt.compare(password, driver.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: driver.id, role: 'driver', email: driver.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, driver: { id: driver.id, name: driver.name, email: driver.email } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/drivers/me — driver auth
router.get('/me', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const driver = await prisma.driver.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, email: true, phone: true, status: true } });
    if (!driver) return res.status(401).json({ error: 'Not found' });
    res.json(driver);
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

// GET /api/drivers/reservations — driver sees assigned reservations
router.get('/reservations', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    jwt.verify(token, JWT_SECRET);
    const reservations = await prisma.reservation.findMany({
      where: { status: 'approved' },
      include: { vehicle: true },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    res.json(reservations);
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

module.exports = router;
