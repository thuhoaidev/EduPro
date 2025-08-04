const crypto = require('crypto');
const UserDevice = require('../models/UserDevice');
const DeviceViolation = require('../models/DeviceViolation');

class DeviceSecurityService {
  // Tạo device fingerprint từ request headers
  generateDeviceFingerprint(req) {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const xForwardedFor = req.headers['x-forwarded-for'] || '';
    const xRealIp = req.headers['x-real-ip'] || '';
    const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress || '';
    const accept = req.headers['accept'] || '';
    const dnt = req.headers['dnt'] || '';
    
    // Tạo fingerprint từ nhiều thông tin hơn để tăng độ chính xác
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${userAgent}${acceptLanguage}${acceptEncoding}${xForwardedFor}${xRealIp}${remoteAddress}${accept}${dnt}`)
      .digest('hex');
    
    console.log('🔍 Device Fingerprint Debug:', {
      userAgent: userAgent.substring(0, 50) + '...',
      acceptLanguage,
      remoteAddress,
      fingerprint: fingerprint.substring(0, 16) + '...'
    });
    
    return fingerprint;
  }

  // Đăng ký thiết bị cho user và course
  async registerDevice(userId, courseId, req) {
    try {
      const deviceId = this.generateDeviceFingerprint(req);
      
      console.log('🔧 Registering device:', {
        userId,
        courseId,
        deviceId: deviceId.substring(0, 16) + '...'
      });

      // Kiểm tra xem thiết bị đã được đăng ký chưa
      const existingDevice = await UserDevice.findOne({
        user_id: userId,
        course_id: courseId,
        device_id: deviceId
      });

      if (existingDevice) {
        console.log('✅ Device already registered, updating activity');
        existingDevice.last_activity = new Date();
        await existingDevice.save();
        return existingDevice;
      }

      // Kiểm tra vi phạm (nhiều user trên cùng thiết bị)
      const otherUsers = await UserDevice.find({
        device_id: deviceId,
        course_id: courseId,
        user_id: { $ne: userId },
        is_active: true
      });

      if (otherUsers.length > 0) {
        console.log('🚨 Device violation detected:', otherUsers.length, 'other users');
        
        // Tạo báo cáo vi phạm
        const violation = new DeviceViolation({
          device_id: deviceId,
          violation_type: 'multiple_accounts',
          user_ids: [userId, ...otherUsers.map(u => u.user_id)],
          course_id: courseId,
          device_info: {
            userAgent: req.headers['user-agent'],
            acceptLanguage: req.headers['accept-language']
          },
          ip_address: req.ip,
          severity: 'medium',
          status: 'pending'
        });

        await violation.save();
        
        throw new Error('Device sharing detected. Violation reported to admin.');
      }

      // Tạo thiết bị mới
      const newDevice = new UserDevice({
        user_id: userId,
        course_id: courseId,
        device_id: deviceId,
        device_info: {
          userAgent: req.headers['user-agent'],
          acceptLanguage: req.headers['accept-language'],
          acceptEncoding: req.headers['accept-encoding']
        },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        last_activity: new Date()
      });

      await newDevice.save();
      console.log('✅ Device registered successfully');
      
      return newDevice;
    } catch (error) {
      console.error('❌ Error registering device:', error);
      throw error;
    }
  }

  // Lấy danh sách thiết bị của user
  async getUserDevices(userId, courseId = null) {
    try {
      const query = { user_id: userId, is_active: true };
      if (courseId) {
        query.course_id = courseId;
      }

      const devices = await UserDevice.find(query).sort({ last_activity: -1 });
      return devices;
    } catch (error) {
      console.error('Error getting user devices:', error);
      throw error;
    }
  }

  // Lấy danh sách vi phạm (Admin)
  async getViolations(filters = {}) {
    try {
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.severity) query.severity = filters.severity;

      const violations = await DeviceViolation.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 50);

      return violations;
    } catch (error) {
      console.error('Error getting violations:', error);
      throw error;
    }
  }

  // Xử lý vi phạm (Admin)
  async handleViolation(violationId, adminId, action, notes = '') {
    try {
      const violation = await DeviceViolation.findById(violationId);
      if (!violation) {
        throw new Error('Violation not found');
      }

      violation.status = action === 'block_users' ? 'resolved' : 'dismissed';
      violation.admin_notes = notes;
      violation.handled_by = adminId;
      violation.handled_at = new Date();

      await violation.save();

      // Nếu admin quyết định khóa tài khoản
      if (action === 'block_users') {
        // Vô hiệu hóa tất cả thiết bị của các user bị khóa
        await UserDevice.updateMany(
          { user_id: { $in: violation.user_ids } },
          { is_active: false }
        );
      }

      return violation;
    } catch (error) {
      console.error('Error handling violation:', error);
      throw error;
    }
  }

  // Thống kê vi phạm
  async getViolationStats() {
    try {
      const total = await DeviceViolation.countDocuments();
      const pending = await DeviceViolation.countDocuments({ status: 'pending' });
      const resolved = await DeviceViolation.countDocuments({ status: 'resolved' });
      const dismissed = await DeviceViolation.countDocuments({ status: 'dismissed' });

      return {
        total,
        pending,
        resolved,
        dismissed
      };
    } catch (error) {
      console.error('Error getting violation stats:', error);
      throw error;
    }
  }

  // Dọn dẹp thiết bị cũ
  async cleanupInactiveDevices() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await UserDevice.updateMany(
        { last_activity: { $lt: thirtyDaysAgo }, is_active: true },
        { is_active: false }
      );

      console.log(`🧹 Cleaned up ${result.modifiedCount} inactive devices`);
      return result.modifiedCount;
    } catch (error) {
      console.error('Error cleaning up devices:', error);
      throw error;
    }
  }
}

module.exports = new DeviceSecurityService();
