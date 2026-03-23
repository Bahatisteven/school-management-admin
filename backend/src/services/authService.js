const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { generateStudentId } = require('../utils/helpers');
const UserDTO = require('../dtos/UserDTO');
const notificationService = require('./notificationService');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName, role, phoneNumber, dateOfBirth } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber,
    });

    await user.save();

    if (role === 'student') {
      const student = new Student({
        userId: user._id,
        studentId: generateStudentId(),
        dateOfBirth,
      });
      await student.save();
    }

    return UserDTO.toClient(user);
  }

  async login(email, password, deviceId, deviceName) {
    console.log('Login attempt:', { email, deviceId, passwordLength: password?.length });
    
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      console.log('User not found or inactive');
      throw new UnauthorizedError('Invalid credentials');
    }

    console.log('User found:', { email: user.email, role: user.role });

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const existingDevice = user.deviceIds.find(d => d.deviceId === deviceId);
    
    if (user.role === 'admin') {
      if (!existingDevice) {
        user.deviceIds.push({
          deviceId,
          deviceName: deviceName || 'Unknown Device',
          isVerified: true, // Auto-verify admin devices
          verifiedAt: new Date(),
        });
        await user.save();
      }
      
      user.lastLogin = new Date();
      await user.save();

      await notificationService.notifySuccessfulLogin(user._id, deviceName || 'Unknown Device');

      const token = this.generateToken(user);
      return {
        success: true,
        token,
        user: UserDTO.toClient(user),
      };
    }
    
    if (!existingDevice) {
      user.deviceIds.push({
        deviceId,
        deviceName: deviceName || 'Unknown Device',
        isVerified: false,
      });
      await user.save();
      
      return {
        success: false,
        message: 'Device needs verification. Please wait for admin approval.',
        requiresVerification: true,
      };
    }

    if (!existingDevice.isVerified) {
      return {
        success: false,
        message: 'Device is pending verification by administrator.',
        requiresVerification: true,
      };
    }

    user.lastLogin = new Date();
    await user.save();

    await notificationService.notifySuccessfulLogin(user._id, deviceName || 'Unknown Device');

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY || '24h' }
    );

    return {
      success: true,
      token,
      user: UserDTO.toClient(user),
    };
  }

  async verifyDevice(userId, deviceId, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const device = user.deviceIds.find(d => d.deviceId === deviceId);
    if (!device) {
      throw new NotFoundError('Device');
    }

    if (device.isVerified) {
      throw new ConflictError('Device already verified');
    }

    device.isVerified = true;
    device.verifiedAt = new Date();
    device.verifiedBy = adminId;

    await user.save();

    await notificationService.notifyDeviceVerified(user._id, device.deviceName);

    return UserDTO.toClientWithDevices(user);
  }

  async getPendingVerifications() {
    const users = await User.find({
      'deviceIds.isVerified': false,
    }).select('-password');

    return users.map(user => ({
      user: UserDTO.toClient(user),
      pendingDevices: user.deviceIds
        .filter(d => !d.isVerified)
        .map(d => ({
          deviceId: d.deviceId,
          deviceName: d.deviceName,
          addedAt: d.addedAt,
        })),
    }));
  }

  generateToken(user) {
    return jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY || '24h' }
    );
  }
}

module.exports = new AuthService();
