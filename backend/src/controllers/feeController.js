const feeService = require('../services/feeService');
const studentService = require('../services/studentService');

class FeeController {
  async deposit(req, res, next) {
    try {
      const { amount, description } = req.body;
      
      let studentId;
      if (req.user.role === 'student') {
        const profile = await studentService.getStudentProfile(req.user._id);
        studentId = profile.id;
      } else if (req.user.role === 'parent') {
        const { childStudentId } = req.body;
        if (!childStudentId) {
          return res.status(400).json({ error: 'Child student ID is required' });
        }
        studentId = childStudentId;
      } else {
        return res.status(403).json({ error: 'Invalid role for fee deposit' });
      }

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
      
      let studentId;
      if (req.user.role === 'student') {
        const profile = await studentService.getStudentProfile(req.user._id);
        studentId = profile.id;
      } else if (req.user.role === 'parent') {
        const { childStudentId } = req.body;
        if (!childStudentId) {
          return res.status(400).json({ error: 'Child student ID is required' });
        }
        studentId = childStudentId;
      } else {
        return res.status(403).json({ error: 'Invalid role for fee withdrawal' });
      }

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
      let studentId;
      
      if (req.user.role === 'student') {
        const profile = await studentService.getStudentProfile(req.user._id);
        studentId = profile.id;
      } else if (req.user.role === 'parent') {
        const { childStudentId } = req.params;
        studentId = childStudentId;
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

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
      let studentId;
      
      if (req.user.role === 'student') {
        const profile = await studentService.getStudentProfile(req.user._id);
        studentId = profile.id;
      } else if (req.user.role === 'parent') {
        const { childStudentId } = req.params;
        studentId = childStudentId;
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

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
