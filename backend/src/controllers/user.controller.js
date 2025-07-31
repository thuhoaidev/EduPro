const User = require('../models/User');
const { Role } = require('../models/Role');
const ROLES = require('../constants/roles');
const { sendInstructorVerificationEmail, sendInstructorProfileSubmittedEmail, sendInstructorApprovalResultEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const InstructorProfile = require('../models/InstructorProfile');
const Enrollment = require('../models/Enrollment');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).populate('role_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    // Nếu là giảng viên, lấy thêm instructor profile
    let instructorProfile = null;
    if (user.role_id?.name === 'instructor' || user.isInstructor) {
      instructorProfile = await InstructorProfile.findOne({ user: user._id });
    }

    let userObj = user.toJSON();
    // Đảm bảo trả về role (object) và roles (mảng tên role)
    if (user.role_id && user.role_id.name) {
      userObj.role = { 
        name: user.role_id.name,
        description: user.role_id.description,
        permissions: user.role_id.permissions || []
      };
      userObj.roles = [user.role_id.name];
    } else {
      userObj.role = { name: 'guest', description: 'Khách', permissions: [] };
      userObj.roles = ['guest'];
    }
    console.log('DEBUG userObj trả về:', userObj);
    if (instructorProfile) {
      userObj.instructorProfile = instructorProfile;
      // Gộp một số trường từ instructorProfile vào instructorInfo nếu cần
      userObj.instructorInfo = {
        ...userObj.instructorInfo,
        expertise: instructorProfile.expertise,
        education: instructorProfile.education,
        bio: instructorProfile.bio,
        status: instructorProfile.status,
        is_approved: instructorProfile.is_approved,
        profileImage: instructorProfile.profileImage,
        rating: instructorProfile.rating,
        totalReviews: instructorProfile.totalReviews,
        totalStudents: instructorProfile.totalStudents,
      };
    }

    res.status(200).json({
      success: true,
      data: userObj, // loại bỏ thông tin nhạy cảm
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ',
    });
  }
};

// Cập nhật thông tin người dùng hiện tại
exports.updateCurrentUser = async (req, res) => {
  try {
    const updateFields = {
      fullname: req.body.fullname,
      nickname: req.body.nickname,
      phone: req.body.phone,
      dob: req.body.dob,
      address: req.body.address,
      gender: req.body.gender,
      bio: req.body.bio,
      instructorInfo: req.body.instructorInfo,
    };

    // Xử lý avatar: ưu tiên file upload, nếu không có thì lấy từ body
    let avatarUrl;
    if (req.uploadedAvatar && req.uploadedAvatar.url) {
      avatarUrl = req.uploadedAvatar.url;
      console.log('DEBUG - Using uploaded avatar URL:', avatarUrl);
    } else if (req.body.avatar) {
      avatarUrl = req.body.avatar;
      console.log('DEBUG - Using body avatar URL:', avatarUrl);
    } else {
      // Nếu không có file mới và không có avatar mới, giữ nguyên avatar cũ
      const user = await User.findById(req.user._id);
      avatarUrl = user && user.avatar ? user.avatar : 'default-avatar.jpg';
      console.log('DEBUG - Keeping existing avatar:', avatarUrl);
    }

    // Luôn cập nhật avatar vào updateFields
    updateFields.avatar = avatarUrl;

    // Xử lý social_links
    if (req.body.social_links) {
      try {
        // Nếu social_links là string JSON, parse thành object
        const socialLinks = typeof req.body.social_links === 'string'
          ? JSON.parse(req.body.social_links)
          : req.body.social_links;

        updateFields.social_links = socialLinks;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng social_links không hợp lệ',
        });
      }
    }

    // Lọc bỏ các trường không có giá trị
    Object.keys(updateFields).forEach(
      (key) => (updateFields[key] === undefined || updateFields[key] === null) && delete updateFields[key],
    );

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('role_id');

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUser.toJSON(),
      avatarInfo: req.uploadedAvatar ? {
        url: req.uploadedAvatar.url,
        public_id: req.uploadedAvatar.public_id,
        size: req.uploadedAvatar.size,
      } : null,
    });
  } catch (error) {
    console.error('Lỗi cập nhật người dùng:', error, error?.errors);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thông tin người dùng',
      error: error.message,
      errors: error.errors || null
    });
  }
};

// Lấy danh sách tất cả người dùng (có phân trang và tìm kiếm)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    // Xây dựng query
    const query = {};
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nickname: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        query.role_id = roleDoc._id;
      }
    }
    if (status) {
      query.status = status;
    }

    // Thực hiện query với phân trang
    const users = await User.find(query)
      .populate('role_id')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    // Đếm tổng số user để phân trang
    const total = await User.countDocuments(query);

    // Bổ sung enrolledCourses cho học viên
    const usersWithEnrollments = await Promise.all(users.map(async user => {
      const userObj = user.toJSON();
      if (userObj.role_id && userObj.role_id.name === 'student') {
        // Đếm số lượng Enrollment có student là user._id
        const enrolledCount = await Enrollment.countDocuments({ student: user._id });
        userObj.enrolledCourses = enrolledCount;
      }
      return userObj;
    }));

    res.status(200).json({
      success: true,
      data: {
        users: usersWithEnrollments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách người dùng',
      error: error.message,
    });
  }
};

