// tours.js
const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const tours = await prisma.tour.findMany({ where, orderBy: { id: 'desc' } });
    res.json(tours);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { name, description, duration, max_people, km_limit, price, status, image_url } = req.body;
  if (!name || !duration || !max_people || price === undefined)
    return res.status(400).json({ error: 'name, duration, max_people, price required' });
  try {
    const tour = await prisma.tour.create({
      data: {
        name, description: description || null,
        duration, max_people: parseInt(max_people),
        km_limit: km_limit ? parseInt(km_limit) : null,
        price: parseFloat(price),
        status: status || 'active',
        image_url: image_url || null,
      },
    });
    res.status(201).json(tour);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { name, description, duration, max_people, km_limit, price, status, image_url } = req.body;
  try {
    const tour = await prisma.tour.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(duration && { duration }),
        ...(max_people && { max_people: parseInt(max_people) }),
        ...(km_limit !== undefined && { km_limit: km_limit ? parseInt(km_limit) : null }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(status && { status }),
        ...(image_url !== undefined && { image_url }),
      },
    });
    res.json(tour);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.tour.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
