const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

class AcademicService {
  async getStudentGrades(studentId) {
    const grades = await Grade.find({ studentId })
      .populate('teacherId', 'firstName lastName')
      .sort({ recordedDate: -1 });

    return grades.map(grade => ({
      id: grade._id,
      subject: grade.subject,
      score: grade.score,
      grade: grade.grade,
      term: grade.term,
      academicYear: grade.academicYear,
      examType: grade.examType,
      remarks: grade.remarks,
      teacher: grade.teacherId ? `${grade.teacherId.firstName} ${grade.teacherId.lastName}` : null,
      recordedDate: grade.recordedDate,
    }));
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

    return attendance.map(record => ({
      id: record._id,
      date: record.date,
      status: record.status,
      remarks: record.remarks,
      recordedBy: record.recordedBy ? `${record.recordedBy.firstName} ${record.recordedBy.lastName}` : null,
    }));
  }

  async getStudentTimetable(studentId) {
    const student = await Student.findById(studentId).populate('classId');
    if (!student || !student.classId) {
      throw new Error('Student class not found');
    }

    const classData = await Class.findById(student.classId)
      .populate('schedule.teacherId', 'firstName lastName');

    if (!classData) {
      throw new Error('Class not found');
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
    return grade;
  }

  async recordAttendance(attendanceData) {
    const attendance = new Attendance(attendanceData);
    await attendance.save();
    return attendance;
  }
}

module.exports = new AcademicService();
