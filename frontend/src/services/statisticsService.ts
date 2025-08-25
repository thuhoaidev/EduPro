import { config } from '../api/axios';
import type { StatisticsData, RevenueData, CategoryStat, MonthlyStat } from '../types/statistics';

class StatisticsService {
  // Lấy thống kê tổng quan
  async getOverviewStatistics(): Promise<StatisticsData> {
    try {
      const response = await config.get('/statistics/overview');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching overview statistics:', error);
      throw error;
    }
  }

  // Lấy thống kê khóa học
  async getCourseStatistics(days: number = 30): Promise<any> {
    try {
      const response = await config.get(`/statistics/courses?days=${days}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching course statistics:', error);
      throw error;
    }
  }

  // Lấy thống kê đơn hàng
  async getOrderStatistics(days: number = 30): Promise<any> {
    try {
      const response = await config.get(`/statistics/orders?days=${days}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  }

  // Lấy thống kê học viên
  async getStudentStatistics(days: number = 30): Promise<any> {
    try {
      const response = await config.get(`/statistics/students?days=${days}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching student statistics:', error);
      throw error;
    }
  }

  // Lấy thống kê giảng viên
  async getInstructorStatistics(days: number = 30): Promise<any> {
    try {
      const response = await config.get(`/statistics/instructors?days=${days}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching instructor statistics:', error);
      throw error;
    }
  }

  // Lấy dữ liệu doanh thu theo thời gian (legacy method for backward compatibility)
  async getRevenueData(days: number = 30): Promise<any[]> {
    try {
      const response = await config.get(`/statistics/revenue?days=${days}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  }



  // Lấy thống kê theo danh mục
  async getCategoryStatistics(): Promise<CategoryStat[]> {
    try {
      const response = await config.get('/statistics/categories');
      return response.data.data;
    } catch (error) {
      return [];
    }
  }

  // Lấy thống kê theo tháng
  async getMonthlyStatistics(year: number = new Date().getFullYear()): Promise<MonthlyStat[]> {
    try {
      const response = await config.get(`/statistics/monthly?year=${year}`);
      return response.data.data;
    } catch (error) {
      return [];
    }
  }

  // Lấy thống kê công khai cho homepage
  async getPublicStatistics(): Promise<any> {
    try {
      console.log('🔍 statisticsService.getPublicStatistics() called');
      console.log('🔍 Making request to /statistics/public');
      
      const response = await config.get('/statistics/public');
      console.log('🔍 Response received:', response);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response data:', response.data);
      
      if (response.data && response.data.success) {
        console.log('🔍 Success response, returning data:', response.data.data);
        return response.data.data;
      } else {
        console.error('🔍 API returned success: false:', response.data);
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error in getPublicStatistics:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      // Trả về dữ liệu mẫu nếu có lỗi
      return {
        totalUsers: 0,
        totalCourses: 0,
        totalInstructors: 0,
        averageRating: 0,
        totalEnrollments: 0
      };
    }
  }
}

export const statisticsService = new StatisticsService();
export default statisticsService; 