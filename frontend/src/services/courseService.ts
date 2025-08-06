const API_BASE_URL = '/api';

// Đặt hàm này trước object courseService
export const updateCourseStatus = async (courseId: string, status: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi cập nhật trạng thái khóa học');
    }
    return result.data;
  } catch (error) {
    console.error('Error updating course status:', error);
    throw error;
  }
};

// Mock data for testing UI
const MOCK_SECTIONS = [
  {
    id: 1,
    title: 'Introduction to React',
    description: 'Learn the basics of React development',
    order: 1,
    isExpanded: true,
    lessons: [
      {
        id: 1,
        title: 'What is React?',
        duration: '10:30',
        order: 1,
      },
      {
        id: 2,
        title: 'Setting up Development Environment',
        duration: '15:45',
        order: 2,
      },
      {
        id: 3,
        title: 'Your First Component',
        duration: '20:15',
        order: 3,
      },
    ],
  },
  {
    id: 2,
    title: 'React Components',
    description: 'Deep dive into React components',
    order: 2,
    isExpanded: false,
    lessons: [
      {
        id: 4,
        title: 'Functional Components',
        duration: '18:20',
        order: 1,
      },
      {
        id: 5,
        title: 'Props and State',
        duration: '25:10',
        order: 2,
      },
    ],
  },
  {
    id: 3,
    title: 'Advanced React',
    description: 'Advanced React concepts and patterns',
    order: 3,
    isExpanded: false,
    lessons: [
      {
        id: 6,
        title: 'React Hooks',
        duration: '30:45',
        order: 1,
      },
      {
        id: 7,
        title: 'Context API',
        duration: '22:30',
        order: 2,
      },
      {
        id: 8,
        title: 'Performance Optimization',
        duration: '28:15',
        order: 3,
      },
    ],
  },
];

// Toggle between mock and real API
const USE_MOCK_DATA = false; // Đã sẵn sàng dùng backend

// Type definitions
interface SectionData {
  title: string;
  description?: string;
  order?: number;
}

interface LessonData {
  title: string;
  duration?: string;
  order?: number;
}

interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  isExpanded: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  duration: string;
  order: number;
}

interface CourseData {
  title: string;
  description?: string;
  price?: number;
  thumbnail?: File;
  requirements?: string[];
  sections?: unknown[];
  [key: string]: unknown;
}

export const courseService = {
  // Get all sections with lessons
  getSections: async (): Promise<Section[]> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_SECTIONS;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sections`);
      if (!response.ok) throw new Error('Failed to fetch sections');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  },

  // Create new section
  createSection: async (sectionData: SectionData): Promise<Section> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newSection: Section = {
        id: Date.now(),
        title: sectionData.title,
        description: sectionData.description || '',
        order: sectionData.order || 1,
        isExpanded: false,
        lessons: [],
      };
      MOCK_SECTIONS.push(newSection);
      return newSection;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData),
      });
      if (!response.ok) throw new Error('Failed to create section');
      return await response.json();
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  },

  // Update section
  updateSection: async (id: number, updates: Partial<SectionData>): Promise<Section | null> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const sectionIndex = MOCK_SECTIONS.findIndex(s => s.id === id);
      if (sectionIndex >= 0) {
        MOCK_SECTIONS[sectionIndex] = { ...MOCK_SECTIONS[sectionIndex], ...updates };
        return MOCK_SECTIONS[sectionIndex];
      }
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update section');
      return await response.json();
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  },

  // Delete section
  deleteSection: async (id: number): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = MOCK_SECTIONS.findIndex(s => s.id === id);
      if (index >= 0) {
        MOCK_SECTIONS.splice(index, 1);
      }
      return true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete section');
      return true;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  },

  // Update sections order
  updateSectionsOrder: async (sections: Section[]): Promise<{ success: boolean }> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Mock implementation - just return success
      return { success: true };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sections/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections }),
      });
      if (!response.ok) throw new Error('Failed to update sections order');
      return await response.json();
    } catch (error) {
      console.error('Error updating sections order:', error);
      throw error;
    }
  },

  // Create new lesson
  createLesson: async (sectionId: number, lessonData: LessonData): Promise<Lesson> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const section = MOCK_SECTIONS.find(s => s.id === sectionId);
      if (section) {
        const newLesson: Lesson = {
          id: Date.now(),
          title: lessonData.title,
          duration: lessonData.duration || '00:00',
          order: lessonData.order || 1,
        };
        section.lessons.push(newLesson);
        return newLesson;
      }
      throw new Error('Section not found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });
      if (!response.ok) throw new Error('Failed to create lesson');
      return await response.json();
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  // Update lesson
  updateLesson: async (
    sectionId: number,
    lessonId: number,
    updates: Partial<LessonData>,
  ): Promise<Lesson> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const section = MOCK_SECTIONS.find(s => s.id === sectionId);
      if (section) {
        const lessonIndex = section.lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex >= 0) {
          section.lessons[lessonIndex] = { ...section.lessons[lessonIndex], ...updates };
          return section.lessons[lessonIndex];
        }
      }
      throw new Error('Lesson not found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update lesson');
      return await response.json();
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  },

  // Delete lesson
  deleteLesson: async (sectionId: number, lessonId: number): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const section = MOCK_SECTIONS.find(s => s.id === sectionId);
      if (section) {
        const lessonIndex = section.lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex >= 0) {
          section.lessons.splice(lessonIndex, 1);
        }
      }
      return true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete lesson');
      return true;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  },

  // Update lessons order
  updateLessonsOrder: async (
    sectionId: number,
    lessons: Lesson[],
  ): Promise<{ success: boolean }> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Mock implementation - just return success
      return { success: true };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/lessons/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessons }),
      });
      if (!response.ok) throw new Error('Failed to update lessons order');
      return await response.json();
    } catch (error) {
      console.error('Error updating lessons order:', error);
      throw error;
    }
  },

  updateCourseStatus,

  createCourse: async (courseData: CourseData) => {
    const token = localStorage.getItem('token');
    let body: string | FormData;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    let isFormData = false;
    if (courseData.thumbnail && courseData.thumbnail instanceof File) {
      const formData = new FormData();
      Object.keys(courseData).forEach(key => {
        if (key === 'thumbnail' && courseData.thumbnail) {
          formData.append('avatar', courseData.thumbnail);
        } else if (key === 'requirements' && Array.isArray(courseData[key])) {
          (courseData[key] as string[]).forEach((req: string) => {
            formData.append('requirements[]', req);
          });
        } else if (key === 'sections' && Array.isArray(courseData[key])) {
          formData.append('sections', JSON.stringify(courseData[key]));
        } else {
          formData.append(key, String(courseData[key]));
        }
      });
      body = formData;
      isFormData = true;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(courseData);
    }
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: isFormData ? { Authorization: `Bearer ${token}` } : headers,
      body,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi tạo khóa học');
    }
    return result.data;
  },
};

// Lấy lesson theo id
export const getLessonById = async (lessonId: string) => {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`);
  if (!response.ok) throw new Error('Không tìm thấy bài học');
  return await response.json();
};

