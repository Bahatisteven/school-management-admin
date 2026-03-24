class StudentDTO {
  static toClient(student, user = null) {
    const dto = {
      id: student._id,
      _id: student._id, // For compatibility
      studentId: student.studentId,
      feeBalance: student.feeBalance,
      dateOfBirth: student.dateOfBirth,
      enrollmentDate: student.enrollmentDate,
    };

    if (user) {
      dto.userId = {
        id: user._id || user,
        _id: user._id || user,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      };
      // Keep old format for compatibility
      dto.firstName = user.firstName;
      dto.lastName = user.lastName;
      dto.email = user.email;
      dto.phoneNumber = user.phoneNumber;
    }

    if (student.classId) {
      dto.classId = {
        id: student.classId._id || student.classId,
        _id: student.classId._id || student.classId,
        name: student.classId.name,
        grade: student.classId.grade,
      };
    }

    return dto;
  }

  static toClientDetailed(student, user, grades = [], attendance = []) {
    return {
      ...this.toClient(student, user),
      grades,
      attendance,
    };
  }
}

module.exports = StudentDTO;
