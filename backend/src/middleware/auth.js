const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// Middleware bảo vệ route yêu cầu xác thực
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Kiểm tra token trong header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Vui lòng đăng nhập để truy cập');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kiểm tra user tồn tại
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new ApiError(401, 'Người dùng không tồn tại');
      }

      // Gán user vào request
      req.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, 'Token không hợp lệ');
    }
  } catch (error) {
    next(error);
  }
};

// Middleware phân quyền
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Bạn không có quyền thực hiện hành động này'));
    }
    next();
  };
}; 