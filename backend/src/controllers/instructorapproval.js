const User = require('../models/User');
const { ROLES } = require('../models/Role');

// [GET] /api/instructors/pending
const getPendingInstructors = async (req, res) => {
  try {
    // Tìm các giảng viên chưa được duyệt
    const pendingInstructors = await User.find({
      role: ROLES.INSTRUCTOR,
      status: 'inactive',
    }).select('-password'); // loại bỏ mật khẩu khỏi kết quả

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

// Duyệt hoặc từ chối giảng viên
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

    // Cập nhật trạng thái is_approved
    user.instructorInfo.is_approved = approve;
    
    // Nếu được duyệt -> set status active & role thành INSTRUCTOR
    if (approve) {
      user.status = 'active';
    } else {
      user.status = 'inactive';
    }

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
    console.error('Lỗi duyệt giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

module.exports = {
  approveInstructorProfile,
  getPendingInstructors,
};

