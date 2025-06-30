const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mock data for testing UI
const MOCK_SECTIONS = [
  {
    id: 1,
    title: "Introduction to React",
    description: "Learn the basics of React development",
    order: 1,
    isExpanded: true,
    lessons: [
      {
        id: 1,
        title: "What is React?",
        duration: "10:30",
        order: 1
      },
      {
        id: 2,
        title: "Setting up Development Environment",
        duration: "15:45",
        order: 2
      },
      {
        id: 3,
        title: "Your First Component",
        duration: "20:15",
        order: 3
      }
    ]
  },
  {
    id: 2,
    title: "React Components",
    description: "Deep dive into React components",
    order: 2,
    isExpanded: false,
    lessons: [
      {
        id: 4,
        title: "Functional Components",
        duration: "18:20",
        order: 1
      },
      {
        id: 5,
        title: "Props and State",
        duration: "25:10",
        order: 2
      }
    ]
  },
  {
    id: 3,
    title: "Advanced React",
    description: "Advanced React concepts and patterns",
    order: 3,
    isExpanded: false,
    lessons: [
      {
        id: 6,
        title: "React Hooks",
        duration: "30:45",
        order: 1
      },
      {
        id: 7,
        title: "Context API",
        duration: "22:30",
        order: 2
      },
      {
        id: 8,
        title: "Performance Optimization",
        duration: "28:15",
        order: 3
      }
    ]
  }
];

// Toggle between mock and real API
const USE_MOCK_DATA = true; // Set to false when backend is ready

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