const academicService = require('../services/academicService');
const studentService = require('../services/studentService');

class AcademicController {
  async getGrades(req, res, next) {
    try {
      let studentId;
      
      if (req.user.role === 'student') {
        const profile = await studentService.getStudentProfile(req.user._id);
        studentId = profile.id;
      } else if (req.user.role === 'parent') {
        const { childStudentId } = req.params;
        studentId = childStudentId;
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

      const grades = await academicService.getStudentGrades(studentId);
      
      res.json({
        success: true,
        data: grades,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      let studentId;
      
      if (req.user.role === 'student') {
        const profile = await studentService.getStudentProfile(req.user._id);
        studentId = profile.id;
      } else if (req.user.role === 'parent') {
        const { childStudentId } = req.params;
        studentId = childStudentId;
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

      const attendance = await academicService.getStudentAttendance(studentId, startDate, endDate);
      
      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTimetable(req, res, next) {
    try {
      let studentId;
      
      if (req.user.role === 'student') {
        const profile = await studentService.getStudentProfile(req.user._id);
        studentId = profile.id;
      } else if (req.user.role === 'parent') {
        const { childStudentId } = req.params;
        studentId = childStudentId;
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

      const timetable = await academicService.getStudentTimetable(studentId);
      
      res.json({
        success: true,
        data: timetable,
      });
    } catch (error) {
      next(error);
    }
  }

  async addGrade(req, res, next) {
    try {
      const grade = await academicService.addGrade({
        ...req.body,
        teacherId: req.user._id,
      });
      
      res.status(201).json({
        success: true,
        message: 'Grade added successfully',
        data: grade,
      });
    } catch (error) {
      next(error);
    }
  }

  async recordAttendance(req, res, next) {
    try {
      const attendance = await academicService.recordAttendance({
        ...req.body,
        recordedBy: req.user._id,
      });
      
      res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AcademicController();
