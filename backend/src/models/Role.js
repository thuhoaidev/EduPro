const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên vai trò là bắt buộc'],
    // unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Mô tả vai trò là bắt buộc'],
  },
  permissions: [{
    type: String,
    required: true,
  }],
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Tạo index cho trường name để tìm kiếm nhanh hơn
roleSchema.index({ name: 1 }, { unique: true });

// Virtual populate cho users có role này
roleSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'role_id',
});

// Method kiểm tra quyền
roleSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Method lấy danh sách quyền
roleSchema.methods.getPermissions = function() {
  return this.permissions;
};

// Method thêm quyền
roleSchema.methods.addPermission = async function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
    await this.save();
  }
  return this;
};

// Method xóa quyền
roleSchema.methods.removePermission = async function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  await this.save();
  return this;
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role; 