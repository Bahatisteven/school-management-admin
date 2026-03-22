const mongoose = require('mongoose');

const feeTransactionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'completed',
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  balanceAfter: Number,
  transactionDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FeeTransaction', feeTransactionSchema);
