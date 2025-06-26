// src/services/apiService.ts
import axios from 'axios';

// Tạo axios instance với baseURL chuẩn
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
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
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    _id: string;
    bio?: string;
    expertise?: string[];
    user?: {
      fullname: string;
      avatar: string;
    }
  };
  category: {
    _id: string;
    name: string;
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
  views?: number;
  __v: number;
  rating?: number;
  reviews?: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  rating: number;
  reviews: number;
  price: number;
  oldPrice?: number;
  Image: string;
  type: string;
  duration: string;
  lessons: number;
  requirements: string[];
  isFree: boolean;
  hasDiscount: boolean;
  discountPercent?: number;
  status: string;
  language: string;
}

export interface Section {
  _id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

export interface Lesson {
  _id: string;
  title: string;
  position: number;
  is_preview: boolean;
}

const mapApiCourseToAppCourse = (apiCourse: ApiCourse): Course => {
  const durationMap: Record<string, string> = {
    beginner: '10 giờ học',
    intermediate: '15 giờ học',
    advanced: '20 giờ học'
  };
  const baseLessons = apiCourse.requirements?.length || 0;
  const lessons = baseLessons + 15;
  const finalPrice = apiCourse.finalPrice || (apiCourse.price * (1 - apiCourse.discount / 100));
  const isFree = finalPrice === 0;
  const hasDiscount = apiCourse.discount > 0;
  return {
    id: apiCourse._id,
    slug: apiCourse.slug,
    title: apiCourse.title,
    subtitle: apiCourse.description,
    author: {
      name: apiCourse.instructor?.user?.fullname || 'Giảng viên EduPro',
      avatar: apiCourse.instructor?.user?.avatar || '',
      bio: apiCourse.instructor?.bio || 'Thông tin giảng viên đang được cập nhật.'
    },
    rating: apiCourse.rating || 4.5,
    reviews: apiCourse.reviews || Math.floor(Math.random() * 100) + 10,
    price: finalPrice,
    oldPrice: hasDiscount ? apiCourse.price : undefined,
    Image: apiCourse.thumbnail || 'https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Khóa+học',
    type: apiCourse.category?.name || 'Khóa học',
    duration: durationMap[apiCourse.level] || '12 giờ học',
    lessons,
    requirements: apiCourse.requirements || [],
    isFree,
    hasDiscount,
    discountPercent: hasDiscount ? apiCourse.discount : undefined,
    status: apiCourse.status,
    language: apiCourse.language
  };
};

export const courseService = {
  getInstructorCourses: async (instructorId: string): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiCourse[]>>(`/courses?instructor=${instructorId}`);
      return response.data?.success && Array.isArray(response.data.data)
        ? response.data.data.map(mapApiCourseToAppCourse)
        : [];
    } catch (error) {
      console.error('Lỗi khi lấy khóa học của giảng viên:', error);
      return [];
    }
  },

  getCourseBySlug: async (slug: string): Promise<Course | null> => {
    try {
      const cacheBustingUrl = `/courses/slug/${slug}?_=${new Date().getTime()}`;
      const response = await apiClient.get<{ success: boolean; data: ApiCourse }>(cacheBustingUrl);
      if (response.data?.success && response.data.data) {
        return mapApiCourseToAppCourse(response.data.data);
      }
      return null;
    } catch (error) {
      console.error(`Lỗi khi lấy khóa học với slug ${slug}:`, error);
      return null;
    }
  },

  getCourseContent: async (courseId: string): Promise<Section[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Section[] }>(`/courses/${courseId}/sections`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error(`Lỗi khi lấy nội dung khóa học ${courseId}:`, error);
      return [];
    }
  },

  getCourseById: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>(`/courses/${id}`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Lỗi khi lấy khóa học với id ${id}:`, error);
      return null;
    }
  },
};