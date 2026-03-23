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

class AdminService {
  async getDashboardStats() {
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
      User.countDocuments({ 'deviceIds.isVerified': false }),
      FeeTransaction.aggregate([
        { $match: { type: 'deposit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      FeeTransaction.find()
        .populate('studentId', 'studentId')
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
  }

  async getAllStudents(page = 1, limit = 20, search = '') {
    const query = search
      ? {
          $or: [
            { studentId: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

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

  async getAllTeachers(page = 1, limit = 20) {
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

  async getAllClasses() {
    const classes = await Class.find()
      .populate('teacherId', 'firstName lastName')
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
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new NotFoundError('Teacher');
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      throw new NotFoundError('Class');
    }

    if (!teacher.assignedClasses.includes(classId)) {
      teacher.assignedClasses.push(classId);
      await teacher.save();
    }

    classDoc.teacherId = teacherId;
    await classDoc.save();

    const populatedTeacher = await Teacher.findById(teacherId)
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('assignedClasses', 'name grade');
    
    const populatedClass = await Class.findById(classId)
      .populate('teacherId', 'firstName lastName');

    return { 
      teacher: TeacherDTO.toClient(populatedTeacher), 
      class: ClassDTO.toClient(populatedClass),
    };
  }

  async getAllFeeTransactions(page = 1, limit = 50, filters = {}) {
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
