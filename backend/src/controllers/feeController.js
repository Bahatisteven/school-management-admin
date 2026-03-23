const feeService = require('../services/feeService');
const studentIdentifier = require('../utils/studentIdentifier');

class FeeController {
  async deposit(req, res, next) {
    try {
      const { amount, description } = req.body;
      const studentId = await studentIdentifier.resolveStudentIdFromBody(req.user, req.body);
      
      const result = await feeService.deposit(studentId, amount, description, req.user._id);
      
      res.json({
        success: true,
        message: 'Deposit successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      const { amount, description } = req.body;
      const studentId = await studentIdentifier.resolveStudentIdFromBody(req.user, req.body);
      
      const result = await feeService.withdraw(studentId, amount, description, req.user._id);
      
      res.json({
        success: true,
        message: 'Withdrawal successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req, res, next) {
    try {
      const studentId = await studentIdentifier.resolveStudentIdFromParams(req.user, req.params);
      const balance = await feeService.getBalance(studentId);
      
      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const studentId = await studentIdentifier.resolveStudentIdFromParams(req.user, req.params);
      const history = await feeService.getTransactionHistory(studentId);
      
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeeController();
