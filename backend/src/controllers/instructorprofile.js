const User = require('../models/user/User');
const { ROLES } = require('../constants/roles');

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

const getInstructorProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Kiểm tra xem người dùng có phải là giảng viên không
    if (user.role !== ROLES.INSTRUCTOR) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng này không phải là giảng viên',
      });
    }

    // Lấy thông tin hồ sơ giảng viên
    const instructorProfile = {
      id: user._id,
      userId: user._id,
      bio: user.instructorInfo?.bio || '',
      expertise: user.instructorInfo?.expertise || '',
      rating: user.instructorInfo?.rating || 0,
      status: user.status || 'pending',
      createdAt: user.createdAt,
      education: user.instructorInfo?.education || [],
      experience: user.instructorInfo?.experience || []
    };

    return res.json({
      success: true,
      data: instructorProfile
    });

  } catch (err) {
    console.error('Lỗi khi lấy thông tin hồ sơ giảng viên:', err);
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

module.exports = {
  updateOrCreateInstructorProfile,
  getInstructorProfile,
};
