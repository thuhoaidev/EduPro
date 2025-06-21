import { useEffect, useState } from "react";
import { User, Mail, BookOpen, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
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
      <motion.div 
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex flex-col items-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="mt-4 text-gray-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Đang tải thông tin...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <motion.div 
              className="text-2xl text-red-500 mb-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ⚠️
            </motion.div>
            <div className="text-xl text-red-600 mb-4 font-semibold">{error}</div>
            <motion.button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Đăng nhập lại
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
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
    <motion.div 
      className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 px-4 lg:px-8">
        {/* Left: User Info Card */}
        <motion.div 
          className="w-full lg:w-1/3"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Avatar Section */}
            <div className="text-center mb-8">
              <motion.div 
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.img
                  src={user?.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullname || '') + '&background=4f8cff&color=fff&size=256'}
                  alt="avatar"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
                <motion.div
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </motion.div>
              </motion.div>
              
              <motion.h1 
                className="text-2xl font-bold text-gray-900 mt-4 mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {user?.fullname || 'Chưa có tên'}
              </motion.h1>
              
              {user?.nickname && (
                <motion.p 
                  className="text-gray-600 text-lg mb-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  @{user.nickname}
                </motion.p>
              )}
              
              <motion.div 
                className="flex items-center justify-center gap-2 text-gray-500 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Mail size={16} />
                <span className="text-sm">{user?.email}</span>
              </motion.div>

              {joinInfo && (
                <motion.div 
                  className="flex items-center justify-center gap-2 text-gray-500 mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Calendar size={16} />
                  <span className="text-sm">Tham gia {joinInfo.timeAgo}</span>
                </motion.div>
              )}
            </div>

            {/* Stats Section */}
            <motion.div 
              className="border-t border-gray-100 pt-6 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="text-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl font-bold text-blue-600">1.2K</div>
                  <div className="text-sm text-gray-500">Người theo dõi</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl font-bold text-green-600">500</div>
                  <div className="text-sm text-gray-500">Đang theo dõi</div>
                </motion.div>
              </div>
            </motion.div>

          </motion.div>
        </motion.div>

        {/* Right: Activity & Courses */}
        <motion.div 
          className="w-full lg:w-2/3 space-y-6"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Courses Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="flex items-center gap-3 mb-6"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.role?.name === 'instructor' ? 'Khóa học của bạn' : 'Khóa học đang học'}
              </h2>
            </motion.div>
            
            <motion.div 
              className="text-center py-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Users className="w-10 h-10 text-gray-400" />
              </motion.div>
              <p className="text-gray-500 text-lg mb-2">
                {user?.role?.name === 'instructor' 
                  ? 'Chưa có khóa học nào được tạo' 
                  : 'Chưa có khóa học nào'
                }
              </p>
              <p className="text-gray-400 text-sm mb-6">
                {user?.role?.name === 'instructor' 
                  ? 'Bắt đầu tạo khóa học đầu tiên của bạn' 
                  : 'Bắt đầu học ngay để xem tiến độ của bạn'
                }
              </p>
              <motion.button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                {user?.role?.name === 'instructor' ? 'Tạo khóa học' : 'Khám phá khóa học'}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;