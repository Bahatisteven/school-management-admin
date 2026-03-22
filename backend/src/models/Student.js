const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  feeBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  dateOfBirth: Date,
  address: String,
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Student', studentSchema);
