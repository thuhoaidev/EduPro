const User = require('../models/User');
const InstructorProfile = require('../models/instructor/InstructorProfile');
const { Role } = require('../models/Role');

const updateOrCreateInstructorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm user và populate role
    const user = await User.findById(userId).populate('role_id');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Chỉ giảng viên được quyền
    if (!user.role_id || user.role_id.name !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ giảng viên mới được phép tạo hoặc cập nhật hồ sơ giảng viên',
      });
    }

    const { bio, expertise, education, experience } = req.body;

    // Tìm hoặc tạo mới hồ sơ giảng viên
    let instructorProfile = await InstructorProfile.findOne({ userId });
    if (!instructorProfile) {
      instructorProfile = new InstructorProfile({ userId });
    }

    // Cập nhật thông tin
    instructorProfile.bio = bio || instructorProfile.bio;
    instructorProfile.expertise = expertise || instructorProfile.expertise;
    instructorProfile.education = education || instructorProfile.education;
    instructorProfile.experience = experience || instructorProfile.experience;
    instructorProfile.status = 'pending'; // Đặt lại trạng thái chờ duyệt

    await instructorProfile.save();

    return res.json({
      success: true,
      message: 'Hồ sơ giảng viên đã được cập nhật và đang chờ duyệt',
      data: instructorProfile
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
    console.log('Requested userId:', userId);

    // Tìm user và populate role
    const user = await User.findById(userId).populate('role_id');
    console.log('Found user:', user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Kiểm tra vai trò
    console.log('User role:', user.role_id?.name);
    if (!user.role_id || user.role_id.name !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Người dùng này không phải là giảng viên',
      });
    }

    // Tìm hồ sơ giảng viên
    const instructorProfile = await InstructorProfile.findOne({ userId });
    console.log('Found instructor profile:', instructorProfile);

    if (!instructorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên',
      });
    }

    // Tạo response data
    const instructorData = {
      user: {
        id: user._id,
        name: user.name,
        gender:user.gender,
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
        created_at: user.created_at,
      },
      instructorProfile,
    };

    return res.status(200).json({
      success: true,
      data: instructorData,
    });

  } catch (err) {
    console.error('Lỗi lấy thông tin hồ sơ giảng viên:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

const getInstructorApplication = async (req, res) => {
  console.log('🔍 API HIT: /admin/instructor-profile/:id', req.params.id);
  try {
    const userId = req.params.id || req.user.id;

    // Tìm người dùng
    const user = await User.findById(userId).populate('role_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Lấy thông tin instructorInfo
    const instructorApplication = user.instructorInfo;

    // Nếu chưa điền thông tin đăng ký
    if (!instructorApplication || !instructorApplication.bio) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng chưa đăng ký làm giảng viên',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        instructorInfo: instructorApplication,
      },
    });
  } catch (err) {
    console.error('Lỗi khi lấy thông tin đăng ký giảng viên:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};
module.exports = {
  updateOrCreateInstructorProfile,
  getInstructorProfile,
   getInstructorApplication
};
