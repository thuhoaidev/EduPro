const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function updateUserSchema() {
  try {
    // Kiểm tra và cập nhật schema
    const userSchema = mongoose.model('User').schema;
    
    // Thêm trường fullname nếu chưa tồn tại
    if (!userSchema.path('fullname')) {
      userSchema.add({
        fullname: {
          type: String,
          required: [true, 'Họ và tên là bắt buộc'],
          trim: true,
          minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
        }
      });
    }

    // Xóa trường name
    if (userSchema.path('name')) {
      userSchema.remove('name');
    }

    // Cập nhật pre-save hook
    userSchema.pre('save', async function(next) {
      // Xử lý password
      if (this.isModified('password')) {
        try {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
          next(error);
          return;
        }
      }

      // Xử lý slug khi fullname thay đổi
      if (this.isModified('fullname')) {
        try {
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
          const existingUser = await User.findOne({ slug: this.slug });
          if (existingUser && existingUser._id.toString() !== this._id.toString()) {
            // Nếu slug đã tồn tại, thêm số vào cuối
            let counter = 1;
            let newSlug = `${this.slug}-${counter}`;
            while (await User.findOne({ slug: newSlug })) {
              counter++;
              newSlug = `${this.slug}-${counter}`;
            }
            this.slug = newSlug;
          }
        } catch (error) {
          next(error);
          return;
        }
      }
      next();
    });

    // Cập nhật các tài liệu hiện có
    await User.updateMany({}, { $set: { fullname: '$name' } });
    
    console.log('Đã cập nhật schema và dữ liệu thành công!');
  } catch (error) {
    console.error('Lỗi khi cập nhật schema:', error);
    throw error;
  }
}

module.exports = updateUserSchema;
