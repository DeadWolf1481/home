const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/stats — admin only
router.get('/', auth, async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const [
      totalReservations,
      pendingReservations,
      approvedReservations,
      cancelledReservations,
      totalRevenue,
      totalVehicles,
      activeVehicles,
      totalBlog,
      totalCustomers,
      recentReservations,
      trackingSteps,
      unreadMessages,
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: 'pending' } }),
      prisma.reservation.count({ where: { status: 'approved' } }),
      prisma.reservation.count({ where: { status: 'cancelled' } }),
      prisma.reservation.aggregate({
        where: { status: 'approved' },
        _sum: { price: true },
      }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'active' } }),
      prisma.blog.count(),
      prisma.customerTracking.groupBy({ by: ['session_id'], _count: true }).then(r => r.length),
      prisma.reservation.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { vehicle: true },
      }),
      prisma.customerTracking.groupBy({
        by: ['current_step'],
        _count: { _all: true },
      }),
      prisma.contactMessage.count({ where: { status: 'unread' } }),
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    res.json({
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
        approved: approvedReservations,
        cancelled: cancelledReservations,
      },
      revenue: {
        total: totalRevenue._sum.price || 0,
      },
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
      },
      blog: { total: totalBlog },
      customers: { total: totalCustomers },
      unreadMessages,
      recentReservations,
      trackingSteps: trackingSteps.reduce((acc, item) => {
        acc[item.current_step] = item._count._all;
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
