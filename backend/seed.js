const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kayzera');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [
      {
        email: 'investor@demo.com',
        password: 'password123',
        name: 'Ada Lovelace',
        userType: 'investor',
        wallet: { ngn: 5000000, usdt: 1250.50, usdc: 800.25 },
        kycStatus: 'Verified',
        twoFactorEnabled: true
      },
      {
        email: 'developer@demo.com',
        password: 'password123',
        name: 'Charles Babbage',
        userType: 'developer',
        wallet: { ngn: 1200000, usdt: 500, usdc: 100 },
        companyProfile: {
          name: 'Babbage Constructions Ltd.',
          regNumber: 'RC123456',
          address: '1 Innovation Drive, Yaba, Lagos',
          website: 'https://babbageconstructions.com'
        },
        twoFactorEnabled: false,
        treasuryAddress: '0x1234ABCD5678EFGH9101KLMN1213OPQR1415STUV'
      },
      {
        email: 'admin@demo.com',
        password: 'password123',
        name: 'Admin Grace Hopper',
        userType: 'admin',
        wallet: { ngn: 0, usdt: 0, usdc: 0 }
      },
      {
        email: 'buyer@demo.com',
        password: 'password123',
        name: 'Bayo Adekunle',
        userType: 'investor',
        wallet: { ngn: 2500000, usdt: 2000, usdc: 1500 },
        kycStatus: 'Not Submitted',
        twoFactorEnabled: false
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Created users:', createdUsers.length);

    // Create projects
    const projects = [
      {
        title: 'Luxury Apartment Complex - Victoria Island',
        tokenTicker: 'VIC',
        tokenSupply: 1000000,
        developerId: createdUsers[1]._id, // Charles Babbage
        developerName: 'Charles Babbage',
        location: 'Victoria Island, Lagos',
        fundingGoal: 5000000,
        amountRaised: 2500000,
        apy: 12,
        term: 24,
        description: 'A premium residential development featuring modern amenities and sustainable design.',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        status: 'active',
        contractAddress: '0x1234567890123456789012345678901234567890'
      },
      {
        title: 'Commercial Office Space - Ikoyi',
        tokenTicker: 'IKY',
        tokenSupply: 2000000,
        developerId: createdUsers[1]._id,
        developerName: 'Charles Babbage',
        location: 'Ikoyi, Lagos',
        fundingGoal: 8000000,
        amountRaised: 4000000,
        apy: 15,
        term: 36,
        description: 'Modern office complex in the heart of Ikoyi business district.',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        images: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
        ],
        status: 'active',
        contractAddress: '0x2345678901234567890123456789012345678901'
      },
      {
        title: 'Residential Estate - Lekki Phase 1',
        tokenTicker: 'LEK',
        tokenSupply: 1500000,
        developerId: createdUsers[1]._id,
        developerName: 'Charles Babbage',
        location: 'Lekki Phase 1, Lagos',
        fundingGoal: 6000000,
        amountRaised: 0,
        apy: 18,
        term: 30,
        description: 'Family-friendly residential estate with modern infrastructure.',
        imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
        ],
        status: 'pending',
        contractAddress: '0x3456789012345678901234567890123456789012'
      },
      {
        title: 'Mixed-Use Development - Surulere',
        tokenTicker: 'SUR',
        tokenSupply: 3000000,
        developerId: createdUsers[1]._id,
        developerName: 'Charles Babbage',
        location: 'Surulere, Lagos',
        fundingGoal: 12000000,
        amountRaised: 0,
        apy: 20,
        term: 48,
        description: 'Comprehensive mixed-use development with residential and commercial spaces.',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
        ],
        status: 'pending',
        contractAddress: '0x4567890123456789012345678901234567890123'
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('Created projects:', createdProjects.length);

    console.log('Database seeded successfully!');
    console.log('\nDemo accounts:');
    console.log('Investor: investor@demo.com / password123');
    console.log('Developer: developer@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');
    console.log('Buyer: buyer@demo.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
