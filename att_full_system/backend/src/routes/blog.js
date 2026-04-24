const router = require('express').Router();
const auth = require('../middleware/auth');

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const posts = await prisma.blog.findMany({ where, orderBy: { id: 'desc' } });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/:slug', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const post = await prisma.blog.findUnique({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { title, content, excerpt, image_url, status } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });
  try {
    const slug = slugify(title) + '-' + Date.now();
    const post = await prisma.blog.create({
      data: { title, slug, content, excerpt: excerpt || null, image_url: image_url || null, status: status || 'active' },
    });
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { title, content, excerpt, image_url, status } = req.body;
  try {
    const post = await prisma.blog.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(image_url !== undefined && { image_url }),
        ...(status && { status }),
      },
    });
    res.json(post);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.blog.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
