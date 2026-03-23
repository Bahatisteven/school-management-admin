class ClassDTO {
  static toClient(classData) {
    return {
      id: classData._id,
      name: classData.name,
      grade: classData.grade,
      section: classData.section,
      academicYear: classData.academicYear,
      capacity: classData.capacity,
      teacher: classData.teacherId ? {
        id: classData.teacherId._id || classData.teacherId,
        name: classData.teacherId.firstName && classData.teacherId.lastName 
          ? `${classData.teacherId.firstName} ${classData.teacherId.lastName}` 
          : undefined,
      } : null,
      schedule: classData.schedule?.map(item => ({
        day: item.day,
        subject: item.subject,
        startTime: item.startTime,
        endTime: item.endTime,
        teacher: item.teacherId ? {
          id: item.teacherId._id || item.teacherId,
          name: item.teacherId.firstName && item.teacherId.lastName 
            ? `${item.teacherId.firstName} ${item.teacherId.lastName}` 
            : undefined,
        } : null,
      })) || [],
    };
  }

  static toClientList(classes) {
    return classes.map(c => this.toClient(c));
  }
}

module.exports = ClassDTO;
