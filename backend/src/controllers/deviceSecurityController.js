const { validationResult } = require('express-validator');
const UserDevice = require('../models/UserDevice');
const DeviceViolation = require('../models/DeviceViolation');
const deviceSecurityService = require('../services/deviceSecurityService');

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
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('🔧 Registering device via service...');
    const result = await deviceSecurityService.registerDevice(userId, courseId, req);

    res.json({
      success: true,
      message: 'Device registered successfully',
      data: result
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
    
    console.log('📱 Getting user devices:', { userId, courseId });
    
    const devices = await deviceSecurityService.getUserDevices(userId, courseId);
    
    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('❌ Get user devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user devices',
      error: error.message
    });
  }
};

// Kiểm tra trạng thái thiết bị hiện tại
const checkDeviceStatus = async (req, res) => {
  console.log('🔍 checkDeviceStatus called');
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('📝 Checking device status:', { courseId, userId });

    const deviceId = deviceSecurityService.generateDeviceFingerprint(req);
    console.log('🔑 Generated deviceId:', deviceId.substring(0, 16) + '...');

    const device = await UserDevice.findOne({
      user_id: userId,
      course_id: courseId,
      device_id: deviceId,
      is_active: true
    });

    console.log('💾 Device found:', !!device);

    res.json({
      success: true,
      data: {
        isRegistered: !!device,
        device: device || null
      }
    });
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
    violation.reviewed_by = adminId;
    violation.reviewed_at = new Date();
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
