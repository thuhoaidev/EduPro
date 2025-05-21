const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../../constants/roles');

// Schema người dùng
const userSchema = new mongoose.Schema({
  // Tên người dùng
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
    trim: true,
  },
  // Email người dùng
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập email hợp lệ'],
  },
  // Mật khẩu đã mã hóa
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false, // Không trả về password khi query
  },
  // Ảnh đại diện
  avatar: {
    type: String,
    default: '',
  },
  // Vai trò người dùng
  role: {
    type: Number,
    enum: Object.values(ROLES),
    default: ROLES.STUDENT, // Mặc định là học viên
  },
  // Trạng thái xác thực email
  isVerified: {
    type: Boolean,
    default: false,
  },
  // Trạng thái tài khoản
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
  },
  // Thông tin bổ sung cho giảng viên
  instructorInfo: {
    bio: String, // Tiểu sử
    expertise: [String], // Chuyên môn
    education: [{ // Học vấn
      degree: String,
      school: String,
      year: Number,
    }],
    experience: [{ // Kinh nghiệm
      position: String,
      company: String,
      duration: String,
      description: String,
    }],
  },
  // Thông tin bổ sung cho học viên
  studentInfo: {
    enrolledCourses: [{ // Khóa học đã đăng ký
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      enrolledAt: {
        type: Date,
        default: Date.now,
      },
      progress: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active',
      },
    }],
    certificates: [{ // Chứng chỉ đã đạt được
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      issuedAt: {
        type: Date,
        default: Date.now,
      },
      certificateUrl: String,
    }],
  },
}, {
  // Thêm timestamps tự động
  timestamps: true,
});

// Middleware mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức so sánh mật khẩu
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Phương thức kiểm tra quyền
userSchema.methods.hasPermission = function(permission) {
  const { ROLE_PERMISSIONS } = require('../../constants/roles');
  return ROLE_PERMISSIONS[this.role]?.includes(permission) || false;
};

// Phương thức kiểm tra role
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 