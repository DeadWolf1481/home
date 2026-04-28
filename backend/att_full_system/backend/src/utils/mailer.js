const { Resend } = require('resend');

const resend = new Resend('re_QtVzdob1_CurncEBEbQPnAvEiNxZ9BNVX');
const FROM = 'Airports Transfer Turkey <onboarding@resend.dev>';

async function sendBookingConfirmation(reservation) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

  <!-- Header -->
  <tr><td style="background:#0a1628;padding:36px 48px;text-align:center">
    <div style="font-size:24px;font-weight:800;color:#f0c040;letter-spacing:2px">AIRPORTS TRANSFER TURKEY</div>
    <div style="color:rgba(255,255,255,0.55);font-size:14px;margin-top:6px">Professional Airport Transfer Service</div>
  </td></tr>

  <!-- Title -->
  <tr><td style="padding:40px 48px 0">
    <div style="font-size:28px;font-weight:700;color:#0a1628">Booking Received! 🎉</div>
    <div style="font-size:16px;color:#555;margin-top:10px;line-height:1.6">Dear <b>${reservation.customer_name}</b>, thank you for choosing Airports Transfer Turkey. We have received your booking and will confirm it shortly.</div>
  </td></tr>

  <!-- Booking Details -->
  <tr><td style="padding:28px 48px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:28px;border:1px solid #e8edf3">
      <tr><td style="font-size:16px;font-weight:700;color:#0a1628;padding-bottom:18px">📋 Booking Details</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #edf0f4">
        <table width="100%"><tr>
          <td style="color:#888;font-size:14px;width:160px">Reference</td>
          <td style="font-weight:700;color:#b8860b;font-family:monospace;font-size:15px">${reservation.reference}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #edf0f4">
        <table width="100%"><tr>
          <td style="color:#888;font-size:14px;width:160px">From</td>
          <td style="font-weight:600;font-size:15px;color:#1a1a1a">${reservation.pickup_location}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #edf0f4">
        <table width="100%"><tr>
          <td style="color:#888;font-size:14px;width:160px">To</td>
          <td style="font-weight:600;font-size:15px;color:#1a1a1a">${reservation.dropoff_location}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #edf0f4">
        <table width="100%"><tr>
          <td style="color:#888;font-size:14px;width:160px">Date & Time</td>
          <td style="font-weight:600;font-size:15px;color:#1a1a1a">${reservation.date}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #edf0f4">
        <table width="100%"><tr>
          <td style="color:#888;font-size:14px;width:160px">Passengers</td>
          <td style="font-size:15px;color:#1a1a1a">${reservation.passengers} passenger${reservation.passengers > 1 ? 's' : ''}</td>
        </tr></table>
      </td></tr>
      ${reservation.vehicle_name ? `<tr><td style="padding:8px 0;border-bottom:1px solid #edf0f4">
        <table width="100%"><tr>
          <td style="color:#888;font-size:14px;width:160px">Vehicle</td>
          <td style="font-weight:600;font-size:15px;color:#1a1a1a">${reservation.vehicle_name}</td>
        </tr></table>
      </td></tr>` : ''}
      ${reservation.price ? `<tr><td style="padding:12px 0 0">
        <table width="100%"><tr>
          <td style="color:#888;font-size:14px;width:160px">Price</td>
          <td style="font-weight:800;font-size:22px;color:#0a1628">€${reservation.price}</td>
        </tr></table>
      </td></tr>` : ''}
    </table>
  </td></tr>

  <!-- Info boxes -->
  <tr><td style="padding:24px 48px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f4fd;border-left:4px solid #2196f3;border-radius:0 8px 8px 0">
      <tr><td style="padding:16px 20px">
        <div style="font-size:15px;font-weight:700;color:#1565c0">✈️ Flight Tracking</div>
        <div style="font-size:14px;color:#444;margin-top:4px">We track your flight in real time. Delays? Your driver adjusts automatically.</div>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:12px 48px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border-left:4px solid #ffc107;border-radius:0 8px 8px 0">
      <tr><td style="padding:16px 20px">
        <div style="font-size:15px;font-weight:700;color:#e65100">💳 Pay on Arrival</div>
        <div style="font-size:14px;color:#444;margin-top:4px">No upfront payment required. Pay your driver on the day of travel.</div>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0a1628;padding:32px 48px;text-align:center;margin-top:32px">
    <a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:12px 28px;border-radius:25px;font-size:15px;font-weight:700;display:inline-block;white-space:nowrap">WhatsApp: +90 544 102 1414</a>
    <div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:14px">airportstransferturkey@gmail.com</div>
    <div style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:6px">BEKPEN ULUSLARARASI TURİZM TİCARET LİMİTED ŞİRKETİ · TURSAB: 14563</div>
  </td></tr>

</table>
</td></tr>
</table>
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
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

  <!-- Header -->
  <tr><td style="background:#0a1628;padding:36px 48px;text-align:center">
    <div style="font-size:24px;font-weight:800;color:#f0c040;letter-spacing:2px">AIRPORTS TRANSFER TURKEY</div>
  </td></tr>

  <!-- Content -->
  <tr><td style="padding:40px 48px">
    <div style="font-size:16px;color:#555;margin-bottom:24px">Dear <b style="color:#0a1628">${name}</b>,</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-left:4px solid #f0c040;border-radius:0 12px 12px 0">
      <tr><td style="padding:24px 28px;font-size:15px;color:#333;line-height:1.8;white-space:pre-line">${replyText}</td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0a1628;padding:32px 48px;text-align:center">
    <a href="https://wa.me/905441021414" style="background:#25D366;color:white;text-decoration:none;padding:12px 28px;border-radius:25px;font-size:15px;font-weight:700;display:inline-block;white-space:nowrap">WhatsApp: +90 544 102 1414</a>
    <div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:14px">airportstransferturkey@gmail.com</div>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Re: ${subject}`,
    html,
  });
}

module.exports = { sendBookingConfirmation, sendContactReply };
