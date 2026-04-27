const { Resend } = require('resend');

const resend = new Resend('re_QtVzdob1_CurncEBEbQPnAvEiNxZ9BNVX');
const FROM = 'Airports Transfer Turkey <onboarding@resend.dev>';

async function sendBookingConfirmation(reservation) {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f5f5;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden">
<div style="background:#0a1628;padding:28px 32px;text-align:center">
<div style="font-size:20px;font-weight:700;color:#f0c040;letter-spacing:1px">AIRPORTS TRANSFER TURKEY</div>
<div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px">Professional Airport Transfer Service</div>
</div>
<div style="padding:32px">
<h2 style="color:#0a1628;margin:0 0 8px">Booking Received! 🎉</h2>
<p style="color:#555;margin:0 0 24px">Dear <b>${reservation.customer_name}</b>, thank you for choosing Airports Transfer Turkey.</p>
<div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px">
<b style="color:#0a1628">📋 Booking Details</b><br><br>
<b>Reference:</b> <span style="color:#b8860b;font-family:monospace">${reservation.reference}</span><br>
<b>From:</b> ${reservation.pickup_location}<br>
<b>To:</b> ${reservation.dropoff_location}<br>
<b>Date:</b> ${reservation.date}<br>
<b>Passengers:</b> ${reservation.passengers}<br>
${reservation.vehicle_name ? `<b>Vehicle:</b> ${reservation.vehicle_name}<br>` : ''}
${reservation.price ? `<b>Price:</b> <span style="font-size:18px;font-weight:700">€${reservation.price}</span><br>` : ''}
</div>
<div style="background:#e3f2fd;border-left:4px solid #2196f3;padding:12px 16px;border-radius:4px;font-size:13px;margin-bottom:10px">
<b style="color:#1565c0">✈️ Flight Tracking</b><br>We monitor your flight in real time. Delays? Your driver adjusts automatically.
</div>
<div style="background:#fff8e1;border-left:4px solid #ffc107;padding:12px 16px;border-radius:4px;font-size:13px">
<b style="color:#f57f17">💳 Pay on Arrival</b><br>No upfront payment required. Pay your driver on the day.
</div>
</div>
<div style="background:#0a1628;padding:20px 32px;text-align:center">
<a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:8px 20px;border-radius:20px;font-size:13px;font-weight:600">💬 WhatsApp: +90 544 102 1414</a>
<div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:8px">airportstransferturkey@gmail.com</div>
</div>
</div></body></html>`;

  return resend.emails.send({
    from: FROM,
    to: reservation.email,
    subject: `Booking Received — ${reservation.reference} | Airports Transfer Turkey`,
    html,
  });
}

async function sendContactReply(to, name, subject, replyText) {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f5f5;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden">
<div style="background:#0a1628;padding:28px 32px;text-align:center">
<div style="font-size:20px;font-weight:700;color:#f0c040;letter-spacing:1px">AIRPORTS TRANSFER TURKEY</div>
</div>
<div style="padding:32px">
<p style="color:#555;margin:0 0 20px">Dear <b>${name}</b>,</p>
<div style="white-space:pre-line;color:#333;line-height:1.7;font-size:14px;background:#f8f9fa;padding:20px;border-radius:8px;border-left:4px solid #f0c040">${replyText}</div>
</div>
<div style="background:#0a1628;padding:20px 32px;text-align:center">
<a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:8px 20px;border-radius:20px;font-size:13px;font-weight:600">💬 WhatsApp: +90 544 102 1414</a>
<div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:8px">airportstransferturkey@gmail.com</div>
</div>
</div></body></html>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Re: ${subject}`,
    html,
  });
}

module.exports = { sendBookingConfirmation, sendContactReply };
