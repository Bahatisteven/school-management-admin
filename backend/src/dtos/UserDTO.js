class UserDTO {
  static toClient(user) {
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      hasVerifiedDevice: user.deviceIds.some(d => d.isVerified),
    };
  }

  static toClientWithDevices(user) {
    return {
      ...this.toClient(user),
      devices: user.deviceIds.map(device => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        isVerified: device.isVerified,
        verifiedAt: device.verifiedAt,
        addedAt: device.addedAt,
      })),
    };
  }
}

module.exports = UserDTO;
