const User = require('../models/user/User');
const { ROLES } = require('../constants/roles');

// [GET] /api/instructors/pending
const getPendingInstructors = async (req, res) => {
  try {
    const pendingInstructors = await User.find({
      role: ROLES.INSTRUCTOR,
      status: 'inactive',
    }).select('-password');

    res.status(200).json({
      success: true,
      data: pendingInstructors,
    });
  } catch (error) {
    console.error('[InstructorController] Error fetching pending instructors:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi máy chủ',
    });
  }
};

// [POST] /api/instructors/approve
const approveInstructorProfile = async (req, res) => {
  try {
    const { userId, approve } = req.body;

    const user = await User.findById(userId);

    if (!user || user.role !== ROLES.INSTRUCTOR) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên',
      });
    }

    user.instructorInfo = {
      ...user.instructorInfo?.toObject?.(),
      is_approved: approve,
    };

    user.status = approve ? 'active' : 'inactive';

    await user.save();

    return res.json({
      success: true,
      message: `Giảng viên đã được ${approve ? 'duyệt' : 'từ chối'}`,
      data: {
        id: user._id,
        name: user.name,
        is_approved: user.instructorInfo.is_approved,
        status: user.status,
      },
    });

  } catch (error) {
    console.error('[InstructorController] Lỗi duyệt giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

// [PUT] /api/instructors/profile
const updateOrCreateInstructorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== ROLES.INSTRUCTOR) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ giảng viên mới được phép tạo hoặc cập nhật hồ sơ',
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

    user.instructorInfo = {
      ...user.instructorInfo?.toObject?.(),
      ...(bio !== undefined && { bio }),
      ...(expertise !== undefined && { expertise }),
      ...(education !== undefined && { education }),
      ...(experience !== undefined && { experience }),
      is_approved: false, // reset duyệt
    };

    user.status = 'inactive';

    await user.save();

    return res.json({
      success: true,
      message: 'Hồ sơ giảng viên đã được cập nhật. Vui lòng chờ duyệt.',
      data: {
        instructorInfo: user.instructorInfo,
      },
    });
  } catch (err) {
    console.error('[InstructorController] Lỗi xử lý hồ sơ giảng viên:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

module.exports = {
  getPendingInstructors,
  approveInstructorProfile,
  updateOrCreateInstructorProfile,
};
