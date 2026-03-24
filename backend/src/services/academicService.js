const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const GradeDTO = require('../dtos/GradeDTO');
const AttendanceDTO = require('../dtos/AttendanceDTO');
const { NotFoundError } = require('../utils/errors');
const notificationService = require('./notificationService');

class AcademicService {
  async getStudentGrades(studentId) {
    const grades = await Grade.find({ studentId })
      .populate('teacherId', 'firstName lastName')
      .sort({ recordedDate: -1 });

    return GradeDTO.toClientList(grades);
  }

  async getStudentAttendance(studentId, startDate, endDate) {
    const query = { studentId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('recordedBy', 'firstName lastName')
      .sort({ date: -1 });

    return AttendanceDTO.toClientList(attendance);
  }

  async getStudentTimetable(studentId) {
    const student = await Student.findById(studentId).populate('classId');
    if (!student || !student.classId) {
      throw new NotFoundError('Student class');
    }

    const classData = await Class.findById(student.classId)
      .populate('schedule.teacherId', 'firstName lastName');

    if (!classData) {
      throw new NotFoundError('Class');
    }

    return {
      class: {
        name: classData.name,
        grade: classData.grade,
      },
      schedule: classData.schedule.map(item => ({
        day: item.day,
        subject: item.subject,
        startTime: item.startTime,
        endTime: item.endTime,
        teacher: item.teacherId ? `${item.teacherId.firstName} ${item.teacherId.lastName}` : null,
      })),
    };
  }

  async addGrade(gradeData) {
    const grade = new Grade(gradeData);
    await grade.save();
    
    const populatedGrade = await Grade.findById(grade._id)
      .populate('teacherId', 'firstName lastName');

    const student = await Student.findById(gradeData.studentId).populate('userId');
    if (student && student.userId) {
      // send notif
      await notificationService.notifyGradeAdded(
        student.userId._id,
        gradeData.subject,
        gradeData.score
      );
    }
    
    return GradeDTO.toClient(populatedGrade);
  }

  async recordAttendance(attendanceData) {
    const attendance = new Attendance(attendanceData);
    await attendance.save();
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('recordedBy', 'firstName lastName');
    
    return AttendanceDTO.toClient(populatedAttendance);
  }

  async recordBulkAttendance(classId, date, records, recordedBy) {
    const mongoose = require('mongoose');
    let session = null;
    
    const isReplicaSet = mongoose.connection.getClient().topology?.description?.type === 'ReplicaSetWithPrimary' || 
                        process.env.NODE_ENV === 'production';

    if (isReplicaSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    try {
      const results = [];
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const options = session ? { session, upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true } 
                             : { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true };

      for (const record of records) {
        const query = {
          studentId: record.studentId,
          date: attendanceDate,
        };
        
        const update = {
          classId,
          status: record.status,
          remarks: record.remarks || '',
          recordedBy,
        };

        const result = await Attendance.findOneAndUpdate(query, update, options);
        results.push(result);
      }

      if (session) await session.commitTransaction();
      return results.length;
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }
}

module.exports = new AcademicService();
