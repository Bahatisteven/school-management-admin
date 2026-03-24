const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Teacher = require('./src/models/Teacher');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management_shared';

const teachers = [
  {
    email: 'john.math@school.com',
    password: 'Teacher@123',
    firstName: 'John',
    lastName: 'Smith',
    phoneNumber: '+250788111111',
    subjects: ['Mathematics', 'Physics'],
    qualification: 'MSc Mathematics',
  },
  {
    email: 'mary.english@school.com',
    password: 'Teacher@123',
    firstName: 'Mary',
    lastName: 'Johnson',
    phoneNumber: '+250788222222',
    subjects: ['English', 'Literature'],
    qualification: 'MA English Literature',
  },
  {
    email: 'david.science@school.com',
    password: 'Teacher@123',
    firstName: 'David',
    lastName: 'Wilson',
    phoneNumber: '+250788333333',
    subjects: ['Chemistry', 'Biology'],
    qualification: 'PhD Chemistry',
  },
];

async function createTeachers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    for (const teacherData of teachers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: teacherData.email });
      if (existingUser) {
        console.log(`✓ Teacher ${teacherData.email} already exists`);
        continue;
      }

      // Create user account
      const user = new User({
        email: teacherData.email,
        password: teacherData.password,
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        role: 'teacher',
        phoneNumber: teacherData.phoneNumber,
        deviceIds: [{
          deviceId: `teacher-device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          deviceName: 'Teacher Device',
          isVerified: true,
          verifiedAt: new Date(),
        }],
        isActive: true,
      });
      await user.save();

      // Create teacher profile
      const teacher = new Teacher({
        userId: user._id,
        teacherId: `TCH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        subjects: teacherData.subjects,
        qualification: teacherData.qualification,
        hireDate: new Date(),
      });
      await teacher.save();

      console.log(`✓ Created teacher: ${teacherData.firstName} ${teacherData.lastName}`);
      console.log(`  Email: ${teacherData.email}`);
      console.log(`  Password: ${teacherData.password}`);
      console.log(`  Subjects: ${teacherData.subjects.join(', ')}`);
      console.log('');
    }

    console.log('\n✅ All teachers created successfully!');
    console.log('\nTeacher Login Credentials:');
    console.log('================================');
    teachers.forEach(t => {
      console.log(`${t.firstName} ${t.lastName}:`);
      console.log(`  Email: ${t.email}`);
      console.log(`  Password: ${t.password}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTeachers();
