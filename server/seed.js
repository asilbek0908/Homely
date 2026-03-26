const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Worker = require('./models/Worker');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Worker.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  console.log('Cleared existing data');

  // Create customers
  const customers = await User.create([
    {
      name: 'Jasur Toshmatov',
      email: 'jasur@gmail.com',
      phone: '+998901234567',
      password: 'password123',
      role: 'customer',
      location: { district: 'Chilonzor', city: 'Tashkent' },
    },
    {
      name: 'Dilnoza Yusupova',
      email: 'dilnoza@gmail.com',
      phone: '+998901234568',
      password: 'password123',
      role: 'customer',
      location: { district: 'Yunusabad', city: 'Tashkent' },
    },
    {
      name: 'Bobur Karimov',
      email: 'bobur@gmail.com',
      phone: '+998901234569',
      password: 'password123',
      role: 'customer',
      location: { district: 'Mirzo Ulugbek', city: 'Tashkent' },
    },
  ]);
  console.log('Created 3 customers');

  // Create worker users
  const workerUsers = await User.create([
    {
      name: 'Kamol Nazarov',
      email: 'kamol@gmail.com',
      phone: '+998901234570',
      password: 'password123',
      role: 'worker',
      location: { district: 'Chilonzor', city: 'Tashkent' },
    },
    {
      name: 'Sarvar Rakhimov',
      email: 'sarvar@gmail.com',
      phone: '+998901234571',
      password: 'password123',
      role: 'worker',
      location: { district: 'Yunusabad', city: 'Tashkent' },
    },
    {
      name: 'Mansur Umarov',
      email: 'mansur@gmail.com',
      phone: '+998901234572',
      password: 'password123',
      role: 'worker',
      location: { district: 'Mirzo Ulugbek', city: 'Tashkent' },
    },
  ]);
  console.log('Created 3 worker users');

  // Create admin
  await User.create({
    name: 'Admin User',
    email: 'admin@homely.uz',
    phone: '+998901234573',
    password: 'admin123',
    role: 'admin',
  });
  console.log('Created admin user');

  // Create worker profiles
  const workers = await Worker.create([
    {
      user: workerUsers[0]._id,
      bio: 'Professional plumber with 8 years of experience in Tashkent. Specializing in pipe repair, installation, and maintenance.',
      services: ['Plumbing', 'Pipe Repair'],
      jobRate: 50000,
      experience: 8,
      isVerified: true,
      verificationStatus: 'approved',
      rating: 4.8,
      totalReviews: 47,
      totalJobs: 52,
      location: { district: 'Chilonzor', city: 'Tashkent' },
    },
    {
      user: workerUsers[1]._id,
      bio: 'Licensed electrician with 10 years of experience. Expert in wiring, electrical repairs, and smart home installations.',
      services: ['Electrical', 'Wiring'],
      jobRate: 60000,
      experience: 10,
      isVerified: true,
      verificationStatus: 'approved',
      rating: 4.9,
      totalReviews: 63,
      totalJobs: 71,
      location: { district: 'Yunusabad', city: 'Tashkent' },
    },
    {
      user: workerUsers[2]._id,
      bio: 'Professional AC technician with 5 years of experience. Installation, maintenance, and repair of all AC brands.',
      services: ['AC Repair'],
      jobRate: 40000,
      experience: 5,
      isVerified: true,
      verificationStatus: 'approved',
      rating: 4.7,
      totalReviews: 38,
      totalJobs: 44,
      location: { district: 'Mirzo Ulugbek', city: 'Tashkent' },
    },
  ]);
  console.log('Created 3 worker profiles');

  // Create bookings
  const bookings = await Booking.create([
    {
      customer: customers[0]._id,
      worker: workers[0]._id,
      service: 'Plumbing',
      description: 'Kitchen sink is leaking, need urgent repair',
      scheduledDate: new Date('2024-12-20'),
      scheduledTime: '10:00',
      address: 'Chilonzor district, Tashkent',
      district: 'Chilonzor',
      status: 'completed',
      price: 150000,
      commission: 15000,
      paymentStatus: 'paid',
    },
    {
      customer: customers[1]._id,
      worker: workers[1]._id,
      service: 'Electrical',
      description: 'Need to install new light fixtures in living room',
      scheduledDate: new Date('2024-12-22'),
      scheduledTime: '14:00',
      address: 'Yunusabad district, Tashkent',
      district: 'Yunusabad',
      status: 'completed',
      price: 200000,
      commission: 20000,
      paymentStatus: 'paid',
    },
    {
      customer: customers[2]._id,
      worker: workers[2]._id,
      service: 'AC Repair',
      description: 'AC unit not cooling properly, needs inspection and repair',
      scheduledDate: new Date('2024-12-25'),
      scheduledTime: '09:00',
      address: 'Mirzo Ulugbek district, Tashkent',
      district: 'Mirzo Ulugbek',
      status: 'pending',
      price: 180000,
      commission: 18000,
      paymentStatus: 'unpaid',
    },
  ]);
  console.log('Created 3 bookings');

  // Create reviews for completed bookings
  await Review.create([
    {
      booking: bookings[0]._id,
      customer: customers[0]._id,
      worker: workers[0]._id,
      rating: 5,
      comment: 'Kamol did an excellent job! Very professional and fixed the leak quickly.',
    },
    {
      booking: bookings[1]._id,
      customer: customers[1]._id,
      worker: workers[1]._id,
      rating: 5,
      comment: 'Sarvar is a true professional. Installed everything perfectly and cleaned up after.',
    },
  ]);
  console.log('Created 2 reviews');

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('Customer: jasur@gmail.com / password123');
  console.log('Worker:   kamol@gmail.com / password123');
  console.log('Admin:    admin@homely.uz / admin123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
