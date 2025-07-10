const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực người dùng
exports.auth = async (req, res, next) => {
  try {
    if (req.path === '/logout') {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded._id || decoded.sub).populate('role_id');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    let roles = user.roles || [];
    if (user.isInstructor) {
      roles.push('instructor');
    }
    if (user.role_id && user.role_id.name) {
      roles.push(user.role_id.name);
    }
    if (roles.length === 0) {
      roles = ['guest'];
    }

    // Không ghi đè role_id! Giữ nguyên object chứa permissions
    req.user = {
      ...user.toObject(),
      _id: user._id,
      roles: [...new Set(roles)],
      id: user._id.toString(),
      userRoleName: roles.includes('admin') ? 'admin'
                    : roles.includes('instructor') ? 'instructor'
                    : roles.includes('student') ? 'student' : 'guest',
      role_id: user.role_id,
    };

    console.log('✅ Authenticated user:', {
      id: req.user.id,
      roles: req.user.roles,
      userRoleName: req.user.userRoleName,
      role_id: req.user.role_id,
    });

    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token đã hết hạn' });
    } else {
      return res.status(500).json({ success: false, message: 'Lỗi xác thực', error: error.message });
    }
  }
};

// Middleware kiểm tra quyền
exports.checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role_id;

      // Nếu là guest (hoặc role không tồn tại), chỉ cho phép một số quyền
      if (req.user.userRoleName === 'guest') {
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

      if (!userRole || !Array.isArray(userRole.permissions)) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền thực hiện chức năng này (permissions không tồn tại)',
        });
      }

      if (!userRole.permissions.includes(requiredPermission)) {
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
exports.checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userRoles = req.user.roles || [];

      if (!userRoles.some(role => requiredRoles.includes(role))) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập',
          debug: {
            userRoles,
            requiredRoles,
          },
        });
      }

      next();
    } catch (error) {
      console.error('Lỗi kiểm tra role:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra role',
        error: error.message,
      });
    }
  };
};

// Middleware yêu cầu đăng nhập
exports.requireAuth = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }

      if (roles.length > 0) {
        const userRoles = req.user.roles || ['guest'];
        const hasRequiredRole = roles.some(role => userRoles.includes(role));
        if (!hasRequiredRole) {
          return res.status(403).json({
            success: false,
            message: 'Không có quyền thực hiện chức năng này',
          });
        }
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền',
        error: error.message,
      });
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
