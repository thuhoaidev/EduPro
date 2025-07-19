const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['success', 'warning', 'info'], required: true },
  created_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // null nếu là global
  is_global: { type: Boolean, default: false },
  icon: { type: String }, // optional
  meta: { type: Schema.Types.Mixed }, // optional, cho phép object bất kỳ
});

module.exports = mongoose.model('Notification', notificationSchema); 