const User = require('../models/User');
const { Role, ROLES } = require('../models/Role');
const Course = require('../models/Course');

// Lấy danh sách người dùng (có phân trang và tìm kiếm)
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
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
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
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách người dùng',
      error: error.message
    });
  }
};

// Lấy thông tin chi tiết một người dùng
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('role_id');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin người dùng',
      error: error.message
    });
  }
};

// Cập nhật trạng thái hồ sơ giảng viên
exports.updateInstructorApproval = async (req, res) => {
  try {
    const instructorId = req.params.id;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Phải là "approved" hoặc "rejected"'
      });
    }

    // Tìm giảng viên
    const instructor = await User.findById(instructorId).populate('role_id');
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên'
      });
    }

    // Kiểm tra xem giảng viên có phải là giảng viên không
    const instructorRole = await Role.findOne({ name: ROLES.INSTRUCTOR });
    if (!instructorRole) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò giảng viên không tồn tại'
      });
    }

    console.log('Instructor role_id:', instructor.role_id);
    console.log('Instructor role_id type:', typeof instructor.role_id);
    console.log('Instructor role_id._id:', instructor.role_id._id);
    console.log('Instructor role_id._id type:', typeof instructor.role_id._id);
    console.log('Instructor Role:', instructorRole);
    console.log('Instructor approval_status:', instructor.approval_status);

    // Kiểm tra xem giảng viên có phải là giảng viên không
    if (!instructor.role_id || !instructor.role_id._id || instructor.role_id._id.toString() !== instructorRole._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Người dùng không phải là giảng viên',
        debug: {
          instructorRoleId: instructor.role_id ? instructor.role_id._id.toString() : 'null',
          instructorRoleID: instructorRole._id.toString()
        }
      });
    }

    // Cập nhật trạng thái duyệt
    instructor.approval_status = status;
    instructor.isInstructor = status === 'approved';
    instructor.has_registered_instructor = status === 'approved';

    // Kiểm tra và khởi tạo instructorInfo nếu cần
    if (!instructor.instructorInfo) {
      instructor.instructorInfo = {};
    }
    instructor.instructorInfo.is_approved = status === 'approved';

    // Lưu thay đổi
    await instructor.save();

    // Xóa approvalStatus khỏi response để tránh hiểu lầm
    const instructorData = instructor.toJSON();
    delete instructorData.approvalStatus;

    res.status(200).json({
      success: true,
      message: status === 'approved' ? 'Duyệt hồ sơ giảng viên thành công' : 'Loại bỏ hồ sơ giảng viên thành công',
      data: instructorData
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái hồ sơ giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái hồ sơ giảng viên',
      error: error.message
    });
  }
};

