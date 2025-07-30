import apiClient from './apiClient';

export interface Note {
  _id: string;
  content: string;
  timestamp: number; // in seconds
  lesson: string;
  course: string;
  user: string;
  createdAt: string;
}

// Lấy tất cả ghi chú của user cho một bài học
export const getNotesByLesson = async (lessonId: string): Promise<Note[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Note[] }>(`/notes/lesson/${lessonId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

// Tạo ghi chú mới
export const createNote = async (data: { content: string; timestamp: number; lessonId: string; courseId: string }): Promise<Note | null> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: Note }>('/notes', data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating note:', error);
    return null;
  }
};

// Xóa một ghi chú
export const deleteNote = async (noteId: string): Promise<boolean> => {
  try {
    const response = await apiClient.delete<{ success: boolean }>(`/notes/${noteId}`);
    return response.data.success;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
};

// Sửa một ghi chú
export const updateNote = async (noteId: string, content: string): Promise<Note | null> => {
  try {
    const response = await apiClient.put<{ success: boolean; data: Note }>(`/notes/${noteId}`, { content });
    return response.data.data;
  } catch (error) {
    console.error('Error updating note:', error);
    return null;
  }
}; 