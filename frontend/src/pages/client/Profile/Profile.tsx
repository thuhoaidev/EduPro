import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { config } from "../../../api/axios";
import { formatDistanceToNow } from 'date-fns';
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

        const response = await config.get('/auth/me');
        
        // Lưu user vào localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        setUser(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        setError(error.response?.data?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="text-xl text-red-500 mb-2">{error}</div>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Đăng nhập lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fafbfc] min-h-screen py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-2 md:px-0">
        {/* Left: User Info */}
        <div className="w-full md:w-1/4 flex flex-col items-center md:items-start pt-2">
          <img
            src={user?.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullname || '') + '&background=4f8cff&color=fff&size=256'}
            alt="avatar"
            className="w-36 h-36 rounded-full border-4 border-white shadow mb-4 object-cover"
          />
          <div className="text-2xl font-bold text-gray-900 mb-1 text-center md:text-left">
            {user?.fullname || 'Không có tên'}
          </div>
          <div className="text-gray-500 text-base mb-3 text-center md:text-left">{user?.nickname || user?.email || 'Không có nickname'}</div>
          <div className="flex items-center gap-2 text-gray-600 mb-2 text-sm">
            <User size={16} />
            <span><b>1.2K</b> người theo dõi · <b>500</b> đang theo dõi</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mb-2 text-sm">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#888" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0-14a6 6 0 0 0-6 6c0 3.31 2.69 6 6 6s6-2.69 6-6a6 6 0 0 0-6-6Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>
            <span>Tham gia từ {user?.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: vi }) : 'Không rõ thời gian tham gia'}</span>
          </div>
          
          {/* Hiển thị role nếu có */}
          {user?.role?.name && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <span className="text-blue-500 font-semibold">Vai trò: {user.role.name}</span>
              </div>
            </div>
          )}
        </div>
        {/* Right: Activity & Courses */}
        <div className="w-full md:w-3/4">
          {/* Activity */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 18 }).map((_, row) => (
                <div key={row} className="flex">
                  {Array.from({ length: 7 }).map((_, col) => (
                    <div
                      key={col}
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: '#f3f4f6' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Khóa học đang học</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add your course cards here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;