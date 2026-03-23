const Student = require('../models/Student');
const FeeTransaction = require('../models/FeeTransaction');
const FeeTransactionDTO = require('../dtos/FeeTransactionDTO');
const notificationService = require('./notificationService');
const { NotFoundError, InsufficientBalanceError, ValidationError } = require('../utils/errors');
const { 
  LOW_BALANCE_THRESHOLD, 
  LOW_BALANCE_NOTIFICATION_COOLDOWN_DAYS,
  PAGINATION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
} = require('../config/constants');

class FeeService {
  async deposit(studentId, amount, description, processedBy) {
    if (amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      throw new NotFoundError('Student');
    }

    student.feeBalance += amount;
    const balanceAfter = student.feeBalance;
    await student.save();

    const transaction = new FeeTransaction({
      studentId,
      type: TRANSACTION_TYPES.DEPOSIT,
      amount,
      description: description || 'Fee deposit',
      status: TRANSACTION_STATUS.COMPLETED,
      processedBy,
      balanceAfter,
    });

    await transaction.save();

    if (student.userId) {
      await notificationService.notifyPaymentConfirmed(
        student.userId._id,
        amount,
        balanceAfter
      );
    }

    return {
      transaction: FeeTransactionDTO.toClient(transaction),
      newBalance: balanceAfter,
    };
  }

  async withdraw(studentId, amount, description, processedBy) {
    if (amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      throw new NotFoundError('Student');
    }

    if (student.feeBalance < amount) {
      throw new InsufficientBalanceError(
        `Insufficient balance. Available: ${student.feeBalance}, Requested: ${amount}`
      );
    }

    student.feeBalance -= amount;
    const balanceAfter = student.feeBalance;
    await student.save();

    const transaction = new FeeTransaction({
      studentId,
      type: TRANSACTION_TYPES.WITHDRAW,
      amount,
      description: description || 'Fee withdrawal',
      status: TRANSACTION_STATUS.COMPLETED,
      processedBy,
      balanceAfter,
    });

    await transaction.save();

    if (student.userId) {
      await notificationService.notifyRefundProcessed(
        student.userId._id,
        amount,
        balanceAfter
      );

      if (balanceAfter < LOW_BALANCE_THRESHOLD) {
        await notificationService.notifyLowBalance(student.userId._id, balanceAfter);
      }
    }

    return {
      transaction: FeeTransactionDTO.toClient(transaction),
      newBalance: balanceAfter,
    };
  }

  async getBalance(studentId) {
    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      throw new NotFoundError('Student');
    }

    if (student.userId && student.feeBalance < LOW_BALANCE_THRESHOLD) {
      const cooldownMs = LOW_BALANCE_NOTIFICATION_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
      const recentNotification = await require('../models/Notification').findOne({
        userId: student.userId._id,
        type: require('../config/constants').NOTIFICATION_TYPES.LOW_BALANCE,
        createdAt: { $gte: new Date(Date.now() - cooldownMs) },
      });

      if (!recentNotification) {
        await notificationService.notifyLowBalance(student.userId._id, student.feeBalance);
      }
    }

    return {
      balance: student.feeBalance,
      studentId: student.studentId,
      isLowBalance: student.feeBalance < LOW_BALANCE_THRESHOLD,
      threshold: LOW_BALANCE_THRESHOLD,
    };
  }

  async getTransactionHistory(studentId, limit = PAGINATION.TRANSACTION_LIMIT) {
    const transactions = await FeeTransaction.find({ studentId })
      .sort({ transactionDate: -1 })
      .limit(limit);

    return FeeTransactionDTO.toClientList(transactions);
  }
}

module.exports = new FeeService();
