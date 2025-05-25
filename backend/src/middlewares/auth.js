const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực người dùng
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Kiểm tra token trong header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để truy cập',
      });
    }

    try {
      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm user theo id từ token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy người dùng',
        });
      }

      // Kiểm tra trạng thái tài khoản
      if (user.status === 'banned') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản đã bị khóa',
        });
      }

      // Gán user vào request để sử dụng ở các middleware tiếp theo
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực',
    });
  }
};

// Middleware kiểm tra quyền dựa trên vai trò
exports.checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Lấy thông tin user từ request (được set bởi middleware protect)
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Không có quyền truy cập',
        });
      }

      // Populate thông tin role của user
      await user.populate('role');
      // Kiểm tra xem role của user có trong danh sách được phép không
      if (!allowedRoles.includes(user.role.name)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thực hiện hành động này',
        });
      }

      next();
    } catch (error) {
      console.error('Lỗi kiểm tra quyền:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi kiểm tra quyền',
      });
    }
  };
};

// Middleware kiểm tra quyền dựa trên permission
exports.checkPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Không có quyền truy cập',
        });
      }

      // Populate thông tin role và permissions của user
      await user.populate('role');
      // Kiểm tra xem user có tất cả các quyền cần thiết không
      const hasAllPermissions = requiredPermissions.every(permission => 
        user.role.permissions.includes(permission),
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có đủ quyền để thực hiện hành động này',
        });
      }

      next();
    } catch (error) {
      console.error('Lỗi kiểm tra quyền:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi kiểm tra quyền',
      });
    }
  };
};

// Middleware yêu cầu xác thực email
exports.requireVerifiedEmail = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Vui lòng xác thực email trước khi thực hiện hành động này',
      });
    }

    next();
  } catch (error) {
    console.error('Lỗi kiểm tra xác thực email:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra xác thực email',
    });
  }
}; 