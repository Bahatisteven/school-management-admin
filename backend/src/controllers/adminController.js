const adminService = require('../services/adminService');
const authService = require('../services/authService');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudents(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await adminService.getAllStudents(
        parseInt(page),
        parseInt(limit),
        search
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeachers(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await adminService.getAllTeachers(parseInt(page), parseInt(limit));

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getClasses(req, res, next) {
    try {
      const classes = await adminService.getAllClasses();
      res.json({
        success: true,
        data: classes,
      });
    } catch (error) {
      next(error);
    }
  }

  async createClass(req, res, next) {
    try {
      const classData = req.body;
      const newClass = await adminService.createClass(classData);

      res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: newClass,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateClass(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const classData = await adminService.updateClass(id, updates);

      res.json({
        success: true,
        message: 'Class updated successfully',
        data: classData,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteClass(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.deleteClass(id);

      res.json({
        success: true,
        message: 'Class deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async assignTeacher(req, res, next) {
    try {
      const { teacherId, classId } = req.body;
      const result = await adminService.assignTeacherToClass(teacherId, classId);

      res.json({
        success: true,
        message: 'Teacher assigned successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeeTransactions(req, res, next) {
    try {
      const { page = 1, limit = 50, type, status, startDate, endDate } = req.query;
      const result = await adminService.getAllFeeTransactions(
        parseInt(page),
        parseInt(limit),
        { type, status, startDate, endDate }
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceReport(req, res, next) {
    try {
      const { classId, startDate, endDate } = req.query;
      const attendance = await adminService.getAttendanceReport(classId, startDate, endDate);

      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingVerifications(req, res, next) {
    try {
      const pending = await authService.getPendingVerifications();
      res.json({
        success: true,
        data: pending,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyDevice(req, res, next) {
    try {
      const { userId, deviceId } = req.body;
      const user = await authService.verifyDevice(userId, deviceId, req.user._id);

      res.json({
        success: true,
        message: 'Device verified successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
