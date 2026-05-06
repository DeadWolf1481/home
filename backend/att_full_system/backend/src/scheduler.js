const cron = require('node-cron');

function parseDate(dateStr) {
  if (!dateStr) return null;
  // Try "6 May 2026 21:10" format
  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)\s+(\d+):(\d+)/);
  if (match) {
    const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const month = months[match[2]];
    if (month !== undefined) {
      const d = new Date(parseInt(match[3]), month, parseInt(match[1]), parseInt(match[4]), parseInt(match[5]));
      if (!isNaN(d.getTime())) return d;
    }
  }
  // Fallback direct parse
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function startScheduler(prisma) {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      console.log('[Scheduler] Running at', now.toISOString());

      // Get all approved reservations with drivers
      const rows = await prisma.$queryRaw`
        SELECT r.id, r.date, r.price, r.driver_id, v.price as vehicle_price
        FROM reservations r
        LEFT JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.status = 'approved' AND r.driver_id IS NOT NULL`;

      console.log('[Scheduler] Checking', rows.length, 'active jobs');

      for (const r of rows) {
        const tripDate = parseDate(r.date);
        if (!tripDate) { console.log('[Scheduler] Cannot parse:', r.date); continue; }

        const msUntilTrip = tripDate.getTime() - now.getTime();
        const hoursUntilTrip = msUntilTrip / (1000 * 60 * 60);
        
        console.log('[Scheduler] Job', r.id, '- date:', r.date, '- hours until trip:', hoursUntilTrip.toFixed(2));

        // If trip time has passed (+ 0 hours buffer) → complete it
        if (now >= tripDate) {
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

      // Also: unassign drivers from jobs that are within 2 hours but not yet taken (offers)
      // This is handled in the offers endpoint by filtering

    } catch (e) { console.error('[Scheduler] Error:', e.message); }
  });

  console.log('[Scheduler] Started (every 5 min)');
}

module.exports = { startScheduler };
