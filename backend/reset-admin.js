const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management';

async function resetAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // delete existing admin
    const deleted = await User.deleteOne({ email: 'admin@school.com' });
    if (deleted.deletedCount > 0) {
      console.log('Existing admin user deleted');
    }

    // creat fresh admin
    const password = 'Admin@123';

    const admin = new User({
      email: 'admin@school.com',
      password: password,  
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      phoneNumber: '+250788000000',
      deviceIds: [{
        deviceId: 'admin-device-001',
        deviceName: 'Admin Workstation',
        isVerified: true,
        verifiedAt: new Date(),
        addedAt: new Date(),
      }],
      isActive: true,
    });

    await admin.save();

    console.log('\n Admin user reset successfully!\n');
    console.log('Login Credentials:');
    console.log('==================');
    console.log('Email:     admin@school.com');
    console.log('Password:  Admin@123');
    console.log('Device ID: admin-device-001');
    console.log('\nYou can now login to the admin dashboard.\n');

    const testAdmin = await User.findOne({ email: 'admin@school.com' });
    const isValid = await testAdmin.comparePassword('Admin@123');
    
    if (isValid) {
      console.log(' Password verification successful!');
    } else {
      console.log(' Password verification failed - something is wrong!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
