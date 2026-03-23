const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student', 'parent'],
    required: true,
    index: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  deviceIds: [{
    deviceId: {
      type: String,
      required: true,
    },
    deviceName: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  lastLogin: Date,
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const sha512Hash = crypto.createHash('sha512').update(this.password).digest('hex');
  this.password = await bcrypt.hash(sha512Hash, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  const sha512Hash = crypto.createHash('sha512').update(candidatePassword).digest('hex');
  return await bcrypt.compare(sha512Hash, this.password);
};

userSchema.methods.hasVerifiedDevice = function(deviceId) {
  return this.deviceIds.some(device => 
    device.deviceId === deviceId && device.isVerified
  );
};

userSchema.index({ 'deviceIds.isVerified': 1 });

module.exports = mongoose.model('User', userSchema);
