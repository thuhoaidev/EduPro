import { config } from '../api/axios';
import type { StatisticsData, TopCourse, RevenueData, CategoryStat, MonthlyStat } from '../types/statistics';

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

  // Lấy dữ liệu doanh thu theo thời gian
  async getRevenueData(days: number = 30): Promise<RevenueData[]> {
    try {
      const response = await config.get(`/statistics/revenue?days=${days}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  }

  // Lấy top khóa học bán chạy
  async getTopCourses(limit: number = 5): Promise<TopCourse[]> {
    try {
      const response = await config.get(`/statistics/top-courses?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching top courses:', error);
      throw error;
    }
  }

  // Lấy thống kê theo danh mục
  async getCategoryStatistics(): Promise<CategoryStat[]> {
    try {
      const response = await config.get('/statistics/categories');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching category statistics:', error);
      throw error;
    }
  }

  // Lấy thống kê theo tháng
  async getMonthlyStatistics(year: number = new Date().getFullYear()): Promise<MonthlyStat[]> {
    try {
      const response = await config.get(`/statistics/monthly?year=${year}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly statistics:', error);
      throw error;
    }
  }
}

export const statisticsService = new StatisticsService();
export default statisticsService; 