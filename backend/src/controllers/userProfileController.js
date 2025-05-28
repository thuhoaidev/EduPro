const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = 'uploads/avatars';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)'));
    }
  }
}).single('avatar');

// Lấy thông tin profile người dùng
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -email_verification_token -reset_password_token -reset_password_expires')
      .populate('role_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Cập nhật thông tin profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'name',
      'nickname',
      'bio',
      'social_links'
    ];

    // Lọc các trường được phép cập nhật
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        if (key === 'social_links') {
          try {
            obj[key] = JSON.parse(req.body[key]);
          } catch (e) {
            obj[key] = req.body[key];
          }
        } else {
          obj[key] = req.body[key];
        }
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -email_verification_token -reset_password_token -reset_password_expires')
     .populate('role_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: user
    });
  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Upload ảnh đại diện
exports.uploadAvatar = (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // Lỗi từ multer
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      // Lỗi khác
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file ảnh'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        // Xóa file vừa upload nếu không tìm thấy user
        await fs.unlink(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng'
        });
      }

      // Xóa ảnh cũ nếu không phải ảnh mặc định
      if (user.avatar && user.avatar !== 'default-avatar.png') {
        const oldAvatarPath = path.join('uploads/avatars', user.avatar);
        try {
          await fs.unlink(oldAvatarPath);
        } catch (error) {
          console.error('Lỗi xóa ảnh cũ:', error);
        }
      }

      // Cập nhật đường dẫn ảnh mới
      user.avatar = req.file.filename;
      await user.save();

      res.json({
        success: true,
        message: 'Upload ảnh đại diện thành công',
        data: {
          avatar: user.avatar
        }
      });
    } catch (error) {
      // Xóa file nếu có lỗi
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      console.error('Lỗi upload avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  });
}; 