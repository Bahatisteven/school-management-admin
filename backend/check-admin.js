const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management')
  .then(async () => {
    console.log('Checking admin account...\n');
    
    const admin = await User.findOne({ email: 'admin@school.com' });
    if (!admin) {
      console.log('Admin account not found!');
    } else {
      console.log('Admin account found');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Active:', admin.isActive);
      console.log('Devices:', admin.deviceIds.length);
      admin.deviceIds.forEach(d => {
        console.log('  -', d.deviceName, ':', d.deviceId, '- Verified:', d.isVerified);
      });
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
