const router = require('express').Router();
const auth = require('../middleware/auth');

const SETTINGS_KEY = 'general_settings';

const DEFAULT_SETTINGS = {
  company_name: 'BEKPEN ULUSLARARASI TURİZM TİCARET LİMİTED ŞİRKETİ',
  site_title: 'Airports Transfer Turkey | VIP Airport Transfer Service Istanbul',
  phone: '+90 544 102 1414',
  email: 'bekpenturizm@gmail.com',
  whatsapp: '+905441021414',
  address: 'Esenyalı Mah. Mezkur Sk. Nizamettin Otluoğlu Apt. NO:26 A Pendik / Istanbul',
  tursab: '14563',
  mersis: '0161095459600001',
};

async function getSettings(prisma) {
  try {
    const page = await prisma.page.findUnique({ where: { page_name: SETTINGS_KEY } });
    if (!page || !page.content) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(page.content) };
  } catch (e) { return DEFAULT_SETTINGS; }
}

async function saveSettings(prisma, data) {
  await prisma.page.upsert({
    where: { page_name: SETTINGS_KEY },
    update: { content: JSON.stringify(data) },
    create: { page_name: SETTINGS_KEY, title: 'General Settings', content: JSON.stringify(data) },
  });
}

// GET /api/settings
router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const settings = await getSettings(prisma);
    res.json(settings);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/settings
router.put('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const current = await getSettings(prisma);
    const updated = { ...current, ...req.body };
    await saveSettings(prisma, updated);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/settings/blog-pages — get all blog detail page contents
router.get('/blog-pages', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const pages = await prisma.page.findMany({
      where: { page_name: { startsWith: 'blog-detail-' } },
    });
    const result = {};
    pages.forEach(p => {
      const key = p.page_name.replace('blog-detail-', '');
      try { result[key] = JSON.parse(p.content); } catch(e) {}
    });
    res.json(result);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/settings/blog-pages/:key — get single blog page
router.get('/blog-pages/:key', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const page = await prisma.page.findUnique({
      where: { page_name: 'blog-detail-' + req.params.key },
    });
    if (!page) return res.json(null);
    res.json(JSON.parse(page.content || '{}'));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/settings/blog-pages/:key — save blog page
router.put('/blog-pages/:key', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const data = req.body;
    await prisma.page.upsert({
      where: { page_name: 'blog-detail-' + req.params.key },
      update: { content: JSON.stringify(data), title: data.title || req.params.key },
      create: { page_name: 'blog-detail-' + req.params.key, title: data.title || req.params.key, content: JSON.stringify(data) },
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;

// GET /api/settings/travel-tips — get all travel tips
router.get('/travel-tips', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const page = await prisma.page.findUnique({ where: { page_name: 'travel_tips' } });
    if (!page) return res.json([]);
    res.json(JSON.parse(page.content || '[]'));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/settings/travel-tips — save travel tips
router.put('/travel-tips', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.page.upsert({
      where: { page_name: 'travel_tips' },
      update: { content: JSON.stringify(req.body) },
      create: { page_name: 'travel_tips', title: 'Travel Tips', content: JSON.stringify(req.body) },
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
