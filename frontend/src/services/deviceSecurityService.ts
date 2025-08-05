import { config } from '../api/axios';

export interface DeviceInfo {
  user_id: number;
  course_id: number;
  device_id: string;
  device_info: any;
  ip_address: string;
  registered_at: string;
  last_activity: string;
  is_active: boolean;
}

export interface DeviceViolation {
  _id: string;
  device_id: string;
  violation_type: 'multiple_accounts' | 'suspicious_activity' | 'account_sharing';
  user_ids: string[];
  course_ids: string[];
  device_info: any;
  ip_address: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViolationStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  dismissed: number;
}

class DeviceSecurityService {
  // Đăng ký thiết bị cho course
  async registerDevice(courseId: number) {
    console.log('🚀 DeviceSecurityService.registerDevice called with courseId:', courseId);
    try {
      console.log('📞 Making POST request to /device-security/register');
      const response = await config.post('/device-security/register', {
        courseId
      });
      console.log('✅ Register device response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Register device error:', error);
      if (error.response?.data?.code === 'DEVICE_SHARING_DETECTED') {
        console.log('⚠️ Device sharing detected!');
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
  
  // Kiểm tra trạng thái thiết bị
  async checkDeviceStatus(courseId: number) {
    console.log('🚀 DeviceSecurityService.checkDeviceStatus called with courseId:', courseId);
    try {
      console.log('📞 Making GET request to /device-security/check-status/' + courseId);
      const response = await config.get(`/device-security/check-status/${courseId}`);
      console.log('✅ Check device status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Check device status error:', error);
      console.error('Check device status error:', error);
      throw error;
    }
  }

  // Lấy danh sách thiết bị của user
  async getUserDevices() {
    try {
      const response = await config.get('/device-security/my-devices');
      return response.data;
    } catch (error) {
      console.error('Get user devices error:', error);
      throw error;
    }
  }

  // Admin: Lấy danh sách vi phạm
  async getViolations(filters?: {
    status?: string;
    severity?: string;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await config.get(`/device-security/violations?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get violations error:', error);
      throw error;
    }
  }

  // Admin: Xử lý vi phạm
  async handleViolation(violationId: string, action: 'block_users' | 'dismiss', notes?: string) {
    try {
      const response = await config.post(`/device-security/violations/${violationId}/handle`, {
        action,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Handle violation error:', error);
      throw error;
    }
  }

  // Admin: Lấy thống kê vi phạm
  async getViolationStats() {
    try {
      const response = await config.get('/device-security/stats');
      return response.data;
    } catch (error) {
      console.error('Get violation stats error:', error);
      throw error;
    }
  }

  // Admin: Dọn dẹp thiết bị không hoạt động
  async cleanupDevices() {
    try {
      const response = await config.post('/device-security/cleanup');
      return response.data;
    } catch (error) {
      console.error('Cleanup devices error:', error);
      throw error;
    }
  }
}

export default new DeviceSecurityService();
