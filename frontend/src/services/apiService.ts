// src/services/apiService.ts
import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface ApiCourse {
  _id: string;
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    _id: string;
    bio: string;
    expertise: string[];
    rating: number;
  };
  category: {
    _id: string;
    name: string;
    id: string;
  };
  level: string;
  language: string;
  price: number;
  discount: number;
  finalPrice: number;
  status: string;
  requirements: string[];
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  rating: number;
  reviews: number;
  price: string;
  oldPrice?: string;
  Image: string;
  type: string;
  duration: string;
  lessons: number;
}

const mapApiCourseToAppCourse = (apiCourse: ApiCourse): Course => {
  // Tính thời lượng dựa trên level
  const durationMap: Record<string, string> = {
    beginner: '10 giờ học',
    intermediate: '15 giờ học',
    advanced: '20 giờ học'
  };

  // Tính số bài học dựa trên requirements
  const baseLessons = apiCourse.requirements?.length || 0;
  const lessons = baseLessons + 15; // Mỗi khóa học có ít nhất 15 bài

  return {
    id: apiCourse.id || apiCourse._id,
    title: apiCourse.title,
    subtitle: apiCourse.description.length > 50 
      ? `${apiCourse.description.substring(0, 50)}...` 
      : apiCourse.description,
    author: apiCourse.instructor.bio || 'Giảng viên EduPro',
    rating: apiCourse.instructor.rating || 0,
    reviews: Math.floor(Math.random() * 100), // Tạm thời random
    price: apiCourse.finalPrice === 0 
      ? 'Miễn phí' 
      : `${apiCourse.finalPrice.toLocaleString('vi-VN')} VND`,
    oldPrice: apiCourse.discount > 0 
      ? `${apiCourse.price.toLocaleString('vi-VN')} VND` 
      : undefined,
    Image: apiCourse.thumbnail || '/default-course.jpg',
    type: apiCourse.category.name,
    duration: durationMap[apiCourse.level] || '12 giờ học',
    lessons
  };
};

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiCourse[]>>('/courses');
      
      if (!response.data?.success || !Array.isArray(response.data.data)) {
        console.warn('API trả về dữ liệu không hợp lệ');
        return [];
      }
      
      return response.data.data.map(mapApiCourseToAppCourse);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khóa học:', error);
      return [];
    }
  },
  
  getPopularCourses: async (): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiCourse[]>>('/courses/popular');
      return response.data?.success && Array.isArray(response.data.data)
        ? response.data.data.map(mapApiCourseToAppCourse)
        : [];
    } catch (error) {
      console.error('Lỗi khi lấy khóa học phổ biến:', error);
      return [];
    }
  }
};