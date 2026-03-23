const Student = require('../models/Student');
const { ForbiddenError, NotFoundError } = require('./errors');

class StudentIdentifier {
  async resolveStudentId(user, childStudentId = null) {
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (!student) {
        throw new NotFoundError('Student profile');
      }
      return student._id;
    }
    
    if (user.role === 'parent') {
      if (!childStudentId) {
        throw new ForbiddenError('Child student ID is required for parent access');
      }
      
      const student = await Student.findById(childStudentId).populate('userId');
      if (!student) {
        throw new NotFoundError('Student');
      }

      if (student.parentId && !student.parentId.equals(user._id)) {
        throw new ForbiddenError('Access denied: Student not associated with this parent');
      }
      
      return childStudentId;
    }
    
    throw new ForbiddenError('Invalid role for student data access');
  }

  async resolveStudentIdFromParams(user, params) {
    return this.resolveStudentId(user, params.childStudentId);
  }

  async resolveStudentIdFromBody(user, body) {
    return this.resolveStudentId(user, body.childStudentId);
  }
}

module.exports = new StudentIdentifier();
