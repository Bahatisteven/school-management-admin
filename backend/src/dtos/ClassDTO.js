class ClassDTO {
  static toClient(classData) {
    return {
      id: classData._id,
      _id: classData._id, // For compatibility
      name: classData.name,
      grade: classData.grade,
      section: classData.section,
      academicYear: classData.academicYear,
      capacity: classData.capacity,
      teacherId: classData.teacherId ? {
        id: classData.teacherId._id || classData.teacherId,
        _id: classData.teacherId._id || classData.teacherId,
        firstName: classData.teacherId.userId?.firstName || classData.teacherId.firstName,
        lastName: classData.teacherId.userId?.lastName || classData.teacherId.lastName,
      } : null,
      schedule: classData.schedule?.map(item => ({
        day: item.day,
        subject: item.subject,
        startTime: item.startTime,
        endTime: item.endTime,
        teacherId: item.teacherId ? {
          id: item.teacherId._id || item.teacherId,
          _id: item.teacherId._id || item.teacherId,
          firstName: item.teacherId.firstName,
          lastName: item.teacherId.lastName,
        } : null,
      })) || [],
    };
  }

  static toClientList(classes) {
    return classes.map(c => this.toClient(c));
  }
}

module.exports = ClassDTO;

