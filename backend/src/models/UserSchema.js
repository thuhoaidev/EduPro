const mongoose = require('mongoose');

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
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'],
  },
  dob: {
    type: Date,
    validate: {
      validator: function(v) {
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
    enum: [null, 'pending', 'approved', 'rejected'],
    default: null,
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
    required: function() {
      return this.reset_password_expires;
    },
    expires: '10m',
  },
  reset_password_expires: {
    type: Date,
    required: function() {
      return this.reset_password_token;
    },
  },
  last_login: {
    type: Date,
    default: Date.now,
  },
  instructorInfo: {
    // Thông tin cơ bản
    is_approved: {
      type: Boolean,
      default: false,
    },
    experience_years: {
      type: Number,
      min: [0, 'Số năm kinh nghiệm không thể âm'],
      max: [50, 'Số năm kinh nghiệm không thể quá 50'],
    },
    specializations: [{
      type: String,
      trim: true,
    }],
    
    // Kinh nghiệm giảng dạy
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
    
    // Bằng cấp & chứng chỉ
    certificates: [{
      name: {
        type: String,
        required: [true, 'Tên bằng cấp/chứng chỉ là bắt buộc'],
        trim: true,
      },
      major: {
        type: String,
        required: [true, 'Ngành học là bắt buộc'],
        trim: true,
      },
      issuer: {
        type: String,
        required: [true, 'Nơi cấp là bắt buộc'],
        trim: true,
      },
      year: {
        type: Number,
        required: [true, 'Năm cấp là bắt buộc'],
        min: [1900, 'Năm cấp không hợp lệ'],
        max: [new Date().getFullYear(), 'Năm cấp không thể là tương lai'],
      },
      file: {
        type: String,
        required: [true, 'File scan bằng cấp là bắt buộc'],
      },
    }],
    
    // Video demo dạy thử
    demo_video: {
      type: String,
      trim: true,
    },
    
    // CV và hồ sơ khác
    cv_file: {
      type: String,
      trim: true,
    },
    other_documents: [{
      name: {
        type: String,
        required: [true, 'Tên hồ sơ là bắt buộc'],
        trim: true,
      },
      file: {
        type: String,
        required: [true, 'File hồ sơ là bắt buộc'],
      },
      description: {
        type: String,
        trim: true,
        maxlength: [500, 'Mô tả không được quá 500 ký tự'],
      },
    }],
    
    // Trạng thái duyệt
    approval_status: {
      type: String,
      enum: [null, 'pending', 'approved', 'rejected'],
      default: null,
    },
    approval_date: {
      type: Date,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejection_reason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Lý do từ chối không được quá 1000 ký tự'],
    },
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
