const API_BASE_URL = '/api';

// Course service implementation
export const courseService = {
  // Get all sections with lessons
  getSections: async () => {
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
  createSection: async (sectionData) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newSection = {
        id: Date.now(),
        ...sectionData,
        lessons: []
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
  updateSection: async (id, updates) => {
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
  deleteSection: async (id) => {
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
  updateSectionsOrder: async (sections) => {
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
  createLesson: async (sectionId, lessonData) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const section = MOCK_SECTIONS.find(s => s.id === sectionId);
      if (section) {
        const newLesson = {
          id: Date.now(),
          ...lessonData
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
  updateLesson: async (sectionId, lessonId, updates) => {
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
  deleteLesson: async (sectionId, lessonId) => {
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
  updateLessonsOrder: async (sectionId, lessons) => {
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

// Course CRUD operations
export const getCourseById = async (courseId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
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

export const updateCourse = async (courseId: string, courseData: any) => {
  try {
    const token = localStorage.getItem('token');
    let body: string | FormData;
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    let isFormData = false;
    if (courseData.thumbnail && courseData.thumbnail instanceof File) {
      const formData = new FormData();
      Object.keys(courseData).forEach(key => {
        if (key === 'thumbnail') {
          formData.append(key, courseData[key]);
        } else if (key === 'requirements' && Array.isArray(courseData[key])) {
          courseData[key].forEach((req: string) => {
            formData.append('requirements[]', req);
          });
        } else if (key === 'sections' && Array.isArray(courseData[key])) {
          formData.append('sections', JSON.stringify(courseData[key]));
        } else {
          formData.append(key, courseData[key]);
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
      headers: isFormData ? { 'Authorization': `Bearer ${token}` } : headers,
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

export const deleteCourse = async (courseId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi xóa khóa học');
      } else {
        const errorText = await response.text();
        console.error('Non-JSON response:', errorText);
        throw new Error('Lỗi khi xóa khóa học');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const getInstructorCourses = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/courses/instructor`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi tải danh sách khóa học');
      } else {
        const errorText = await response.text();
        console.error('Non-JSON response:', errorText);
        throw new Error('Lỗi khi tải danh sách khóa học');
      }
    }

    const result = await response.json();
    return result.data || result; // Trả về data nếu có, không thì trả về toàn bộ result
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    throw error;
  }
};