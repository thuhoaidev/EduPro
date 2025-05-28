const jwt = require('jsonwebtoken');
const User = require('../models/user/User');
const { ROLES } = require('../constants/roles');

// Middleware xác thực người dùng
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      req.user = { role: ROLES.GUEST };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token đã hết hạn' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Middleware kiểm tra quyền role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }
    next();
  };
};

// Middleware yêu cầu đăng nhập
const requireAuth = (req, res, next) => {
  if (!req.user || req.user.role === ROLES.GUEST) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
  }
  next();
};

// Middleware riêng cho admin và instructor
const isAdmin = checkRole(ROLES.ADMIN);
const isInstructor = checkRole(ROLES.INSTRUCTOR);

module.exports = {
  auth,
  requireAuth,
  checkRole,
  isAdmin,
  isInstructor,
};
