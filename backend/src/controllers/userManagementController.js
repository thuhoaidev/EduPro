const User = require('../models/User');
const { Role } = require('../models/Role');

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