// Lấy thông tin chi tiết một người dùng theo ID
exports.getUserById = async (req, res) => {
  try {
    console.log('=== GET USER BY ID DEBUG ===');
    console.log('Requested ID:', req.params.id);
    console.log('ID type:', typeof req.params.id);
    console.log('ID length:', req.params.id?.length);
    
    // Kiểm tra định dạng ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('ERROR: Invalid ObjectId format');
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
        debug: { providedId: req.params.id }
      });
    }
    
    console.log('Searching for user with ID:', req.params.id);
    const user = await User.findById(req.params.id).populate('role_id');
    
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User details:', {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        nickname: user.nickname
      });
    }

    if (!user) {
      console.log('ERROR: User not found in database');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
        debug: { searchedId: req.params.id }
      });
    }

    console.log('SUCCESS: Returning user data');
    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('ERROR in getUserById:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      requestedId: req.params.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin người dùng',
      error: error.message,
      debug: { requestedId: req.params.id }
    });
  }
};

// Tạo người dùng mới (Admin only)
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      fullname,
      nickname,
      phone,
      dob,
      address,
      gender,
      role_id,
      status = 'active',
      approval_status = 'approved',
      bio,
      instructorInfo,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!email || !password || !fullname || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, fullname và role_id là bắt buộc',
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    // Kiểm tra role_id hợp lệ
    const role = await Role.findOne({ _id: role_id });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ',
      });
    }

    // Tạo nickname từ fullname nếu không được cung cấp
    let finalNickname = nickname;
    if (!finalNickname || finalNickname === '' || finalNickname === null || finalNickname === undefined) {
      if (fullname) {
        finalNickname = fullname.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '');
        // Đảm bảo nickname không rỗng
        if (!finalNickname || finalNickname === '' || finalNickname === null || finalNickname === undefined) {
          finalNickname = 'user' + Date.now();
        }
      } else {
        finalNickname = 'user' + Date.now();
      }
    }

    // Slug sẽ được tạo tự động bởi pre-save hook

    // Xử lý avatar: ưu tiên file upload, nếu không có thì lấy từ body
    let avatarUrl = null;
    console.log('DEBUG - req.uploadedAvatar:', req.uploadedAvatar);
    console.log('DEBUG - req.body.avatar:', req.body.avatar);

    if (req.uploadedAvatar && req.uploadedAvatar.url) {
      avatarUrl = req.uploadedAvatar.url;
      console.log('DEBUG - Using uploaded avatar URL:', avatarUrl);
    } else if (req.body.avatar) {
      avatarUrl = req.body.avatar;
      console.log('DEBUG - Using body avatar URL:', avatarUrl);
    } else {
      console.log('DEBUG - No avatar provided, using default');
      avatarUrl = 'default-avatar.jpg'; // Giá trị mặc định
    }

    // Xử lý social_links
    let socialLinks = null;
    if (req.body.social_links) {
      try {
        socialLinks = typeof req.body.social_links === 'string'
          ? JSON.parse(req.body.social_links)
          : req.body.social_links;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng social_links không hợp lệ',
        });
      }
    }

    // Tạo user mới
    const userData = {
      email,
      password,
      fullname,
      phone,
      dob,
      address,
      gender,
      role_id,
      status,
      approval_status,
      email_verified: true, // Admin tạo user nên mặc định đã xác thực email
      bio,
      instructorInfo,
      avatar: avatarUrl,
      social_links: socialLinks,
    };

    // Chỉ thêm nickname nếu nó có giá trị hợp lệ
    if (finalNickname && finalNickname !== '' && finalNickname !== null && finalNickname !== undefined) {
      userData.nickname = finalNickname;
    }

    const user = new User(userData);

    await user.save();
    await user.populate('role_id');

    // Tạo bản ghi InstructorProfile tương ứng
    await InstructorProfile.create({
      user: user._id,
      status: 'pending',
      is_approved: false,
      bio: user.bio,
      expertise: user.instructorInfo.specializations,
      education: [{
        degree: user.instructorInfo.degree,
        institution: user.instructorInfo.institution,
        year: parseInt(user.instructorInfo.graduation_year) || new Date().getFullYear(),
      }],
      profileImage: avatarUrl || 'default-avatar.jpg',
    });
    // Gửi thông báo cho user mới
/*
    await Notification.create({
      title: 'Chào mừng bạn đến với hệ thống!',
      content: 'Tài khoản của bạn đã được tạo thành công.',
      type: 'success',
      receiver: user._id,
      icon: 'user-plus',
      meta: { link: '/profile' }
    });
*/

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: user.toJSON(),
      avatarInfo: req.uploadedAvatar ? {
        url: req.uploadedAvatar.url,
        public_id: req.uploadedAvatar.public_id,
        size: req.uploadedAvatar.size,
      } : null,
    });
  } catch (error) {
    console.error('Lỗi tạo người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo người dùng',
      error: error.message,
    });
  }
};

