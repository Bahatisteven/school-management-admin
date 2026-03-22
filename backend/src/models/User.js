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
  },
  lastLogin: Date,
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // First apply SHA-512 hashing as per requirements
  const sha512Hash = crypto.createHash('sha512').update(this.password).digest('hex');
  // Then apply bcrypt for additional security
  this.password = await bcrypt.hash(sha512Hash, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  // Apply SHA-512 to candidate password before comparing
  const sha512Hash = crypto.createHash('sha512').update(candidatePassword).digest('hex');
  return await bcrypt.compare(sha512Hash, this.password);
};

userSchema.methods.hasVerifiedDevice = function(deviceId) {
  return this.deviceIds.some(device => 
    device.deviceId === deviceId && device.isVerified
  );
};

module.exports = mongoose.model('User', userSchema);
