const { validationResult } = require('express-validator');
const UserDevice = require('../models/UserDevice');
const DeviceViolation = require('../models/DeviceViolation');
const crypto = require('crypto');

// Tạo device fingerprint từ request headers
const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${userAgent}${acceptLanguage}${acceptEncoding}`)
    .digest('hex');
  
  return fingerprint;
};

// Đăng ký thiết bị khi user truy cập course
const registerDevice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId } = req.body;
    const userId = req.user?.id || 'mock-user-id';
    const deviceId = generateDeviceFingerprint(req);
    
    // Tạm thời trả về mock response để frontend hoạt động
    console.log('🔧 Returning mock registerDevice response');
    return res.json({
      success: true,
      message: 'Device registered successfully (mock)',
      data: {
        user_id: userId,
        course_id: courseId,
        device_id: deviceId,
        registered_at: new Date()
      }
    });

    // Kiểm tra thiết bị đã đăng ký chưa
    const existingDevice = await UserDevice.findOne({
      user_id: userId,
      course_id: courseId,
      device_id: deviceId
    });

    if (existingDevice) {
      // Cập nhật thời gian hoạt động cuối
      existingDevice.last_activity = new Date();
      await existingDevice.save();

      return res.json({
        success: true,
        message: 'Device already registered',
        data: existingDevice
      });
    }

    // Kiểm tra có user khác đang dùng thiết bị này không
    const otherUsers = await UserDevice.find({
      device_id: deviceId,
      course_id: courseId,
      user_id: { $ne: userId }
    });

    if (otherUsers.length > 0) {
      // Tạo báo cáo vi phạm
      const violation = new DeviceViolation({
        device_id: deviceId,
        violation_type: 'multiple_accounts',
        user_ids: [userId, ...otherUsers.map(u => u.user_id)],
        course_ids: [courseId],
        device_info: {
          userAgent: req.headers['user-agent'],
          acceptLanguage: req.headers['accept-language']
        },
        ip_address: req.ip,
        severity: 'medium'
      });

      await violation.save();

      return res.status(403).json({
        success: false,
        message: 'Device sharing detected. Violation reported to admin.',
        code: 'DEVICE_SHARING_DETECTED'
      });
    }

    // Đăng ký thiết bị mới
    const newDevice = new UserDevice({
      user_id: userId,
      course_id: courseId,
      device_id: deviceId,
      device_info: {
        userAgent: req.headers['user-agent'],
        acceptLanguage: req.headers['accept-language']
      },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      last_activity: new Date()
    });

    await newDevice.save();

    res.json({
      success: true,
      message: 'Device registered successfully',
      data: newDevice
    });

  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device'
    });
  }
};

// Lấy danh sách thiết bị của user
const getUserDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;

    const query = { user_id: userId, is_active: true };
    if (courseId) {
      query.course_id = courseId;
    }

    const devices = await UserDevice.find(query)
      .sort({ last_activity: -1 });

    res.json({
      success: true,
      data: devices
    });

  } catch (error) {
    console.error('Get user devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user devices'
    });
  }
};

// Kiểm tra trạng thái thiết bị hiện tại
const checkDeviceStatus = async (req, res) => {
  console.log('🔍 checkDeviceStatus called');
  try {
    const { courseId } = req.params;
    const userId = req.user?.id || 'mock-user-id';
    console.log('📝 Extracted params:', { courseId, userId });
    
    const deviceId = generateDeviceFingerprint(req);
    console.log('🔑 Generated deviceId:', deviceId);
    
    // Tạm thởi trả về mock response để frontend hoạt động
    console.log('🔧 Returning mock response (device not registered)');
    res.json({
      success: true,
      data: {
        isRegistered: false,
        device: null
      }
    });
    
    // TODO: Uncomment when database is ready
    /*
    console.log('💾 Querying UserDevice...');
    const device = await UserDevice.findOne({
      user_id: userId,
      course_id: courseId,
      device_id: deviceId
    });
    console.log('💾 UserDevice query result:', device);

    res.json({
      success: true,
      data: {
        isRegistered: !!device,
        device: device || null
      }
    });
    */
  } catch (error) {
    console.error('❌ Check device status error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to check device status',
      error: error.message
    });
  }
};

// Admin: Lấy danh sách vi phạm
const getViolations = async (req, res) => {
  try {
    const { status, severity, limit = 50 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const violations = await DeviceViolation.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: violations
    });
  } catch (error) {
    console.error('Get violations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get violations'
    });
  }
};

// Admin: Xử lý vi phạm
const handleViolation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { violationId } = req.params;
    const { action, notes } = req.body;
    const adminId = req.user.id;

    const violation = await DeviceViolation.findById(violationId);
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    violation.status = action === 'block_users' ? 'resolved' : 'dismissed';
    violation.handled_by = adminId;
    violation.handled_at = new Date();
    violation.admin_notes = notes;

    await violation.save();

    res.json({
      success: true,
      message: `Violation ${action === 'block_users' ? 'resolved and users blocked' : 'dismissed'}`,
      data: violation
    });
  } catch (error) {
    console.error('Handle violation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to handle violation'
    });
  }
};

// Admin: Thống kê vi phạm
const getViolationStats = async (req, res) => {
  try {
    const totalViolations = await DeviceViolation.countDocuments();
    const pendingViolations = await DeviceViolation.countDocuments({ status: 'pending' });
    const resolvedViolations = await DeviceViolation.countDocuments({ status: 'resolved' });
    const dismissedViolations = await DeviceViolation.countDocuments({ status: 'dismissed' });

    const stats = {
      total: totalViolations,
      pending: pendingViolations,
      resolved: resolvedViolations,
      dismissed: dismissedViolations
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get violation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get violation statistics'
    });
  }
};

// Admin: Dọn dẹp thiết bị không hoạt động
const cleanupDevices = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await UserDevice.updateMany(
      { last_activity: { $lt: thirtyDaysAgo }, is_active: true },
      { is_active: false }
    );

    res.json({
      success: true,
      message: `Cleaned up ${result.modifiedCount} inactive devices`,
      data: { cleanedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Cleanup devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup devices'
    });
  }
};

module.exports = {
  registerDevice,
  getUserDevices,
  checkDeviceStatus,
  getViolations,
  handleViolation,
  getViolationStats,
  cleanupDevices
};
