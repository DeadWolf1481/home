const cron = require('node-cron');

// Run every 30 minutes — check if accepted jobs have passed their time + 1 hour
// If so, mark as "completed" and add to driver earnings
function startScheduler(prisma) {
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('[Scheduler] Checking completed trips...');

      // Find reservations that:
      // 1. Have a driver assigned (driver_id is not null)
      // 2. Status is 'approved' (not yet completed)
      // 3. Trip date+time + 1 hour has passed
      const rows = await prisma.$queryRaw`
        SELECT r.*, v.price as vehicle_price
        FROM reservations r
        LEFT JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.driver_id IS NOT NULL
          AND r.status = 'approved'
      `;

      const now = new Date();
      let completed = 0;

      for (const r of rows) {
        try {
          // Parse date string like "15 Jan 2026 23:00"
          const tripDate = new Date(r.date.replace(/(\d+) (\w+) (\d+) (\d+:\d+)/, '$2 $1 $3 $4'));
          if (isNaN(tripDate.getTime())) continue;

          // Add 1 hour
          const completionTime = new Date(tripDate.getTime() + 60 * 60 * 1000);

          if (now >= completionTime) {
            // Mark as completed
            await prisma.$queryRaw`UPDATE reservations SET status = 'completed' WHERE id = ${r.id}`;

            // Add to driver earnings
            const price = parseFloat(r.price || r.vehicle_price || 0);
            if (price > 0 && r.driver_id) {
              await prisma.$queryRaw`
                INSERT INTO driver_earnings (driver_id, reservation_id, amount, earned_at)
                VALUES (${r.driver_id}, ${r.id}, ${price}, NOW())
                ON CONFLICT (reservation_id) DO NOTHING`;
            }
            completed++;
          }
        } catch (e) {
          console.error('[Scheduler] Error processing reservation', r.id, e.message);
        }
      }

      if (completed > 0) console.log('[Scheduler]', completed, 'trips marked as completed');
    } catch (e) {
      console.error('[Scheduler] Error:', e.message);
    }
  });

  console.log('[Scheduler] Trip completion scheduler started');
}

module.exports = { startScheduler };
