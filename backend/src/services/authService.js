const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { generateStudentId } = require('../utils/helpers');
const UserDTO = require('../dtos/UserDTO');

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName, role, phoneNumber, dateOfBirth } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
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
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const existingDevice = user.deviceIds.find(d => d.deviceId === deviceId);
    
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
      throw new Error('User not found');
    }

    const device = user.deviceIds.find(d => d.deviceId === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    if (device.isVerified) {
      throw new Error('Device already verified');
    }

    device.isVerified = true;
    device.verifiedAt = new Date();
    device.verifiedBy = adminId;

    await user.save();

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
}

module.exports = new AuthService();
