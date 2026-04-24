const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/vehicles — public (used by frontend)
router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/vehicles — admin only
router.post('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { name, passenger_capacity, luggage_capacity, price, image_url, status } = req.body;
  if (!name || !passenger_capacity || !luggage_capacity)
    return res.status(400).json({ error: 'name, passenger_capacity, luggage_capacity required' });

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        passenger_capacity: parseInt(passenger_capacity),
        luggage_capacity: parseInt(luggage_capacity),
        price: parseFloat(price) || 0,
        image_url: image_url || null,
        status: status || 'active',
      },
    });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/vehicles/:id — admin only
router.put('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { name, passenger_capacity, luggage_capacity, price, image_url, status } = req.body;
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(passenger_capacity && { passenger_capacity: parseInt(passenger_capacity) }),
        ...(luggage_capacity && { luggage_capacity: parseInt(luggage_capacity) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(image_url !== undefined && { image_url }),
        ...(status && { status }),
      },
    });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/vehicles/:id — admin only
router.delete('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.vehicle.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
