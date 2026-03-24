const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define schemas (simplified)
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  deviceIds: [String]
});

const StudentSchema = new mongoose.Schema({
  studentId: String,
  firstName: String,
  lastName: String,
  email: String,
  userId: mongoose.Schema.Types.ObjectId,
  classId: mongoose.Schema.Types.ObjectId,
  feeBalance: Number
});

const ClassSchema = new mongoose.Schema({
  name: String,
  grade: String,
  teacherId: mongoose.Schema.Types.ObjectId,
  capacity: Number
});

const TeacherSchema = new mongoose.Schema({
  teacherId: String,
  firstName: String,
  lastName: String,
  email: String,
  userId: mongoose.Schema.Types.ObjectId,
  subject: String
});

const FeeTransactionSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  type: String,
  amount: Number,
  description: String,
  balanceAfter: Number,
  transactionDate: Date
});

const GradeSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  subject: String,
  score: Number,
  grade: String,
  examType: String,
  term: String,
  teacher: String,
  recordedDate: Date
});

const AttendanceSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  date: Date,
  status: String,
  remarks: String,
  recordedBy: String
});

const User = mongoose.model('User', UserSchema);
const Student = mongoose.model('Student', StudentSchema);
const Class = mongoose.model('Class', ClassSchema);
const Teacher = mongoose.model('Teacher', TeacherSchema);
const FeeTransaction = mongoose.model('FeeTransaction', FeeTransactionSchema);
const Grade = mongoose.model('Grade', GradeSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 1. Create Admin User
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@school.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      deviceIds: ['admin-device-001']
    });
    console.log('✅ Admin created: admin@school.com / Admin123!\n');

    // 2. Create Classes
    console.log('Creating classes...');
    const class1 = await Class.create({
      name: 'Mathematics A',
      grade: 'Grade 10',
      capacity: 30
    });
    const class2 = await Class.create({
      name: 'Science B',
      grade: 'Grade 11',
      capacity: 25
    });
    console.log('✅ Classes created\n');

    // 3. Create Teacher Users
    console.log('Creating teachers...');
    const teacherPassword = await bcrypt.hash('Teacher123!', 10);
    const teacherUser1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@school.com',
      password: teacherPassword,
      role: 'teacher',
      isVerified: true,
      deviceIds: ['teacher-device-001']
    });
    
    const teacher1 = await Teacher.create({
      teacherId: 'TCH001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@school.com',
      userId: teacherUser1._id,
      subject: 'Mathematics'
    });
    
    // Update class with teacher
    class1.teacherId = teacher1._id;
    await class1.save();
    
    console.log('✅ Teacher created: john.doe@school.com / Teacher123!\n');

    // 4. Create Student User
    console.log('Creating student...');
    const studentPassword = await bcrypt.hash('Student123!', 10);
    const studentUser = await User.create({
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@student.com',
      password: studentPassword,
      role: 'student',
      isVerified: true,
      deviceIds: ['student-device-001']
    });
    
    const student = await Student.create({
      studentId: 'STU001',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@student.com',
      userId: studentUser._id,
      classId: class1._id,
      feeBalance: 50000
    });
    console.log('✅ Student created: alice.johnson@student.com / Student123!\n');

    // 5. Create Parent User
    console.log('Creating parent...');
    const parentPassword = await bcrypt.hash('Parent123!', 10);
    const parentUser = await User.create({
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@parent.com',
      password: parentPassword,
      role: 'parent',
      isVerified: true,
      deviceIds: ['parent-device-001']
    });
    console.log('✅ Parent created: robert.johnson@parent.com / Parent123!\n');

    // 6. Create Fee Transactions
    console.log('Creating fee transactions...');
    await FeeTransaction.create([
      {
        studentId: student._id,
        type: 'deposit',
        amount: 100000,
        description: 'Initial fee payment',
        balanceAfter: 100000,
        transactionDate: new Date('2026-01-15')
      },
      {
        studentId: student._id,
        type: 'withdraw',
        amount: 30000,
        description: 'Book refund',
        balanceAfter: 70000,
        transactionDate: new Date('2026-02-10')
      },
      {
        studentId: student._id,
        type: 'withdraw',
        amount: 20000,
        description: 'Uniform refund',
        balanceAfter: 50000,
        transactionDate: new Date('2026-03-05')
      }
    ]);
    console.log('✅ Fee transactions created\n');

    // 7. Create Grades
    console.log('Creating grades...');
    await Grade.create([
      {
        studentId: student._id,
        subject: 'Mathematics',
        score: 85,
        grade: 'A',
        examType: 'Midterm',
        term: 'Term 1',
        teacher: 'John Doe',
        recordedDate: new Date('2026-02-20')
      },
      {
        studentId: student._id,
        subject: 'Physics',
        score: 78,
        grade: 'B+',
        examType: 'Final',
        term: 'Term 1',
        teacher: 'Jane Smith',
        recordedDate: new Date('2026-03-10')
      },
      {
        studentId: student._id,
        subject: 'Chemistry',
        score: 92,
        grade: 'A+',
        examType: 'Midterm',
        term: 'Term 1',
        teacher: 'Mark Brown',
        recordedDate: new Date('2026-02-25')
      },
      {
        studentId: student._id,
        subject: 'English',
        score: 88,
        grade: 'A',
        examType: 'Final',
        term: 'Term 1',
        teacher: 'Sarah Wilson',
        recordedDate: new Date('2026-03-15')
      },
      {
        studentId: student._id,
        subject: 'Biology',
        score: 76,
        grade: 'B',
        examType: 'Midterm',
        term: 'Term 1',
        teacher: 'David Lee',
        recordedDate: new Date('2026-02-28')
      }
    ]);
    console.log('✅ Grades created\n');

    // 8. Create Attendance Records
    console.log('Creating attendance records...');
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let status = 'present';
      if (i === 5 || i === 12) status = 'absent';
      if (i === 8) status = 'late';
      
      attendanceRecords.push({
        studentId: student._id,
        date: date,
        status: status,
        remarks: status === 'absent' ? 'Sick' : status === 'late' ? 'Traffic' : '',
        recordedBy: 'John Doe'
      });
    }
    
    await Attendance.create(attendanceRecords);
    console.log('✅ Attendance records created\n');

    console.log('✨ Database seeding completed successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📝 Test Accounts Created:');
    console.log('═══════════════════════════════════════════════════');
    console.log('👨‍💼 Admin:   admin@school.com / Admin123!');
    console.log('👨‍🏫 Teacher: john.doe@school.com / Teacher123!');
    console.log('👨‍🎓 Student: alice.johnson@student.com / Student123!');
    console.log('👨‍👩‍👧 Parent:  robert.johnson@parent.com / Parent123!');
    console.log('═══════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();
