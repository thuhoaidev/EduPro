// src/services/apiService.ts
import apiClient from './apiClient';
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
  displayStatus?: string;
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
  level: string;
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
    language: apiCourse.language,
    level: apiCourse.level
  };
};

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiCourse[]>>('/courses');
      return response.data?.success && Array.isArray(response.data.data)
        ? response.data.data.map(mapApiCourseToAppCourse)
        : [];
    } catch (error) {
      console.error('Lỗi khi lấy tất cả khóa học:', error);
      return [];
    }
  },

  searchCourses: async (searchTerm: string): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiCourse[]>>(`/courses?search=${encodeURIComponent(searchTerm)}`);
      return response.data?.success && Array.isArray(response.data.data)
        ? response.data.data.map(mapApiCourseToAppCourse)
        : [];
    } catch (error) {
      console.error('Lỗi khi tìm kiếm khóa học:', error);
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

  getInstructorCourses: async (): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiCourse[]>>('/courses/instructor');
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

  createCourse: async (data: any) => {
    try {
      const response = await apiClient.post('/courses', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  mapApiCourseToAppCourse,

  updateCourseStatus: async (courseId: string, status: string) => {
    try {
      const response = await apiClient.patch(`/courses/${courseId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  submitCourseForApproval: async (courseId: string) => {
    try {
      const response = await apiClient.post(`/courses/${courseId}/submit`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  approveCourse: async (courseId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await apiClient.post(`/courses/${courseId}/approve`, { action, reason });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  deleteCourse: async (courseId: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/courses/${courseId}`);
      return response.data?.success || false;
    } catch (error: any) {
      console.error('Lỗi khi xóa khóa học:', error);
      throw error.response?.data || error;
    }
  },

  updateCourse: async (courseId: string, courseData: Partial<ApiCourse>): Promise<ApiCourse | null> => {
    try {
      const response = await apiClient.put<ApiResponse<ApiCourse>>(`/courses/${courseId}`, courseData);
      return response.data?.success ? response.data.data : null;
    } catch (error: any) {
      console.error('Lỗi khi cập nhật khóa học:', error);
      throw error.response?.data || error;
    }
  },
};

// Instructor Registration Interfaces
export interface InstructorRegistrationForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  degree: string;
  institution: string;
  graduationYear: string;
  major: string;
  specializations: string[];
  teachingExperience: string;
  experienceDescription: string;
  bio: string;
  linkedin?: string;
  github?: string;
  website?: string;
  avatar?: File;
  cv?: File;
  certificates?: File[];
  demoVideo?: File;
}

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
      }>;
      demo_video: string | null;
      cv_file: string | null;
      instructor_profile_status: string;
      bio: string;
    };
  };
}

// Instructor Registration Service
export const instructorService = {
  registerInstructor: async (formData: FormData): Promise<InstructorRegistrationResponse> => {
    try {
      const response = await apiClient.post<InstructorRegistrationResponse>(
        '/auth/instructor-register',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lỗi đăng ký giảng viên:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Lỗi đăng ký giảng viên');
      }
      throw new Error('Lỗi kết nối server');
    }
  },

  verifyInstructorEmail: async (token: string): Promise<InstructorRegistrationResponse> => {
    try {
      const response = await apiClient.get<InstructorRegistrationResponse>(
        `/auth/verify-instructor-email/${token}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Lỗi xác minh email giảng viên:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Lỗi xác minh email');
      }
      throw new Error('Lỗi kết nối server');
    }
  }
};

export { mapApiCourseToAppCourse };
const apiService = {
  getCurrentUser: async () => {
    try {
      const res = await apiClient.get('/users/me');
      return res.data;
    } catch (err) {
      console.error('Lỗi khi lấy thông tin người dùng:', err);
      return null;
    }
  },
unlikePost: async (postId: string) => {
  try {
    const res = await apiClient.delete(`/blogs/${postId}/like`);
    return res.data; // trả về { liked, likes_count }
  } catch (err: any) {
    console.error(`❌ Lỗi khi bỏ like post ${postId}:`, err.response?.data || err.message);
    throw err;
  }
},

fetchSavedPosts: async () => {
  try {
    const res = await apiClient.get('/blogs/saved-posts'); // ❌ bỏ headers thủ công
    if (res.data?.success === false) {
      throw new Error(res.data.message || 'Lỗi từ API');
    }
    return res.data?.data || [];
  } catch (err: any) {
    console.error('❌ Lỗi khi lấy bài viết đã lưu:', err.response?.data || err.message);
    throw err;
  }
},
  likePost: async (postId: string) => {
  try {
    const res = await apiClient.post(`/blogs/${postId}/like`);
    return res.data; // trả về { liked, likes_count }
  } catch (err: any) {
    console.error(`❌ Lỗi khi like post ${postId}:`, err.response?.data || err.message);
    throw err;
  }
},


  unsavePost: async (savedPostId: string) => {
    return apiClient.delete(`/blogs/${savedPostId}/unsave`);
  },

  // src/services/apiService.ts
  toggleSavePost: async (blogId: string) => {
  return apiClient.post(`/blogs/${blogId}/toggle-save`);
},


  fetchComments: async (postId: string) => {
    const res = await apiClient.get(`/blogs/${postId}/comments`);
    return res.data;
  },
addComment: async (postId: string, content: string) => {
  const res = await apiClient.post(`/blogs/${postId}/comment`, { content }); // ✅ sửa lại /comment
  if (res.data?.success && res.data.data) {
    return res.data.data;
  }
  throw new Error('Không thể thêm bình luận');
},

  replyToComment: async (commentId: string, content: string) => {
  const res = await apiClient.post(`/blogs/comment/${commentId}/reply`, { content }); // ✅ đúng route
  if (res.data?.success && res.data.data) {
    return res.data.data; // trả về dữ liệu phản hồi
  }
  throw new Error('Không thể gửi phản hồi');
}

};

export { apiClient, apiService };


