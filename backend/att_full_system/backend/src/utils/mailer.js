const { Resend } = require('resend');

const resend = new Resend('re_QtVzdob1_CurncEBEbQPnAvEiNxZ9BNVX');
const FROM = 'Airports Transfer Turkey <onboarding@resend.dev>';

async function sendBookingConfirmation(reservation) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;font-size:16px">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8"><tr><td style="padding:30px 0" align="center">
<table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:12px;overflow:hidden">

<tr><td bgcolor="#0a1628" style="padding:30px 40px;text-align:center">
<div style="font-size:22px;font-weight:bold;color:#f0c040;letter-spacing:2px">AIRPORTS TRANSFER TURKEY</div>
<div style="font-size:14px;color:#aaa;margin-top:6px">Professional Airport Transfer Service</div>
</td></tr>

<tr><td style="padding:30px 40px">
<div style="font-size:24px;font-weight:bold;color:#0a1628;margin-bottom:12px">Booking Received! 🎉</div>
<div style="font-size:16px;color:#444;line-height:1.6">Dear <b>${reservation.customer_name}</b>, thank you for choosing Airports Transfer Turkey. We have received your booking.</div>
</td></tr>

<tr><td style="padding:0 40px 30px">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="border-radius:10px;border:1px solid #e0e8f0">
<tr><td style="padding:20px 24px;font-size:16px;font-weight:bold;color:#0a1628;border-bottom:1px solid #e0e8f0">📋 Booking Details</td></tr>
<tr><td style="padding:14px 24px;border-bottom:1px solid #f0f4f8">
  <table width="100%"><tr>
    <td style="color:#888;font-size:15px;width:150px">Reference</td>
    <td style="font-weight:bold;color:#b8860b;font-size:16px;font-family:monospace">${reservation.reference}</td>
  </tr></table>
</td></tr>
<tr><td style="padding:14px 24px;border-bottom:1px solid #f0f4f8">
  <table width="100%"><tr>
    <td style="color:#888;font-size:15px;width:150px">From</td>
    <td style="font-weight:600;font-size:16px;color:#222">${reservation.pickup_location}</td>
  </tr></table>
</td></tr>
<tr><td style="padding:14px 24px;border-bottom:1px solid #f0f4f8">
  <table width="100%"><tr>
    <td style="color:#888;font-size:15px;width:150px">To</td>
    <td style="font-weight:600;font-size:16px;color:#222">${reservation.dropoff_location}</td>
  </tr></table>
</td></tr>
<tr><td style="padding:14px 24px;border-bottom:1px solid #f0f4f8">
  <table width="100%"><tr>
    <td style="color:#888;font-size:15px;width:150px">Date</td>
    <td style="font-weight:600;font-size:16px;color:#222">${reservation.date}</td>
  </tr></table>
</td></tr>
<tr><td style="padding:14px 24px;border-bottom:1px solid #f0f4f8">
  <table width="100%"><tr>
    <td style="color:#888;font-size:15px;width:150px">Passengers</td>
    <td style="font-size:16px;color:#222">${reservation.passengers}</td>
  </tr></table>
</td></tr>
${reservation.vehicle_name ? `<tr><td style="padding:14px 24px;border-bottom:1px solid #f0f4f8">
  <table width="100%"><tr>
    <td style="color:#888;font-size:15px;width:150px">Vehicle</td>
    <td style="font-weight:600;font-size:16px;color:#222">${reservation.vehicle_name}</td>
  </tr></table>
</td></tr>` : ''}
${reservation.price ? `<tr><td style="padding:14px 24px">
  <table width="100%"><tr>
    <td style="color:#888;font-size:15px;width:150px">Price</td>
    <td style="font-weight:bold;font-size:22px;color:#0a1628">€${reservation.price}</td>
  </tr></table>
</td></tr>` : ''}
</table>
</td></tr>

<tr><td style="padding:0 40px 30px">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#e3f2fd" style="border-left:4px solid #2196f3;border-radius:0 8px 8px 0"><tr><td style="padding:16px 20px">
<div style="font-size:16px;font-weight:bold;color:#1565c0">✈️ Flight Tracking</div>
<div style="font-size:15px;color:#444;margin-top:4px">We monitor your flight in real time. Delays? Your driver adjusts automatically.</div>
</td></tr></table>
</td></tr>

<tr><td style="padding:0 40px 30px">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#fff8e1" style="border-left:4px solid #ffc107;border-radius:0 8px 8px 0"><tr><td style="padding:16px 20px">
<div style="font-size:16px;font-weight:bold;color:#e65100">💳 Pay on Arrival</div>
<div style="font-size:15px;color:#444;margin-top:4px">No upfront payment. Pay your driver on the day of travel.</div>
</td></tr></table>
</td></tr>

<tr><td bgcolor="#0a1628" style="padding:28px 40px;text-align:center">
<a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:12px 30px;border-radius:25px;font-size:16px;font-weight:bold;display:inline-block">WhatsApp: +90 544 102 1414</a>
<div style="color:#888;font-size:14px;margin-top:12px">airportstransferturkey@gmail.com</div>
<div style="color:#555;font-size:13px;margin-top:6px">BEKPEN ULUSLARARASI TURİZM TİCARET LİMİTED ŞİRKETİ · TURSAB: 14563</div>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

  return resend.emails.send({
    from: FROM,
    to: reservation.email,
    subject: `Booking Received — ${reservation.reference} | Airports Transfer Turkey`,
    html,
  });
}

async function sendContactReply(to, name, subject, replyText) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;font-size:16px">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8"><tr><td style="padding:30px 0" align="center">
<table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:12px;overflow:hidden">

<tr><td bgcolor="#0a1628" style="padding:30px 40px;text-align:center">
<div style="font-size:22px;font-weight:bold;color:#f0c040;letter-spacing:2px">AIRPORTS TRANSFER TURKEY</div>
</td></tr>

<tr><td style="padding:30px 40px">
<div style="font-size:16px;color:#444;margin-bottom:20px">Dear <b>${name}</b>,</div>
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="border-left:4px solid #f0c040;border-radius:0 10px 10px 0"><tr>
<td style="padding:24px 28px;font-size:16px;color:#333;line-height:1.8;white-space:pre-line">${replyText}</td>
</tr></table>
</td></tr>

<tr><td bgcolor="#0a1628" style="padding:28px 40px;text-align:center">
<a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:12px 30px;border-radius:25px;font-size:16px;font-weight:bold;display:inline-block">WhatsApp: +90 544 102 1414</a>
<div style="color:#888;font-size:14px;margin-top:12px">airportstransferturkey@gmail.com</div>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Re: ${subject}`,
    html,
  });
}

module.exports = { sendBookingConfirmation, sendContactReply };