// Tạo người dùng mới
exports.createUser = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      role_id, 
      status = 'active',
      phone,
      address,
      dob,
      gender,
      approval_status = 'approved'
    } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Kiểm tra role_id hợp lệ
    const role = await Role.findOne({ _id: role_id });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ'
      });
    }

    // Tạo user mới
    const user = new User({
      email,
      password,
      name,
      role_id,
      status,
      phone,
      address,
      dob,
      gender,
      approval_status,
      email_verified: true // Admin tạo user nên mặc định đã xác thực email
    });

    await user.save();
    await user.populate('role_id');

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Lỗi tạo người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo người dùng',
      error: error.message
    });
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { 
      name, 
      role_id, 
      status,
      email_verified,
      phone,
      address,
      dob,
      gender,
      email,
      approval_status
    } = req.body;
    const userId = req.params.id;

    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra email duy nhất (nếu email được cập nhật)
    if (email !== undefined && email !== user.email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng bởi người dùng khác'
        });
      }
    }

    // Kiểm tra role_id nếu cập nhật
    if (role_id !== undefined && role_id !== user.role_id) {
      const role = await Role.findById(role_id);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Vai trò không hợp lệ'
        });
      }
    }

    // Cập nhật thông tin
    const updateData = {
      name: name !== undefined ? name : user.name,
      role_id: role_id !== undefined ? role_id : user.role_id,
      status: status !== undefined ? status : user.status,
      email_verified: email_verified !== undefined ? email_verified : user.email_verified,
      phone: phone !== undefined ? phone : user.phone,
      address: address !== undefined ? address : user.address,
      dob: dob !== undefined ? dob : user.dob,
      gender: gender !== undefined ? gender : user.gender,
      email: email !== undefined ? email : user.email,
      approval_status: approval_status !== undefined ? approval_status : user.approval_status,
    };

    // Sử dụng findByIdAndUpdate với session nếu cần transaction, ở đây dùng đơn giản
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('role_id');

    if (!updatedUser) {
       return res.status(404).json({
         success: false,
         message: 'Không tìm thấy người dùng sau khi cập nhật'
       });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('Lỗi chi tiết khi cập nhật người dùng:', error);
    // Kiểm tra nếu là lỗi xác thực Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Lỗi xác thực dữ liệu',
        errors: messages
      });
    }
     if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Lỗi chuyển đổi kiểu dữ liệu cho trường ${error.path}: ${error.message}`,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ khi cập nhật người dùng',
      error: error.message
    });
  }
};

// Lấy danh sách giảng viên và hồ sơ chờ duyệt
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
        message: 'Vai trò giảng viên không tồn tại'
      });
    }

    // Xây dựng query cho giảng viên
    const instructorsQuery = {
      role_id: instructorRole._id
    };

    // Xây dựng query cho hồ sơ chờ duyệt
    const pendingQuery = {
      role_id: instructorRole._id,
      approvalStatus: 'pending'
    };

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      const searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
      instructorsQuery.$and = [instructorsQuery, searchQuery];
      pendingQuery.$and = [pendingQuery, searchQuery];
    }

    // Thực hiện query với phân trang
    const [instructors, pendingProfiles] = await Promise.all([
      User.find(instructorsQuery)
        .populate('role_id')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ created_at: -1 }),
      User.find(pendingQuery)
        .populate('role_id')
        .sort({ created_at: -1 })
    ]);

    // Đếm tổng số giảng viên và hồ sơ chờ duyệt
    const [totalInstructors, totalPending] = await Promise.all([
      User.countDocuments(instructorsQuery),
      User.countDocuments(pendingQuery)
    ]);

    res.status(200).json({
      success: true,
      data: {
        // Danh sách giảng viên đã được duyệt
        instructors: instructors.map(instructor => instructor.toJSON()),
        // Danh sách hồ sơ giảng viên chờ duyệt
        pendingProfiles: pendingProfiles.map(profile => profile.toJSON()),
        pagination: {
          // Phân trang chỉ áp dụng cho danh sách giảng viên đã được duyệt
          total: totalInstructors,
          page,
          limit,
          totalPages: Math.ceil(totalInstructors / limit)
        },
        // Số lượng hồ sơ chờ duyệt
        pendingCount: totalPending
      }
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách giảng viên',
      error: error.message
    });
  }
};

// Lấy chi tiết hồ sơ giảng viên
exports.getInstructorProfile = async (req, res) => {
  try {
    const instructorId = req.params.id;

    // Tìm giảng viên
    const instructor = await User.findById(instructorId)
      .populate('role_id')
      .populate({
        path: 'courses',
        select: 'title description image_url rating reviews_count',
        options: { limit: 5 }
      });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên'
      });
    }

    // Kiểm tra xem người dùng có phải là giảng viên không
    if (instructor.role_id.name !== ROLES.INSTRUCTOR) {
      return res.status(403).json({
        success: false,
        message: 'Người dùng không phải là giảng viên'
      });
    }

    // Tính tổng số khóa học và tổng số học viên
    const totalCourses = await Course.countDocuments({ instructor_id: instructorId });
    const totalStudents = await Course.countDocuments({
      instructor_id: instructorId,
      $or: [
        { students: { $exists: true, $not: { $size: 0 } } }
      ]
    });

    // Tính tổng số đánh giá và điểm trung bình từ khóa học
    const totalReviews = instructor.courses.reduce((total, course) => {
      return total + (course.reviews_count || 0);
    }, 0);

    const averageRating = instructor.courses.reduce((sum, course) => {
      return sum + (course.rating || 0);
    }, 0) / (instructor.courses.length || 1);

    // Format dữ liệu trả về
    const instructorData = {
      ...instructor.toJSON(),
      totalCourses,
      totalStudents,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1))
    };

    res.status(200).json({
      success: true,
      data: instructorData
    });
  } catch (error) {
    console.error('Error fetching instructor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết hồ sơ giảng viên',
      error: error.message
    });
  }
};

// Cập nhật hồ sơ giảng viên
exports.updateInstructorProfile = async (req, res) => {
  try {
    const instructorId = req.params.id;
    const { 
      name,
      email,
      phone,
      address,
      dob,
      gender,
      bio,
      expertise,
      social_links,
      avatar,
      cover_photo
    } = req.body;

    // Kiểm tra giảng viên tồn tại
    const instructor = await User.findById(instructorId).populate('role_id');
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên'
      });
    }

    // Kiểm tra xem người dùng có phải là giảng viên không
    if (instructor.role_id.name !== ROLES.INSTRUCTOR) {
      return res.status(403).json({
        success: false,
        message: 'Người dùng không phải là giảng viên'
      });
    }

    // Kiểm tra email duy nhất (nếu email được cập nhật)
    if (email !== undefined && email !== instructor.email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== instructorId) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng bởi người dùng khác'
        });
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      name: name !== undefined ? name : instructor.name,
      email: email !== undefined ? email : instructor.email,
      phone: phone !== undefined ? phone : instructor.phone,
      address: address !== undefined ? address : instructor.address,
      dob: dob !== undefined ? dob : instructor.dob,
      gender: gender !== undefined ? gender : instructor.gender,
      bio: bio !== undefined ? bio : instructor.bio,
      expertise: expertise !== undefined ? expertise : instructor.expertise,
      social_links: social_links !== undefined ? social_links : instructor.social_links,
      avatar: avatar !== undefined ? avatar : instructor.avatar,
      cover_photo: cover_photo !== undefined ? cover_photo : instructor.cover_photo,
      updated_at: new Date()
    };

    // Cập nhật giảng viên
    const updatedInstructor = await User.findByIdAndUpdate(
      instructorId,
      updateData,
      { new: true, runValidators: true }
    ).populate('role_id');

    if (!updatedInstructor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên sau khi cập nhật'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ giảng viên thành công',
      data: updatedInstructor.toJSON()
    });
  } catch (error) {
    console.error('Error updating instructor profile:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Lỗi xác thực dữ liệu',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật hồ sơ giảng viên',
      error: error.message
    });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Xóa user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Lỗi xóa người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa người dùng',
      error: error.message
    });
  }
}; 