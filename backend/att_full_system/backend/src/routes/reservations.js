const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/reservations — admin only
router.get('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { customer_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, reservations] = await Promise.all([
      prisma.reservation.count({ where }),
      prisma.reservation.findMany({
        where,
        include: { vehicle: true },
        orderBy: { created_at: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
    ]);

    res.json({ total, page: parseInt(page), limit: parseInt(limit), data: reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reservations/:id — admin only
router.get('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const r = await prisma.reservation.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { vehicle: true },
    });
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/reservations/:id/status — admin only
router.put('/:id/status', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { status } = req.body;
  if (!['pending', 'approved', 'cancelled'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    const r = await prisma.reservation.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { vehicle: true },
    });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/reservations/:id — admin only
router.put('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { customer_name, email, phone, pickup_location, dropoff_location, date, status, notes, payment_method, price } = req.body;
  try {
    const r = await prisma.reservation.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(customer_name && { customer_name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(pickup_location && { pickup_location }),
        ...(dropoff_location && { dropoff_location }),
        ...(date && { date }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(payment_method && { payment_method }),
        ...(price !== undefined && { price: parseFloat(price) }),
      },
      include: { vehicle: true },
    });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/reservations/:id — admin only
router.delete('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.reservation.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
