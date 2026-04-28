const router = require('express').Router();
const { sendBookingConfirmation } = require('../utils/mailer');

// POST /api/booking — public (called by results.html)
router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma;

  // Generate ATT001 style reference
  async function generateReference() {
    const last = await prisma.reservation.findFirst({
      orderBy: { id: 'desc' },
      select: { reference: true },
    });
    let num = 1;
    if (last?.reference && last.reference.startsWith('ATT')) {
      const n = parseInt(last.reference.replace('ATT', ''));
      if (!isNaN(n)) num = n + 1;
    }
    return 'ATT' + String(num).padStart(3, '0');
  }
  const {
    vehicle, vehicleName, price,
    from, to, date, passengers, luggage,
    name, email, phone, flight, notes,
    source,
  } = req.body;

  if (!name || !email || !phone || !from || !to || !date)
    return res.status(400).json({ error: 'Missing required fields' });

  try {
    // Find vehicle by id or name
    let vehicleRecord = null;
    if (vehicle) {
      vehicleRecord = await prisma.vehicle.findFirst({
        where: {
          OR: [
            { name: { contains: vehicleName || vehicle, mode: 'insensitive' } },
          ],
        },
      });
    }

    const reference = await generateReference();
    const reservation = await prisma.reservation.create({
      data: {
        reference,
        customer_name: name,
        email,
        phone,
        pickup_location: from,
        dropoff_location: to,
        date,
        passengers: parseInt(passengers) || 1,
        luggage: parseInt(luggage) || 0,
        flight_number: flight || null,
        notes: notes || null,
        vehicle_id: vehicleRecord?.id || null,
        price: parseFloat(price) || null,
        status: 'pending',
        source: source || 'website',
      },
    });

    // Update customer tracking to "completed"
    const sessionId = req.body.session_id || `booking-${reservation.id}`;
    const realIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    const existing = await prisma.customerTracking.findFirst({
      where: { session_id: sessionId },
      orderBy: { created_at: 'desc' },
    });
    if (existing) {
      await prisma.customerTracking.update({
        where: { id: existing.id },
        data: {
          current_step: 'completed',
          last_action: `Booking submitted: ${reservation.reference}`,
          ip_address: realIP,
        },
      }).catch(() => {});
    } else {
      await prisma.customerTracking.create({
        data: {
          session_id: sessionId,
          current_step: 'completed',
          last_action: `Booking submitted: ${reservation.reference}`,
          ip_address: realIP,
        },
      }).catch(() => {});
    }

    // Send confirmation email
    sendBookingConfirmation({
      ...reservation,
      vehicle_name: vehicleRecord?.name || vehicleName || null,
    }).catch(err => console.error('Mail error:', err));

    res.status(201).json({
      success: true,
      reference: reservation.reference,
      message: 'Booking received. We will confirm within minutes.',
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Could not save booking. Please try WhatsApp.' });
  }
});

module.exports = router;
