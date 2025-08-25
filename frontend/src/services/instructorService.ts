import { config } from '../api/axios';

export interface InstructorDashboardStats {
  overview: {
    totalCourses: number;
    publishedCourses: number;
    pendingCourses: number;
    draftCourses: number;
    totalStudents: number;
    totalEnrollments: number;
    totalEarnings: number;
    currentBalance: number;
    totalTransactions: number;
  };
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
  }>;
  topCourses: Array<{
    _id: string;
    title: string;
    thumbnail: string;
    price: number;
    enrollmentCount: number;
    rating: number;
    totalReviews: number;
  }>;
  recentEnrollments: Array<{
    date: string;
    count: number;
  }>;
}

export interface CourseAnalytics {
  course: {
    _id: string;
    title: string;
    thumbnail: string;
    price: number;
    status: string;
    rating: number;
    totalReviews: number;
    enrolledStudents: number;
  };
  analytics: {
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    enrollmentTrend: Array<{
      _id: string;
      count: number;
    }>;
    completionTrend: Array<{
      _id: string;
      completedCount: number;
    }>;
  };
}

export interface EarningsAnalytics {
  period: number;
  totalEarnings: number;
  totalTransactions: number;
  averageEarnings: number;
  dailyEarnings: Array<{
    date: string;
    earnings: number;
    transactions: number;
  }>;
  topCourses: Array<{
    _id: string;
    courseTitle: string;
    courseThumbnail: string;
    totalEarnings: number;
    salesCount: number;
  }>;
}

export interface InstructorStudent {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    phone: string;
  };
  course: {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
  };
  progress: number;
  completed: boolean;
  enrolledAt: string;
  lastActivity: string | null;
}

export interface InstructorStudentsResponse {
  students: InstructorStudent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    uniqueStudents: number;
  };
}

export interface InstructorCourse {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  status: string;
}

class InstructorService {
  // Lấy thống kê tổng quan cho instructor dashboard
  async getDashboardStats(): Promise<InstructorDashboardStats> {
    try {
      const response = await config.get('/instructor/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching instructor dashboard stats:', error);
      throw error;
    }
  }

  // Lấy thống kê chi tiết khóa học
  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    try {
      const response = await config.get(`/instructor/dashboard/course/${courseId}/analytics`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  }

  // Lấy thống kê thu nhập chi tiết
  async getEarningsAnalytics(period: number = 30): Promise<EarningsAnalytics> {
    try {
      const response = await config.get(`/instructor/dashboard/earnings?period=${period}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching earnings analytics:', error);
      throw error;
    }
  }

  // Lấy danh sách học viên của instructor
  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    courseId?: string;
  }): Promise<InstructorStudentsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.courseId) queryParams.append('courseId', params.courseId);

      const response = await config.get(`/instructor/students?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching instructor students:', error);
      throw error;
    }
  }

  // Lấy danh sách khóa học của instructor
  async getCourses(): Promise<InstructorCourse[]> {
    try {
      const response = await config.get('/instructor/courses');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      throw error;
    }
  }

  // Lấy chi tiết học viên
  async getStudentDetail(studentId: string): Promise<InstructorStudent & { lessonProgress?: Array<{
    lessonId: string;
    lessonTitle: string;
    watchedSeconds: number;
    videoDuration: number;
    completed: boolean;
    lastWatchedAt: string;
    quizPassed?: boolean;
  }> }> {
    try {
      const response = await config.get(`/instructor/students/${studentId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching student detail:', error);
      throw error;
    }
  }

  // Lấy dữ liệu analytics chi tiết
  async getAnalytics(params?: any): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.timeRange) queryParams.append('timeRange', params.timeRange);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await config.get(`/instructor/analytics?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
}

export default new InstructorService();
