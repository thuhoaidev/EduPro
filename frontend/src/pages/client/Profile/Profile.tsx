import { useEffect, useState } from "react";
import { User, Mail, BookOpen, Users, Calendar, MapPin, Globe, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { config } from "../../../api/axios";
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { debugAvatar, forceRefreshUser as debugForceRefreshUser } from '../../../utils/debugUserData';
import { testAvatarLoading } from '../../../utils/testAvatarLoading';
import { clearCacheAndRefresh } from '../../../utils/clearCacheAndRefresh';
import { testAllAvatarFunctions } from '../../../utils/testAllAvatarFunctions';
import { autoFixAvatar } from '../../../utils/autoFixAvatar';

interface User {
  id: number;
  avatar?: string;
  fullname: string;
  nickname?: string;
  email: string;
  bio?: string;
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

  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastLocationKey, setLastLocationKey] = useState(location.key);

  // Force refresh user data khi cần thiết
  const forceRefreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile: Fresh user data from API:', data.user);

        // Cập nhật localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        // Cập nhật state
        setUser(data.user);

        // Trigger event
        window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: data.user } }));
      }
    } catch (error) {
      console.error('Profile: Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await config.get('/users/me');
        setUser(response.data.data);
        setError(null);
        console.log('Fetched user data:', response.data.data);
        console.log('User bio:', response.data.data.bio);
      } catch (error: unknown) {
        console.error('Error fetching user profile:', error);
        let errorMessage = 'Không thể tải thông tin người dùng';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number, data?: { message?: string } } };
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
    // Nếu có ?refresh=1 thì xóa nó khỏi URL sau khi fetch
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('refresh') === '1') {
      urlParams.delete('refresh');
      const newUrl = location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location.search]); // Re-fetch when location changes, refreshKey changes, or location key changes

  // Force refresh when coming back from edit page
  useEffect(() => {
    const handleFocus = () => {
      // Check if we're coming back from edit page
      if (location.pathname === '/profile') {
        setRefreshKey(prev => prev + 1);
      }
    };

    // Check if we're coming back from edit page via location state
    if (location.state?.from === 'edit') {
      setRefreshKey(prev => prev + 1);
      // Clear the state to prevent infinite refresh
      window.history.replaceState({}, document.title);
    }

    // Check if we're coming back from edit page via URL search params
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('refresh') === 'true') {
      setRefreshKey(prev => prev + 1);
      // Remove the refresh parameter from URL
      const newUrl = location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Check if location key changed (indicating navigation)
    if (location.key !== lastLocationKey) {
      setLastLocationKey(location.key);
      // If we're on profile page and location key changed, refresh data
      if (location.pathname === '/profile') {
        setRefreshKey(prev => prev + 1);
      }
    }

    // Custom event listener để cập nhật user data khi có thay đổi từ Header
    const handleUserUpdate = (event: CustomEvent) => {
      console.log('Profile: Received user-updated event', event.detail);
      if (event.detail && event.detail.user) {
        setUser(event.detail.user);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('user-updated', handleUserUpdate as EventListener);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('user-updated', handleUserUpdate as EventListener);
    };
  }, [location.pathname, location.state, location.search, location.key, lastLocationKey]);

  // Additional refresh trigger when component mounts or location changes
  useEffect(() => {
    // Refresh data when component mounts or when we're on profile page
    if (location.pathname === '/profile') {
      setRefreshKey(prev => prev + 1);
    }
  }, [location.pathname]);

  // Auto refresh user data nếu avatar không hợp lệ
  useEffect(() => {
    if (user && user.avatar && !user.avatar.includes('googleusercontent.com') && !user.avatar.startsWith('http')) {
      console.log('Profile: Invalid avatar detected, refreshing user data...');
      forceRefreshUser();
    }
  }, [user]);

  // Export debug functions to window for console access
  useEffect(() => {
    (window as any).debugAvatar = debugAvatar;
    (window as any).forceRefreshUser = debugForceRefreshUser;
    (window as any).profileForceRefresh = forceRefreshUser;
    (window as any).testAvatarLoading = testAvatarLoading;
    (window as any).clearCacheAndRefresh = clearCacheAndRefresh;
    (window as any).testAllAvatarFunctions = testAllAvatarFunctions;
    (window as any).autoFixAvatar = autoFixAvatar;
  }, []);

  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
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
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-ping"></div>
          </motion.div>
          <motion.p
            className="mt-6 text-gray-600 font-medium text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Đang tải thông tin cá nhân...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-red-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <motion.div
              className="text-4xl mb-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ⚠️
            </motion.div>
            <div className="text-xl text-red-600 mb-6 font-semibold">{error}</div>
            <motion.button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
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
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        >
          {/* Avatar & Basic Info Section */}
          <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 text-center">
              <motion.div
                className="relative inline-block mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-32 h-32 rounded-full p-2 bg-white/20 backdrop-blur-sm mx-auto shadow-2xl">
                  <img
                    src={user?.avatar && user.avatar !== 'default-avatar.jpg' && user.avatar !== '' && (user.avatar.includes('googleusercontent.com') || user.avatar.startsWith('http')) ? user.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullname || '') + '&background=4f8cff&color=fff&size=256'}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-white/30"
                  />
                </div>
                <motion.div
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-3 border-white flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </motion.div>
              </motion.div>

              <motion.h2
                className="text-3xl font-bold mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {user?.fullname ?? 'Chưa có tên'}
              </motion.h2>

              {user?.nickname && (
                <motion.p
                  className="text-blue-100 text-lg font-mono mb-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  @{user?.nickname}
                </motion.p>
              )}

              <motion.div
                className="flex items-center justify-center gap-2 text-blue-100 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Mail size={18} />
                <span className="text-base">{user?.email ?? ''}</span>
              </motion.div>

              {/* Role Badge */}
              {user?.role?.name && (
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <Award size={16} />
                  {user.role.name === 'instructor' ? 'Giảng viên' : 
                   user.role.name === 'admin' ? 'Quản trị viên' : 
                   user.role.name === 'moderator' ? 'Điều hành viên' : 'Học viên'}
                </motion.div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Bio Section */}
            {user?.bio && (
              <motion.div
                className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Giới thiệu
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {user.bio}
                  </p>
                </motion.div>
              )}

            {/* Social Links */}
              {user?.social_links && (user?.social_links?.facebook || user?.social_links?.github || user?.social_links?.website) && (
                <motion.div
                className="mb-8"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Globe size={20} className="text-blue-600" />
                  Liên kết mạng xã hội
                </h3>
                <div className="flex gap-4">
                  {user?.social_links?.facebook && (
                    <motion.a 
                      href={user.social_links.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.326v-21.349c0-.734-.593-1.326-1.324-1.326z" />
                      </svg>
                      Facebook
                    </motion.a>
                  )}
                  {user?.social_links?.github && (
                    <motion.a 
                      href={user.social_links.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576 4.765-1.588 8.199-6.084 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </motion.a>
                  )}
                  {user?.social_links?.website && (
                    <motion.a 
                      href={user.social_links.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Globe size={16} />
                      Website
                    </motion.a>
                  )}
                </div>
                </motion.div>
              )}

            {/* Instructor Information */}
            {user?.role?.name === 'instructor' && (
              <motion.div
                className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-green-600" />
                  Thông tin giảng viên
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Chuyên môn:</span>
                    {user?.instructorInfo?.specializations && user.instructorInfo.specializations.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.instructorInfo.specializations.map((spec, idx) => (
                          <span key={idx} className="inline-block bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                    ) : (
                      <span className="text-gray-500 ml-2">Chưa cập nhật</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Kinh nghiệm giảng dạy:</span>
                    <span className="text-gray-600 ml-2">
                      {typeof user?.instructorInfo?.experience_years === 'number' ? user.instructorInfo.experience_years : 'Chưa cập nhật'} năm
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Giới thiệu:</span>
                    <p className="text-gray-600 mt-1">
                      {user?.instructorInfo?.teaching_experience?.description ? user.instructorInfo.teaching_experience.description : 'Không có mô tả'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats Section */}
            <motion.div
              className="mb-8"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold mb-1">{user?.followers_count ?? 0}</div>
                  <div className="text-blue-100 text-sm">Người theo dõi</div>
                </motion.div>
                <motion.div
                  className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold mb-1">{user?.following_count ?? 0}</div>
                  <div className="text-green-100 text-sm">Đang theo dõi</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Join Date Section */}
            {joinInfo && (
              <motion.div
                className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <div className="flex items-center justify-center gap-3 text-gray-600">
                  <Clock size={20} className="text-blue-600" />
                  <span className="text-base">Tham gia {joinInfo.timeAgo}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;