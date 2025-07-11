const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Vai trò là bắt buộc'],
  },
  nickname: {
    type: String,
    trim: true,
  },
  fullname: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
  },
  avatar: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
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
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'],
  },
  dob: {
    type: Date,
    validate: {
      validator: function (v) {
        return !v || v <= new Date();
      },
      message: 'Ngày sinh không thể là ngày trong tương lai',
    },
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Địa chỉ không được quá 500 ký tự'],
  },
  isInstructor: {
    type: Boolean,
    default: false,
  },
  email_verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'blocked'],
    default: 'inactive',
    required: true,
  },
  approval_status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending',
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
    default: null,
  },
  email_verification_expires: {
    type: Date,
    required: false,
    default: null,
  },
  reset_password_token: {
    type: String,
    required: function () {
      return this.reset_password_expires;
    },
    expires: '10m',
  },
  reset_password_expires: {
    type: Date,
    required: function () {
      return this.reset_password_token;
    },
  },
  last_login: {
    type: Date,
    default: Date.now,
  },

  // Thông tin học vấn
  education: [
    {
      degree: { type: String, trim: true, required: true },
      institution: { type: String, trim: true, required: true },
      year: {
        type: Number,
        required: true,
        min: [1950, 'Năm tốt nghiệp không hợp lệ'],
        max: [new Date().getFullYear(), 'Năm tốt nghiệp không thể là tương lai'],
      },
      major: { type: String, trim: true, required: true },
    },
  ],

  // Hồ sơ giảng viên
  instructorInfo: {
    is_approved: { type: Boolean, default: false },
    experience_years: {
      type: Number,
      min: [0, 'Số năm kinh nghiệm không thể âm'],
      max: [50, 'Số năm kinh nghiệm không thể quá 50'],
    },
    specializations: [{ type: String, trim: true }],
    teaching_experience: {
      years: {
        type: Number,
        min: [0, 'Số năm kinh nghiệm không thể âm'],
        max: [50, 'Số năm kinh nghiệm không thể quá 50'],
      },
      description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Mô tả kinh nghiệm không được quá 2000 ký tự'],
      },
    },
    certificates: [
      {
        name: { type: String, trim: true },
        file: { type: String, required: [true, 'File scan bằng cấp là bắt buộc'] },
        original_name: { type: String, trim: true },
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
    demo_video: { type: String, trim: true },
    cv_file: { type: String, trim: true },
    other_documents: [
      {
        name: { type: String, required: true, trim: true },
        file: { type: String, required: true },
        description: {
          type: String,
          trim: true,
          maxlength: [500, 'Mô tả không được quá 500 ký tự'],
        },
      },
    ],
    instructor_profile_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approval_date: { type: Date },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejection_reason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Lý do từ chối không được quá 1000 ký tự'],
    },
    application_date: { type: Date, default: Date.now },
  },

  // ✅ savedPosts - lưu bài viết
  savedPosts: [
    {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true,
      },
      savedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  suppressReservedKeysWarning: true,
});

module.exports = UserSchema;
