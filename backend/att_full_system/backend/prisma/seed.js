const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const hashedPassword = await bcrypt.hash('.241176.', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'bekpenturizm@gmail.com' },
    update: {},
    create: {
      email: 'bekpenturizm@gmail.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Default vehicles
  const vehicles = [
    { name: 'Mercedes Vito', passenger_capacity: 6, luggage_capacity: 8, price: 59, status: 'active' },
    { name: 'VIP Mercedes Vito', passenger_capacity: 4, luggage_capacity: 6, price: 79, status: 'active' },
    { name: 'Mercedes Sprinter', passenger_capacity: 12, luggage_capacity: 12, price: 119, status: 'active' },
    { name: 'VIP Mercedes Sprinter', passenger_capacity: 12, luggage_capacity: 16, price: 139, status: 'active' },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: vehicles.indexOf(v) + 1 },
      update: {},
      create: v,
    });
  }
  console.log('✅ Vehicles seeded');

  // Default FAQs
  const faqs = [
    { question: 'How do I book an airport transfer?', answer: 'Simply enter your pickup and drop-off locations, select your travel date, number of passengers and luggage, then choose your preferred vehicle.', order_num: 1 },
    { question: 'Is there a free cancellation policy?', answer: 'Yes. You can cancel your booking free of charge up to 24 hours before your scheduled transfer.', order_num: 2 },
    { question: 'Do I need to pay in advance?', answer: 'No. Airports Transfer Turkey does not require any prepayment. You pay your driver directly on the day of travel.', order_num: 3 },
    { question: 'What happens if my flight is delayed?', answer: 'We track all flights in real time. If your flight is delayed, your driver will automatically adjust their arrival time at no extra cost.', order_num: 4 },
    { question: 'Which airports do you serve?', answer: 'We serve Istanbul Airport (IST) and Sabiha Gökçen Airport (SAW), as well as transfers between any locations within Istanbul.', order_num: 5 },
    { question: 'Can I book a child seat?', answer: 'Yes. Child seats are available upon request at no additional charge. Please mention your requirement when booking.', order_num: 6 },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({ data: faq }).catch(() => {});
  }
  console.log('✅ FAQs seeded');

  // Default pages
  await prisma.page.upsert({
    where: { page_name: 'about' },
    update: {},
    create: {
      page_name: 'about',
      title: 'About Us',
      content: 'BEKPEN ULUSLARARASI TURİZM TİCARET LİMİTED ŞİRKETİ has been providing premium airport transfer services in Istanbul since 2016. Licensed by TURSAB (Licence No: 14563), we operate a modern fleet of Mercedes vehicles with professional, English-speaking drivers.',
    },
  });

  await prisma.page.upsert({
    where: { page_name: 'contact' },
    update: {},
    create: {
      page_name: 'contact',
      title: 'Contact',
      content: 'Phone: +90 544 102 1414\nEmail: bekpenturizm@gmail.com\nAddress: Esenyalı Mah. Mezkur Sk. Nizamettin Otluoğlu Apt. NO:26 A Pendik / Istanbul',
    },
  });
  console.log('✅ Pages seeded');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
