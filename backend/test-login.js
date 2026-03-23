const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const testPassword = 'Admin@123';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management')
  .then(async () => {
    console.log('Testing admin login...\n');
    
    const admin = await User.findOne({ email: 'admin@school.com' });
    if (!admin) {
      console.log('❌ Admin account not found!');
      mongoose.connection.close();
      return;
    }
    
    console.log('Testing password:', testPassword);
    const isValid = await admin.comparePassword(testPassword);
    
    if (isValid) {
      console.log('✅ Password is correct!');
      console.log('\nYou can login with:');
      console.log('Email: admin@school.com');
      console.log('Password:', testPassword);
    } else {
      console.log('❌ Password is incorrect!');
      console.log('\nPlease run setup-admin.js to reset the admin password');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
