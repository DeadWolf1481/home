const cron = require('node-cron');

function parseDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)\s+(\d+):(\d+)/);
  if (match) {
    const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const month = months[match[2]];
    if (month !== undefined) {
      // Parse as UTC+3 (Turkey time) → convert to UTC
      const localDate = new Date(parseInt(match[3]), month, parseInt(match[1]), parseInt(match[4]), parseInt(match[5]));
      // Subtract 3 hours to get UTC
      return new Date(localDate.getTime() - 3 * 60 * 60 * 1000);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function startScheduler(prisma) {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      console.log('[Scheduler] Running at', now.toISOString());

      const rows = await prisma.$queryRaw`
        SELECT r.id, r.date, r.price, r.driver_id, v.price as vehicle_price
        FROM reservations r
        LEFT JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.status = 'approved' AND r.driver_id IS NOT NULL`;

      console.log('[Scheduler] Checking', rows.length, 'active jobs');

      for (const r of rows) {
        const tripDateUTC = parseDate(r.date);
        if (!tripDateUTC) { console.log('[Scheduler] Cannot parse:', r.date); continue; }

        const hoursUntil = (tripDateUTC - now) / (1000 * 60 * 60);
        console.log('[Scheduler] Job', r.id, '- date:', r.date, '- UTC:', tripDateUTC.toISOString(), '- hours until:', hoursUntil.toFixed(2));

        if (now >= tripDateUTC) {
          await prisma.$queryRaw`UPDATE reservations SET status = 'completed' WHERE id = ${r.id}`;
          const price = parseFloat(r.price || r.vehicle_price || 0);
          if (price > 0 && r.driver_id) {
            await prisma.$queryRaw`
              INSERT INTO driver_earnings (driver_id, reservation_id, amount, earned_at)
              VALUES (${r.driver_id}, ${r.id}, ${price}, NOW())
              ON CONFLICT (reservation_id) DO NOTHING`;
            console.log('[Scheduler] ✅ Completed job', r.id, '- Added €' + price + ' to driver', r.driver_id);
          }
        }
      }
    } catch (e) { console.error('[Scheduler] Error:', e.message); }
  });
  console.log('[Scheduler] Started (every 5 min, Turkey UTC+3)');
}

module.exports = { startScheduler };

// Monthly payment summary — runs on 1st of every month at 00:00
function startMonthlyScheduler(prisma) {
  cron.schedule('0 0 1 * *', async () => {
    try {
      console.log('[Monthly] Creating driver payment summaries...');
      const now = new Date();
      const periodEnd = new Date(now);
      const periodStart = new Date(now);
      periodStart.setDate(periodStart.getDate() - 30);

      // Get all drivers with earnings in the last 30 days
      const summaries = await prisma.$queryRaw`
        SELECT 
          de.driver_id,
          u.email as driver_email,
          da.phone as driver_phone,
          da.bank_iban as driver_iban,
          SUM(de.amount) as total_amount
        FROM driver_earnings de
        LEFT JOIN users u ON de.driver_id = u.id
        LEFT JOIN LATERAL (
          SELECT phone, bank_iban FROM driver_applications 
          WHERE email = u.email ORDER BY id ASC LIMIT 1
        ) da ON true
        WHERE de.earned_at >= ${periodStart} AND de.earned_at <= ${periodEnd}
        GROUP BY de.driver_id, u.email, da.phone, da.bank_iban
      `;

      for (const s of summaries) {
        await prisma.$queryRaw`
          INSERT INTO driver_payment_summaries 
            (driver_id, driver_email, driver_phone, driver_iban, amount, period_start, period_end, created_at)
          VALUES 
            (${s.driver_id}, ${s.driver_email}, ${s.driver_phone}, ${s.driver_iban}, ${parseFloat(s.total_amount)}, ${periodStart}, ${periodEnd}, NOW())
        `;
        console.log('[Monthly] Added summary for', s.driver_email, '€' + s.total_amount);
      }

      // Reset driver_earnings after summary
      await prisma.$queryRaw`DELETE FROM driver_earnings WHERE earned_at <= ${periodEnd}`;
      console.log('[Monthly] Done. Summaries created:', summaries.length);
    } catch (e) { console.error('[Monthly] Error:', e.message); }
  });
  console.log('[Monthly] Payment summary scheduler started (1st of every month)');
}

module.exports = { startScheduler, startMonthlyScheduler };
