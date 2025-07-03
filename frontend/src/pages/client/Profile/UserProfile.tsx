import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { config } from '../../../api/axios';
import { Button, Modal, List, Avatar, message, Card, List as AntList } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import CourseCard from '../../../components/course/CourseCard';
import { motion, AnimatePresence } from 'framer-motion';
import { getToken, isTokenValid, clearAuthData } from '../../../utils/tokenUtils';

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
  const [following, setFollowing] = useState<User[]>([]);
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
      if (!valid) {
        clearAuthData();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const valid = Boolean(getToken() && isTokenValid());
    setIsLoggedIn(valid);
    if (!valid) {
      clearAuthData();
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await config.get(`/users/slug/${slug}`);
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
        const res = await config.get('/users/me');
        setCurrentUserId(res.data.data._id);
      } catch {
        // nothing
      }
    };
    fetchCurrentUser();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !currentUserId || !user) return;
    const checkFollow = async () => {
      try {
        const res = await config.get(`/users/${user._id}/followers`);
        setFollowers(res.data.data);
        setIsFollowing(res.data.data.some((u: User) => u._id === currentUserId));
      } catch {
        // nothing
      }
    };
    checkFollow();
  }, [isLoggedIn, currentUserId, user]);

  useEffect(() => {
    if (currentUserId && user && currentUserId === user._id) {
      navigate('/profile', { replace: true });
    }
  }, [currentUserId, user, navigate]);

  const handleFollow = async () => {
    try {
      await config.post(`/users/${user?._id}/follow`);
      setIsFollowing(true);
      setFollowers(prev => [...prev, { ...user!, _id: currentUserId! }]);
      message.success('Đã theo dõi');
    } catch (err: unknown) {
      const msg = isAxiosErrorWithMessage(err)
        ? err.response.data.message
        : 'Theo dõi thất bại';
      message.error(msg);
    }
  };

  const handleUnfollow = async () => {
    try {
      await config.delete(`/users/${user?._id}/follow`);
      setIsFollowing(false);
      setFollowers(prev => prev.filter(u => u._id !== currentUserId));
      message.success('Đã bỏ theo dõi');
    } catch {
      message.error('Bỏ theo dõi thất bại');
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await config.get(`/users/${user?._id}/following`);
      setFollowing(res.data.data);
      setShowFollowing(true);
    } catch {
      // nothing
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!user) return <div>Không tìm thấy người dùng.</div>;

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left: Thông tin cá nhân */}
        {!showAllCourses && (
          <div className="md:w-1/3 w-full flex flex-col items-center bg-white rounded-3xl shadow-xl p-6 self-start">
            {/* Avatar lớn, viền gradient */}
            <div className="relative mb-4">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 p-1 shadow-lg">
                <Avatar
                  size={128}
                  src={user.avatar}
                  icon={<UserOutlined />}
                  className="w-full h-full rounded-full border-4 border-white shadow"
                  style={{ fontSize: 48, background: '#fff' }}
                >
                  {user.fullname[0]}
                </Avatar>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-1 text-gray-900 text-center">{user.fullname}</h2>
            {user.nickname && <div className="text-blue-500 text-lg mb-2">@{user.nickname}</div>}
            <div className="mb-3 text-gray-600 text-center max-w-xl">{user.bio}</div>
            {/* Social links */}
            {user.social_links && (user.social_links.facebook || user.social_links.github || user.social_links.website) && (
              <div className="flex flex-col gap-2 mb-3 w-full items-center">
                {user.social_links.facebook && (
                  <a href={user.social_links.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-base font-medium">
                    <i className="fab fa-facebook text-xl"></i>
                    <span>{user.social_links.facebook.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {user.social_links.github && (
                  <a href={user.social_links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-800 hover:text-black text-base font-medium">
                    <i className="fab fa-github text-xl"></i>
                    <span>{user.social_links.github.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {user.social_links.website && (
                  <a href={user.social_links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-base font-medium">
                    <BookOutlined className="text-xl" />
                    <span>{user.social_links.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            )}
            {/* Stats */}
            <div className="flex gap-8 mb-4">
              <button className="flex flex-col items-center" onClick={() => setShowFollowers(true)}>
                <span className="text-xl font-bold text-blue-600 flex items-center gap-1"><TeamOutlined />{followers.length}</span>
                <span className="text-xs text-gray-500">Người theo dõi</span>
              </button>
              <button className="flex flex-col items-center" onClick={fetchFollowing}>
                <span className="text-xl font-bold text-green-600 flex items-center gap-1"><TeamOutlined />{user.following_count ?? 0}</span>
                <span className="text-xs text-gray-500">Đang theo dõi</span>
              </button>
            </div>
            {/* Nút follow/unfollow */}
            {isLoggedIn && currentUserId && currentUserId !== user._id && (
              isFollowing ? (
                <Button danger shape="round" size="large" className="mb-2 px-8" onClick={handleUnfollow}>Bỏ theo dõi</Button>
              ) : (
                <Button type="primary" shape="round" size="large" className="mb-2 px-8" onClick={handleFollow}>Theo dõi</Button>
              )
            )}
          </div>
        )}
        {/* Right: Khóa học đã tạo & đã tham gia */}
        <div className="md:w-2/3 w-full flex flex-col gap-10">
          {createdCourses.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2"><BookOutlined />Khóa học </h3>
              <AnimatePresence initial={false}>
                <motion.div
                  key={showAllCourses ? 'all' : 'short'}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <AnimatePresence initial={false}>
                    {(showAllCourses ? createdCourses : createdCourses.slice(0, 3)).map((course, idx) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: idx * 0.07 }}
                      >
                        <CourseCard course={{
                          ...course,
                          Image: course.thumbnail || '',
                          reviews: course.totalReviews ?? 0,
                          price: course.finalPrice ?? course.price ?? 0,
                          oldPrice: course.price ?? 0,
                          isFree: (course.finalPrice ?? course.price ?? 0) === 0,
                          rating: course.rating ?? 0,
                          slug: course.slug || course._id,
                          id: course._id,
                          subtitle: '',
                          author: { name: '', avatar: '', bio: '' },
                          type: '',
                          duration: '',
                          lessons: 0,
                          status: '',
                          requirements: [],
                          hasDiscount: false,
                          language: '',
                        }} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
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
          )}
          {enrolledCourses.length > 0 && (
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