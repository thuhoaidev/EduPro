
const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;

/**
 * @desc    Lấy thông tin người dùng hiện tại
 * @route   GET /api/auth/user-me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role_id');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * @desc    Cập nhật thông tin người dùng
 * @route   PUT /api/update-me
 */
exports.updateCurrentUser = async (req, res) => {
  try {
    const fields = [
      'name',
      'nickname',
      'avatar',
      'bio',
      'social_links',
      'instructorInfo',
      'email',
      'phone',
      'address'
    ];

    const updateFields = {};
    fields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updateFields[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('role_id');

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUser.toJSON(),
    });
  } catch (error) {
    console.error('Lỗi cập nhật người dùng:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật thông tin người dùng' });
  }
};

/**
 * @desc    Tải lên ảnh đại diện
 * @route   POST /api/upload-avatar
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh để tải lên',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      await fs.unlink(req.file.path); // Xóa file nếu không có user
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars/', user.avatar);
      try {
        await fs.access(oldAvatarPath);
        await fs.unlink(oldAvatarPath);
      } catch (_) {
        // Không cần log nếu file cũ không tồn tại
      }
    }

    // Lưu file mới
    user.avatar = req.file.filename;
    await user.save();

    res.json({
      success: true,
      message: 'Tải lên ảnh đại diện thành công',
      data: {
        avatar: req.file.filename, // chỉ trả về tên file, không kèm đường dẫn
      },
    });
  } catch (error) {
    // Nếu lỗi, xóa file đã upload (nếu có)
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Lỗi khi xóa file lỗi:', unlinkError);
      }
    }

    console.error('Lỗi tải lên ảnh đại diện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tải lên ảnh đại diện',
      error: error.message,
    });
  }
};
