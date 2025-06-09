const mongoose = require('mongoose');
const slugify = require('slugify');

const UserSchema = new mongoose.Schema({
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Vai trò là bắt buộc'],
  },
  nickname: {
    type: String,
    required: [true, 'Nickname là bắt buộc'],
    trim: true,
  },
  fullname: {
    type: String,
    trim: true,
    minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Nam', 'Nữ', 'Khác'],
    default: 'Khác',
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/, 'Email không hợp lệ'],
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false,
  },
  isInstructor: {
    type: Boolean,
    default: false
  },
  email_verified: {
    type: Boolean,
    default: false,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'blocked'],
    default: 'inactive',
    required: true
  },
  approval_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
    required: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg',
  },
  bio: {
    type: String,
    default: '',
  },
  social_links: {
    type: Map,
    of: String,
    default: {},
  },
  followers_count: {
    type: Number,
    default: 0,
  },
  following_count: {
    type: Number,
    default: 0,
  },
  email_verification_token: {
    type: String,
    required: false,
    default: null
  },
  email_verification_expires: {
    type: Date,
    required: false,
    default: null
  },
  reset_password_token: {
    type: String,
    required: function() {
      return this.reset_password_expires;
    },
    expires: '10m'
  },
  reset_password_expires: {
    type: Date,
    required: function() {
      return this.reset_password_token;
    }
  },
  last_login: {
    type: Date,
    default: Date.now
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});



module.exports = UserSchema;
