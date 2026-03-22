const Student = require('../models/Student');
const FeeTransaction = require('../models/FeeTransaction');
const FeeTransactionDTO = require('../dtos/FeeTransactionDTO');

class FeeService {
  async deposit(studentId, amount, description, processedBy) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    student.feeBalance += amount;
    const balanceAfter = student.feeBalance;
    await student.save();

    const transaction = new FeeTransaction({
      studentId,
      type: 'deposit',
      amount,
      description: description || 'Fee deposit',
      status: 'completed',
      processedBy,
      balanceAfter,
    });

    await transaction.save();

    return {
      transaction: FeeTransactionDTO.toClient(transaction),
      newBalance: balanceAfter,
    };
  }

  async withdraw(studentId, amount, description, processedBy) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    if (student.feeBalance < amount) {
      throw new Error('Insufficient balance');
    }

    student.feeBalance -= amount;
    const balanceAfter = student.feeBalance;
    await student.save();

    const transaction = new FeeTransaction({
      studentId,
      type: 'withdraw',
      amount,
      description: description || 'Fee withdrawal',
      status: 'completed',
      processedBy,
      balanceAfter,
    });

    await transaction.save();

    return {
      transaction: FeeTransactionDTO.toClient(transaction),
      newBalance: balanceAfter,
    };
  }

  async getBalance(studentId) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    return {
      balance: student.feeBalance,
      studentId: student.studentId,
    };
  }

  async getTransactionHistory(studentId, limit = 50) {
    const transactions = await FeeTransaction.find({ studentId })
      .sort({ transactionDate: -1 })
      .limit(limit);

    return FeeTransactionDTO.toClientList(transactions);
  }
}

module.exports = new FeeService();
