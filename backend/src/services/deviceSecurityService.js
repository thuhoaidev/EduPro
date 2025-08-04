const UserDevice = require('../models/UserDevice');
const DeviceViolation = require('../models/DeviceViolation');
const User = require('../models/User');
const Course = require('../models/Course');
const crypto = require('crypto');

class DeviceSecurityService {
  // Tạo device fingerprint từ thông tin request
  generateDeviceFingerprint(req) {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    // Tạo fingerprint từ các thông tin có sẵn
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${userAgent}${acceptLanguage}${acceptEncoding}`)
      .digest('hex');
    
    return fingerprint;
  }

  // Đăng ký thiết bị cho user và course
  async registerDevice(userId, courseId, req) {
    try {
      const deviceId = this.generateDeviceFingerprint(req);
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        acceptLanguage: req.headers['accept-language'],
        acceptEncoding: req.headers['accept-encoding']
      };

      // Kiểm tra xem thiết bị đã được đăng ký chưa
      const existingDevice = await UserDevice.findOne({
        user_id: userId,
        course_id: courseId,
        device_id: deviceId
      });

      if (existingDevice) {
        // Cập nhật last_activity
        existingDevice.last_activity = new Date();
        existingDevice.is_active = true;
        await existingDevice.save();
        return existingDevice;
      }

      // Kiểm tra vi phạm trước khi đăng ký
      await this.checkForViolations(deviceId, userId, courseId, req);

      // Tạo device mới
      const newDevice = new UserDevice({
        user_id: userId,
        course_id: courseId,
        device_id: deviceId,
        device_info: deviceInfo,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        last_activity: new Date()
      });

      await newDevice.save();
      return newDevice;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  // Kiểm tra vi phạm (nhiều tài khoản trên cùng thiết bị)
  async checkForViolations(deviceId, userId, courseId, req) {
    try {
      // Tìm tất cả user khác đang sử dụng cùng device cho cùng course
      const existingUsers = await UserDevice.find({
        device_id: deviceId,
        course_id: courseId,
        user_id: { $ne: userId },
        is_active: true
      }).populate('user_id', 'username email fullname');

      if (existingUsers.length > 0) {
        // Có vi phạm - tạo báo cáo
        const userIds = [userId, ...existingUsers.map(d => d.user_id)];
        
        // Kiểm tra xem đã có báo cáo cho device này chưa
        const existingViolation = await DeviceViolation.findOne({
          device_id: deviceId,
          status: 'pending'
        });

        if (!existingViolation) {
          await DeviceViolation.create({
            device_id: deviceId,
            violation_type: 'multiple_accounts',
            user_ids: userIds,
            course_ids: [courseId],
            device_info: {
              userAgent: req.headers['user-agent'],
              ip: req.ip
            },
            ip_address: req.ip,
            severity: userIds.length > 3 ? 'high' : 'medium'
          });

          console.log(`🚨 Device violation detected: ${userIds.length} accounts on device ${deviceId}`);
        } else {
          // Cập nhật báo cáo hiện có
          const updatedUserIds = [...new Set([...existingViolation.user_ids, userId])];
          const updatedCourseIds = [...new Set([...existingViolation.course_ids, courseId])];
          
          existingViolation.user_ids = updatedUserIds;
          existingViolation.course_ids = updatedCourseIds;
          existingViolation.severity = updatedUserIds.length > 3 ? 'high' : 'medium';
          await existingViolation.save();
        }

        throw new Error(`Device sharing detected. This device is already registered for ${existingUsers.length} other account(s) in this course.`);
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách thiết bị của user
  async getUserDevices(userId) {
    try {
      const devices = await UserDevice.find({ user_id: userId })
        .populate('course_id', 'title')
        .sort({ registered_at: -1 });

      return devices;
    } catch (error) {
      console.error('Error getting user devices:', error);
      throw error;
    }
  }

  // Lấy danh sách vi phạm cho admin
  async getViolations(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.severity) {
        query.severity = filters.severity;
      }

      const violations = await DeviceViolation.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 50);

      return violations;
    } catch (error) {
      console.error('Error getting violations:', error);
      throw error;
    }
  }

  // Admin xử lý vi phạm
  async handleViolation(violationId, adminId, action, notes = '') {
    try {
      const violation = await DeviceViolation.findById(violationId);
      
      if (!violation) {
        throw new Error('Violation not found');
      }

      // Cập nhật trạng thái vi phạm
      violation.status = action === 'block_users' ? 'resolved' : 'dismissed';
      violation.admin_notes = notes;
      violation.reviewed_by = adminId;
      violation.reviewed_at = new Date();
      await violation.save();

      // Nếu admin quyết định khóa tài khoản
      if (action === 'block_users') {
        await User.updateMany(
          { _id: { $in: violation.user_ids } },
          { status: 'blocked' }
        );

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
      const stats = await DeviceViolation.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      const result = {
        total: 0,
        pending: 0,
        reviewed: 0,
        resolved: 0,
        dismissed: 0
      };

      stats.forEach(stat => {
        result[stat.status] = parseInt(stat.dataValues.count);
        result.total += parseInt(stat.dataValues.count);
      });

      return result;
    } catch (error) {
      console.error('Error getting violation stats:', error);
      throw error;
    }
  }

  // Dọn dẹp thiết bị không hoạt động
  async cleanupInactiveDevices() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await UserDevice.update(
        { is_active: false },
        {
          where: {
            last_activity: { [Op.lt]: thirtyDaysAgo },
            is_active: true
          }
        }
      );

      console.log(`Cleaned up ${result[0]} inactive devices`);
      return result[0];
    } catch (error) {
      console.error('Error cleaning up devices:', error);
      throw error;
    }
  }
}

module.exports = new DeviceSecurityService();
