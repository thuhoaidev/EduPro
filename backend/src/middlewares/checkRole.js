const Role = require('../models/Role');

// Middleware kiểm tra quyền dựa trên vai trò
const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Lấy thông tin role từ user đã được authenticate
      const userRole = await Role.findById(req.user.role);
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Không tìm thấy vai trò của người dùng'
        });
      }

      // Kiểm tra xem role của user có trong danh sách được phép không
      if (!allowedRoles.includes(userRole.name)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thực hiện hành động này'
        });
      }

      // Lưu thông tin role vào request để sử dụng ở các middleware tiếp theo
      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Lỗi kiểm tra quyền:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi kiểm tra quyền'
      });
    }
  };
};

module.exports = checkRole; 