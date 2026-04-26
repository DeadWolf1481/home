const router = require('express').Router();
const auth = require('../middleware/auth');

// In-memory store (replace with DB model later)
// For now uses a simple JSON approach via a Prisma Page entry
const PAGE_KEY = 'payment_links';

async function getLinks(prisma) {
  try {
    const page = await prisma.page.findUnique({ where: { page_name: PAGE_KEY } });
    if (!page || !page.content) return [];
    return JSON.parse(page.content);
  } catch (e) { return []; }
}

async function saveLinks(prisma, links) {
  await prisma.page.upsert({
    where: { page_name: PAGE_KEY },
    update: { content: JSON.stringify(links) },
    create: { page_name: PAGE_KEY, title: 'Payment Links', content: JSON.stringify(links) },
  });
}

// GET /api/payment-links
router.get('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const links = await getLinks(prisma);
    res.json(links);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/payment-links
router.post('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { amount, currency, customer_name, customer_phone, customer_email, link, notes } = req.body;
  if (!amount || !link) return res.status(400).json({ error: 'amount and link required' });
  try {
    const links = await getLinks(prisma);
    const newLink = {
      id: Date.now(),
      amount: parseFloat(amount),
      currency: currency || 'EUR',
      customer_name: customer_name || '',
      customer_phone: customer_phone || '',
      customer_email: customer_email || '',
      link,
      notes: notes || '',
      status: 'pending', // pending / paid / failed
      created_at: new Date().toISOString(),
      paid_at: null,
    };
    links.unshift(newLink);
    await saveLinks(prisma, links);
    res.status(201).json(newLink);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/payment-links/:id/status
router.put('/:id/status', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { status } = req.body;
  if (!['pending', 'paid', 'failed'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    const links = await getLinks(prisma);
    const idx = links.findIndex(l => String(l.id) === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    links[idx].status = status;
    if (status === 'paid') links[idx].paid_at = new Date().toISOString();
    await saveLinks(prisma, links);
    res.json(links[idx]);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/payment-links/:id
router.delete('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const links = await getLinks(prisma);
    const filtered = links.filter(l => String(l.id) !== req.params.id);
    await saveLinks(prisma, filtered);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
