const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserSchema = require('./UserSchema');
const slugify = require('slugify');

// Virtual populate cho các khóa học của giảng viên
UserSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'instructor_id',
});

// Pre-save hook để xử lý password và slug
UserSchema.pre('save', async function (next) {
  try {
    // Xử lý password
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Xử lý slug từ nickname - luôn đảm bảo slug được tạo
    if (this.isModified('nickname') || !this.slug || this.slug === '' || !this.nickname || this.nickname === '' || this.nickname === null || this.nickname === undefined) {
      // Đảm bảo nickname tồn tại
      if (!this.nickname || this.nickname === '' || this.nickname === null || this.nickname === undefined) {
        // Nếu không có nickname, tạo từ fullname
        if (this.fullname) {
          this.nickname = this.fullname.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '');
          if (!this.nickname || this.nickname === '' || this.nickname === null || this.nickname === undefined) {
            this.nickname = 'user' + Date.now();
          }
        } else {
          // Nếu không có cả nickname và fullname, tạo nickname mặc định
          this.nickname = 'user' + Date.now();
        }
      }

      // Chuẩn hóa nickname để tạo slug
      const normalizedNickname = this.nickname.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let baseSlug = normalizedNickname.replace(/-+/g, '-').replace(/^-+|-+$/g, ''); // Thay thế nhiều dấu gạch ngang liên tiếp và loại bỏ dấu gạch ngang ở đầu và cuối

      // Đảm bảo slug không rỗng và không chỉ chứa dấu gạch ngang
      if (!baseSlug || baseSlug === '' || baseSlug === null || baseSlug === undefined || baseSlug.replace(/-/g, '') === '' || baseSlug.length < 3) {
        baseSlug = 'user-' + Date.now();
      }

      // Kiểm tra xem slug đã tồn tại chưa và tạo slug duy nhất
      let finalSlug = baseSlug;
      let counter = 1;
      
      while (true) {
        const existingUser = await mongoose.model('User').findOne({ slug: finalSlug });
        if (!existingUser || existingUser._id.toString() === this._id.toString()) {
          break; // Slug không tồn tại hoặc là chính user này
        }
        // Nếu slug đã tồn tại, thêm số vào cuối
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
        
        // Nếu đã thử quá nhiều lần, thêm timestamp để đảm bảo unique
        if (counter > 100) {
          finalSlug = `${baseSlug}-${Date.now()}`;
          break;
        }
      }
      
      this.slug = finalSlug;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method để match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method để tạo token xác thực email
UserSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verificationToken;
};

// Method để tạo token reset mật khẩu
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.reset_password_token = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.reset_password_expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Method để kiểm tra quyền
UserSchema.methods.hasPermission = function (permission) {
  return this.role.permissions.includes(permission);
};

// Method để format dữ liệu khi trả về client
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  // Xóa các trường nhạy cảm
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.reset_password_token;
  delete userObject.reset_password_expires;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema);