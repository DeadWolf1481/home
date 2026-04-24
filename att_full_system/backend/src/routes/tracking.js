const router = require('express').Router();
const auth = require('../middleware/auth');

// POST /api/customers-tracking — public (called by frontend)
router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { session_id, current_step, last_action, metadata } = req.body;

  if (!session_id || !current_step)
    return res.status(400).json({ error: 'session_id and current_step required' });

  try {
    const existing = await prisma.customerTracking.findFirst({
      where: { session_id },
      orderBy: { created_at: 'desc' },
    });

    let record;
    if (existing) {
      record = await prisma.customerTracking.update({
        where: { id: existing.id },
        data: {
          current_step,
          last_action: last_action || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
        },
      });
    } else {
      record = await prisma.customerTracking.create({
        data: {
          session_id,
          current_step,
          last_action: last_action || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
        },
      });
    }

    res.json({ success: true, id: record.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/customers-tracking — admin only
router.get('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { page = 1, limit = 50, step } = req.query;
    const where = step ? { current_step: step } : {};

    const [total, records] = await Promise.all([
      prisma.customerTracking.count({ where }),
      prisma.customerTracking.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
    ]);

    // Parse metadata JSON
    const data = records.map(r => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : null,
    }));

    res.json({ total, data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
