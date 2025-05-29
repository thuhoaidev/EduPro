const User = require('../models/User');
const Role = require('../models/Role');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/sendEmail');

// [GET] /api/instructors/approved
const getApprovedInstructors = async (req, res) => {
  try {
    // Tìm role "instructor"
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò giảng viên',
      });
    }

    // Lấy các user có role là "instructor" và đã được duyệt
    const approvedInstructors = await User.find({
      role_id: instructorRole._id,
      approval_status: 'approved',
    }).select('-password');

    res.status(200).json({
      success: true,
      data: approvedInstructors,
    });
  } catch (error) {
    console.error('[InstructorController] Lỗi lấy danh sách giảng viên đã duyệt:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi máy chủ',
    });
  }
};



// [GET] /api/instructors/pending
const getPendingInstructors = async (req, res) => {
  try {
    // Bước 1: Tìm role "instructor"
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò giảng viên',
      });
    }

    // Bước 2: Tìm users với role_id là instructorRole._id và approval_status 'pending'
    const pendingInstructors = await User.find({
      role_id: instructorRole._id,
      approval_status: 'pending',
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

module.exports = { getPendingInstructors };


// Duyệt hoặc từ chối giảng viên
const approveInstructorProfile = async (req, res) => {
  try {
    const { userId, approve } = req.body;

    if (!userId || typeof approve !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Thiếu userId hoặc approve không hợp lệ',
      });
    }

    // Tìm role "instructor"
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò giảng viên',
      });
    }

    // Tìm user theo id và role_id
    const user = await User.findOne({ _id: userId, role_id: instructorRole._id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên',
      });
    }

    // Kiểm tra instructorInfo
    if (!user.instructorInfo) {
      return res.status(400).json({
        success: false,
        message: 'Giảng viên chưa có thông tin hồ sơ instructorInfo',
      });
    }

    // Cập nhật trạng thái duyệt
    user.approval_status = approve ? 'approved' : 'rejected';
    user.instructorInfo.is_approved = approve;

    await user.save();

    // Gửi email thông báo
    if (approve) {
      await sendApprovalEmail(user.email, user.name);
    } else {
      await sendRejectionEmail(user.email, user.name);
    }

    return res.json({
      success: true,
      message: `Tài khoản trong trạng thái: ${approve ? 'duyệt' : 'từ chối'}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        approval_status: user.approval_status,
      },
    });
  } catch (error) {
    console.error('Lỗi duyệt giảng viên:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi máy chủ',
    });
  }
};

module.exports = {
  approveInstructorProfile,
  getPendingInstructors,
  getApprovedInstructors,
};
