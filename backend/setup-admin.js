const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management';

async function setupAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      role: String,
      phoneNumber: String,
      deviceIds: Array,
      isActive: Boolean,
    }));

    const existingAdmin = await User.findOne({ email: 'admin@school.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@school.com');
      console.log('Password: Admin@123');
      process.exit(0);
    }

    // create admin
    const password = 'Admin@123';
    const sha512Hash = crypto.createHash('sha512').update(password).digest('hex');
    const hashedPassword = await bcrypt.hash(sha512Hash, 12);

    const admin = new User({
      email: 'admin@school.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      phoneNumber: '+250788000000',
      deviceIds: [{
        deviceId: 'admin-device-001',
        deviceName: 'Admin Workstation',
        isVerified: true,
        addedAt: new Date(),
      }],
      isActive: true,
    });

    await admin.save();

    console.log('\nAdmin user created successfully!\n');
    console.log('Login Credentials:');
    console.log('==================');
    console.log('Email:     admin@school.com');
    console.log('Password:  Admin@123');
    console.log('Device ID: admin-device-001');
    console.log('\nYou can now login to the admin dashboard.\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
