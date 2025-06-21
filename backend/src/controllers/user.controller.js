const User = require('../models/User');
const { Role, ROLES } = require('../models/Role');

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON(), // loại bỏ thông tin nhạy cảm
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

    // Xử lý avatar nếu có upload
    if (req.uploadedAvatar) {
      updateFields.avatar = req.uploadedAvatar.url;
    } else if (req.body.avatar) {
      // Nếu không có file upload nhưng có URL avatar
      updateFields.avatar = req.body.avatar;
    }

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
    console.error('Lỗi cập nhật người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thông tin người dùng',
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
    const user = await User.findById(req.params.id).populate('role_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin người dùng',
      error: error.message,
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

    // Xử lý nickname để tạo slug
    const normalizedNickname = nickname ? nickname.toLowerCase().replace(/[^a-z0-9]/g, '-') : '';

    // Kiểm tra xem slug đã tồn tại chưa
    let slug = normalizedNickname;
    let counter = 1;
    let userWithSlug;

    if (normalizedNickname) {
      do {
        userWithSlug = await User.findOne({ slug });
        if (userWithSlug) {
          slug = `${normalizedNickname}-${counter++}`;
        }
      } while (userWithSlug);
    }

    // Xử lý avatar nếu có upload
    let avatarUrl = null;
    if (req.uploadedAvatar) {
      avatarUrl = req.uploadedAvatar.url;
    } else if (req.body.avatar) {
      avatarUrl = req.body.avatar;
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
    const user = new User({
      email,
      password,
      fullname,
      nickname,
      phone,
      dob,
      address,
      gender,
      role_id,
      status,
      approval_status,
      email_verified: true, // Admin tạo user nên mặc định đã xác thực email
      slug,
      bio,
      instructorInfo,
      avatar: avatarUrl,
      social_links: socialLinks,
    });

    await user.save();
    await user.populate('role_id');

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
      avatar: updateData.avatar || existingUser.avatar,
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

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: ROLES.INSTRUCTOR });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò giảng viên không tồn tại',
      });
    }

    // Xây dựng query cho giảng viên
    const instructorsQuery = {
      role_id: instructorRole._id,
    };

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      const searchQuery = {
        $or: [
          { fullname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { nickname: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      };
      instructorsQuery.$and = [instructorsQuery, searchQuery];
    }

    // Thực hiện query với phân trang
    const instructors = await User.find(instructorsQuery)
      .populate('role_id')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    // Đếm tổng số giảng viên
    const total = await User.countDocuments(instructorsQuery);

    res.status(200).json({
      success: true,
      data: {
        instructors: instructors.map(instructor => instructor.toJSON()),
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

    // Kiểm tra lý do từ chối nếu status là rejected
    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Lý do từ chối là bắt buộc khi từ chối hồ sơ',
      });
    }

    // Tìm giảng viên
    const instructor = await User.findById(instructorId).populate('role_id');
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên',
      });
    }

    // Kiểm tra xem có hồ sơ giảng viên không
    if (!instructor.instructorInfo) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng chưa nộp hồ sơ giảng viên',
      });
    }

    // Cập nhật trạng thái duyệt
    instructor.approval_status = status;
    instructor.instructorInfo.approval_status = status;
    instructor.instructorInfo.approval_date = new Date();
    instructor.instructorInfo.approved_by = req.user._id;

    if (status === 'approved') {
      // Nếu duyệt, cập nhật role thành instructor
      const instructorRole = await Role.findOne({ name: 'instructor' });
      if (instructorRole) {
        instructor.role_id = instructorRole._id;
        instructor.isInstructor = true;
        instructor.instructorInfo.is_approved = true;
      }
      instructor.instructorInfo.rejection_reason = null;
    } else {
      // Nếu từ chối, giữ nguyên role student
      instructor.instructorInfo.rejection_reason = rejection_reason;
      instructor.instructorInfo.is_approved = false;
    }

    // Lưu thay đổi
    await instructor.save();

    res.status(200).json({
      success: true,
      message: status === 'approved' ? 'Duyệt hồ sơ giảng viên thành công' : 'Từ chối hồ sơ giảng viên thành công',
      data: {
        _id: instructor._id,
        email: instructor.email,
        fullname: instructor.fullname,
        approval_status: instructor.approval_status,
        role: instructor.role_id.name,
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

// Lấy danh sách hồ sơ giảng viên chờ duyệt
exports.getPendingInstructors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // Tạo query cơ bản
    const pendingInstructorsQuery = {
      approval_status: 'pending',
      instructorInfo: { $exists: true },
    };

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      const searchQuery = {
        $or: [
          { fullname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { nickname: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      };
      pendingInstructorsQuery.$and = [searchQuery];
    }

    // Lấy danh sách giảng viên chờ duyệt
    const pendingInstructors = await User.find(pendingInstructorsQuery)
      .populate('role_id')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    // Đếm tổng số
    const total = await User.countDocuments(pendingInstructorsQuery);

    // Format dữ liệu trả về
    const formattedInstructors = pendingInstructors.map(instructor => {
      const instructorData = instructor.toJSON();
      return {
        ...instructorData,
        instructorProfile: {
          bio: instructorData.bio || '',
          social_links: instructorData.social_links || {},
          avatar: instructorData.avatar || null,
          phone: instructorData.phone || '',
          address: instructorData.address || '',
          dob: instructorData.dob || null,
          gender: instructorData.gender || '',
          instructorInfo: instructorData.instructorInfo || {},
        },
        registrationInfo: {
          created_at: instructorData.created_at,
          updated_at: instructorData.updated_at,
          email_verified: instructorData.email_verified,
          status: instructorData.status,
        },
      };
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách hồ sơ giảng viên chờ duyệt thành công',
      data: {
        pendingInstructors: formattedInstructors,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        summary: {
          totalPending: total,
          totalApproved: await User.countDocuments({
            approval_status: 'approved',
            instructorInfo: { $exists: true },
          }),
          totalRejected: await User.countDocuments({
            approval_status: 'rejected',
            instructorInfo: { $exists: true },
          }),
        },
      },
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách hồ sơ giảng viên chờ duyệt:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách hồ sơ giảng viên chờ duyệt',
      error: error.message,
    });
  }
};


// Lấy thông tin chi tiết hồ sơ giảng viên chờ duyệt
exports.getPendingInstructorDetail = async (req, res) => {
  try {
    const instructorId = req.params.id;

    // Không lọc theo role vì lúc này user chưa phải instructor
    const instructor = await User.findOne({
      _id: instructorId,
      $or: [
        { approval_status: 'pending' },
        { approval_status: null },
      ],
    }).populate('role_id');

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên chờ duyệt',
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
      approval_status: instructorData.approval_status,
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



// Nộp hồ sơ giảng viên (từ role sinh viên)
exports.submitInstructorProfile = async (req, res) => {
  try { 
    const userId = req.user._id;
    
    // Kiểm tra user hiện tại
    const user = await User.findById(userId).populate('role_id');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Kiểm tra xem user có phải là sinh viên không
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole || user.role_id._id.toString() !== studentRole._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ sinh viên mới có thể nộp hồ sơ giảng viên',
      });
    }

    // Kiểm tra xem đã có hồ sơ giảng viên chưa
    if (user.instructorInfo && user.instructorInfo.approval_status) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã nộp hồ sơ giảng viên trước đó',
      });
    }

    const {
      experience_years,
      specializations,
      teaching_experience,
      certificates,
      demo_video,
      other_documents,
    } = req.body;

    // Validation dữ liệu bắt buộc
    if (!experience_years || !specializations || !teaching_experience || !certificates) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: kinh nghiệm, chuyên môn, mô tả kinh nghiệm, bằng cấp',
      });
    }

    // Validation certificates
    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phải có ít nhất 1 bằng cấp/chứng chỉ',
      });
    }

    // Xử lý file upload
    const uploadedFiles = req.files || {};
    
    // Xử lý file bằng cấp
    const processedCertificates = [];
    if (uploadedFiles.certificate_files && certificates) {
      for (let i = 0; i < certificates.length; i++) {
        const certificate = certificates[i];
        const certificateFile = uploadedFiles.certificate_files[i];
        
        if (!certificateFile) {
          return res.status(400).json({
            success: false,
            message: `Thiếu file scan cho bằng cấp: ${certificate.name}`,
          });
        }

        // Upload file lên Cloudinary
        const cloudinaryResult = await uploadToCloudinary(certificateFile.path, 'instructor-certificates');
        
        processedCertificates.push({
          name: certificate.name,
          major: certificate.major,
          issuer: certificate.issuer,
          year: certificate.year,
          file: cloudinaryResult.secure_url,
        });
      }
    }

    // Xử lý CV file
    let cvFileUrl = null;
    if (uploadedFiles.cv_file && uploadedFiles.cv_file[0]) {
      const cvResult = await uploadToCloudinary(uploadedFiles.cv_file[0].path, 'instructor-cv');
      cvFileUrl = cvResult.secure_url;
    }

    // Xử lý video demo
    let demoVideoUrl = null;
    if (uploadedFiles.demo_video && uploadedFiles.demo_video[0]) {
      const videoResult = await uploadToCloudinary(uploadedFiles.demo_video[0].path, 'instructor-demo-videos');
      demoVideoUrl = videoResult.secure_url;
    }

    // Xử lý hồ sơ khác
    const processedOtherDocuments = [];
    if (uploadedFiles.other_documents && other_documents) {
      for (let i = 0; i < other_documents.length; i++) {
        const doc = other_documents[i];
        const docFile = uploadedFiles.other_documents[i];
        
        if (docFile) {
          const docResult = await uploadToCloudinary(docFile.path, 'instructor-documents');
          processedOtherDocuments.push({
            name: doc.name,
            file: docResult.secure_url,
            description: doc.description || '',
          });
        }
      }
    }

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò giảng viên không tồn tại',
      });
    }

    // Cập nhật thông tin user
    const instructorInfo = {
      is_approved: false,
      experience_years: parseInt(experience_years),
      specializations: Array.isArray(specializations) ? specializations : [specializations],
      teaching_experience: {
        years: parseInt(teaching_experience.years),
        description: teaching_experience.description,
      },
      certificates: processedCertificates,
      demo_video: demoVideoUrl,
      cv_file: cvFileUrl,
      other_documents: processedOtherDocuments,
      approval_status: 'pending',
    };

    // Cập nhật user
    user.instructorInfo = instructorInfo;
    user.approval_status = 'pending';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Nộp hồ sơ giảng viên thành công. Hồ sơ đang chờ duyệt.',
      data: {
        instructorInfo: user.instructorInfo,
        approval_status: user.approval_status,
      },
    });
  } catch (error) {
    console.error('Lỗi nộp hồ sơ giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi nộp hồ sơ giảng viên',
      error: error.message,
    });
  }
};

