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
  instructorInfo?: {
    instructor_profile_status: string;
    rejection_reason?: string;
    specializations?: string[];
    experience_years?: number;
    teaching_experience?: {
      description: string;
    };
    education?: {
      degree: string;
      institution: string;
      year: number;
    }[];
    cv_file?: string;
    demo_video?: string;
    application_date?: string;
    approval_date?: string;
  };
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  followers_count?: number;
  following_count?: number;
  social_links?: {
    facebook?: string;
    github?: string;
    website?: string;
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

        const response = await config.get('/users/me');
        // Lưu user vào localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
        setUser(response.data.data);
        setError(null);
      } catch (error: unknown) {
        console.error('Error fetching user profile:', error);
        let errorMessage = 'Không thể tải thông tin người dùng';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number, data?: { message?: string } } };
          if (axiosError.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
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

              {/* Social links */}
              {user?.social_links && (user.social_links.facebook || user.social_links.github || user.social_links.website) && (
                <motion.div
                  className="flex items-center justify-center gap-3 mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                >
                  {user.social_links.facebook && (
                    <a href={user.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" title="Facebook">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.326v-21.349c0-.734-.593-1.326-1.324-1.326z"/></svg>
                    </a>
                  )}
                  {user.social_links.github && (
                    <a href={user.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-black" title="GitHub">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576 4.765-1.588 8.199-6.084 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                  )}
                  {user.social_links.website && (
                    <a href={user.social_links.website} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900" title="Website">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm0-18c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zm0-10c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z"/></svg>
                    </a>
                  )}
                </motion.div>
              )}

              {joinInfo ? (
                <motion.div 
                  className="flex items-center justify-center gap-2 text-gray-500 mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Calendar size={16} />
                  <span className="text-sm">Tham gia {joinInfo.timeAgo}</span>
                </motion.div>
              ) : null}
            </div>

            {/* Thông tin giảng viên */}
            {((user?.role?.name === 'instructor') || user?.instructorInfo) && (
              <motion.div
                className="mt-8 border-t border-gray-100 pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <BookOpen className="inline-block w-5 h-5 text-blue-500" /> Thông tin giảng viên
                </h3>
                <div className="space-y-2 text-gray-700 text-base">
                  <div><b>Chuyên môn:</b> {user?.instructorInfo?.specializations && user.instructorInfo.specializations.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.instructorInfo.specializations.map((spec, idx) => (
                        <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-blue-200">
                          {spec}
                        </span>
                      ))}
                    </div>
                  ) : 'Chưa cập nhật'}</div>
                  <div><b>Kinh nghiệm giảng dạy:</b> {typeof user?.instructorInfo?.experience_years === 'number' ? user.instructorInfo.experience_years : 'Chưa cập nhật'} năm</div>
                  <div><b>Giới thiệu:</b> {user?.instructorInfo?.teaching_experience?.description ? user.instructorInfo.teaching_experience.description : 'Không có mô tả'}</div>
                  {user?.instructorInfo?.cv_file && (
                    <div><b>CV:</b> <a href={user.instructorInfo.cv_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Xem CV</a></div>
                  )}
                  {user?.instructorInfo?.demo_video && (
                    <div><b>Video demo:</b> <a href={user.instructorInfo.demo_video} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Xem video</a></div>
                  )}
                
                </div>
              </motion.div>
            )}

            {/* Stats Section: Người theo dõi/Đang theo dõi */}
            <motion.div 
              className="border-t border-gray-100 pt-6 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="text-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl font-bold text-blue-600">{user?.followers_count ?? 0}</div>
                  <div className="text-sm text-gray-500">Người theo dõi</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl font-bold text-green-600">{user?.following_count ?? 0}</div>
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