// Cập nhật thông tin người dùng theo ID (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log('Update request body:', updateData); // Debug log

    // Kiểm tra user tồn tại
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Kiểm tra role tồn tại nếu cập nhật role
    if (updateData.role_id) {
      const roleExists = await Role.findById(updateData.role_id);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: 'Vai trò không tồn tại',
        });
      }
    }

    // Kiểm tra email trùng lặp nếu có cập nhật email
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại',
        });
      }
    }

    // Xử lý avatar: ưu tiên file upload, nếu không có thì lấy từ body
    let avatarUrl = existingUser.avatar; // Giữ avatar cũ nếu không có avatar mới
    console.log('DEBUG - req.uploadedAvatar (update):', req.uploadedAvatar);
    console.log('DEBUG - updateData.avatar:', updateData.avatar);
    console.log('DEBUG - existingUser.avatar:', existingUser.avatar);

    if (req.uploadedAvatar && req.uploadedAvatar.url) {
      avatarUrl = req.uploadedAvatar.url;
      console.log('DEBUG - Using uploaded avatar URL (update):', avatarUrl);
    } else if (updateData.avatar) {
      avatarUrl = updateData.avatar;
      console.log('DEBUG - Using body avatar URL (update):', avatarUrl);
    } else {
      console.log('DEBUG - Keeping existing avatar:', avatarUrl);
      // Đảm bảo có giá trị mặc định nếu không có avatar cũ
      if (!avatarUrl) {
        avatarUrl = 'default-avatar.jpg';
        console.log('DEBUG - No existing avatar, using default:', avatarUrl);
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const dataToUpdate = {
      fullname: updateData.fullname || existingUser.fullname,
      email: updateData.email || existingUser.email,
      role_id: updateData.role_id || existingUser.role_id,
      status: updateData.status || existingUser.status,
      phone: updateData.phone || existingUser.phone,
      address: updateData.address || existingUser.address,
      dob: updateData.dob || existingUser.dob,
      gender: updateData.gender || existingUser.gender,
      approval_status: updateData.approval_status || existingUser.approval_status,
      nickname: updateData.nickname || existingUser.nickname,
      bio: updateData.bio || existingUser.bio,
      social_links: updateData.social_links || existingUser.social_links,
      avatar: avatarUrl,
    };

    console.log('Data to update:', dataToUpdate); // Debug log

    // Cập nhật user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: dataToUpdate },
      { new: true, runValidators: true },
    ).populate('role_id');

    console.log('Updated user:', updatedUser); // Debug log

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error); // Debug log
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Xóa người dùng theo ID (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Xóa user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công',
    });
  } catch (error) {
    console.error('Lỗi xóa người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa người dùng',
      error: error.message,
    });
  }
};

// Lấy danh sách giảng viên
exports.getInstructors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const approvalStatus = req.query.approvalStatus;
    const from = req.query.from;
    const to = req.query.to;

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: ROLES.INSTRUCTOR });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò giảng viên không tồn tại',
      });
    }

    // Xây dựng query
    const instructorsQuery = {
      role_id: instructorRole._id,
    };

    // Tạo mảng conditions để kết hợp
    const conditions = [];

    // Tìm kiếm
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      conditions.push({
        $or: [
          { fullname: searchRegex },
          { email: searchRegex },
          { nickname: searchRegex },
          { phone: searchRegex },
        ]
      });
    }

    // Lọc theo trạng thái duyệt nếu có
    if (approvalStatus) {
      conditions.push({ 'instructorInfo.approval_status': approvalStatus });
    }

    // Lọc theo khoảng thời gian nộp hồ sơ
    if (from || to) {
      const dateQuery = {};
      if (from) {
        dateQuery.$gte = new Date(from);
      }
      if (to) {
        // Đặt thời gian cuối ngày cho 'to' date
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateQuery.$lte = toDate;
      }
      
      // Lọc theo application_date hoặc createdAt
      conditions.push({
        $or: [
          { 'instructorInfo.application_date': dateQuery },
          { createdAt: dateQuery }
        ]
      });
    }

    // Kết hợp tất cả conditions
    if (conditions.length > 0) {
      instructorsQuery.$and = conditions;
    }

    console.log('Instructors query:', JSON.stringify(instructorsQuery, null, 2));

    // Query + lean để truy cập nested fields
    const instructors = await User.find(instructorsQuery)
      .populate('role_id')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // ✅ Cho phép truy cập instructorInfo trực tiếp

    const total = await User.countDocuments(instructorsQuery);

    res.status(200).json({
      success: true,
      data: {
        instructors: instructors.map((instructor) => {
          const info = instructor.instructorInfo || {};
          const education = instructor.education || [];
          const firstEducation = education.length > 0 ? education[0] : {};

          return {
            id: instructor._id,
            fullname: instructor.fullname,
            email: instructor.email,
            avatar: instructor.avatar,
            phone: instructor.phone,
            address: instructor.address,
            dob: instructor.dob,
            gender: instructor.gender,
            status: instructor.status,
            role: instructor.role_id?.name || 'instructor',
            createdAt: instructor.createdAt,
            updatedAt: instructor.updatedAt,
            approvalStatus: info.instructor_profile_status || 'pending',
            isApproved: info.is_approved || false,
            specializations: info.specializations || [],
            experienceYears: info.experience_years || (info.teaching_experience?.years ?? 0),
            experienceDescription: info.teaching_experience?.description || '',
            certificates: info.certificates || [],
            demoVideo: info.demo_video || '',
            bio: info.bio || '',
            github: info.github || '',
            website: info.website || '',
            education: instructor.education || [],
            degree: firstEducation.degree || '',
            university: firstEducation.institution || '',
            major: firstEducation.major || '',
            graduationYear: firstEducation.year || '',
            cvUrl: info.cv_file || '',
            demoVideoUrl: info.demo_video || '',
            applicationDate: info.application_date || instructor.createdAt,
          };
        }),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách giảng viên',
      error: error.message,
    });
  }
};


