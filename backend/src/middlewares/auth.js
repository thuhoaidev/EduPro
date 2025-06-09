const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Middleware xác thực token
exports.auth = async (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      // Nếu không có token, gán role guest
      const guestRole = await Role.findOne({ name: 'guest' });
      if (!guestRole) {
        return res.status(500).json({
          success: false,
          message: 'Không tìm thấy role guest',
        });
      }
      // Gán guest role cho user và lưu trữ ID của role
      req.user = { role_id: guestRole._id, role: guestRole };
      return next();
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Populate role_id để lấy thông tin vai trò đầy đủ
    const user = await User.findById(decoded.id).populate('role_id');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ',
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập',
    });
  }
};

// Middleware kiểm tra quyền
exports.checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Lấy thông tin role từ user (đã được populate trong auth middleware)
      const userRole = req.user.role_id;
      // Nếu là guest, chỉ cho phép các quyền cơ bản
      if (userRole && userRole.name === 'guest') {
        const guestPermissions = [
          'view_courses',
          'view_course_details',
          'view_instructor_profiles',
          'view_course_preview',
          'search_courses',
          'filter_courses',
        ];

        if (!guestPermissions.includes(requiredPermission)) {
          return res.status(403).json({
            success: false,
            message: 'Vui lòng đăng nhập để thực hiện chức năng này',
          });
        }
      }

      // Kiểm tra quyền của role
      if (!userRole || !userRole.permissions || !userRole.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền thực hiện chức năng này',
        });
      }

      next();
    } catch (error) {
      console.error('Lỗi kiểm tra quyền:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền',
      });
    }
  };
};

// Middleware kiểm tra role
exports.checkRole = (roles) => {
  return async (req, res, next) => {
    //  console.log('✅ [checkRole] middleware activated');
    try {
      // Lấy thông tin role từ user (đã được populate trong auth middleware)
      const userRole = req.user.role_id;
// console.log('User role:', req.user.role_id?.name);
// console.log('Required roles:', roles);
      // Nếu là guest, chỉ cho phép truy cập các route công khai
      if (userRole && userRole.name === 'guest' && !roles.includes('guest')) {
        return res.status(403).json({
          success: false,
          message: 'Vui lòng đăng nhập để thực hiện chức năng này',
        });
      }

      if (!userRole || !roles.includes(userRole.name)) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập',
        });
      }

      next();
    } catch (error) {
      console.error('Lỗi kiểm tra role:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra role',
      });
    }
  };
};

// Middleware yêu cầu đăng nhập
exports.requireAuth = async (req, res, next) => {
  try {
    // Kiểm tra nếu user tồn tại và không phải guest
    if (!req.user || (req.user.role_id && req.user.role_id.name === 'guest')) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện chức năng này',
      });
    }
    next();
  } catch (error) {
    console.error('Lỗi yêu cầu đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
    });
  }
};

// Middleware kiểm tra email đã xác thực
exports.requireVerifiedEmail = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để truy cập',
      });
    }

    if (!req.user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Vui lòng xác thực email để tiếp tục',
      });
    }

    next();
  } catch (error) {
    console.error('Lỗi kiểm tra email:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra email',
      error: error.message,
    });
  }
}; 