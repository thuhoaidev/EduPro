const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực người dùng
exports.auth = async (req, res, next) => {
  try {
    // Kiểm tra nếu là route logout thì không cần xác thực token
    if (req.path === '/logout') {
      next();
      return;
    }

    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực',
      });
    }

    const token = authHeader.split(' ')[1];

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Tìm user trong database
    const user = await User.findById(decoded.id).populate('role_id');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Gán role cho user
    req.user = {
      ...user.toObject(),
      role: user.role_id && user.role_id.name ? user.role_id.name : 'guest',
      role_id: user.role_id,
      roles: [user.role_id && user.role_id.name ? user.role_id.name : 'guest'],
    };

    // Log thông tin user để debug
    console.log('Authenticated user:', {
      id: user._id,
      role: req.user.role,
      role_id: req.user.role_id,
      roles: req.user.roles,
    });

    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ',
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Lỗi xác thực',
        error: error.message,
      });
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
exports.checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const userRoles = user.roles || [];

      // Debug log
      console.log('Checking role:', {
        userRoles: userRoles,
        requiredRoles: requiredRoles,
        hasRole: userRoles.some(role => requiredRoles.includes(role)),
      });

      // Kiểm tra role
      if (!userRoles.some(role => requiredRoles.includes(role))) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập',
          debug: {
            userRoles: userRoles,
            requiredRoles: requiredRoles,
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

      // Kiểm tra xem user có quyền truy cập không
      if (roles.length > 0) {
        const userRoles = req.user.roles || ['guest']; // Sử dụng 'guest' nếu không có roles
        const hasRequiredRole = roles.some(role => userRoles.includes(role));
        if (!hasRequiredRole) {
          // Log thông tin chi tiết về roles
          console.log('User has role_id:', req.user.role_id);
          console.log('User has roles:', userRoles);
          console.log('Required roles:', roles);
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