// Cập nhật trạng thái hồ sơ giảng viên
exports.updateInstructorApproval = async (req, res) => {
  try {
    const instructorId = req.params.id;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Phải là "approved" hoặc "rejected"',
      });
    }

    if (status === 'rejected' && !rejection_reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Lý do từ chối là bắt buộc khi từ chối hồ sơ',
      });
    }

    const instructor = await User.findById(instructorId).populate('role_id');
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên',
      });
    }

    if (!instructor.instructorInfo) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng chưa nộp hồ sơ giảng viên',
      });
    }

    const info = instructor.instructorInfo;

    // Cập nhật trạng thái theo yêu cầu
    if (status === 'approved') {
      info.approval_status = 'approved';
      info.instructor_profile_status = 'approved';
      info.is_approved = true;
      info.rejection_reason = null;
      instructor.isInstructor = true;

      const instructorRole = await Role.findOne({ name: 'instructor' });
      if (instructorRole) {
        instructor.role_id = instructorRole._id;
      }
    } else if (status === 'rejected') {
      info.approval_status = 'rejected';
      info.instructor_profile_status = 'rejected';
      info.is_approved = false;
      info.rejection_reason = rejection_reason?.trim();
    }

    info.approval_date = new Date();
    info.approved_by = req.user._id;

    // Đánh dấu instructorInfo đã bị thay đổi (nếu là subdocument)
    instructor.markModified('instructorInfo');

    await instructor.save();

    // Cập nhật bảng instructorprofiles
    const InstructorProfile = require('../models/InstructorProfile');
    let instructorProfile = await InstructorProfile.findOne({ user: instructorId });
    
    if (instructorProfile) {
      // Cập nhật trạng thái trong bảng instructorprofiles
      instructorProfile.status = status;
      instructorProfile.is_approved = status === 'approved';
      await instructorProfile.save();
    } else {
      // Tạo mới record trong bảng instructorprofiles nếu chưa có
      instructorProfile = await InstructorProfile.create({
        user: instructorId,
        status: status,
        is_approved: status === 'approved',
        bio: info.bio || '',
        expertise: info.specializations || [],
        education: instructor.education || [],
        experience: info.experience || []
      });
    }

    // Gửi email thông báo kết quả duyệt
    try {
      await sendInstructorApprovalResultEmail(
        instructor.email,
        instructor.fullname,
        status,
        rejection_reason
      );
    } catch (emailError) {
      console.error('Lỗi gửi email kết quả duyệt hồ sơ:', emailError);
    }

    // Emit realtime event cho instructor approval
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('instructor-approved', {
          userId: instructor._id,
          email: instructor.email,
          fullname: instructor.fullname,
          status: status,
          rejection_reason: rejection_reason,
          approvedBy: req.user._id,
          timestamp: new Date()
        });
        console.log('Realtime instructor-approved event emitted');
      }
    } catch (socketError) {
      console.error('Failed to emit realtime event:', socketError);
    }

    res.status(200).json({
      success: true,
      message: status === 'approved'
        ? 'Duyệt hồ sơ giảng viên thành công'
        : 'Từ chối hồ sơ giảng viên thành công',
      data: {
        _id: instructor._id,
        email: instructor.email,
        fullname: instructor.fullname,
        role: instructor.role_id?.name,
        instructorInfo: instructor.instructorInfo,
      },
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái hồ sơ giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái hồ sơ giảng viên',
      error: error.message,
    });
  }
};


// Lấy thông tin chi tiết hồ sơ giảng viên chờ duyệt
exports.getInstructorDetail = async (req, res) => {
  try {
    const instructorId = req.params.id;

    // Tìm user theo _id, không lọc approval_status
    const instructor = await User.findById(instructorId).populate('role_id');

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên ',
      });
    }

    const instructorData = instructor.toObject(); // toJSON hoặc toObject đều được
    const detailedProfile = {
      _id: instructorData._id,
      fullname: instructorData.fullname,
      email: instructorData.email,
      nickname: instructorData.nickname,
      avatar: instructorData.avatar,
      dob: instructorData.dob,
      gender: instructorData.gender,
      phone: instructorData.phone,
      address: instructorData.address,
      approvalStatus: instructorData.approval_status,
      isInstructor: instructorData.isInstructor,
      has_registered_instructor: instructorData.has_registered_instructor,
      instructorProfile: {
        bio: instructorData.bio || '',
        social_links: instructorData.social_links || {},
        avatar: instructorData.avatar || null,
        phone: instructorData.phone || '',
        address: instructorData.address || '',
        dob: instructorData.dob || null,
        gender: instructorData.gender || '',
        instructorInfo: {
          experience_years: instructorData.instructorInfo?.experience_years || 0,
          specializations: instructorData.instructorInfo?.specializations || [],
          teaching_experience: instructorData.instructorInfo?.teaching_experience || {},
          certificates: instructorData.instructorInfo?.certificates || [],
          cv_file: instructorData.instructorInfo?.cv_file || null,
          demo_video: instructorData.instructorInfo?.demo_video || null,
          other_documents: instructorData.instructorInfo?.other_documents || [],
        },
      },
    };

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin chi tiết hồ sơ giảng viên thành công',
      data: detailedProfile,
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin chi tiết hồ sơ giảng viên:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin chi tiết hồ sơ giảng viên',
      error: error.message,
    });
  }
};

// Helper function để upload file lên Cloudinary
async function uploadToCloudinary(filePath, folder) {
  const cloudinary = require('../utils/cloudinary');
  return await cloudinary.uploader.upload(filePath, {
    folder: folder,
    resource_type: 'auto',
  });
}

