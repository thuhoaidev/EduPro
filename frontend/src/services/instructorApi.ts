import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lấy profile giảng viên
export const getInstructorProfile = () => apiClient.get('/api/auth/instructor-approval');

// Cập nhật profile giảng viên
export const updateInstructorProfile = (data: any) => apiClient.put('/api/auth/instructor-approval', data);

// Upload avatar (file)
export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return apiClient.post('/api/instructor/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
