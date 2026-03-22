const studentService = require('../services/studentService');

class StudentController {
  async getProfile(req, res, next) {
    try {
      const profile = await studentService.getStudentProfile(req.user._id);
      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChildren(req, res, next) {
    try {
      const children = await studentService.getChildrenForParent(req.user._id);
      res.json({
        success: true,
        data: children,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await studentService.getStudentProfile(req.user._id);
      const updated = await studentService.updateStudentProfile(profile.id, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