// Đăng ký giảng viên mới (comprehensive form)
exports.registerInstructor = async (req, res) => {
  try {
    // Clean và validate input data
    const {
      // Personal info
      fullName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      address,

      // Education
      degree,
      institution,
      graduationYear,
      major,

      // Professional
      specializations,
      teachingExperience,
      experienceDescription,

      // Additional
      bio,
      facebook,
      github,
      website
    } = req.body;

    // Thêm log kiểm tra giá trị bio
    console.log('DEBUG - req.body.bio:', req.body.bio);
    // Clean whitespace from string fields
    const cleanFullName = fullName?.trim();
    const cleanEmail = email?.trim();
    const cleanPhone = phone?.trim();
    const cleanPassword = password?.trim();
    const cleanGender = gender?.trim();
    const cleanAddress = address?.trim();
    const cleanDegree = degree?.trim();
    const cleanInstitution = institution?.trim();
    const cleanMajor = major?.trim();
    const cleanBio = typeof req.body.bio === 'string' ? req.body.bio.trim() : '';
    const cleanFacebook = facebook?.trim();
    const cleanGithub = github?.trim();
    const cleanWebsite = website?.trim();

    // Map gender values
    const genderMap = {
      'nam': 'Nam',
      'nữ': 'Nữ',
      'khác': 'Khác',
      'male': 'Nam',
      'female': 'Nữ',
      'other': 'Khác'
    };

    const mappedGender = genderMap[cleanGender?.toLowerCase()] || cleanGender;

    // Tạo nickname từ fullName
    const generateNickname = (fullName) => {
      const nameParts = fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[nameParts.length - 2]}${nameParts[nameParts.length - 1]}`.toLowerCase();
      }
      return fullName.toLowerCase().replace(/\s+/g, '');
    };

    const nickname = generateNickname(cleanFullName);
    // Không tạo slug ở đây, để model tự động tạo trong pre-save hook

    console.log('Received instructor registration data:', {
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      gender: mappedGender,
      nickname,
      dateOfBirth,
      address: cleanAddress,
      degree: cleanDegree,
      institution: cleanInstitution,
      graduationYear,
      major: cleanMajor,
      specializations,
      teachingExperience,
      experienceDescription,
      bio: cleanBio
    });

    // Validation dữ liệu bắt buộc
    if (!cleanFullName || !cleanEmail || !cleanPhone || !cleanPassword || !mappedGender || !dateOfBirth || !cleanAddress) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cá nhân bắt buộc',
        missing: {
          fullName: !cleanFullName,
          email: !cleanEmail,
          phone: !cleanPhone,
          password: !cleanPassword,
          gender: !mappedGender,
          dateOfBirth: !dateOfBirth,
          address: !cleanAddress
        },
        received: {
          fullName: cleanFullName,
          email: cleanEmail,
          phone: cleanPhone,
          password: cleanPassword ? '***' : '',
          gender: mappedGender,
          dateOfBirth,
          address: cleanAddress
        }
      });
    }

    if (!cleanDegree || !cleanInstitution || !graduationYear || !cleanMajor) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin học vấn bắt buộc',
        missing: {
          degree: !cleanDegree,
          institution: !cleanInstitution,
          graduationYear: !graduationYear,
          major: !cleanMajor
        }
      });
    }

    if (!specializations || !teachingExperience || !experienceDescription) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin chuyên môn bắt buộc',
        missing: {
          specializations: !specializations,
          teachingExperience: !teachingExperience,
          experienceDescription: !experienceDescription
        }
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    // Lấy thông tin file đã upload từ middleware
    const uploadedFiles = req.uploadedInstructorFiles || {};
    console.log('DEBUG - uploadedInstructorFiles in registerInstructor:', uploadedFiles); // Log để debug

    // Xử lý avatar
    let avatarUrl = 'default-avatar.jpg';
    if (uploadedFiles.avatar) {
      avatarUrl = uploadedFiles.avatar.url;
    }

    // Xử lý CV file
    let cvFileUrl = null;
    if (uploadedFiles.cv) {
      cvFileUrl = uploadedFiles.cv.url;
    }

    // Xử lý certificates
    const processedCertificates = [];
    if (uploadedFiles.certificates && uploadedFiles.certificates.length > 0) {
      for (const certFile of uploadedFiles.certificates) {
        processedCertificates.push({
          name: certFile.original_name,
          file: certFile.url,
          original_name: certFile.original_name,
          uploaded_at: new Date(),
        });
      }
    }

    // Xử lý demo video
    let demoVideoUrl = null;
    if (uploadedFiles.demoVideo) {
      demoVideoUrl = uploadedFiles.demoVideo.url;
    }

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò giảng viên không tồn tại',
      });
    }

    // Xử lý dateOfBirth
    let processedDateOfBirth;
    try {
      processedDateOfBirth = new Date(dateOfBirth);
      if (isNaN(processedDateOfBirth.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng ngày sinh không hợp lệ',
        receivedDate: dateOfBirth
      });
    }

    // Tạo email verification token (dùng đúng tên trường trong schema)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    // Tạo user mới
    const newUser = new User({
      fullname: cleanFullName,
      nickname: nickname,
      email: cleanEmail,
      phone: cleanPhone,
      password: cleanPassword,
      gender: mappedGender,
      dob: processedDateOfBirth,
      address: cleanAddress,
      avatar: avatarUrl || 'default-avatar.jpg',
      bio: cleanBio,
      social_links: {
        facebook: cleanFacebook || '',
        github: cleanGithub || '',
        website: cleanWebsite || '',
      },
      role_id: instructorRole._id,
      status: 'inactive',
      email_verified: false,
      approval_status: 'pending',
      instructor_approval_status: 'pending',
      email_verification_token: hashedVerificationToken,
      email_verification_expires: verificationExpires,
      education: [{
        degree: cleanDegree,
        institution: cleanInstitution,
        year: parseInt(graduationYear) || new Date().getFullYear(),
        major: cleanMajor,
      }],
      instructorInfo: {
        is_approved: false,
        experience_years: parseInt(teachingExperience) || 0,
        specializations: Array.isArray(specializations) ? specializations : [specializations],
        teaching_experience: {
          years: parseInt(teachingExperience) || 0,
          description: experienceDescription,
        },
        certificates: processedCertificates,
        demo_video: demoVideoUrl || null,
        cv_file: cvFileUrl || null,
        instructor_profile_status: 'pending',
        bio: cleanBio || '',
      },
    });

    await newUser.save();

    // Tạo bản ghi InstructorProfile tương ứng
    await InstructorProfile.create({
      user: newUser._id,
      status: 'pending',
      is_approved: false,
      bio: newUser.bio,
      expertise: newUser.instructorInfo.specializations,
      education: [{
        degree: cleanDegree,
        institution: cleanInstitution,
        year: parseInt(graduationYear) || new Date().getFullYear(),
      }],
      profileImage: avatarUrl || 'default-avatar.jpg',
    });

    // Gửi email xác minh
    try {
      await sendInstructorVerificationEmail(cleanEmail, cleanFullName, verificationToken);
      console.log('Verification email sent successfully to:', cleanEmail);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Không dừng quá trình nếu lỗi gửi email
    }

    console.log('Instructor registration successful:', {
      userId: newUser._id,
      email: newUser.email,
      status: newUser.status,
      emailVerified: newUser.email_verified
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký giảng viên thành công! Vui lòng kiểm tra email để xác minh tài khoản.',
      data: {
        user: {
          _id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
          status: newUser.status,
          email_verified: newUser.email_verified,
          approval_status: newUser.approval_status,
          instructor_approval_status: newUser.instructor_approval_status,
        },
        instructorInfo: {
          ...newUser.instructorInfo.toObject ? newUser.instructorInfo.toObject() : newUser.instructorInfo,
          bio: newUser.bio || newUser.instructorInfo.bio || '',
          instructor_profile_status: newUser.instructorInfo.instructor_profile_status,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi đăng ký giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng ký giảng viên',
      error: error.message,
    });
  }
};

// Xác minh email cho instructor registration
exports.verifyInstructorEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token xác minh không hợp lệ',
      });
    }

    // Tìm user với token này (hash SHA256 token từ URL)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email_verification_token: hashedToken,
      email_verification_expires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token xác minh không hợp lệ hoặc đã hết hạn',
      });
    }

    // Cập nhật trạng thái user
    user.email_verified = true;
    user.status = 'active';
    user.email_verification_token = undefined;
    user.email_verification_expires = undefined;
    user.approval_status = 'approved'; // Chuyển sang đã duyệt khi xác minh email
    // KHÔNG cập nhật instructorInfo.instructor_profile_status, giữ nguyên trạng thái cũ

    if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    await user.save();

    // Gửi email thông báo hồ sơ đã được gửi cho admin
    try {
      await sendInstructorProfileSubmittedEmail(user.email, user.fullname);
      console.log('Profile submitted email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Failed to send profile submitted email:', emailError);
    }

    // Emit realtime event cho email verification
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('email-verified', {
          token: token,
          userId: user._id,
          email: user.email,
          fullname: user.fullname,
          isInstructor: true,
          timestamp: new Date()
        });
        console.log('Realtime email-verified event emitted');
      }
    } catch (socketError) {
      console.error('Failed to emit realtime event:', socketError);
    }

    console.log('Email verification successful:', {
      userId: user._id,
      email: user.email,
      status: user.status,
      emailVerified: user.email_verified,
      approvalStatus: user.approval_status
    });

    res.status(200).json({
      success: true,
      message: 'Xác minh email thành công! Hồ sơ của bạn đã được gửi cho admin xét duyệt.',
      data: {
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          status: user.status,
          email_verified: user.email_verified,
          approval_status: user.approval_status,
        },
        instructorInfo: user.instructorInfo,
      },
    });
  } catch (error) {
    console.error('Lỗi xác minh email:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác minh email',
      error: error.message,
    });
  }
};

// Cập nhật hồ sơ giảng viên (và đồng bộ sang User)
exports.updateInstructorProfile = async (req, res) => {
  try {
    const { id } = req.params; // id của InstructorProfile
    const updateData = req.body;

    // Tìm InstructorProfile
    const instructorProfile = await InstructorProfile.findById(id);
    if (!instructorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên',
      });
    }

    // Cập nhật các trường cho InstructorProfile
    if (updateData.bio !== undefined) instructorProfile.bio = updateData.bio;
    if (updateData.profileImage !== undefined) instructorProfile.profileImage = updateData.profileImage;
    if (updateData.expertise !== undefined) instructorProfile.expertise = updateData.expertise;
    if (updateData.education !== undefined) instructorProfile.education = updateData.education;
    if (updateData.status !== undefined) instructorProfile.status = updateData.status;
    if (updateData.is_approved !== undefined) instructorProfile.is_approved = updateData.is_approved;
    if (updateData.experience !== undefined) instructorProfile.experience = updateData.experience;
    // ... thêm các trường khác nếu cần

    await instructorProfile.save();

    // Đồng bộ sang User
    const user = await User.findById(instructorProfile.user);
    if (user) {
      if (updateData.bio !== undefined) user.bio = updateData.bio;
      if (updateData.profileImage !== undefined) user.avatar = updateData.profileImage;
      if (updateData.expertise !== undefined) {
        user.instructorInfo = user.instructorInfo || {};
        user.instructorInfo.specializations = updateData.expertise;
      }
      if (updateData.education !== undefined) user.education = updateData.education;
      // ... đồng bộ các trường khác nếu cần
      await user.save();
    }

    res.json({
      success: true,
      message: 'Cập nhật hồ sơ giảng viên thành công',
      data: instructorProfile,
    });
  } catch (error) {
    console.error('Lỗi cập nhật hồ sơ giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật hồ sơ giảng viên',
      error: error.message,
    });
  }
};

exports.getMyEnrollments = async (req, res, next) => {
  try {
    const Enrollment = require('../models/Enrollment');
    const Course = require('../models/Course');
    const Section = require('../models/Section');

    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor category',
        },
      });

    const data = await Promise.all(
      enrollments.map(async (enroll) => {
        const course = enroll.course;

        // 👇 Tính totalLessons cho từng course
        let totalLessons = 0;
        if (course?._id) {
          const sections = await Section.find({ course_id: course._id }).select('lessons');
          totalLessons = sections.reduce((sum, section) => {
            return sum + (section.lessons?.length || 0);
          }, 0);
        }

        return {
          ...enroll.toObject(),
          course: {
            ...course.toObject(),
            totalLessons, // 👈 Gắn vào đây
          },
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách giảng viên đã duyệt cho client
exports.getApprovedInstructors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: ROLES.INSTRUCTOR });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò giảng viên không tồn tại',
      });
    }

    // Xây dựng query - chỉ lấy giảng viên đã được duyệt
    const instructorsQuery = {
      role_id: instructorRole._id,
      'instructorInfo.is_approved': true,
      $or: [
        { 'instructorInfo.approval_status': 'approved' },
        { approval_status: 'approved' }
      ]
    };

    // Tìm kiếm
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      instructorsQuery.$or = [
        { fullname: searchRegex },
        { email: searchRegex },
        { nickname: searchRegex },
        { 'instructorInfo.bio': searchRegex },
        { 'instructorInfo.expertise': searchRegex }
      ];
    }

    // Query + lean để truy cập nested fields
    const instructors = await User.find(instructorsQuery)
      .populate('role_id')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(instructorsQuery);

    // Lấy thống kê khóa học cho từng giảng viên
    const Course = require('../models/Course');
    const instructorIds = instructors.map(instructor => instructor._id);

    // Lấy instructor profile IDs cho các user
    const instructorProfiles = await InstructorProfile.find({
      user: { $in: instructorIds }
    }).select('_id user');

    const instructorProfileIds = instructorProfiles.map(profile => profile._id);
    const userToProfileMap = {};
    instructorProfiles.forEach(profile => {
      userToProfileMap[profile.user.toString()] = profile._id.toString();
    });

    const courseStats = await Course.aggregate([
      {
        $match: {
          instructor: { $in: instructorProfileIds }
        }
      },
      {
        $group: {
          _id: '$instructor',
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: '$enrolledStudents' || 0 }
        }
      }
    ]);

    // Tạo map để truy cập nhanh thống kê
    const courseStatsMap = {};
    courseStats.forEach(stat => {
      courseStatsMap[stat._id.toString()] = stat;
    });

    res.status(200).json({
      success: true,
      data: {
        instructors: instructors.map((instructor) => {
          const info = instructor.instructorInfo || {};
          const education = instructor.education || [];
          const firstEducation = education.length > 0 ? education[0] : {};

          return {
            id: instructor._id,
            slug: instructor.slug,
            fullname: instructor.fullname,
            email: instructor.email,
            avatar: instructor.avatar,
            phone: instructor.phone,
            address: instructor.address,
            dob: instructor.dob,
            gender: instructor.gender,
            status: instructor.status,
            role: instructor.role_id?.name || 'instructor',
            createdAt: instructor.createdAt,
            updatedAt: instructor.updatedAt,
            approvalStatus: info.instructor_profile_status || 'pending',
            isApproved: info.is_approved || false,
            specializations: info.specializations || [],
            experienceYears: info.experience_years || (info.teaching_experience?.years ?? 0),
            experienceDescription: info.teaching_experience?.description || '',
            certificates: info.certificates || [],
            demoVideo: info.demo_video || '',
            bio: info.bio || '',
            github: info.github || '',
            website: info.website || '',
            education: instructor.education || [],
            degree: firstEducation.degree || '',
            university: firstEducation.institution || '',
            major: firstEducation.major || '',
            graduationYear: firstEducation.year || '',
            cvUrl: info.cv_file || '',
            demoVideoUrl: info.demo_video || '',
            applicationDate: info.application_date || instructor.createdAt,
          };
        }),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách giảng viên đã duyệt:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách giảng viên',
      error: error.message,
    });
  }
};

// Lấy chi tiết giảng viên đã duyệt cho client
exports.getApprovedInstructorDetail = async (req, res) => {
  try {
    const instructorId = req.params.id;

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: ROLES.INSTRUCTOR });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò giảng viên không tồn tại',
      });
    }

    // Tìm giảng viên đã được duyệt
    const instructor = await User.findOne({
      _id: instructorId,
      role_id: instructorRole._id,
      'instructorInfo.approval_status': 'approved',
      'instructorInfo.is_approved': true
    }).populate('role_id').lean();

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên hoặc giảng viên chưa được duyệt',
      });
    }

    const info = instructor.instructorInfo || {};

    // Lấy thống kê khóa học
    const Course = require('../models/Course');
    const InstructorProfile = require('../models/InstructorProfile');

    const instructorProfile = await InstructorProfile.findOne({ user: instructor._id });
    let courseStats = { totalCourses: 0, totalStudents: 0 };

    if (instructorProfile) {
      const courseAggregation = await Course.aggregate([
        {
          $match: {
            instructor: instructorProfile._id
          }
        },
        {
          $group: {
            _id: '$instructor',
            totalCourses: { $sum: 1 },
            totalStudents: { $sum: '$enrolledStudents' || 0 }
          }
        }
      ]);

      if (courseAggregation.length > 0) {
        courseStats = courseAggregation[0];
      }
    }

    // Lấy danh sách khóa học của giảng viên
    const courses = instructorProfile ? await Course.find({ instructor: instructorProfile._id })
      .select('title slug thumbnail price discount rating totalReviews level language')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean() : [];

    res.status(200).json({
      success: true,
      data: {
        id: instructor._id,
        fullname: instructor.fullname,
        email: instructor.email,
        avatar: instructor.avatar,
        phone: instructor.phone,
        address: instructor.address,
        bio: info.bio || 'Chưa có thông tin giới thiệu',
        rating: info.rating || 0,
        totalStudents: courseStats.totalStudents || info.totalStudents || 0,
        totalCourses: courseStats.totalCourses || 0,
        totalReviews: info.totalReviews || 0,
        experienceYears: info.experience_years || 0,
        expertise: info.expertise || [],
        isVerified: true,
        location: instructor.address || 'Chưa cập nhật',
        education: info.education || `${info.degree || ''} ${info.university || ''}`.trim() || 'Chưa cập nhật',
        degree: info.degree,
        university: info.university,
        major: info.major,
        graduationYear: info.graduation_year,
        experienceDescription: info.teaching_experience_description,
        github: info.github,
        facebook: info.facebook,
        website: info.website,
        createdAt: instructor.createdAt,
        courses: courses.map(course => ({
          id: course._id,
          title: course.title,
          slug: course.slug,
          thumbnail: course.thumbnail,
          price: course.price,
          discount: course.discount,
          finalPrice: Math.round(course.price * (1 - (course.discount || 0) / 100)),
          rating: course.rating,
          totalReviews: course.totalReviews,
          level: course.level,
          language: course.language
        }))
      },
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết giảng viên',
      error: error.message,
    });
  }
};

// Theo dõi một user
exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể tự theo dõi chính mình.' });
    }
    // Kiểm tra user tồn tại
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }
    // Tạo follow
    const follow = await Follow.findOneAndUpdate(
      { follower: currentUserId, following: targetUserId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // Tăng followers_count và following_count nếu là lần đầu
    await User.findByIdAndUpdate(targetUserId, { $inc: { followers_count: 1 } });
    await User.findByIdAndUpdate(currentUserId, { $inc: { following_count: 1 } });
    res.status(200).json({ success: true, message: 'Đã theo dõi người dùng.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Đã theo dõi người này.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// Bỏ theo dõi một user
exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    const follow = await Follow.findOneAndDelete({ follower: currentUserId, following: targetUserId });
    if (!follow) {
      return res.status(400).json({ success: false, message: 'Bạn chưa theo dõi người này.' });
    }
    // Giảm followers_count và following_count
    await User.findByIdAndUpdate(targetUserId, { $inc: { followers_count: -1 } });
    await User.findByIdAndUpdate(currentUserId, { $inc: { following_count: -1 } });
    res.status(200).json({ success: true, message: 'Đã bỏ theo dõi người dùng.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// Lấy danh sách follower của user
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;
    const followers = await Follow.find({ following: userId }).populate('follower', 'fullname nickname avatar slug');
    res.status(200).json({ success: true, data: followers.map(f => f.follower) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// Lấy danh sách user mà user này đang theo dõi
exports.getFollowing = async (req, res) => {
  try {
    // Nếu có req.params.id thì lấy theo id đó (public route)
    // Nếu không có thì lấy theo user hiện tại (authenticated route)
    const userId = req.params.id || req.user._id;
    
    console.log('Getting following for userId:', userId);
    
    const following = await Follow.find({ follower: userId })
      .populate('following', 'fullname nickname avatar slug _id')
      .sort({ createdAt: -1 });
    
    console.log('Found following:', following.length);
    
    const followingUsers = following.map(f => f.following).filter(user => user !== null);
    
    res.status(200).json({ 
      success: true, 
      data: followingUsers 
    });
  } catch (error) {
    console.error('Error getting following:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ', 
      error: error.message 
    });
  }
};

// Lấy thông tin user theo slug hoặc nickname, trả về cả khóa học đã tạo và đã tham gia
exports.getUserBySlug = async (req, res) => {
  try {
    let user = await User.findOne({ slug: req.params.slug }).populate('role_id');
    if (!user) {
      // Nếu không tìm thấy theo slug, thử tìm theo nickname
      user = await User.findOne({ nickname: req.params.slug }).populate('role_id');
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Lấy danh sách khóa học đã tạo (nếu là instructor)
    let createdCourses = [];
    if (user.role_id?.name === 'instructor' || user.isInstructor) {
      // Tìm InstructorProfile
      const InstructorProfile = require('../models/InstructorProfile');
      const Course = require('../models/Course');
      const instructorProfile = await InstructorProfile.findOne({ user: user._id });
      if (instructorProfile) {
        createdCourses = await Course.find({ instructor: instructorProfile._id });
      }
    }

    // Lấy danh sách khóa học đã tham gia (enrolled)
    const Enrollment = require('../models/Enrollment');
    const Course = require('../models/Course');
    const enrollments = await Enrollment.find({ student: user._id });
    const enrolledCourseIds = enrollments.map(e => e.course);
    const enrolledCourses = await Course.find({ _id: { $in: enrolledCourseIds } });

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        createdCourses,
        enrolledCourses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.searchUsers = exports.getAllUsers;

// Tìm kiếm giảng viên (public)
exports.searchInstructors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: ROLES.INSTRUCTOR });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò giảng viên không tồn tại',
      });
    }

    // Xây dựng query
    const query = { role_id: instructorRole._id };
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nickname: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('role_id')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => user.toJSON()),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Lỗi tìm kiếm giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tìm kiếm giảng viên',
      error: error.message,
    });
  }
};
