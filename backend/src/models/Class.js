const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  grade: {
    type: String,
    required: true,
  },
  section: String,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  academicYear: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    default: 30,
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    subject: String,
    startTime: String,
    endTime: String,
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Class', classSchema);
