const mongoose = require('mongoose');
const slugify = require('slugify');

const testUserSchema = new mongoose.Schema({
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
    required: [true, 'Họ và tên là bắt buộc'],
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
  emailVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'blocked'],
    default: 'inactive'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

testUserSchema.pre('save', async function(next) {
  if (this.isModified('fullname')) {
    // Chuyển đổi tên thành ASCII và chuẩn hóa
    const asciiName = this.fullname.normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd');
    
    // Tạo slug từ nickname
    this.slug = slugify(asciiName, {
      lower: true,
      strict: true
    }).toLowerCase();

    // Kiểm tra xem slug đã tồn tại chưa
    const existingUser = await mongoose.model('User').findOne({ slug: this.slug });
    if (existingUser && existingUser._id.toString() !== this._id.toString()) {
      // Nếu slug đã tồn tại, thêm số vào cuối
      let counter = 1;
      let newSlug = `${this.slug}-${counter}`;
      while (await mongoose.model('User').findOne({ slug: newSlug })) {
        counter++;
        newSlug = `${this.slug}-${counter}`;
      }
      this.slug = newSlug;
    }
  }
  next();
});

module.exports = testUserSchema;
