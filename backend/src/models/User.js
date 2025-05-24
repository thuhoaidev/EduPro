const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Vai trò là bắt buộc'],
  },
  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ'],
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false, // Không trả về password khi query
  },
  avatar: {
    type: String,
    default: 'default-avatar.png',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
  },
  approval_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  email_verification_token: String,
  email_verification_expires: Date,
  reset_password_token: String,
  reset_password_expires: Date,
  last_login: Date,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Tạo index cho email
userSchema.index({ email: 1 }, { unique: true });

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Phương thức tạo token xác thực email
userSchema.methods.createEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.email_verification_token = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.email_verification_expires = Date.now() + 24 * 60 * 60 * 1000; // 24 giờ
  return token;
};

// Phương thức tạo token reset mật khẩu
userSchema.methods.createPasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.reset_password_token = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.reset_password_expires = Date.now() + 1 * 60 * 60 * 1000; // 1 giờ
  return token;
};

// Phương thức kiểm tra quyền
userSchema.methods.hasPermission = async function(permission) {
  await this.populate('role');
  return this.role.permissions.get(permission) || false;
};

// Phương thức lấy thông tin user (không bao gồm các trường nhạy cảm)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.email_verification_token;
  delete user.email_verification_expires;
  delete user.reset_password_token;
  delete user.reset_password_expires;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 