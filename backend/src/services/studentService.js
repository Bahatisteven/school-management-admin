const Student = require('../models/Student');
const User = require('../models/User');
const StudentDTO = require('../dtos/StudentDTO');

class StudentService {
  async getStudentProfile(userId) {
    const student = await Student.findOne({ userId }).populate('classId');
    if (!student) {
      throw new Error('Student profile not found');
    }

    const user = await User.findById(userId).select('-password');
    return StudentDTO.toClient(student, user);
  }

  async getStudentByStudentId(studentId) {
    const student = await Student.findOne({ studentId }).populate('classId userId');
    if (!student) {
      throw new Error('Student not found');
    }

    return StudentDTO.toClient(student, student.userId);
  }

  async updateStudentProfile(studentId, updates) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    Object.assign(student, updates);
    await student.save();

    return student;
  }

  async getChildrenForParent(parentId) {
    const students = await Student.find({ parentId })
      .populate('userId classId');

    return students.map(student => 
      StudentDTO.toClient(student, student.userId)
    );
  }
}

module.exports = new StudentService();
