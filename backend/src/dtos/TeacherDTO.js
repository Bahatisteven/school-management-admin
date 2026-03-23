class TeacherDTO {
  static toClient(teacher) {
    return {
      id: teacher._id,
      employeeId: teacher.employeeId,
      user: teacher.userId ? {
        id: teacher.userId._id || teacher.userId,
        firstName: teacher.userId.firstName,
        lastName: teacher.userId.lastName,
        email: teacher.userId.email,
        phoneNumber: teacher.userId.phoneNumber,
      } : null,
      subject: teacher.subject,
      qualification: teacher.qualification,
      assignedClasses: teacher.assignedClasses?.map(cls => 
        cls._id ? {
          id: cls._id,
          name: cls.name,
          grade: cls.grade,
        } : cls
      ) || [],
      joinDate: teacher.joinDate,
    };
  }

  static toClientList(teachers) {
    return teachers.map(t => this.toClient(t));
  }
}

module.exports = TeacherDTO;
