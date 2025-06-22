// src/services/apiService.ts
import { config as axios } from '../api/axios';
import type { AxiosResponse } from 'axios';

// Sử dụng axios config đã được cấu hình
const apiClient = axios;

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
  price: string;
  oldPrice?: string;
  Image: string;
  type: string;
  duration: string;
  lessons: number;
  requirements: string[];
  isFree: boolean;
  hasDiscount: boolean;
  discountPercent?: number;
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
  // Tính thời lượng dựa trên level
  const durationMap: Record<string, string> = {
    beginner: '10 giờ học',
    intermediate: '15 giờ học',
    advanced: '20 giờ học'
  };

  // Tính số bài học dựa trên requirements
  const baseLessons = apiCourse.requirements?.length || 0;
  const lessons = baseLessons + 15; // Mỗi khóa học có ít nhất 15 bài

  // Tính giá sau giảm giá
  const finalPrice = apiCourse.finalPrice || (apiCourse.price * (1 - apiCourse.discount / 100));
  const isFree = finalPrice === 0;
  const hasDiscount = apiCourse.discount > 0;

  // Format giá
  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')} VND`;
  };

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
    price: formatPrice(finalPrice),
    oldPrice: hasDiscount ? formatPrice(apiCourse.price) : undefined,
    Image: apiCourse.thumbnail || 'https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Khóa+học',
    type: apiCourse.category?.name || 'Khóa học',
    duration: durationMap[apiCourse.level] || '12 giờ học',
    lessons,
    requirements: apiCourse.requirements || [],
    isFree,
    hasDiscount,
    discountPercent: hasDiscount ? apiCourse.discount : undefined
  };
};

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiCourse[]>>('/courses');
      if (!response.data?.success || !Array.isArray(response.data.data)) {
        console.warn('API trả về dữ liệu không hợp lệ cho getAllCourses');
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
  },

  getCoursesByCategory: async (categoryId: string): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiCourse[]>>(`/courses?category=${categoryId}`);
      return response.data?.success && Array.isArray(response.data.data)
        ? response.data.data.map(mapApiCourseToAppCourse)
        : [];
    } catch (error) {
      console.error('Lỗi khi lấy khóa học theo danh mục:', error);
      return [];
    }
  },

  getCourseBySlug: async (slug: string): Promise<Course | null> => {
    try {
      // Thêm một tham số truy vấn duy nhất để đảm bảo dữ liệu luôn mới
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

  searchCourses: async (searchTerm: string): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiCourse[]>>(`/courses/search?searchTerm=${searchTerm}`);
      return response.data?.success && Array.isArray(response.data.data)
        ? response.data.data.map(mapApiCourseToAppCourse)
        : [];
    } catch (error) {
      console.error('Lỗi khi tìm kiếm khóa học:', error);
      return [];
    }
  },

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
  }
};

// Instructor Registration Response Interfaces
export interface InstructorRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      fullname: string;
      email: string;
      status: string;
      email_verified: boolean;
      approval_status: string;
    };
    instructorInfo: {
      is_approved: boolean;
      experience_years: number;
      specializations: string[];
      teaching_experience: {
        years: number;
        description: string;
      };
      certificates: Array<{
        name: string;
        file: string;
        original_name: string;
        uploaded_at: string;
        _id: string;
        id: string;
      }>;
      demo_video?: string;
      cv_file?: string;
      approval_status: string;
      other_documents: any[];
    };
  };
}

// Instructor Registration API
export const registerInstructor = async (formData: FormData): Promise<InstructorRegistrationResponse> => {
  try {
    const response = await axios.post('/users/instructor-register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Lỗi đăng ký giảng viên:', error);
    throw new Error(error.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký');
  }
};