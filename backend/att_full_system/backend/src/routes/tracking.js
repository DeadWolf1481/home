const router = require('express').Router();
const auth = require('../middleware/auth');

const MAX_RECORDS = 60;

function getRealIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '—';
}

async function getLocation(ip) {
  if (!ip || ip === '—' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') || ip === '::1') {
    return 'Local';
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`, {
      signal: AbortSignal.timeout(2000),
    });
    const data = await res.json();
    if (data.status === 'success') {
      return [data.city, data.country].filter(Boolean).join(', ');
    }
  } catch (e) {}
  return null;
}

// POST /api/customers-tracking — public
router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { session_id, current_step, last_action, metadata } = req.body;

  if (!session_id || !current_step)
    return res.status(400).json({ error: 'session_id and current_step required' });

  const realIP = getRealIP(req);

  try {
    const locationPromise = getLocation(realIP);
    const existing = await prisma.customerTracking.findFirst({
      where: { session_id },
      orderBy: { created_at: 'desc' },
    });
    const location = await locationPromise;

    const existingMeta = metadata ? (typeof metadata === 'object' ? metadata : {}) : {};
    const metaWithLocation = location ? { ...existingMeta, location } : existingMeta;

    const trackData = {
      current_step,
      last_action: last_action || null,
      metadata: Object.keys(metaWithLocation).length ? JSON.stringify(metaWithLocation) : null,
      ip_address: realIP,
      user_agent: req.headers['user-agent'] || null,
    };

    let record;
    if (existing) {
      record = await prisma.customerTracking.update({
        where: { id: existing.id },
        data: trackData,
      });
    } else {
      const count = await prisma.customerTracking.count();
      if (count >= MAX_RECORDS) {
        const oldest = await prisma.customerTracking.findMany({
          orderBy: { created_at: 'asc' },
          take: count - MAX_RECORDS + 1,
          select: { id: true },
        });
        await prisma.customerTracking.deleteMany({
          where: { id: { in: oldest.map(r => r.id) } },
        });
      }
      record = await prisma.customerTracking.create({
        data: { session_id, ...trackData },
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
    const { step } = req.query;
    const where = step ? { current_step: step } : {};
    const [total, records] = await Promise.all([
      prisma.customerTracking.count({ where }),
      prisma.customerTracking.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        take: MAX_RECORDS,
      }),
    ]);
    const data = records.map(r => {
      let meta = null, location = null;
      try { meta = r.metadata ? JSON.parse(r.metadata) : null; location = meta?.location || null; } catch(e) {}
      return { ...r, metadata: meta, location };
    });
    res.json({ total, data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
