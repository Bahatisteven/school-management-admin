const studentService = require('../services/studentService');

class StudentIdentifier {
  async resolveStudentId(user, childStudentId = null) {
    if (user.role === 'student') {
      const profile = await studentService.getStudentProfile(user._id);
      return profile.id;
    }
    
    if (user.role === 'parent') {
      if (!childStudentId) {
        throw new Error('Child student ID is required for parent access');
      }
      
      const children = await studentService.getChildrenForParent(user._id);
      const hasAccess = children.some(child => child.id === childStudentId);
      
      if (!hasAccess) {
        throw new Error('Access denied: Student not associated with this parent');
      }
      
      return childStudentId;
    }
    
    throw new Error('Invalid role for student data access');
  }

  async resolveStudentIdFromParams(user, params) {
    return this.resolveStudentId(user, params.childStudentId);
  }

  async resolveStudentIdFromBody(user, body) {
    return this.resolveStudentId(user, body.childStudentId);
  }
}

module.exports = new StudentIdentifier();
