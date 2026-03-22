class StudentDTO {
  static toClient(student, user = null) {
    const dto = {
      id: student._id,
      studentId: student.studentId,
      feeBalance: student.feeBalance,
      dateOfBirth: student.dateOfBirth,
      enrollmentDate: student.enrollmentDate,
    };

    if (user) {
      dto.firstName = user.firstName;
      dto.lastName = user.lastName;
      dto.email = user.email;
      dto.phoneNumber = user.phoneNumber;
    }

    if (student.classId) {
      dto.class = {
        id: student.classId._id,
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
