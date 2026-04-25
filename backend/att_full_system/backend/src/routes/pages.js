const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const pages = await prisma.page.findMany();
    res.json(pages);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/:name', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const page = await prisma.page.findUnique({ where: { page_name: req.params.name } });
    if (!page) return res.status(404).json({ error: 'Not found' });
    res.json(page);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:name', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { title, content } = req.body;
  try {
    const page = await prisma.page.upsert({
      where: { page_name: req.params.name },
      update: { ...(title && { title }), ...(content && { content }) },
      create: { page_name: req.params.name, title: title || req.params.name, content: content || '' },
    });
    res.json(page);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
