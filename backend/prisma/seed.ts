import { PrismaClient, UserRole, SessionType, PackageType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'gus@sanchescoaching.co.uk' },
    update: {},
    create: {
      email: 'gus@sanchescoaching.co.uk',
      firstName: 'Gus',
      lastName: 'Sanches',
      phone: '+447123456789',
      role: UserRole.ADMIN,
      passwordHash: hashedPassword,
      isVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test client user
  const clientPassword = await bcrypt.hash('Test123!', 12);
  const client = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+447987654321',
      role: UserRole.CLIENT,
      passwordHash: clientPassword,
      isVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Test client user created:', client.email);

  // Create session configurations
  const sessionConfigs = [
    {
      type: SessionType.ONE_TO_ONE,
      name: '1-to-1 Session',
      description:
        'Intensive one-on-one coaching focused on your individual development',
      duration: 60,
      price: 50.0,
      maxParticipants: 1,
    },
    {
      type: SessionType.SMALL_GROUP,
      name: 'Small Group Session',
      description: 'Train with up to 4 players in a dynamic group environment',
      duration: 90,
      price: 30.0,
      maxParticipants: 4,
    },
    {
      type: SessionType.ASSESSMENT,
      name: 'Skills Assessment',
      description: 'Comprehensive skills assessment with detailed feedback report',
      duration: 45,
      price: 40.0,
      maxParticipants: 1,
    },
    {
      type: SessionType.CAMP,
      name: 'Training Camp',
      description: 'Intensive multi-day training camp',
      duration: 480,
      price: 350.0,
      maxParticipants: 20,
    },
  ];

  for (const config of sessionConfigs) {
    await prisma.sessionConfig.upsert({
      where: { type: config.type },
      update: config,
      create: config,
    });
  }
  console.log('✅ Session configurations created');

  // Create working hours (Monday to Saturday, 9 AM to 6 PM)
  const workingHours = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' }, // Friday
    { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' }, // Saturday
  ];

  for (const hours of workingHours) {
    await prisma.workingHours.upsert({
      where: { dayOfWeek: hours.dayOfWeek },
      update: hours,
      create: { ...hours, isActive: true },
    });
  }
  console.log('✅ Working hours configured');

  // Create sample events
  const events = [
    {
      title: 'Summer Training Camp 2024',
      description:
        '5-day intensive training camp focusing on technical skills, tactical awareness, and fitness',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-19'),
      location: 'City Sports Complex',
      capacity: 20,
      currentBookings: 0,
      price: 350.0,
      isPublished: true,
      isFeatured: true,
    },
    {
      title: 'Elite Skills Workshop',
      description:
        '2-day workshop for advanced players looking to take their skills to the next level',
      startDate: new Date('2024-08-05'),
      endDate: new Date('2024-08-06'),
      location: 'Elite Training Ground',
      capacity: 15,
      currentBookings: 0,
      price: 200.0,
      isPublished: true,
      isFeatured: false,
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }
  console.log('✅ Sample events created');

  // Create sample discount codes
  const discounts = [
    {
      code: 'WELCOME10',
      description: 'Welcome offer - 10% off first booking',
      discountType: 'PERCENTAGE',
      discountValue: 10.0,
      validFrom: new Date(),
      validUntil: new Date('2025-12-31'),
      applicableTo: 'ALL',
      isActive: true,
    },
    {
      code: 'SUMMER2024',
      description: 'Summer special - £20 off packages',
      discountType: 'FIXED',
      discountValue: 20.0,
      validFrom: new Date('2024-06-01'),
      validUntil: new Date('2024-08-31'),
      applicableTo: 'PACKAGE',
      isActive: true,
    },
  ];

  for (const discount of discounts) {
    await prisma.discountCode.upsert({
      where: { code: discount.code },
      update: discount,
      create: discount,
    });
  }
  console.log('✅ Discount codes created');

  // Create notification templates
  const notifications = [
    {
      type: 'EMAIL',
      event: 'BOOKING_CONFIRMED',
      subject: 'Booking Confirmed - Sanches Coaching',
      emailTemplate: 'Your booking has been confirmed!',
      isActive: true,
    },
    {
      type: 'SMS',
      event: 'REMINDER_24H',
      smsTemplate: 'Reminder: You have a session tomorrow at {time}',
      isActive: true,
      sendBefore: 1440, // 24 hours
    },
    {
      type: 'SMS',
      event: 'REMINDER_1H',
      smsTemplate: 'Reminder: Your session starts in 1 hour!',
      isActive: true,
      sendBefore: 60, // 1 hour
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }
  console.log('✅ Notification templates created');

  // Create system configuration
  const systemConfigs = [
    {
      key: 'MIN_BOOKING_NOTICE_HOURS',
      value: '24',
      description: 'Minimum hours notice required for bookings',
    },
    {
      key: 'SESSION_BUFFER_MINUTES',
      value: '15',
      description: 'Buffer time between sessions in minutes',
    },
    {
      key: 'CANCELLATION_NOTICE_HOURS',
      value: '24',
      description: 'Minimum hours notice required for cancellations',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config,
    });
  }
  console.log('✅ System configuration created');

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: gus@sanchescoaching.co.uk');
  console.log('  Password: Admin123!');
  console.log('');
  console.log('Test Client:');
  console.log('  Email: test@example.com');
  console.log('  Password: Test123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
