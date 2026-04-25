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

  // Sample blog posts
  const blogPosts = [
    {
      title: 'Hagia Sophia: A Complete Guide for First-Time Visitors',
      slug: 'hagia-sophia-guide-' + Date.now(),
      excerpt: 'Everything you need to know before visiting one of Istanbul\'s most iconic landmarks — opening hours, dress code, tips, and how to get there from the airport.',
      content: 'Hagia Sophia is one of the greatest architectural achievements in human history. Built in 537 AD under Emperor Justinian I, it served as a cathedral, mosque, museum, and is now an active mosque open to visitors. The massive dome, stunning Byzantine mosaics, and Ottoman calligraphy panels make it a must-see. Arrive early in the morning to avoid crowds. Modest dress is required — shoulders and knees must be covered. Entry is free. From Istanbul Airport, a private transfer takes 45-60 minutes.',
      image_url: null,
      status: 'active',
    },
    {
      title: 'Grand Bazaar: The Ultimate Shopping Guide',
      slug: 'grand-bazaar-guide-' + (Date.now() + 1),
      excerpt: 'With over 4,000 shops across 61 covered streets, the Grand Bazaar is one of the world\'s oldest and largest covered markets. Here\'s how to make the most of your visit.',
      content: 'The Grand Bazaar (Kapalıçarşı) has been the commercial heart of Istanbul since 1461. You\'ll find gold jewellery, leather goods, ceramics, Turkish carpets, spices, and much more. Bargaining is expected — start at roughly half the asking price. The main entrance on the Beyazıt side is most convenient. Allow at least 2-3 hours to explore. From Istanbul Airport, a private transfer to the Bazaar area takes approximately 45-55 minutes.',
      image_url: null,
      status: 'active',
    },
    {
      title: 'Bosphorus Cruise: What You Need to Know',
      slug: 'bosphorus-cruise-guide-' + (Date.now() + 2),
      excerpt: 'The Bosphorus strait separates Europe and Asia and offers some of Istanbul\'s most spectacular scenery. Here\'s everything you need to plan the perfect cruise.',
      content: 'A Bosphorus cruise is one of the best ways to experience Istanbul. Public ferries from Eminönü make the full return journey to Anadolu Kavağı, passing Ottoman palaces, wooden mansions, and fortress ruins. For a shorter experience, the commuter ferries between Kabataş and Üsküdar take about 20 minutes. Sunset cruises are particularly popular. Both Istanbul Airport and Sabiha Gökçen Airport are well-connected to the Bosphorus waterfront by private transfer.',
      image_url: null,
      status: 'active',
    },
    {
      title: 'Topkapi Palace: Inside the Heart of the Ottoman Empire',
      slug: 'topkapi-palace-guide-' + (Date.now() + 3),
      excerpt: 'For nearly 400 years, Topkapi Palace was the centre of the Ottoman Empire. Today it is one of Istanbul\'s most rewarding museums — here\'s how to visit.',
      content: 'Topkapi Palace was built by Sultan Mehmed II in the 1450s and expanded by successive sultans. The palace is organised around four courtyards. Don\'t miss the Treasury — home to the famous Spoonmaker\'s Diamond and the Topkapi Dagger — and the Harem, which requires a separate ticket. Book tickets online to avoid queuing. The palace is closed on Tuesdays. Allow at least 3-4 hours for a thorough visit. From Istanbul Airport, a private transfer to Sultanahmet takes approximately 45-60 minutes.',
      image_url: null,
      status: 'active',
    },
    {
      title: 'Galata Tower: Best Views in Istanbul',
      slug: 'galata-tower-guide-' + (Date.now() + 4),
      excerpt: 'Rising above the rooftops of Beyoğlu, the Galata Tower offers what many consider the finest panoramic view of Istanbul. Here\'s what to expect.',
      content: 'The Galata Tower dates from 1348 when it was built by Genoese merchants. The observation gallery at 63 metres height offers panoramic views of the Golden Horn, Bosphorus, and the historic peninsula. Sunrise and sunset are the best times for photographers. Book tickets online — queues can be long in high season. The Galata neighbourhood below is one of Istanbul\'s most charming areas, with jewellery shops, music instrument makers, and excellent coffee. From Istanbul Airport, a private transfer to Galata takes approximately 40-55 minutes.',
      image_url: null,
      status: 'active',
    },
  ];

  for (const post of blogPosts) {
    await prisma.blog.create({ data: post }).catch(() => {});
  }
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
