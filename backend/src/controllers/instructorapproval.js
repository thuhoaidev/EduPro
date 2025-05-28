const User = require('../models/user/User');
const { ROLES } = require('../constants/roles');

// [GET] /api/instructors/pending
const getPendingInstructors = async (req, res) => {
  try {
    const pendingInstructors = await User.find({
      role: ROLES.INSTRUCTOR,
      status: 'inactive',
    }).select('-password');

    res.status(200).json({ success: true, data: pendingInstructors });
  } catch (error) {
    console.error('[InstructorController] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// [GET] /api/instructors/:id
const getInstructorProfileById = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id).select('-password');

    if (!instructor || instructor.role !== ROLES.INSTRUCTOR) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giảng viên' });
    }

    res.json({ success: true, data: instructor });
  } catch (err) {
    console.error('[InstructorController] Lỗi:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// [POST] /api/instructors/approve
const approveInstructorProfile = async (req, res) => {
  try {
    const { userId, approve } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== ROLES.INSTRUCTOR) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giảng viên' });
    }

    user.instructorInfo = {
      ...user.instructorInfo?.toObject?.(),
      is_approved: approve,
    };

    user.status = approve ? 'active' : 'inactive';
    await user.save();

    res.json({
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
    console.error('[InstructorController] Lỗi duyệt:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// [PUT] /api/instructors/profile
const updateOrCreateInstructorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== ROLES.INSTRUCTOR) {
      return res.status(403).json({ success: false, message: 'Chỉ giảng viên mới được cập nhật hồ sơ' });
    }

    const { bio, expertise, education, experience } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.instructorInfo = {
      ...user.instructorInfo?.toObject?.(),
      ...(bio !== undefined && { bio }),
      ...(expertise !== undefined && { expertise }),
      ...(education !== undefined && { education }),
      ...(experience !== undefined && { experience }),
      is_approved: false,
    };

    user.status = 'inactive';
    await user.save();

    res.json({
      success: true,
      message: 'Hồ sơ giảng viên đã được cập nhật. Vui lòng chờ duyệt.',
      data: { instructorInfo: user.instructorInfo },
    });
  } catch (err) {
    console.error('[InstructorController] Lỗi cập nhật hồ sơ:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getPendingInstructors,
  getInstructorProfileById,
  approveInstructorProfile,
  updateOrCreateInstructorProfile,
};
