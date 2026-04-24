const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order_num: 'asc' } });
    res.json(faqs);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { question, answer, order_num } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'question and answer required' });
  try {
    const faq = await prisma.faq.create({
      data: { question, answer, order_num: parseInt(order_num) || 0 },
    });
    res.status(201).json(faq);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { question, answer, order_num } = req.body;
  try {
    const faq = await prisma.faq.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(order_num !== undefined && { order_num: parseInt(order_num) }),
      },
    });
    res.json(faq);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.faq.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
