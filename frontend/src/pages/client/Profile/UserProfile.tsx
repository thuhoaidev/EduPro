import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Modal, List, Avatar, message, Card, List as AntList, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, DownOutlined, UpOutlined, MessageOutlined, UserDeleteOutlined, UserAddOutlined, MoreOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { getToken, isTokenValid } from '../../../utils/tokenUtils';
import { EventEmitter } from '../../../utils/eventEmitter';

// Tạo instance axios riêng cho file này
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
// Interceptor tự động gắn token
api.interceptors.request.use((request) => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  return request;
}, (error) => Promise.reject(error));

interface User {
  _id: string;
  avatar?: string;
  fullname: string;
  nickname?: string;
  email: string;
  bio?: string;
  created_at?: string;
  followers_count?: number;
  following_count?: number;
  social_links?: {
    facebook?: string;
    github?: string;
    website?: string;
  };
  role?: { name: string };
}

interface Course {
  _id: string;
  title: string;
  thumbnail?: string;
  price?: number;
  finalPrice?: number;
  rating?: number;
  totalReviews?: number;
  slug?: string;
  level?: string;
  lessons_count?: number; // Added for new logic
}

function isAxiosErrorWithMessage(err: unknown): err is { response: { data: { message: string } } } {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as { response?: unknown }).response === 'object' &&
    (err as { response?: unknown }).response !== null
  ) {
    const response = (err as { response: unknown }).response;
    if (
      typeof response === 'object' &&
      response !== null &&
      'data' in response &&
      typeof (response as { data?: unknown }).data === 'object' &&
      (response as { data: unknown }).data !== null
    ) {
      const data = (response as { data: unknown }).data;
      return (
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof (data as { message?: unknown }).message === 'string'
      );
    }
  }
  return false;
}

const UserProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following] = useState<User[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(getToken() && isTokenValid()));

  useEffect(() => {
    const handleStorage = () => {
      const valid = Boolean(getToken() && isTokenValid());
      setIsLoggedIn(valid);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const valid = Boolean(getToken() && isTokenValid());
    setIsLoggedIn(valid);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/users/slug/${slug}`);
        setUser(res.data.data);
        setCreatedCourses(res.data.data.createdCourses || []);
        setEnrolledCourses(res.data.data.enrolledCourses || []);
      } catch {
        // nothing
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [slug]);

  useEffect(() => {
    if (!isLoggedIn) return;
    // Lấy user hiện tại để kiểm tra trạng thái follow
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/api/users/me');
        setCurrentUserId(res.data.data._id);
      } catch {
        // nothing
      }
    };
    fetchCurrentUser();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!user) return;
    const fetchFollowers = async () => {
      try {
        const res = await api.get(`/api/users/${user._id}/followers`);
        setFollowers(res.data.data);
        // Nếu đã đăng nhập, kiểm tra trạng thái follow
        if (isLoggedIn && currentUserId) {
          setIsFollowing(res.data.data.some((u: User) => u._id === currentUserId));
        }
      } catch {
        // nothing
      }
    };
    fetchFollowers();
  }, [user, isLoggedIn, currentUserId]);

  useEffect(() => {
    if (currentUserId && user && currentUserId === user._id) {
      navigate('/profile', { replace: true });
    }
  }, [currentUserId, user, navigate]);

  const handleFollow = async () => {
    try {
      await api.post(`/api/users/${user?._id}/follow`);
      setIsFollowing(true);
      setFollowers(prev => [...prev, { ...user!, _id: currentUserId! }]);
      message.open({
        content: (
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400">
              <UserAddOutlined className="text-white text-xl" />
            </span>
            <div>
              <div className="font-bold text-base text-blue-700">Đã theo dõi</div>
              <div className="text-xs text-gray-500">Bạn sẽ nhận được cập nhật mới từ người này.</div>
            </div>
          </div>
        ),
        duration: 2,
        className: 'custom-follow-message',
        style: { boxShadow: '0 4px 24px 0 rgba(80,80,180,0.10)', borderRadius: 16, padding: 12 }
      });
      
      // Emit event để các component khác biết có thay đổi follow status
      EventEmitter.emitFollowStatusChanged({ targetUserId: user?._id, action: 'follow' });
    } catch (err: unknown) {
      const msg = isAxiosErrorWithMessage(err)
        ? err.response.data.message
        : 'Theo dõi thất bại';
      message.error(msg);
    }
  };

  const handleUnfollow = async () => {
    if (!user || !currentUserId) return;
    try {
      await api.delete(`/api/users/${user._id}/follow`);
      setIsFollowing(false);
      setFollowers(prev => prev.filter(u => u._id !== currentUserId));
      message.open({
        content: (
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-purple-400">
              <UserDeleteOutlined className="text-white text-xl" />
            </span>
            <div>
              <div className="font-bold text-base text-pink-700">Đã bỏ theo dõi</div>
              <div className="text-xs text-gray-500">Bạn sẽ không nhận được cập nhật mới từ người này.</div>
            </div>
          </div>
        ),
        duration: 2,
        className: 'custom-follow-message',
        style: { boxShadow: '0 4px 24px 0 rgba(180,80,180,0.10)', borderRadius: 16, padding: 12 }
      });
      // Emit event để các component khác biết có thay đổi follow status
      EventEmitter.emitFollowStatusChanged({ targetUserId: user._id, action: 'unfollow' });
    } catch {
      message.error('Bỏ theo dõi thất bại');
    }
  };

  // Menu items cho dropdown
  const menuItems: MenuProps['items'] = [
    {
      key: 'message',
      label: (
        <div className="flex items-center gap-4 px-2 py-2 font-semibold text-base cursor-pointer transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group rounded-lg">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
            <MessageOutlined className="text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text" />
          </span>
          <span className="text-gray-900">Nhắn tin</span>
        </div>
      ),
      onClick: () => navigate(`/messages/${user?._id}`)
    },
    {
      key: 'unfollow',
      label: (
        <div className="flex items-center gap-4 px-2 py-2 font-semibold text-base cursor-pointer transition-all hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 group rounded-lg">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-pink-100 to-purple-100 group-hover:from-pink-200 group-hover:to-purple-200 transition-all">
            <UserDeleteOutlined className="text-lg bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text" />
          </span>
          <span className="text-red-600">Bỏ theo dõi</span>
        </div>
      ),
      onClick: handleUnfollow
    }
  ];

  if (loading) return <div>Đang tải...</div>;
  if (!user) return <div>Không tìm thấy người dùng.</div>;

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left: Thông tin cá nhân */}
        <div className="md:w-1/3 w-full flex flex-col items-center bg-white rounded-3xl shadow-2xl p-8 self-start border border-blue-100">
          {/* Avatar lớn, viền gradient động */}
          <div className="relative mb-6 group">
            <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 animate-gradient-spin shadow-xl group-hover:scale-105 transition-transform duration-300">
              <Avatar
                size={144}
                src={user.avatar}
                icon={<UserOutlined />}
                className="w-full h-full rounded-full border-4 border-white shadow"
                style={{ fontSize: 56, background: '#fff' }}
              >
                {user.fullname[0]}
              </Avatar>
            </div>
            {/* Hiệu ứng online */}
            <span className="absolute bottom-4 right-4 w-5 h-5 bg-green-400 border-4 border-white rounded-full shadow"></span>
          </div>
          {/* Tên và nickname */}
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1 text-center">{user.fullname}</h2>
          {user.nickname && <div className="text-blue-400 text-lg font-mono mb-2">@{user.nickname}</div>}
          <div className="mb-3 text-gray-500 text-center text-base font-light max-w-xl">{user.bio}</div>
          {/* Social links */}
          {user.social_links && (user.social_links.facebook || user.social_links.github || user.social_links.website) && (
            <div className="flex gap-4 justify-center mb-4">
              {user.social_links.facebook && (
                <a href={user.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:scale-110 transition-transform text-2xl"><i className="fab fa-facebook"></i></a>
              )}
              {user.social_links.github && (
                <a href={user.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:scale-110 transition-transform text-2xl"><i className="fab fa-github"></i></a>
              )}
              {user.social_links.website && (
                <a href={user.social_links.website} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:scale-110 transition-transform text-2xl"><BookOutlined /></a>
              )}
            </div>
          )}
          {/* Stats */}
          <div className="flex gap-8 justify-center mb-6">
            <div className="flex flex-col items-center bg-blue-50 rounded-xl px-4 py-2 shadow">
              <TeamOutlined className="text-blue-400 text-2xl mb-1" />
              <span className="font-bold text-lg text-blue-700">{followers.length}</span>
              <span className="text-xs text-gray-500">Người theo dõi</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-xl px-4 py-2 shadow">
              <TeamOutlined className="text-green-400 text-2xl mb-1" />
              <span className="font-bold text-lg text-green-700">{user.following_count ?? 0}</span>
              <span className="text-xs text-gray-500">Đang theo dõi</span>
            </div>
          </div>
          {/* Nút theo dõi/hủy theo dõi và nhắn tin */}
          {isLoggedIn && currentUserId && currentUserId !== user._id && (
            isFollowing ? (
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                overlayClassName="!p-0 !bg-transparent !border-0"
                placement="bottomRight"
              >
                <Button
                  shape="round"
                  size="large"
                  className="ml-4 px-7 py-2 font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl border-0 hover:scale-105 hover:shadow-2xl transition-all duration-200 flex items-center gap-2"
                  icon={<MoreOutlined className="text-xl" />}
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6 0%, #a78bfa 100%)',
                    color: '#fff',
                  }}
                >
                  Tùy chọn
                </Button>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                shape="round"
                size="large"
                className="ml-4 px-7 py-2 font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl border-0 hover:scale-105 hover:shadow-2xl transition-all duration-200 flex items-center gap-2"
                icon={<UserAddOutlined className="text-xl" />}
                onClick={handleFollow}
                style={{
                  background: 'linear-gradient(90deg, #ec4899 0%, #a78bfa 100%)',
                  color: '#fff',
                }}
              >
                Theo dõi
              </Button>
            )
          )}
        </div>
        {/* Right: Khóa học đã tạo & đã tham gia */}
        <div className="md:w-2/3 w-full flex flex-col gap-10">
          {/* Khóa học đã tạo */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOutlined className="text-white text-sm" />
              </div>
              Khóa học đã tạo
            </h3>
            {createdCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                  <BookOutlined className="text-3xl text-blue-500" />
                </div>
                <div className="text-gray-500 text-lg font-medium mb-2">Chưa có khóa học nào</div>
                <div className="text-gray-400 text-sm">Bắt đầu tạo khóa học đầu tiên của bạn</div>
              </div>
            ) : (
              <div className="relative">
                {/* Container với scroll ngang */}
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-6 pb-6" style={{ minWidth: 'max-content' }}>
                    {createdCourses.map((course, idx) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 flex-shrink-0 border border-gray-100 overflow-hidden cursor-pointer"
                        style={{ width: '320px' }}
                        onClick={() => {
                          // Debug: log thông tin course
                          console.log('Course data:', course);
                          console.log('Course slug:', course.slug);
                          console.log('Course _id:', course._id);
                          
                          // Sử dụng slug nếu có, nếu không thì sử dụng id với format /courses/id/id
                          const courseUrl = course.slug ? `/courses/${course.slug}` : `/courses/id/${course._id}`;
                          console.log('Generated URL:', courseUrl);
                          window.open(courseUrl, '_blank');
                        }}
                      >
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                        
                        {/* Image container */}
                        <div className="relative overflow-hidden">
                          <img
                            alt={course.title}
                            src={course.thumbnail || '/default-course.jpg'}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                          
                          {/* Price badge */}
                          <div className="absolute top-4 right-4">
                            <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                              <span className="text-sm font-semibold text-gray-800">
                                {course.finalPrice ? `${course.finalPrice.toLocaleString()}₫` : 'Miễn phí'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Rating badge */}
                          <div className="absolute bottom-4 left-4">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-3 h-3 ${i < (course.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs font-medium text-gray-700">
                                {course.rating || 0} ({course.totalReviews || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5 relative z-20">
                          <h3 className="font-bold text-xl text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                            {course.title}
                          </h3>
                          
                          {/* Course stats */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span className="font-medium text-gray-700">{course.lessons_count || 12} bài học</span>
                            </div>
                            <button 
                              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-gray-200 hover:border-blue-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isLoggedIn) {
                                  // Logic thêm vào giỏ hàng sẽ được thêm ở đây
                                  message.success('Đã thêm khóa học vào giỏ hàng');
                                } else {
                                  navigate('/login');
                                }
                              }}
                              title={isLoggedIn ? "Thêm vào giỏ hàng" : "Đăng nhập để thêm vào giỏ hàng"}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Hover effect border */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-500"></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Thanh scroll tùy chỉnh */}
                <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 shadow-sm"
                    style={{ 
                      width: `${Math.min(100, (createdCourses.length * 320) / (window.innerWidth * 0.6) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center mb-4">
                <BookOutlined className="text-3xl text-green-500" />
              </div>
              <div className="text-gray-500 text-lg font-medium mb-2">Chưa tham gia khóa học nào</div>
              <div className="text-gray-400 text-sm">Khám phá và đăng ký khóa học đầu tiên</div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                  <BookOutlined className="text-white text-sm" />
                </div>
                Khóa học đã tham gia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course, idx) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden cursor-pointer"
                    onClick={() => window.open(`/courses/${course.slug || course._id}`, '_blank')}
                  >
                    {/* Image container */}
                    <div className="relative overflow-hidden">
                      <img
                        alt={course.title}
                        src={course.thumbnail || '/default-course.jpg'}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      
                      {/* Progress badge */}
                      <div className="absolute top-3 left-3">
                        <div className="px-2.5 py-1 bg-green-500/90 backdrop-blur-sm rounded-full shadow-lg">
                          <span className="text-xs font-semibold text-white">Đang học</span>
                        </div>
                      </div>
                      
                      {/* Price badge */}
                      <div className="absolute top-3 right-3">
                        <div className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                          <span className="text-xs font-semibold text-gray-800">
                            {course.finalPrice ? `${course.finalPrice.toLocaleString()}₫` : 'Miễn phí'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors duration-300 leading-tight">
                        {course.title}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3 h-3 ${i < (course.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {course.rating || 0} ({course.totalReviews || 0} đánh giá)
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Tiến độ học tập</span>
                          <span>65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                      
                      {/* Action button */}
                      <button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Tiếp tục học
                      </button>
                    </div>
                    
                    {/* Hover effect border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-green-200 transition-all duration-500"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal followers */}
      <Modal open={showFollowers} onCancel={() => setShowFollowers(false)} footer={null} title="Người theo dõi">
        <List
          dataSource={followers}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Link to={`/users/${item._id}`}>
                    <Avatar src={item.avatar}>{item.fullname[0]}</Avatar>
                  </Link>
                }
                title={<Link to={`/users/${item._id}`}>{item.fullname}</Link>}
                description={item.nickname ? `@${item.nickname}` : ''}
              />
            </List.Item>
          )}
        />
      </Modal>
      {/* Modal following */}
      <Modal open={showFollowing} onCancel={() => setShowFollowing(false)} footer={null} title="Đang theo dõi">
        <List
          dataSource={following}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Link to={`/users/${item._id}`}>
                    <Avatar src={item.avatar}>{item.fullname[0]}</Avatar>
                  </Link>
                }
                title={<Link to={`/users/${item._id}`}>{item.fullname}</Link>}
                description={item.nickname ? `@${item.nickname}` : ''}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default UserProfile;
