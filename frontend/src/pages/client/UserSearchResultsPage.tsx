import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Typography, Pagination, Spin, Empty, Card, Avatar, Rate, Badge, Tag, Select } from 'antd';
import { UserOutlined, TeamOutlined, StarFilled, TrophyOutlined, GlobalOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './InstructorsPage.css';
import { config } from '../../api/axios';

const { Content } = Layout;
const { Title, Text } = Typography;

interface Instructor {
  id: string;
  slug?: string;
  fullname: string;
  avatar?: string;
  bio?: string;
  rating?: number;
  totalStudents?: number;
  totalCourses?: number;
  totalReviews?: number;
  experienceYears?: number;
  expertise?: string[];
  isVerified?: boolean;
  isFeatured?: boolean;
  isOnline?: boolean;
  location?: string;
  education?: Array<{ degree: string }>;
  approvalStatus?: string;
  role?: string;
  enrolledCourses?: number;
  followers_count?: number;
}

const InstructorCard = ({ instructor }: { instructor: Instructor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -8, scale: 1.04, boxShadow: '0 12px 32px rgba(24,144,255,0.18)' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ cursor: 'pointer', transition: 'box-shadow 0.3s, transform 0.3s' }}
      onClick={() => navigate(`/users/${instructor.slug || instructor.id}`)}
    >
      <Card
        className="h-full instructor-card border-0 shadow-xl rounded-3xl transition-all duration-300"
        style={{
          background: isHovered ? 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)' : '#fff',
          boxShadow: isHovered ? '0 12px 32px rgba(24,144,255,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 32,
          border: 'none',
        }}
        styles={{ body: { padding: 28 } }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar
                size={88}
                src={instructor.avatar}
                icon={<UserOutlined />}
                style={{
                  border: isHovered ? '4px solid #1890ff' : '4px solid #e0e7ef',
                  boxShadow: isHovered ? '0 0 0 6px #bae6fd' : 'none',
                  transition: 'all 0.3s',
                  background: '#fff',
                }}
              />
              {instructor.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Title level={4} className="!mb-1 !text-lg !font-bold text-blue-700">{instructor.fullname}</Title>
                {instructor.isVerified && (
                  <Badge count={<TrophyOutlined style={{ color: '#faad14' }} />} />
                )}
                {instructor.isFeatured && (
                  <Badge count={<StarFilled style={{ color: '#ff4d4f' }} />} />
                )}
              </div>
              <Text type="secondary" className="text-sm">
                  {instructor.role === 'instructor'
                    ? 'Giảng viên'
                    : instructor.role === 'student'
                    ? 'Học viên'
                    : instructor.role === 'admin'
                    ? 'Quản trị viên'
                    : 'Người dùng'}
                </Text>           
              </div>
          </div>
        </div>
        <div className="mb-4">
          <Text className="text-sm text-gray-600 line-clamp-3">{instructor.bio || 'Chưa có thông tin giới thiệu'}</Text>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Rate disabled allowHalf defaultValue={instructor.rating || 0} style={{ fontSize: 16 }} />
            <Text strong className="text-base text-blue-600">{instructor.rating || 0}</Text>
            <Text type="secondary" className="text-xs">({instructor.totalReviews || 0} đánh giá)</Text>
          </div>
          <div className="flex items-center space-x-1">
            <TeamOutlined className="text-blue-500" />
            <Text className="text-sm">{instructor.totalStudents || 0}</Text>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {instructor.role === 'student' ? (
            <>
              <div className="text-center p-2 bg-blue-50 rounded-xl">
                <div className="text-lg font-bold text-blue-600">{instructor.enrolledCourses || 0}</div>
                <Text className="text-xs">Khóa học đã đăng ký</Text>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-xl">
                <div className="text-lg font-bold text-green-600">{instructor.followers_count || 0}</div>
                <Text className="text-xs">Người theo dõi</Text>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-2 bg-blue-50 rounded-xl">
                <div className="text-lg font-bold text-blue-600">{instructor.totalCourses || 0}</div>
                <Text className="text-xs">Khóa học</Text>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-xl">
                <div className="text-lg font-bold text-green-600">{instructor.experienceYears || 0}</div>
                <Text className="text-xs">Năm KN</Text>
              </div>
            </>
          )}
        </div>
        <div className="mb-2">
          <Text strong className="text-sm mb-2 block">Chuyên môn:</Text>
          <div className="flex flex-wrap gap-1">
            {instructor.expertise && instructor.expertise.length > 0 ? (
              <>
                {instructor.expertise.slice(0, 3).map((spec, index) => (
                  <Tag key={index} color="blue" className="text-xs rounded-full px-2 py-1">{spec}</Tag>
                ))}
                {instructor.expertise.length > 3 && (
                  <Tag color="default" className="text-xs rounded-full px-2 py-1">+{instructor.expertise.length - 3}</Tag>
                )}
              </>
            ) : (
              <Text type="secondary" className="text-xs">Chưa cập nhật</Text>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center space-x-1">
            <GlobalOutlined className="text-gray-400" />
            <Text type="secondary">{instructor.location || 'Chưa cập nhật'}</Text>
          </div>
          <div className="flex items-center space-x-1">
            <BookOutlined className="text-gray-400" />
            <Text type="secondary">
              {Array.isArray(instructor.education) && instructor.education.length > 0
                ? instructor.education.map(edu => edu.degree).sort((a, b) => {
                  const order = ['Tiến sĩ', 'Thạc sĩ', 'Cử nhân', 'Kỹ sư', 'Khác'];
                  return order.indexOf(a) - order.indexOf(b);
                })[0]
                : 'Chưa cập nhật'}
            </Text>
          </div>
        </div>
        
      </Card>
    </motion.div>
  );
};

const UserSearchResultsPage = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0
  });
  const instructorsPerPage = 8;
  const location = useLocation();
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Lấy search term từ query string khi trang được mở hoặc URL thay đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    setSearchTerm(search);
    setCurrentPage(1);
  }, [location.search]);

  // Fetch instructors from API
  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: instructorsPerPage
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (roleFilter && roleFilter !== '') {
        params.role = roleFilter;
      }
      const response = await config.get('/users/search', { params });
      const data = response.data.data;
      // Debug: log dữ liệu user trả về từ API
      console.log('API /users/search data:', data.users);
      // Map API response to our interface
      const mappedInstructors = data.users.map((instructor: any) => ({
        id: instructor.id || instructor._id,
        slug: instructor.slug,
        fullname: instructor.fullname,
        avatar: instructor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.fullname}`,
        bio: instructor.bio || 'Chưa có thông tin giới thiệu',
        rating: instructor.rating || 0,
        totalStudents: instructor.totalStudents || 0,
        totalCourses: instructor.totalCourses || 0,
        totalReviews: instructor.totalReviews || 0,
        experienceYears: instructor.experienceYears || 0,
        expertise: instructor.expertise || [],
        isVerified: true, // Tất cả đều đã được duyệt
        isFeatured: instructor.isFeatured || false,
        isOnline: instructor.isOnline || false,
        location: instructor.location || 'Chưa cập nhật',
        education: Array.isArray(instructor.education)
          ? instructor.education.map((edu: any) => ({ degree: edu.degree }))
          : [],
        approvalStatus: instructor.approvalStatus || 'approved',
        role: (instructor.role_id && instructor.role_id.name) ? instructor.role_id.name : (instructor.role || 'user'),
        enrolledCourses: instructor.enrolledCourses || 0,
        followers_count: instructor.followers_count || 0,
      }));
      setInstructors(mappedInstructors);
      setPagination(data.pagination);
    } catch (error) {
      setInstructors([]);
      setPagination({ total: 0, page: 1, limit: instructorsPerPage, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
    // eslint-disable-next-line
  }, [currentPage, searchTerm, roleFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
  };

  return (
    <Layout>
      <Content className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <motion.div
          className="w-full"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <Title level={2} className="!mb-0">Người dùng ({pagination.total})</Title>
            <div className="w-full md:w-auto flex justify-end">
              <Select
                value={roleFilter}
                onChange={value => setRoleFilter(value)}
                style={{ minWidth: 180 }}
                options={[
                  { value: '', label: 'Tất cả vai trò' },
                  { value: 'student', label: 'Học viên' },
                  { value: 'instructor', label: 'Giảng viên' },
                  { value: 'admin', label: 'Quản trị viên' },
                ]}
                placeholder="Lọc theo vai trò"
              />
            </div>
          </motion.div>

          {loading ? (
            <div className="text-center py-16">
              <Spin size="large" />
              <div className="mt-4 text-blue-600 font-semibold animate-pulse">Đang tải danh sách người dùng...</div>
            </div>
          ) : instructors.length > 0 ? (
            <motion.div variants={containerVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2 md:px-6 lg:px-8">
                {instructors.map(instructor => (
                  <div className="instructor-card-wrapper" key={instructor.id}>
                    <InstructorCard instructor={instructor} />
                  </div>
                ))}
              </div>
              <motion.div variants={itemVariants} className="text-center mt-10">
                <div className="inline-block px-6 py-4 bg-white rounded-2xl shadow-lg border border-blue-200 custom-pagination">
                  <Pagination
                    current={currentPage}
                    total={pagination.total}
                    pageSize={instructorsPerPage}
                    onChange={page => setCurrentPage(page)}
                    showSizeChanger={false}
                    className="custom-pagination"
                  />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserOutlined className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy giảng viên
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi từ khóa tìm kiếm khác
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </Content>
    </Layout>
  );
};

export default UserSearchResultsPage; 