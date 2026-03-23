const mongoose = require('mongoose');

const feeTransactionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw'],
    required: true,
    index: true,
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
    index: true,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  balanceAfter: Number,
  transactionDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

feeTransactionSchema.index({ studentId: 1, transactionDate: -1 });

module.exports = mongoose.model('FeeTransaction', feeTransactionSchema);
