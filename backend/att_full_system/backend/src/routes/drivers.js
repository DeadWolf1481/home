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
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, email: true, role: true } });
    if (!user || user.role !== 'driver') return res.status(401).json({ error: 'Not found' });
    res.json(user);
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

// GET /api/drivers/reservations
router.get('/reservations', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    jwt.verify(token, JWT_SECRET);
    const reservations = await prisma.reservation.findMany({
      include: { vehicle: true },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
    res.json(reservations);
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

module.exports = router;
