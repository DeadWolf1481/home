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
