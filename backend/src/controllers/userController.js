const User = require('../models/User');
const path = require('path');
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
        message: 'Không có file nào được tải lên',
      });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: { avatar: user.avatar },
    });
  } catch (error) {
    console.error('Lỗi upload avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải ảnh',
    });
  }
};