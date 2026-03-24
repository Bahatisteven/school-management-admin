const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const FeeTransaction = require('../models/FeeTransaction');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const StudentDTO = require('../dtos/StudentDTO');
const TeacherDTO = require('../dtos/TeacherDTO');
const ClassDTO = require('../dtos/ClassDTO');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { PAGINATION, TRANSACTION_STATUS, TRANSACTION_TYPES } = require('../config/constants');

class AdminService {
  async getDashboardStats(user) {
    if (user.role === 'admin') {
      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        pendingVerifications,
        totalFeeCollected,
        recentTransactions,
      ] = await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Class.countDocuments(),
        User.countDocuments({ 
          'deviceIds.isVerified': false,
          role: { $ne: 'admin' }
        }),
        FeeTransaction.aggregate([
          { $match: { type: TRANSACTION_TYPES.DEPOSIT, status: TRANSACTION_STATUS.COMPLETED } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        FeeTransaction.find()
          .populate({
            path: 'studentId',
            select: 'studentId',
            populate: { path: 'userId', select: 'firstName lastName' }
          })
          .sort({ transactionDate: -1 })
          .limit(10),
      ]);

      return {
        totalStudents,
        totalTeachers,
        totalClasses,
        pendingVerifications,
        totalFeeCollected: totalFeeCollected[0]?.total || 0,
        recentTransactions,
      };
    } else if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: user._id || user.id });
      
      if (!teacher) {
        throw new NotFoundError('Teacher profile not found');
      }

      // Check for classes where THIS teacher is assigned
      // We check by teacher._id (the profile ID)
      const assignedClasses = await Class.find({ teacherId: teacher._id }).populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'firstName lastName' }
      });

      const assignedClassIds = assignedClasses.map(c => c._id);
      const studentsCount = await Student.countDocuments({ classId: { $in: assignedClassIds } });

      console.log(`Teacher Dashboard Debug [${teacher.teacherId}]:`);
      console.log(`- Teacher Profile ID: ${teacher._id}`);
      console.log(`- Found ${assignedClasses.length} Classes`);
      console.log(`- Found ${studentsCount} Students in those classes`);

      return {
        totalStudents: studentsCount,
        totalClasses: assignedClasses.length,
        assignedClasses: ClassDTO.toClientList(assignedClasses),
      };
    }
    return {};
  }

  async getAllStudents(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, search = '', user = null) {
    let query = search
      ? {
          $or: [
            { studentId: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    // Filter by teacher's classes if user is a teacher
    if (user && user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: user._id || user.id });
      if (teacher) {
        console.log('Fetching students for teacher:', teacher.teacherId);
        const teacherClasses = await Class.find({ teacherId: teacher._id }).distinct('_id');
        console.log('Teacher assigned to classes:', teacherClasses);
        query.classId = { $in: teacherClasses };
      } else {
        console.log('No teacher profile found for user:', user._id || user.id);
        return { students: [], pagination: { page, limit, total: 0, pages: 0 } };
      }
    }

    const students = await Student.find(query)
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('classId', 'name grade')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Student.countDocuments(query);

    return {
      students: students.map(s => StudentDTO.toClient(s, s.userId)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAllTeachers(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
    const teachers = await Teacher.find()
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('assignedClasses', 'name grade')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Teacher.countDocuments();

    return {
      teachers: TeacherDTO.toClientList(teachers),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async createTeacher(teacherData) {
    const mongoose = require('mongoose');
    let session = null;
    
    // Transactions only work on Replica Sets
    const isReplicaSet = mongoose.connection.getClient().topology?.description?.type === 'ReplicaSetWithPrimary' || 
                        process.env.NODE_ENV === 'production';

    if (isReplicaSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    try {
      const options = session ? { session } : {};

      // Check if user already exists
      const existingUser = await User.findOne({ email: teacherData.email }).session(session || null);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // 1. Create User account
      const user = new User({
        email: teacherData.email,
        password: teacherData.password,
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        role: 'teacher',
        phoneNumber: teacherData.phoneNumber,
        isActive: true,
      });
      await user.save(options);

      // 2. Generate Unique Teacher ID
      const year = new Date().getFullYear();
      const count = await Teacher.countDocuments().session(session || null);
      const teacherId = `TCH-${year}-${String(count + 1).padStart(3, '0')}`;

      // 3. Create Teacher profile
      const teacher = new Teacher({
        userId: user._id,
        teacherId,
        subjects: teacherData.subjects,
        qualification: teacherData.qualification,
        hireDate: new Date(),
      });
      await teacher.save(options);

      if (session) await session.commitTransaction();
      
      // Populate for DTO
      const populatedTeacher = await Teacher.findById(teacher._id)
        .populate('userId', 'firstName lastName email phoneNumber');
        
      return TeacherDTO.toClient(populatedTeacher);
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  async getAllClasses(user = null) {
    let query = {};
    
    if (user && user.role === 'teacher') {
      const userId = user._id || user.id;
      console.log('Fetching classes for teacher userId:', userId);
      const teacher = await Teacher.findOne({ userId });
      if (teacher) {
        console.log('Found teacher profile:', teacher.teacherId);
        query.teacherId = teacher._id;
      } else {
        console.log('Teacher profile NOT FOUND for userId:', userId);
        return [];
      }
    }

    const classes = await Class.find(query)
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .sort({ name: 1 });

    return ClassDTO.toClientList(classes);
  }

  async createClass(classData) {
    const existingClass = await Class.findOne({ name: classData.name });
    if (existingClass) {
      throw new ConflictError('Class with this name already exists');
    }

    const newClass = new Class(classData);
    await newClass.save();
    
    return ClassDTO.toClient(newClass);
  }

  async updateClass(classId, updates) {
    const classDoc = await Class.findByIdAndUpdate(classId, updates, {
      new: true,
      runValidators: true,
    }).populate('teacherId', 'firstName lastName');

    if (!classDoc) {
      throw new NotFoundError('Class');
    }

    return ClassDTO.toClient(classDoc);
  }

  async deleteClass(classId) {
    const classDoc = await Class.findByIdAndDelete(classId);
    if (!classDoc) {
      throw new NotFoundError('Class');
    }

    await Student.updateMany({ classId }, { $unset: { classId: 1 } });

    return ClassDTO.toClient(classDoc);
  }

  async assignTeacherToClass(teacherId, classId) {
    console.log(`Assignment Attempt: Teacher[${teacherId}] to Class[${classId}]`);
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      console.error('Assignment Error: Teacher not found for ID', teacherId);
      throw new NotFoundError('Teacher');
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      console.error('Assignment Error: Class not found for ID', classId);
      throw new NotFoundError('Class');
    }

    // Ensure teacher record has this class in its list
    if (!teacher.assignedClasses.includes(classId)) {
      teacher.assignedClasses.push(classId);
      await teacher.save();
    }

    // Ensure class record has this teacher ID
    classDoc.teacherId = teacher._id;
    await classDoc.save();

    console.log(`Successfully assigned ${teacher.teacherId} to class ${classDoc.name}`);

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('assignedClasses', 'name grade');
    
    const populatedClass = await Class.findById(classId)
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'firstName lastName' }
      });

    return { 
      teacher: TeacherDTO.toClient(populatedTeacher), 
      class: ClassDTO.toClient(populatedClass),
    };
  }

  async assignStudentToClass(studentId, classId) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    // Normalize empty string to null
    const normalizedClassId = classId && classId !== '' ? classId : null;

    if (normalizedClassId) {
      const classDoc = await Class.findById(normalizedClassId);
      if (!classDoc) {
        throw new NotFoundError('Class');
      }

      const currentClassStudents = await Student.countDocuments({ classId: normalizedClassId });
      if (currentClassStudents >= classDoc.capacity) {
        throw new ConflictError('Class has reached maximum capacity');
      }
    }

    student.classId = normalizedClassId;
    await student.save();

    const populatedStudent = await Student.findById(studentId)
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('classId', 'name grade section');

    return {
      student: StudentDTO.toClient(populatedStudent, populatedStudent.userId),
      message: normalizedClassId ? 'Student assigned to class successfully' : 'Student removed from class successfully',
    };
  }

  async getAllFeeTransactions(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.TRANSACTION_LIMIT, filters = {}) {
    const query = {};
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.transactionDate = {};
      if (filters.startDate) query.transactionDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.transactionDate.$lte = new Date(filters.endDate);
    }

    const transactions = await FeeTransaction.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName email' },
      })
      .sort({ transactionDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await FeeTransaction.countDocuments(query);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAttendanceReport(classId, startDate, endDate) {
    const query = { classId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'studentId')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .sort({ date: -1 });

    return attendance;
  }
}

module.exports = new AdminService();
