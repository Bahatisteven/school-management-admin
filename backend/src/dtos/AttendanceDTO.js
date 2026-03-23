class AttendanceDTO {
  static toClient(attendance) {
    return {
      id: attendance._id,
      date: attendance.date,
      status: attendance.status,
      remarks: attendance.remarks,
      recordedBy: attendance.recordedBy ? {
        id: attendance.recordedBy._id || attendance.recordedBy,
        name: attendance.recordedBy.firstName && attendance.recordedBy.lastName 
          ? `${attendance.recordedBy.firstName} ${attendance.recordedBy.lastName}` 
          : undefined,
      } : null,
    };
  }

  static toClientList(attendanceRecords) {
    return attendanceRecords.map(a => this.toClient(a));
  }
}

module.exports = AttendanceDTO;
