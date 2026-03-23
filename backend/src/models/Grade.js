const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  grade: String,
  term: String,
  academicYear: String,
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment'],
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  remarks: String,
  recordedDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

gradeSchema.index({ studentId: 1, recordedDate: -1 });
gradeSchema.index({ classId: 1, academicYear: 1, term: 1 });

module.exports = mongoose.model('Grade', gradeSchema);
