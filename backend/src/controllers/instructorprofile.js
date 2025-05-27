const User = require('../models/User');
const { ROLES } = require('../models/Role');

const updateOrCreateInstructorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Chỉ giảng viên được quyền
    if (req.user.role !== ROLES.INSTRUCTOR) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ giảng viên mới được phép tạo hoặc cập nhật hồ sơ giảng viên',
      });
    }

    const { bio, expertise, education, experience } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Gán thông tin mới (nếu chưa có thì sẽ tạo mới)
    user.instructorInfo = {
      ...user.instructorInfo?.toObject(), // nếu đã có thì giữ lại dữ liệu cũ
      ...(bio !== undefined && { bio }),
      ...(expertise !== undefined && { expertise }),
      ...(education !== undefined && { education }),
      ...(experience !== undefined && { experience }),
    };

    // Tự động chuyển trạng thái thành 'inactive' để chờ duyệt
    user.status = 'inactive';

    await user.save();

    return res.json({
      success: true,
      message: 'Hồ sơ giảng viên đã được cập nhật và đang chờ duyệt',
      data: {
        instructorInfo: user.instructorInfo,
      },
    });
  } catch (err) {
    console.error('Lỗi xử lý hồ sơ giảng viên:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

module.exports = {
  updateOrCreateInstructorProfile,
};
