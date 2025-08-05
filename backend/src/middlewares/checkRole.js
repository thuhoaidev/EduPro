// Middleware kiểm tra quyền dựa trên vai trò
const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Kiểm tra xem user có tồn tại không
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Bạn chưa đăng nhập.',
        });
      }

      // Lấy thông tin role từ user đã được authenticate
      const userRoles = req.user.roles || [];
      const userRoleName = req.user.userRoleName;
      const roleId = req.user.role_id;

      // Kiểm tra xem có role nào trong danh sách được phép không
      let hasPermission = false;

      // Kiểm tra trong roles array
      for (const role of userRoles) {
        if (allowedRoles.includes(role)) {
          hasPermission = true;
          break;
        }
      }

      // Kiểm tra userRoleName
      if (!hasPermission && allowedRoles.includes(userRoleName)) {
        hasPermission = true;
      }

      // Kiểm tra role_id.name
      if (!hasPermission && roleId && roleId.name && allowedRoles.includes(roleId.name)) {
        hasPermission = true;
      }

      if (!hasPermission) {
        console.log('❌ Permission denied:', {
          userRoles,
          userRoleName,
          roleIdName: roleId?.name,
          allowedRoles,
          userId: req.user.id
        });
        
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thực hiện hành động này.',
        });
      }

      // Lưu thông tin role vào request để sử dụng ở các middleware tiếp theo
      req.userRole = roleId;
      next();
    } catch (error) {
      console.error('Lỗi kiểm tra quyền:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi kiểm tra quyền.',
      });
    }
  };
};

module.exports = checkRole; 