const User = require('../models/User');
const Role = require('../models/Role');

// Lấy danh sách giảng viên chờ duyệt
const getPendingInstructors = async (req, res) => {
  try {
    // Tìm role giảng viên
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò giảng viên',
      });
    }

    // Tìm các giảng viên chưa được duyệt
    const pendingInstructors = await User.find({
      role_id: instructorRole._id,
      approval_status: 'pending',
    }).select('-password').populate('role_id');

    res.status(200).json({
      success: true,
      data: pendingInstructors,
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách giảng viên chờ duyệt:', error);
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

    // Tìm role giảng viên
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò giảng viên',
      });
    }

    const user = await User.findOne({
      _id: userId,
      role_id: instructorRole._id,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên',
      });
    }

    // Cập nhật trạng thái duyệt
    user.approval_status = approve ? 'approved' : 'rejected';
    user.status = approve ? 'active' : 'inactive';
    await user.save();

    return res.json({
      success: true,
      message: `Giảng viên đã được ${approve ? 'duyệt' : 'từ chối'}`,
      data: {
        id: user._id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        approval_status: user.approval_status,
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

