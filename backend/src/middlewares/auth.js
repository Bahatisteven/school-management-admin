const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, isActive: true });

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const deviceId = req.header('X-Device-ID');
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    if (!user.hasVerifiedDevice(deviceId)) {
      return res.status(403).json({ 
        error: 'Device not verified', 
        message: 'This device needs to be verified by an administrator before you can access the system.' 
      });
    }

    req.user = user;
    req.token = token;
    req.deviceId = deviceId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { auth, authorize };
