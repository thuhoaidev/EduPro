const deviceSecurityService = require('../services/deviceSecurityService');
const UserDevice = require('../models/UserDevice');

// Middleware kiểm tra thiết bị khi truy cập course
const checkDeviceAccess = async (req, res, next) => {
  try {
    // Chỉ áp dụng cho các route course cần bảo mật
    const courseId = req.params.courseId || req.body.courseId;
    
    if (!courseId || !req.user) {
      return next();
    }

    const userId = req.user.id;
    const deviceId = deviceSecurityService.generateDeviceFingerprint(req);

    // Kiểm tra xem thiết bị đã được đăng ký chưa
    const existingDevice = await UserDevice.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
        device_id: deviceId,
        is_active: true
      }
    });

    if (!existingDevice) {
      // Thiết bị chưa được đăng ký - yêu cầu đăng ký
      return res.status(403).json({
        success: false,
        message: 'Device not registered for this course',
        code: 'DEVICE_NOT_REGISTERED',
        requireRegistration: true
      });
    }

    // Cập nhật last_activity
    await existingDevice.update({
      last_activity: new Date()
    });

    // Thêm thông tin device vào request
    req.deviceInfo = {
      deviceId,
      registeredAt: existingDevice.registered_at
    };

    next();
  } catch (error) {
    console.error('Device security middleware error:', error);
    
    // Trong trường hợp lỗi, vẫn cho phép truy cập nhưng log lỗi
    next();
  }
};

// Middleware kiểm tra user có bị khóa không
const checkUserBlocked = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    if (req.user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked due to security violations',
        code: 'ACCOUNT_BLOCKED'
      });
    }

    next();
  } catch (error) {
    console.error('Check user blocked middleware error:', error);
    next();
  }
};

// Middleware log hoạt động thiết bị
const logDeviceActivity = (req, res, next) => {
  try {
    if (req.user && req.deviceInfo) {
      console.log(`Device activity: User ${req.user.id} on device ${req.deviceInfo.deviceId} - ${req.method} ${req.path}`);
    }
    next();
  } catch (error) {
    console.error('Log device activity error:', error);
    next();
  }
};

module.exports = {
  checkDeviceAccess,
  checkUserBlocked,
  logDeviceActivity
};
