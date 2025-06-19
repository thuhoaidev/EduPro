import { useEffect, useState } from "react";
import { User, Calendar, Mail } from "lucide-react";
import { config } from "../../../api/axios";
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface User {
  id: number;
  avatar?: string;
  fullname: string;
  nickname?: string;
  email: string;
  created_at: string;
  approval_status?: string;
  role?: {
    name: string;
    description: string;
    permissions: string[];
  };
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Redirect to login if no token
          window.location.href = '/login';
          return;
        }

        // Kiểm tra user trong localStorage trước
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setLoading(false);
          return;
        }

        const response = await config.get('/users/me');
        
        // Lưu user vào localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        setUser(response.data);
        setError(null);
      } catch (error: unknown) {
        console.error('Error fetching user profile:', error);
        let errorMessage = 'Không thể tải thông tin người dùng';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          errorMessage = axiosError.response?.data?.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-2xl text-red-500 mb-4">⚠️</div>
            <div className="text-xl text-red-600 mb-4 font-semibold">{error}</div>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      fullDate: format(date, 'dd/MM/yyyy', { locale: vi }),
      timeAgo: formatDistanceToNow(date, { addSuffix: true, locale: vi }),
      year: date.getFullYear()
    };
  };

  const joinInfo = user?.created_at ? formatJoinDate(user.created_at) : null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 px-4 lg:px-8">
        {/* Left: User Info Card */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Avatar Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <img
                  src={user?.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullname || '') + '&background=4f8cff&color=fff&size=256'}
                  alt="avatar"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
                />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                {user?.fullname || 'Chưa có tên'}
              </h1>
              
              {user?.nickname && (
                <p className="text-gray-600 text-lg mb-3">@{user.nickname}</p>
              )}
              
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                <Mail size={16} />
                <span className="text-sm">{user?.email}</span>
              </div>
            </div>

            {/* Stats Section */}
            <div className="border-t border-gray-100 pt-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1.2K</div>
                  <div className="text-sm text-gray-500">Người theo dõi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">500</div>
                  <div className="text-sm text-gray-500">Đang theo dõi</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Activity & Courses */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* Courses Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.role?.name === 'instructor' ? 'Khóa học của bạn' : 'Khóa học đang học'}
              </h2>
            </div>
            
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {user?.role?.name === 'instructor' 
                  ? 'Chưa có khóa học nào được tạo' 
                  : 'Chưa có khóa học nào'
                }
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {user?.role?.name === 'instructor' 
                  ? 'Bắt đầu tạo khóa học đầu tiên của bạn' 
                  : 'Bắt đầu học ngay để xem tiến độ của bạn'
                }
              </p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                {user?.role?.name === 'instructor' ? 'Tạo khóa học' : 'Khám phá khóa học'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;