const cron = require('node-cron');

function parseDate(dateStr) {
  if (!dateStr) return null;
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  // Format: "6 May 2026 21:10"
  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)\s+(\d+):(\d+)/);
  if (match) {
    const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const month = months[match[2]];
    if (month !== undefined) {
      d = new Date(parseInt(match[3]), month, parseInt(match[1]), parseInt(match[4]), parseInt(match[5]));
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

function startScheduler(prisma) {
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('[Scheduler] Checking completed trips...');
      const rows = await prisma.$queryRaw`
        SELECT r.id, r.date, r.price, r.driver_id, v.price as vehicle_price
        FROM reservations r
        LEFT JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.driver_id IS NOT NULL AND r.status = 'approved'`;

      console.log('[Scheduler] Active jobs:', rows.length);
      const now = new Date();
      let completed = 0;

      for (const r of rows) {
        try {
          const tripDate = parseDate(r.date);
          if (!tripDate) { console.log('[Scheduler] Cannot parse date:', r.date); continue; }
          const completionTime = new Date(tripDate.getTime() + 60 * 60 * 1000);
          console.log('[Scheduler] Job', r.id, '- date:', r.date, '- parsed:', tripDate, '- completes at:', completionTime);
          if (now >= completionTime) {
            await prisma.$queryRaw`UPDATE reservations SET status = 'completed' WHERE id = ${r.id}`;
            const price = parseFloat(r.price || r.vehicle_price || 0);
            if (price > 0 && r.driver_id) {
              await prisma.$queryRaw`
                INSERT INTO driver_earnings (driver_id, reservation_id, amount, earned_at)
                VALUES (${r.driver_id}, ${r.id}, ${price}, NOW())
                ON CONFLICT (reservation_id) DO NOTHING`;
              console.log('[Scheduler] Earnings added: €' + price + ' for driver', r.driver_id);
            }
            completed++;
          }
        } catch (e) { console.error('[Scheduler] Error:', r.id, e.message); }
      }
      console.log('[Scheduler] Completed this run:', completed);
    } catch (e) { console.error('[Scheduler] Fatal:', e.message); }
  });
  console.log('[Scheduler] Started (every 30 min)');
}

module.exports = { startScheduler };
