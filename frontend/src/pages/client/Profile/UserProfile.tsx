import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Modal, List, Avatar, message, Card, List as AntList, Dropdown } from 'antd';
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
      (response as { data?: unknown }).data !== null
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
  const [showAllCourses, setShowAllCourses] = useState(false);
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
                menu={
                  <motion.ul
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, type: 'spring' }}
                    className="rounded-2xl shadow-2xl bg-white/70 backdrop-blur-xl p-2 min-w-[220px] relative"
                    style={{
                      boxShadow: '0 8px 32px 0 rgba(80,80,180,0.13)',
                    }}
                  >
                    <li
                      className="flex items-center gap-4 px-5 py-4 rounded-xl font-semibold text-base cursor-pointer transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group"
                      onClick={() => navigate(`/messages/${user._id}`)}
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
                        <MessageOutlined className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text" />
                      </span>
                      <span className="text-gray-900">Nhắn tin</span>
                    </li>
                    <div className="my-1 h-[1px] bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-60" />
                    <li
                      className="flex items-center gap-4 px-5 py-4 rounded-xl font-semibold text-base cursor-pointer transition-all hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 group"
                      onClick={handleUnfollow}
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-pink-100 to-purple-100 group-hover:from-pink-200 group-hover:to-purple-200 transition-all">
                        <UserDeleteOutlined className="text-2xl bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text" />
                      </span>
                      <span className="text-red-600">Bỏ theo dõi</span>
                    </li>
                  </motion.ul>
                }
                trigger={['click']}
                overlayClassName="!p-0 !bg-transparent !border-0"
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
            <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2"><BookOutlined />Khóa học </h3>
            {createdCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <BookOutlined className="text-5xl text-gray-300 mb-4" />
                <div className="text-gray-400 text-lg font-medium">Chưa có khóa học nào.</div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                <motion.div
                  key={showAllCourses ? 'all' : 'short'}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence initial={false}>
                    {(showAllCourses ? createdCourses : createdCourses.slice(0, 3)).map((course, idx) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: idx * 0.07 }}
                        className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
                      >
                        <div className="relative">
                          <img
                            alt={course.title}
                            src={course.thumbnail || '/default-course.jpg'}
                            className="rounded-t-3xl h-40 object-cover group-hover:scale-105 transition-transform duration-300 w-full"
                          />
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{course.title}</h3>
                          <div className="text-sm text-gray-600">Giá: {course.finalPrice ? `${course.finalPrice.toLocaleString()}₫` : 'Miễn phí'}</div>
                          <div className="text-xs text-gray-500">Đánh giá: {course.rating || 0} ({course.totalReviews || 0} đánh giá)</div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            )}
            {createdCourses.length > 3 && (
              <div className="flex justify-center mt-4">
                <button
                  className="px-6 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition flex items-center gap-2 shadow-sm"
                  onClick={() => setShowAllCourses(v => !v)}
                >
                  {showAllCourses ? 'Thu gọn' : 'Xem thêm'}
                  {showAllCourses ? <UpOutlined /> : <DownOutlined />}
                </button>
              </div>
            )}
          </div>
          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOutlined className="text-5xl text-gray-300 mb-4" />
              <div className="text-gray-400 text-lg font-medium">Chưa tham gia khóa học nào.</div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2"><BookOutlined />Khóa học đã tham gia</h3>
              <AntList
                grid={{ gutter: 24, column: 2 }}
                dataSource={enrolledCourses}
                locale={{ emptyText: 'Chưa tham gia khóa học nào.' }}
                renderItem={course => (
                  <AntList.Item>
                    <Card
                      hoverable
                      cover={course.thumbnail ? <img alt={course.title} src={course.thumbnail} style={{ height: 140, objectFit: 'cover', borderRadius: 12 }} /> : null}
                      onClick={() => window.open(`/courses/${course.slug || course._id}`, '_blank')}
                      style={{ cursor: 'pointer', borderRadius: 20, boxShadow: '0 2px 12px rgba(16,185,129,0.08)' }}
                    >
                      <Card.Meta
                        title={<span className="font-semibold text-green-700">{course.title}</span>}
                        description={
                          <>
                            <div className="text-sm text-gray-600">Giá: {course.finalPrice ? `${course.finalPrice.toLocaleString()}₫` : 'Miễn phí'}</div>
                            <div className="text-xs text-gray-500">Đánh giá: {course.rating || 0} ({course.totalReviews || 0} đánh giá)</div>
                          </>
                        }
                      />
                    </Card>
                  </AntList.Item>
                )}
              />
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
