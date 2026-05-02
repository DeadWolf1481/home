const router = require('express').Router();
const auth = require('../middleware/auth');
const { Resend } = require('resend');

const resend = new Resend('re_QtVzdob1_CurncEBEbQPnAvEiNxZ9BNVX');
const FROM = 'Airports Transfer Turkey <onboarding@resend.dev>';

// POST /api/driver-applications — public
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

  try {
    // Check duplicate
    const existing = await prisma.$queryRaw`SELECT id FROM driver_applications WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) return res.status(400).json({ error: 'An application with this email already exists' });

    const result = await prisma.$queryRaw`
      INSERT INTO driver_applications 
        (full_name, email, phone, photo, id_front, id_back, license_front, license_back,
         criminal_record, residence_doc, tursab_doc, d2_doc,
         bank_name, bank_holder, bank_iban,
         car_front, car_right, car_left, car_back,
         car_interior_1, car_interior_2, car_interior_3, car_interior_4,
         status, created_at, updated_at)
      VALUES
        (${full_name}, ${email}, ${phone},
         ${photo||null}, ${id_front||null}, ${id_back||null}, ${license_front||null}, ${license_back||null},
         ${criminal_record||null}, ${residence_doc||null}, ${tursab_doc||null}, ${d2_doc||null},
         ${bank_name||null}, ${bank_holder||null}, ${bank_iban||null},
         ${car_front||null}, ${car_right||null}, ${car_left||null}, ${car_back||null},
         ${car_interior_1||null}, ${car_interior_2||null}, ${car_interior_3||null}, ${car_interior_4||null},
         'pending', NOW(), NOW())
      RETURNING id`;

    resend.emails.send({
      from: FROM, to: 'bekpenturizm@gmail.com',
      subject: `🚗 New Driver Application: ${full_name}`,
      html: `<div style="font-family:Arial,sans-serif;padding:20px"><h2>New Driver Application</h2><p><b>Name:</b> ${full_name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone}</p><a href="https://home-production-6910.up.railway.app/admin" style="background:#f0c040;color:#000;padding:10px 20px;text-decoration:none;border-radius:5px;font-weight:bold">Review in Admin Panel</a></div>`,
    }).catch(() => {});

    res.status(201).json({ success: true, id: result[0].id });
  } catch (err) {
    console.error('Driver app error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/driver-applications — admin only
router.get('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const apps = await prisma.$queryRaw`
      SELECT id, full_name, email, phone, status, bank_name, bank_holder, bank_iban, admin_notes, created_at
      FROM driver_applications ORDER BY created_at DESC`;
    res.json(apps);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/driver-applications/:id — admin only
router.get('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const rows = await prisma.$queryRaw`SELECT * FROM driver_applications WHERE id = ${parseInt(req.params.id)}`;
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/driver-applications/:id/status — admin only
router.put('/:id/status', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { status, admin_notes } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    await prisma.$queryRaw`UPDATE driver_applications SET status=${status}, admin_notes=${admin_notes||null}, updated_at=NOW() WHERE id=${parseInt(req.params.id)}`;
    const rows = await prisma.$queryRaw`SELECT * FROM driver_applications WHERE id=${parseInt(req.params.id)}`;
    const app = rows[0];

    if (status === 'approved') {
      const mailResult = await resend.emails.send({
        from: FROM, to: [app.email, 'bekpenturizm@gmail.com'],
        subject: '✅ Your Driver Application Has Been Approved — Airports Transfer Turkey',
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8"><tr><td style="padding:30px 0" align="center"><table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:12px;overflow:hidden"><tr><td bgcolor="#0a1628" style="padding:30px 40px;text-align:center"><div style="font-size:22px;font-weight:bold;color:#f0c040;letter-spacing:2px">AIRPORTS TRANSFER TURKEY</div></td></tr><tr><td style="padding:30px 40px"><div style="font-size:16px;color:#444;margin-bottom:16px">Dear <b>${app.full_name}</b>,</div><div style="font-size:16px;color:#333;line-height:1.8;margin-bottom:20px">We are pleased to inform you that your driver application has been <b style="color:#2e7d32">approved</b>. Welcome to the Airports Transfer Turkey team!</div><table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="border-left:4px solid #f0c040;border-radius:0 10px 10px 0"><tr><td style="padding:16px 20px;font-size:15px;color:#333;line-height:1.8">You can now log in to the driver panel to view your assigned transfers.<br><br>For any questions, contact us via WhatsApp.</td></tr></table>${admin_notes ? `<div style="margin-top:16px;padding:14px;background:#fff8e1;border-left:4px solid #ffc107;font-size:14px;color:#555">${admin_notes}</div>` : ''}</td></tr><tr><td bgcolor="#0a1628" style="padding:28px 40px;text-align:center"><a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:12px 30px;border-radius:25px;font-size:16px;font-weight:bold;display:inline-block">WhatsApp: +90 544 102 1414</a></td></tr></table></td></tr></table></body></html>`,
      });
      console.log('Approval mail result:', JSON.stringify(mailResult));
    } else if (status === 'rejected') {
      const mailResult = await resend.emails.send({
        from: FROM, to: [app.email, 'bekpenturizm@gmail.com'],
        subject: 'Driver Application Update — Airports Transfer Turkey',
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8"><tr><td style="padding:30px 0" align="center"><table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:12px;overflow:hidden"><tr><td bgcolor="#0a1628" style="padding:30px 40px;text-align:center"><div style="font-size:22px;font-weight:bold;color:#f0c040;letter-spacing:2px">AIRPORTS TRANSFER TURKEY</div></td></tr><tr><td style="padding:30px 40px"><div style="font-size:16px;color:#444;margin-bottom:16px">Dear <b>${app.full_name}</b>,</div><div style="font-size:16px;color:#333;line-height:1.8;margin-bottom:20px">Thank you for applying. Unfortunately, we are unable to approve your application at this time.</div>${admin_notes ? `<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="border-left:4px solid #e53935;border-radius:0 10px 10px 0"><tr><td style="padding:16px 20px;font-size:14px;color:#555">${admin_notes}</td></tr></table>` : ''}</td></tr><tr><td bgcolor="#0a1628" style="padding:28px 40px;text-align:center"><a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:12px 30px;border-radius:25px;font-size:16px;font-weight:bold;display:inline-block">WhatsApp: +90 544 102 1414</a></td></tr></table></td></tr></table></body></html>`,
      });
      console.log('Rejection mail result:', JSON.stringify(mailResult));
    }

    res.json({ success: true, status });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

// DELETE /api/driver-applications/:id — admin only
router.delete('/:id', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.$queryRaw`DELETE FROM driver_applications WHERE id=${parseInt(req.params.id)}`;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
