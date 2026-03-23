class GradeDTO {
  static toClient(grade) {
    return {
      id: grade._id,
      subject: grade.subject,
      score: grade.score,
      grade: grade.grade,
      term: grade.term,
      academicYear: grade.academicYear,
      examType: grade.examType,
      remarks: grade.remarks,
      teacher: grade.teacherId ? {
        id: grade.teacherId._id || grade.teacherId,
        name: grade.teacherId.firstName && grade.teacherId.lastName 
          ? `${grade.teacherId.firstName} ${grade.teacherId.lastName}` 
          : undefined,
      } : null,
      recordedDate: grade.recordedDate,
    };
  }

  static toClientList(grades) {
    return grades.map(g => this.toClient(g));
  }
}

module.exports = GradeDTO;
