const mongoose = require('mongoose');

const deviceViolationSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
    maxlength: 255
  },
  violation_type: {
    type: String,
    enum: ['multiple_accounts', 'suspicious_activity', 'account_sharing'],
    default: 'multiple_accounts'
  },
  user_ids: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true
  },
  course_ids: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Course',
    required: true
  },
  device_info: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ip_address: {
    type: String,
    maxlength: 45
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  admin_notes: {
    type: String
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewed_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
deviceViolationSchema.index({ device_id: 1 });
deviceViolationSchema.index({ status: 1 });
deviceViolationSchema.index({ severity: 1 });
deviceViolationSchema.index({ createdAt: 1 });

module.exports = mongoose.model('DeviceViolation', deviceViolationSchema);
