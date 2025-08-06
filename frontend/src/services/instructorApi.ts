import axios from 'axios';

// Tạo instance của axios
const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm Authorization token nếu có
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Lấy danh sách giảng viên chờ duyệt (dành cho admin)
export const getPendingInstructors = () => apiClient.get('/api/auth/instructors-pending');

//Duyệt hoặc từ chối giảng viên
export const approveInstructor = (userId: string, approve: boolean) =>
  apiClient.post('/api/auth/instructors-approve', { userId, approve });

//Lấy hồ sơ giảng viên hiện tại (dành cho chính giảng viên)
export const getInstructorProfile = () => apiClient.get('/api/auth/instructor-approval');

//Cập nhật hồ sơ giảng viên hiện tại
export const updateInstructorProfile = (data: any) =>
  apiClient.put('/api/auth/instructor-approval', data);

//Upload avatar
export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return apiClient.post('/api/instructor/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
