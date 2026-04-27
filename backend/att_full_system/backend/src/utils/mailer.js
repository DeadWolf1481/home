const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'airportstransferturkey@gmail.com',
    pass: 'phkwqqkevckubir',
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

async function sendBookingConfirmation(reservation) {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f5f5;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1)">
<div style="background:#0a1628;padding:28px 32px;text-align:center">
<div style="font-size:20px;font-weight:700;color:#f0c040;letter-spacing:1px">AIRPORTS TRANSFER TURKEY</div>
<div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px">Professional Airport Transfer Service</div>
</div>
<div style="padding:32px">
<h2 style="color:#0a1628;margin:0 0 8px">Booking Received! 🎉</h2>
<p style="color:#555;margin:0 0 24px">Dear <b>${reservation.customer_name}</b>, thank you for choosing Airports Transfer Turkey. We have received your booking and will confirm it shortly.</p>
<div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px">
<div style="font-weight:700;color:#0a1628;margin-bottom:12px">📋 Booking Details</div>
<table style="width:100%;border-collapse:collapse">
<tr><td style="padding:6px 0;color:#888;font-size:13px;width:140px">Reference</td><td style="padding:6px 0;font-weight:700;color:#f0c040;font-family:monospace">${reservation.reference}</td></tr>
<tr><td style="padding:6px 0;color:#888;font-size:13px">From</td><td style="padding:6px 0;font-weight:600">${reservation.pickup_location}</td></tr>
<tr><td style="padding:6px 0;color:#888;font-size:13px">To</td><td style="padding:6px 0;font-weight:600">${reservation.dropoff_location}</td></tr>
<tr><td style="padding:6px 0;color:#888;font-size:13px">Date</td><td style="padding:6px 0;font-weight:600">${reservation.date}</td></tr>
<tr><td style="padding:6px 0;color:#888;font-size:13px">Passengers</td><td style="padding:6px 0">${reservation.passengers}</td></tr>
${reservation.vehicle_name ? `<tr><td style="padding:6px 0;color:#888;font-size:13px">Vehicle</td><td style="padding:6px 0;font-weight:600">${reservation.vehicle_name}</td></tr>` : ''}
${reservation.price ? `<tr><td style="padding:6px 0;color:#888;font-size:13px">Price</td><td style="padding:6px 0;font-weight:700;font-size:18px">€${reservation.price}</td></tr>` : ''}
</table>
</div>
<div style="background:#e3f2fd;border-left:4px solid #2196f3;padding:12px 16px;border-radius:4px;font-size:13px;margin-bottom:10px">
<b style="color:#1565c0">✈️ Flight Tracking</b><br><span style="color:#555">We track your flight in real time. Delays? Your driver adjusts automatically.</span>
</div>
<div style="background:#fff8e1;border-left:4px solid #ffc107;padding:12px 16px;border-radius:4px;font-size:13px">
<b style="color:#f57f17">💳 Pay on Arrival</b><br><span style="color:#555">No upfront payment required. Pay your driver on the day of travel.</span>
</div>
</div>
<div style="background:#0a1628;padding:20px 32px;text-align:center">
<div style="margin-bottom:10px"><a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:8px 20px;border-radius:20px;font-size:13px;font-weight:600">💬 WhatsApp: +90 544 102 1414</a></div>
<div style="color:rgba(255,255,255,0.5);font-size:12px">airportstransferturkey@gmail.com</div>
</div>
</div>
</body></html>`;

  return transporter.sendMail({
    from: '"Airports Transfer Turkey" <airportstransferturkey@gmail.com>',
    to: reservation.email,
    subject: `Booking Received — ${reservation.reference} | Airports Transfer Turkey`,
    html,
  });
}

async function sendContactReply(to, name, subject, replyText) {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f5f5;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1)">
<div style="background:#0a1628;padding:28px 32px;text-align:center">
<div style="font-size:20px;font-weight:700;color:#f0c040;letter-spacing:1px">AIRPORTS TRANSFER TURKEY</div>
</div>
<div style="padding:32px">
<p style="color:#555;margin:0 0 20px">Dear <b>${name}</b>,</p>
<div style="white-space:pre-line;color:#333;line-height:1.7;font-size:14px;background:#f8f9fa;padding:20px;border-radius:8px;border-left:4px solid #f0c040">${replyText}</div>
</div>
<div style="background:#0a1628;padding:20px 32px;text-align:center">
<div style="margin-bottom:8px"><a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:8px 20px;border-radius:20px;font-size:13px;font-weight:600">💬 WhatsApp: +90 544 102 1414</a></div>
<div style="color:rgba(255,255,255,0.5);font-size:12px">airportstransferturkey@gmail.com</div>
</div>
</div>
</body></html>`;

  return transporter.sendMail({
    from: '"Airports Transfer Turkey" <airportstransferturkey@gmail.com>',
    to,
    subject: `Re: ${subject}`,
    html,
  });
}

module.exports = { sendBookingConfirmation, sendContactReply };
