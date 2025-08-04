const mongoose = require('mongoose');

const userDeviceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  device_id: {
    type: String,
    required: true,
    maxlength: 255
  },
  device_info: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ip_address: {
    type: String,
    maxlength: 45
  },
  user_agent: {
    type: String
  },
  registered_at: {
    type: Date,
    default: Date.now
  },
  last_activity: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: false
});

// Composite index để đảm bảo unique constraint
userDeviceSchema.index({ user_id: 1, course_id: 1, device_id: 1 }, { unique: true });
userDeviceSchema.index({ device_id: 1 });
userDeviceSchema.index({ user_id: 1 });
userDeviceSchema.index({ course_id: 1 });
userDeviceSchema.index({ registered_at: 1 });

module.exports = mongoose.model('UserDevice', userDeviceSchema);
