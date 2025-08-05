const cron = require('node-cron');
const deviceSecurityService = require('../services/deviceSecurityService');

class DeviceSecurityCleanup {
  constructor() {
    this.isRunning = false;
  }

  // Khởi động cron job
  start() {
    console.log('🔒 Starting Device Security Cleanup Job...');

    // Chạy mỗi 6 giờ để dọn dẹp thiết bị không hoạt động
    cron.schedule('0 */6 * * *', async () => {
      if (this.isRunning) {
        console.log('Device cleanup job is already running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('🧹 Running device security cleanup...');

      try {
        const cleanedCount = await deviceSecurityService.cleanupInactiveDevices();
        console.log(`✅ Device cleanup completed. Cleaned ${cleanedCount} inactive devices.`);
      } catch (error) {
        console.error('❌ Device cleanup failed:', error);
      } finally {
        this.isRunning = false;
      }
    });

    // Chạy ngay lập tức khi khởi động (optional)
    this.runCleanup();
  }

  // Chạy cleanup thủ công
  async runCleanup() {
    if (this.isRunning) {
      console.log('Device cleanup job is already running...');
      return;
    }

    this.isRunning = true;
    console.log('🧹 Running manual device security cleanup...');

    try {
      const cleanedCount = await deviceSecurityService.cleanupInactiveDevices();
      console.log(`✅ Manual cleanup completed. Cleaned ${cleanedCount} inactive devices.`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ Manual cleanup failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // Dừng cleanup job
  stop() {
    console.log('🛑 Stopping Device Security Cleanup Job...');
    cron.getTasks().forEach(task => task.stop());
  }

  // Lấy trạng thái
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.getNextRunTime()
    };
  }

  // Lấy thời gian chạy tiếp theo
  getNextRunTime() {
    const now = new Date();
    const next = new Date(now);
    
    // Tính toán 6 giờ tiếp theo
    const hoursUntilNext = 6 - (now.getHours() % 6);
    next.setHours(now.getHours() + hoursUntilNext, 0, 0, 0);
    
    return next;
  }
}

// Export singleton instance
const deviceSecurityCleanup = new DeviceSecurityCleanup();

module.exports = deviceSecurityCleanup;
