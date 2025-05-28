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

// Lấy thông tin hồ sơ giảng viên
const getInstructorProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    // Tìm user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Kiểm tra xem user có phải là giảng viên không
    if (user.role !== ROLES.INSTRUCTOR) {
      return res.status(403).json({
        success: false,
        message: 'Người dùng này không phải là giảng viên',
      });
    }

    // Tạo response data
    const instructorData = {
      user: {
        id: user._id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        social_links: user.social_links,
        followers_count: user.followers_count,
        following_count: user.following_count,
        status: user.status,
        approval_status: user.approval_status,
        email_verified: user.email_verified,
        created_at: user.created_at
      },
      instructorInfo: user.instructorInfo || null
    };

    return res.json({
      success: true,
      data: instructorData
    });

  } catch (err) {
    console.error('Lỗi lấy thông tin hồ sơ giảng viên:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

module.exports = {
  updateOrCreateInstructorProfile,
  getInstructorProfile
};
