const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password, deviceId, deviceName } = req.body;
      const result = await authService.login(email, password, deviceId, deviceName);
      
      if (!result.success) {
        return res.status(403).json(result);
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyDevice(req, res, next) {
    try {
      const { userId, deviceId } = req.body;
      const user = await authService.verifyDevice(userId, deviceId, req.user._id);
      
      res.json({
        success: true,
        message: 'Device verified successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingVerifications(req, res, next) {
    try {
      const pending = await authService.getPendingVerifications();
      res.json({
        success: true,
        data: pending,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful',
    });
  }

  async getCurrentUser(req, res) {
    const UserDTO = require('../dtos/UserDTO');
    res.json({
      success: true,
      data: UserDTO.toClient(req.user),
    });
  }
}

module.exports = new AuthController();