// Lấy thông tin hồ sơ giảng viên của user hiện tại
exports.getMyInstructorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate('role_id');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        instructorInfo: user.instructorInfo || null,
        approval_status: user.approval_status,
        role: user.role_id.name,
      },
    });
  } catch (error) {
    console.error('Lỗi lấy hồ sơ giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy hồ sơ giảng viên',
      error: error.message,
    });
  }
};

// Cập nhật hồ sơ giảng viên (cho user đã nộp hồ sơ)
exports.updateInstructorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate('role_id');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Kiểm tra xem có hồ sơ giảng viên không
    if (!user.instructorInfo || !user.instructorInfo.approval_status) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa nộp hồ sơ giảng viên',
      });
    }

    // Chỉ cho phép cập nhật khi hồ sơ bị từ chối
    if (user.instructorInfo.approval_status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật hồ sơ đã được duyệt',
      });
    }

    const {
      experience_years,
      specializations,
      teaching_experience,
      certificates,
      demo_video,
      other_documents,
    } = req.body;

    // Xử lý file upload tương tự như submitInstructorProfile
    // ... (code xử lý file tương tự)

    // Cập nhật thông tin
    if (experience_years) user.instructorInfo.experience_years = parseInt(experience_years);
    if (specializations) user.instructorInfo.specializations = Array.isArray(specializations) ? specializations : [specializations];
    if (teaching_experience) user.instructorInfo.teaching_experience = teaching_experience;
    if (certificates) user.instructorInfo.certificates = certificates;
    if (demo_video) user.instructorInfo.demo_video = demo_video;
    if (other_documents) user.instructorInfo.other_documents = other_documents;

    // Reset trạng thái về pending
    user.instructorInfo.approval_status = 'pending';
    user.approval_status = 'pending';

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ giảng viên thành công. Hồ sơ đang chờ duyệt lại.',
      data: {
        instructorInfo: user.instructorInfo,
        approval_status: user.approval_status,
      },
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

// Helper function để upload file lên Cloudinary
async function uploadToCloudinary(filePath, folder) {
  const cloudinary = require('../utils/cloudinary');
  return await cloudinary.uploader.upload(filePath, {
    folder: folder,
    resource_type: 'auto',
  });
}
