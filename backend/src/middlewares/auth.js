const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// Middleware xác thực người dùng
exports.auth = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Không tìm thấy token xác thực');
    }

    const token = authHeader.split(' ')[1];

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Tìm user trong database
    const user = await User.findById(decoded.id).populate({
      path: 'role_id',
      select: 'name',
      model: 'Role'
    });
    
    console.log('Found user:', JSON.stringify(user, null, 2));
    
    if (!user) {
      throw new ApiError(401, 'Không tìm thấy người dùng');
    }

    if (!user.role_id) {
      console.log('User has no role_id');
      throw new ApiError(403, 'Người dùng không có quyền truy cập');
    }

    // Gán user vào request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Token không hợp lệ'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token đã hết hạn'));
    } else {
      next(error);
    }
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
    try {
      // Lấy thông tin role từ user (đã được populate trong auth middleware)
      const userRole = req.user.role_id;

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
exports.requireAuth = (roles = []) => {
  return (req, res, next) => {
    try {
      console.log('Checking permissions...');
      console.log('User:', JSON.stringify(req.user, null, 2));
      console.log('User role:', JSON.stringify(req.user?.role_id, null, 2));
      console.log('Required roles:', roles);

      if (!req.user) {
        throw new ApiError(401, 'Vui lòng đăng nhập');
      }

      if (!req.user.role_id) {
        console.log('User has no role_id');
        throw new ApiError(403, 'Người dùng không có quyền truy cập');
      }

      if (roles.length > 0 && !roles.includes(req.user.role_id.name)) {
        console.log('User role name:', req.user.role_id.name);
        console.log('Is role included:', roles.includes(req.user.role_id.name));
        throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      next(error);
    }
  };
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