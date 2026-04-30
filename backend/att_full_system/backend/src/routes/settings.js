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

// GET /api/settings — public
router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const settings = await getSettings(prisma);
    res.json(settings);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/settings — admin only
router.put('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const current = await getSettings(prisma);
    const updated = { ...current, ...req.body };
    await saveSettings(prisma, updated);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
