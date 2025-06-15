const InstructorProfile = require('../models/InstructorProfile');

exports.getInstructorApplication = async (req, res) => {
  try {
    const id = req.params.id || req.user._id;
    const instructorProfile = await InstructorProfile.findOne({ user: id });
    
    if (!instructorProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hồ sơ giảng viên'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: instructorProfile
    });
  } catch (error) {
    console.error('Lỗi khi lấy hồ sơ giảng viên:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Lỗi máy chủ'
    });
  }
};

exports.updateOrCreateInstructorProfile = async (req, res) => {
  try {
    const instructorProfile = await InstructorProfile.findOne({ user: req.user._id });
    
    if (instructorProfile) {
      await instructorProfile.updateOne(req.body);
    } else {
      await InstructorProfile.create({
        user: req.user._id,
        ...req.body
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật hồ sơ giảng viên thành công'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ giảng viên:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Lỗi máy chủ'
    });
  }
};