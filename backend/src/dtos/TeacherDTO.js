class TeacherDTO {
  static toClient(teacher) {
    if (!teacher) return null;
    
    const user = teacher.userId;
    const dto = {
      id: teacher._id,
      _id: teacher._id, // For compatibility
      teacherId: teacher.teacherId,
      subjects: teacher.subjects || [],
      qualification: teacher.qualification,
      hireDate: teacher.hireDate,
      assignedClasses: teacher.assignedClasses?.map(cls => 
        cls._id ? {
          id: cls._id,
          _id: cls._id,
          name: cls.name,
          grade: cls.grade,
        } : cls
      ) || [],
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
    }

    return dto;
  }

  static toClientList(teachers) {
    return teachers.map(t => this.toClient(t));
  }
}

module.exports = TeacherDTO;
