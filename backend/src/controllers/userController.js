const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;

// controllers/userController.js
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role_id');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON(), // loại bỏ thông tin nhạy cảm
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

exports.updateCurrentUser = async (req, res) => {
  try {
    const updateFields = {
      name: req.body.name,
      nickname: req.body.nickname,
      avatar: req.body.avatar,
      bio: req.body.bio,
      social_links: req.body.social_links,
      instructorInfo: req.body.instructorInfo,
    };

    // Lọc bỏ các trường không có giá trị
    Object.keys(updateFields).forEach(
      (key) => (updateFields[key] === undefined || updateFields[key] === null) && delete updateFields[key]
    );

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

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh để tải lên'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      // Delete the uploaded file if user not found
      await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
      try {
        await fs.access(oldAvatarPath);
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        // Ignore error if old avatar doesn't exist
      }
    }

    // Update user's avatar path
    user.avatar = req.file.path.replace(/\\/g, '/').replace('backend/', '');
    await user.save();

    res.json({
      success: true,
      message: 'Tải lên ảnh đại diện thành công',
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    // Delete the uploaded file if there's an error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    console.error('Lỗi tải lên ảnh đại diện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tải lên ảnh đại diện',
      error: error.message
    });
  }
};