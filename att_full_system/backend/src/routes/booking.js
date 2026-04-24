const router = require('express').Router();

// POST /api/booking — public (called by results.html)
router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
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

    const reservation = await prisma.reservation.create({
      data: {
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
    await prisma.customerTracking.create({
      data: {
        session_id: `booking-${reservation.id}`,
        current_step: 'completed',
        last_action: `Booking submitted: ${reservation.reference}`,
        metadata: JSON.stringify({ reservation_id: reservation.id, vehicle: vehicleName }),
        ip_address: req.ip,
      },
    }).catch(() => {});

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
