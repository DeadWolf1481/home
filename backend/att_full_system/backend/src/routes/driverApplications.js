const router = require('express').Router();
const auth = require('../middleware/auth');
const { Resend } = require('resend');

const resend = new Resend('re_QtVzdob1_CurncEBEbQPnAvEiNxZ9BNVX');
const FROM = 'Airports Transfer Turkey <onboarding@resend.dev>';

// POST /api/driver-applications — public (submit application)
router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const {
    full_name, email, phone,
    photo, id_front, id_back, license_front, license_back,
    criminal_record, residence_doc, tursab_doc, d2_doc,
    bank_name, bank_holder, bank_iban,
    car_front, car_right, car_left, car_back,
    car_interior_1, car_interior_2, car_interior_3, car_interior_4,
  } = req.body;

  if (!full_name || !email || !phone)
    return res.status(400).json({ error: 'Name, email and phone required' });

  // Check required docs
  const required = { photo, id_front, id_back, license_front, license_back, criminal_record, residence_doc, tursab_doc, d2_doc, bank_iban, car_front, car_right, car_left, car_back };
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length > 0)
    return res.status(400).json({ error: 'Missing required fields: ' + missing.join(', ') });

  try {
    const existing = await prisma.driverApplication.findFirst({ where: { email } });
    if (existing) return res.status(400).json({ error: 'An application with this email already exists' });

    const application = await prisma.driverApplication.create({
      data: {
        full_name, email, phone,
        photo, id_front, id_back, license_front, license_back,
        criminal_record, residence_doc, tursab_doc, d2_doc,
        bank_name: bank_name || null, bank_holder: bank_holder || null, bank_iban: bank_iban || null,
        car_front, car_right, car_left, car_back,
        car_interior_1: car_interior_1 || null, car_interior_2: car_interior_2 || null,
        car_interior_3: car_interior_3 || null, car_interior_4: car_interior_4 || null,
      },
    });

    // Notify admin
    resend.emails.send({
      from: FROM,
      to: 'bekpenturizm@gmail.com',
      subject: `🚗 New Driver Application: ${full_name}`,
      html: `<div style="font-family:Arial,sans-serif;padding:20px"><h2>New Driver Application</h2><p><b>Name:</b> ${full_name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone}</p><p><a href="https://home-production-6910.up.railway.app/admin" style="background:#f0c040;color:#000;padding:10px 20px;text-decoration:none;border-radius:5px;font-weight:bold">Review in Admin Panel</a></p></div>`,
    }).catch(() => {});

    res.status(201).json({ success: true, id: application.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/driver-applications — admin only
router.get('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const apps = await prisma.driverApplication.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true, full_name: true, email: true, phone: true,
        status: true, bank_name: true, bank_holder: true, bank_iban: true,
        admin_notes: true, created_at: true,
      },
    });
    res.json(apps);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/driver-applications/:id — admin only (full detail with docs)
router.get('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const app = await prisma.driverApplication.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!app) return res.status(404).json({ error: 'Not found' });
    res.json(app);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/driver-applications/:id/status — admin only
router.put('/:id/status', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { status, admin_notes } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    const app = await prisma.driverApplication.update({
      where: { id: parseInt(req.params.id) },
      data: { status, admin_notes: admin_notes || null },
    });

    // Send email to applicant
    if (status === 'approved') {
      await resend.emails.send({
        from: FROM,
        to: app.email,
        subject: '✅ Your Driver Application Has Been Approved — Airports Transfer Turkey',
        html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;font-size:16px">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8"><tr><td style="padding:30px 0" align="center">
<table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:12px;overflow:hidden">
<tr><td bgcolor="#0a1628" style="padding:30px 40px;text-align:center">
<div style="font-size:22px;font-weight:bold;color:#f0c040;letter-spacing:2px">AIRPORTS TRANSFER TURKEY</div>
<div style="font-size:14px;color:#aaa;margin-top:6px">Driver Panel</div>
</td></tr>
<tr><td style="padding:30px 40px">
<div style="font-size:16px;color:#444;line-height:1.6;margin-bottom:20px">Dear <b>${app.full_name}</b>,</div>
<div style="font-size:16px;color:#333;line-height:1.8;margin-bottom:20px">We are pleased to inform you that your driver application has been <b style="color:#2e7d32">approved</b>. Welcome to the Airports Transfer Turkey team!</div>
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="border-left:4px solid #f0c040;border-radius:0 10px 10px 0"><tr>
<td style="padding:16px 20px;font-size:15px;color:#333;line-height:1.8">
You can now log in to the driver panel to view your assigned transfers.<br><br>
For any questions, please contact us via WhatsApp or email below.
</td></tr></table>
${admin_notes ? `<div style="margin-top:20px;padding:16px;background:#fff8e1;border-left:4px solid #ffc107;border-radius:0 8px 8px 0;font-size:14px;color:#555">${admin_notes}</div>` : ''}
</td></tr>
<tr><td style="padding:0 40px 30px">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="border-left:4px solid #f0c040;border-radius:0 10px 10px 0"><tr>
<td style="padding:16px 20px;font-size:14px;color:#555;line-height:1.7">
<b style="color:#0a1628">Airports Transfer Turkey Team</b><br>
📞 +90 544 102 1414<br>✉️ airportstransferturkey@gmail.com
</td></tr></table>
</td></tr>
<tr><td bgcolor="#0a1628" style="padding:28px 40px;text-align:center">
<a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:12px 30px;border-radius:25px;font-size:16px;font-weight:bold;display:inline-block">WhatsApp: +90 544 102 1414</a>
</td></tr>
</table></td></tr></table>
</body></html>`,
      }).catch(e => console.error('Approval mail error:', e));
    } else if (status === 'rejected') {
      await resend.emails.send({
        from: FROM,
        to: app.email,
        subject: '❌ Driver Application Update — Airports Transfer Turkey',
        html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;font-size:16px">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8"><tr><td style="padding:30px 0" align="center">
<table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:12px;overflow:hidden">
<tr><td bgcolor="#0a1628" style="padding:30px 40px;text-align:center">
<div style="font-size:22px;font-weight:bold;color:#f0c040;letter-spacing:2px">AIRPORTS TRANSFER TURKEY</div>
</td></tr>
<tr><td style="padding:30px 40px">
<div style="font-size:16px;color:#444;margin-bottom:20px">Dear <b>${app.full_name}</b>,</div>
<div style="font-size:16px;color:#333;line-height:1.8;margin-bottom:20px">Thank you for applying to join Airports Transfer Turkey. Unfortunately, we are unable to approve your application at this time.</div>
${admin_notes ? `<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="border-left:4px solid #e53935;border-radius:0 10px 10px 0"><tr><td style="padding:16px 20px;font-size:14px;color:#555">${admin_notes}</td></tr></table>` : ''}
<div style="margin-top:20px;font-size:15px;color:#333">If you believe this is an error or wish to reapply, please contact us.</div>
</td></tr>
<tr><td bgcolor="#0a1628" style="padding:28px 40px;text-align:center">
<a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:12px 30px;border-radius:25px;font-size:16px;font-weight:bold;display:inline-block">WhatsApp: +90 544 102 1414</a>
</td></tr>
</table></td></tr></table>
</body></html>`,
      }).catch(e => console.error('Rejection mail error:', e));
    }

    res.json({ success: true, status });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/driver-applications/:id — admin only
router.delete('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.driverApplication.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
