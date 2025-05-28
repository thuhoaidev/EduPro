const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  permissions: [{
    type: String,
    required: true,
  }],
}, {
  timestamps: true,
});

// Tạo index cho trường name để tối ưu tìm kiếm
roleSchema.index({ name: 1 });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role; 