// Lấy section theo id
export const getSectionById = async (sectionId: string) => {
  const response = await fetch(`${API_BASE_URL}/sections/${sectionId}`);
  if (!response.ok) throw new Error('Không tìm thấy chương');
  return await response.json();
};

// Cập nhật section
export const updateSection = async (
  sectionId: string,
  sectionData: { title: string; description?: string },
) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sectionData),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi cập nhật chương');
    }
    return result.data;
  } catch (error) {
    console.error('Error updating section:', error);
    throw error;
  }
};

// Tạo section mới
export const createSection = async (
  courseId: string,
  sectionData: { title: string; description?: string },
) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sections`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course_id: courseId,
        ...sectionData,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi tạo chương');
    }
    return result.data;
  } catch (error) {
    console.error('Error creating section:', error);
    throw error;
  }
};

// Xóa section
export const deleteSection = async (sectionId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi xóa chương');
    }
    return result.data;
  } catch (error) {
    console.error('Error deleting section:', error);
    throw error;
  }
};

// Tạo bài học mới
export const createLesson = async (
  sectionId: string,
  lessonData: { title: string; is_preview?: boolean },
) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/lessons`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lessons: [
          {
            section_id: sectionId,
            title: lessonData.title,
            is_preview: lessonData.is_preview || false,
          },
        ],
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi tạo bài học');
    }
    return result.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

// Cập nhật bài học
export const updateLesson = async (
  lessonId: string,
  lessonData: { title: string; is_preview?: boolean },
) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi cập nhật bài học');
    }
    return result.data;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

// Xóa bài học
export const deleteLesson = async (lessonId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi xóa bài học');
    }
    return result.data;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

// Tạo video mới
export const createVideo = async (lessonId: string, videoData: FormData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: videoData,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi tạo video');
    }
    return result.data;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
};

// Cập nhật video
export const updateVideo = async (videoId: string, videoData: FormData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: videoData,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi cập nhật video');
    }
    return result.data;
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

// Xóa video
export const deleteVideo = async (videoId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi xóa video');
    }
    return result.data;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

// Tạo quiz mới
export const createQuiz = async (lessonId: string, quizData: { questions: any[] }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lesson_id: lessonId,
        ...quizData,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi tạo quiz');
    }
    return result.data;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

// Cập nhật quiz
export const updateQuiz = async (quizId: string, quizData: { questions: any[] }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi cập nhật quiz');
    }
    return result.data;
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
};

// Lấy khóa học theo id
export const getCourseById = async (courseId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Không tìm thấy khóa học');
    }
    return result.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

// Cập nhật khóa học
export const updateCourse = async (courseId: string, courseData: CourseData) => {
  try {
    const token = localStorage.getItem('token');
    let body: string | FormData;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    let isFormData = false;
    if (courseData.thumbnail && courseData.thumbnail instanceof File) {
      const formData = new FormData();
      Object.keys(courseData).forEach(key => {
        if (key === 'thumbnail' && courseData.thumbnail) {
          formData.append('avatar', courseData.thumbnail);
        } else if (key === 'requirements' && Array.isArray(courseData[key])) {
          (courseData[key] as string[]).forEach((req: string) => {
            formData.append('requirements[]', req);
          });
        } else if (key === 'sections' && Array.isArray(courseData[key])) {
          formData.append('sections', JSON.stringify(courseData[key]));
        } else {
          formData.append(key, String(courseData[key]));
        }
      });
      body = formData;
      isFormData = true;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(courseData);
    }
    const url = `${API_BASE_URL}/courses/${courseId}`;
    console.log('Gọi API update:', url);
    const response = await fetch(url, {
      method: 'PUT',
      headers: isFormData ? { Authorization: `Bearer ${token}` } : headers,
      body,
    });
    const result = await response.json();
    console.log('Update course response:', result);
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi khi cập nhật khóa học');
    }
    return result.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};
