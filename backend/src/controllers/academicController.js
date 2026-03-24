const academicService = require('../services/academicService');
const studentIdentifier = require('../utils/studentIdentifier');

class AcademicController {
  async getGrades(req, res, next) {
    try {
      const studentId = await studentIdentifier.resolveStudentIdFromParams(req.user, req.params);
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
      const studentId = await studentIdentifier.resolveStudentIdFromParams(req.user, req.params);
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
      const studentId = await studentIdentifier.resolveStudentIdFromParams(req.user, req.params);
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
      const { classId, date, students } = req.body;
      
      if (Array.isArray(students)) {
        // bulk recording for multiple students
        const count = await academicService.recordBulkAttendance(
          classId,
          date,
          students,
          req.user._id
        );
        
        return res.status(201).json({
          success: true,
          message: `${count} attendance records saved successfully`,
        });
      }

      //single record 
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
