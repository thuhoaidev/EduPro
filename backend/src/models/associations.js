const User = require('./User');
const Course = require('./Course');
const UserDevice = require('./UserDevice');
const DeviceViolation = require('./DeviceViolation');

// Existing associations...
// (Keep all existing associations)

// Device Security Associations
UserDevice.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

UserDevice.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

User.hasMany(UserDevice, {
  foreignKey: 'user_id',
  as: 'devices'
});

Course.hasMany(UserDevice, {
  foreignKey: 'course_id',
  as: 'devices'
});

DeviceViolation.belongsTo(User, {
  foreignKey: 'reviewed_by',
  as: 'reviewer'
});

User.hasMany(DeviceViolation, {
  foreignKey: 'reviewed_by',
  as: 'reviewedViolations'
});

module.exports = {
  User,
  Course,
  UserDevice,
  DeviceViolation
};
