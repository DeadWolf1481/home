const router = require('express').Router();
const auth = require('../middleware/auth');
const { sendContactReply } = require('../utils/mailer');

// POST /api/contact — public
router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { name, email, phone, subject, message, source } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ error: 'name, email, message required' });
  try {
    const msg = await prisma.contactMessage.create({
      data: { name, email, phone: phone || null, subject: subject || null, message, source: source || 'website' },
    });
    res.status(201).json({ success: true, id: msg.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/contact — admin only
router.get('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { created_at: 'desc' } });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/contact/:id/read — admin only
router.put('/:id/read', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const msg = await prisma.contactMessage.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'read' },
    });
    res.json(msg);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/contact/:id/reply — admin only
router.post('/:id/reply', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { replyText } = req.body;
  if (!replyText) return res.status(400).json({ error: 'replyText required' });
  try {
    const msg = await prisma.contactMessage.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    await sendContactReply(msg.email, msg.name, msg.subject || 'Your message', replyText);

    // Mark as read
    await prisma.contactMessage.update({
      where: { id: msg.id },
      data: { status: 'read' },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Reply mail error:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

// DELETE /api/contact/:id — admin only
router.delete('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.contactMessage.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
