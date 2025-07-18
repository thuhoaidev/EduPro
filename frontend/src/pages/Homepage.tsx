import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Rate, Tag, Space, Tabs, Spin, message, Badge, Tooltip, Carousel, Avatar, Input, Select } from "antd";
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  PlayCircleOutlined,
  GiftOutlined,
  CopyOutlined,
  ClockCircleOutlined as ClockIcon,
  LeftOutlined,
  RightOutlined,
  FireOutlined,
  StarOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  CrownOutlined,
  HeartOutlined,
  AimOutlined,
  TeamOutlined,
  BookOutlined,
  SafetyOutlined,
  UserOutlined
} from "@ant-design/icons";
import "../styles/courseCard.css";
import "./Homepage.css";
import { courseService, type Course as ApiCourse } from '../services/apiService';
import CourseCard from '../components/course/CourseCard';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Course extends ApiCourse {
  _id: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface VoucherDisplay {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  category: string;
  isHot?: boolean;
  isNew?: boolean;
  isExpired: boolean;
  daysLeft: number;
  status?: 'available' | 'unavailable';
  statusMessage?: string;
}

interface CommentData {
  user?: {
    fullname?: string;
  };
  content?: string;
  rating?: number;
}

interface VoucherData {
  validFrom: string;
  validTo: string;
  usedCount: number;
  usageLimit: number;
  [key: string]: unknown;
}

interface Instructor {
  _id: string;
  fullname?: string;
  name?: string;
  avatar?: string;
  profilePicture?: string;
  specialty?: string;
  bio?: string;
  courseCount?: number;
  courses?: unknown[];
  studentCount?: number;
  students?: number;
}

interface Blog {
  _id: string;
  title: string;
  summary?: string;
  content?: string;
  thumbnail?: string;
  author?: {
    fullname?: string;
    avatar?: string;
  };
  createdAt?: string;
}

// Sửa CustomArrow để không truyền currentSlide, slideCount vào DOM
const CustomArrow = ({ children, ...rest }: {
  children: React.ReactNode;
  [key: string]: unknown;
}) => {
  // Loại bỏ currentSlide, slideCount khỏi props truyền vào span
  return <span {...rest}>{children}</span>;
};

const SectionWrapper = ({ children, style = {}, className = "" }: { children: React.ReactNode, style?: React.CSSProperties, className?: string }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
        hidden: { opacity: 0, y: 60 },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
};

function HomeSearchBar() {
  const [searchType, setSearchType] = useState('course');
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!keyword.trim()) return;
    if (searchType === 'user') {
      navigate(`/search/users?search=${encodeURIComponent(keyword)}`);
    } else {
      navigate(`/search/courses?search=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <motion.div 
      className="home-search-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <div className="search-wrapper">
        <div className="search-type-container">
          <Select 
            value={searchType} 
            onChange={setSearchType} 
            className="search-type-select"
            size="large"
            suffixIcon={<AimOutlined />}
          >
            <Option value="course">
              <BookOutlined /> Khóa học
            </Option>
            <Option value="user">
              <UserOutlined /> Người dùng
            </Option>
      </Select>
        </div>
        <div className="search-input-container">
      <Input
            placeholder="Nhập từ khóa tìm kiếm..."
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        onPressEnter={handleSearch}
            className="search-input"
        size="large"
            prefix={<SearchOutlined className="search-prefix-icon" />}
      />
        </div>
        <Button 
          type="primary" 
          size="large" 
          onClick={handleSearch}
          className="search-button"
          icon={<RocketOutlined />}
        >
          Tìm kiếm
        </Button>
    </div>
    </motion.div>
  );
}

const Homepage = () => {
  const [freeCourses, setFreeCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [paidCourses, setPaidCourses] = useState<Course[]>([]);
  const [vouchers, setVouchers] = useState<VoucherDisplay[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  // Thêm state cho instructors và blogs
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await courseService.getAllCourses() as Course[];
        setFreeCourses(coursesData.filter((course) => course.isFree === true));
        setPaidCourses(coursesData.filter((course) => course.isFree === false));
        
        const popular = [...coursesData]
          .sort((a, b) => b.reviews - a.reviews || b.rating - a.rating)
          .slice(0, 4);
        setPopularCourses(popular);
        
        const response = await fetch('http://localhost:5000/api/blogs/68547db672358427a53d9ece/comments');
        const commentsData = await response.json();
        if (Array.isArray(commentsData)) {
          const mappedTestimonials: Testimonial[] = commentsData.map((comment: CommentData) => ({
            name: comment.user?.fullname || 'Học viên',
            role: 'Sinh viên',
            content: comment.content || 'Khóa học rất hay!',
            rating: comment.rating || 5,
            avatar: `https://i.pravatar.cc/80?u=${comment.user?.fullname || 'user'}`
          }));
          setTestimonials(mappedTestimonials);
        } else {
          console.error('commentsData is not an array:', commentsData);
          setTestimonials([]);
        }
        
        try {
          const vouchersResponse = await fetch('http://localhost:5000/api/vouchers');
          if (vouchersResponse.ok) {
            const vouchersData = await vouchersResponse.json();
            const processedVouchers = vouchersData.map((voucher: VoucherData) => {
              const now = new Date();
              const validTo = new Date(voucher.validTo);
              const isExpired = now > validTo;
              const daysLeft = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              return {
                ...voucher,
                isExpired,
                daysLeft: isExpired ? 0 : daysLeft,
                status: isExpired || voucher.usedCount >= voucher.usageLimit ? 'unavailable' : 'available',
                statusMessage: isExpired ? 'Đã hết hạn' : voucher.usedCount >= voucher.usageLimit ? 'Hết voucher' : 'Có thể sử dụng'
              };
            });
            setVouchers(processedVouchers);
          }
        } catch (voucherError) {
          console.error('Error fetching vouchers:', voucherError);
        }
        // Fetch instructors
        try {
          const res = await fetch('http://localhost:5000/api/users?role=instructor&limit=4');
          if (res.ok) {
            const data = await res.json();
            setInstructors(data.data || []);
          }
        } catch (err) {
          console.error('Error fetching instructors:', err);
        }
        // Fetch blogs
        try {
          const res = await fetch('http://localhost:5000/api/blogs?sort=popular&limit=4');
          if (res.ok) {
            const data = await res.json();
            setBlogs(data.data || []);
          }
        } catch (err) {
          console.error('Error fetching blogs:', err);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEnrollments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setEnrolledCourseIds([]);
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/users/me/enrollments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const ids = (data.data || []).map((enroll: { course: { _id?: string; id?: string } }) => enroll.course?._id || enroll.course?.id);
          setEnrolledCourseIds(ids);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      }
    };

    fetchData();
    fetchEnrollments();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã ${code}!`);
  };

  const formatDiscount = (voucher: VoucherDisplay) => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discount}%`;
    }
    return `${voucher.discount.toLocaleString()}đ`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large">
          <div className="loading-content">
            <ThunderboltOutlined className="loading-icon" />
            <div>Đang tải dữ liệu...</div>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-pattern"></div>
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
        <Row justify="center">
          <Col xs={22} md={18} lg={14}>
              <motion.div 
                className="hero-text"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <div className="hero-badge">
                  <ThunderboltOutlined className="badge-icon" />
                  <span>Nền tảng học tập hàng đầu Việt Nam</span>
                </div>
                <Title level={1} className="hero-title">
                  Nâng tầm kỹ năng với <span className="gradient-text">EduPro</span>
                </Title>
                <Paragraph className="hero-subtitle">
                  Trang bị cho bạn những kỹ năng cần thiết trong thế giới số. 
                  Bắt đầu hành trình chinh phục công nghệ cùng đội ngũ chuyên gia hàng đầu.
                </Paragraph>
                <Space size="large" className="hero-buttons">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      type="primary" 
                      size="large" 
                      className="hero-primary-btn"
                      onClick={() => navigate('/courses')}
                      icon={<RocketOutlined />}
                    >
                    Khám phá khóa học
                </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      ghost 
                      size="large" 
                      className="hero-secondary-btn"
                      icon={<PlayCircleOutlined />}
                    >
                      Xem giới thiệu
                </Button>
                  </motion.div>
                </Space>
            </motion.div>
          </Col>
        </Row>
      </div>
        
        {/* Search Bar */}
        <HomeSearchBar />
      </section>

      {/* Stats Section */}
      <SectionWrapper className="stats-section">
        <div className="section-header">
          <div className="section-badge">
            <RiseOutlined className="badge-icon" />
            <span>Thống kê ấn tượng</span>
          </div>
          <Title level={2} className="section-title">Những con số nổi bật</Title>
          <Text className="section-subtitle">Thể hiện sự tin tưởng và thành công của cộng đồng EduPro</Text>
        </div>
        <div className="modern-stats-grid">
          {/* Học viên */}
          <div className="modern-stat-card">
            <div className="modern-stat-icon" style={{background: 'linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)'}}>
              <TeamOutlined />
            </div>
            <div className="modern-stat-label">Học viên</div>
            <div className="modern-stat-value gradient-blue">1,200<span className="modern-stat-plus">+</span></div>
          </div>
          {/* Khóa học */}
          <div className="modern-stat-card">
            <div className="modern-stat-icon" style={{background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)'}}>
              <BookOutlined />
            </div>
            <div className="modern-stat-label">Khóa học</div>
            <div className="modern-stat-value gradient-green">50<span className="modern-stat-plus">+</span></div>
          </div>
          {/* Giảng viên */}
          <div className="modern-stat-card">
            <div className="modern-stat-icon" style={{background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)'}}>
              <CrownOutlined />
            </div>
            <div className="modern-stat-label">Giảng viên</div>
            <div className="modern-stat-value gradient-orange">12<span className="modern-stat-plus">+</span></div>
          </div>
          {/* Đánh giá */}
          <div className="modern-stat-card">
            <div className="modern-stat-icon" style={{background: 'linear-gradient(135deg, #f472b6 0%, #f87171 100%)'}}>
              <HeartOutlined />
            </div>
            <div className="modern-stat-label">Đánh giá</div>
            <div className="modern-stat-value gradient-pink">4.9/5</div>
          </div>
        </div>
      </SectionWrapper>

      {/* Vouchers Section */}
      <SectionWrapper className="vouchers-section">
        <div className="section-header">
          <div className="section-badge">
            <GiftOutlined className="badge-icon" />
            <span>Ưu đãi đặc biệt</span>
          </div>
          <Title level={2} className="section-title">
            Mã giảm giá hấp dẫn
          </Title>
          <Text className="section-subtitle">Đừng bỏ lỡ các ưu đãi đặc biệt từ EduPro!</Text>
        </div>

        <Row gutter={[24, 24]} className="vouchers-grid">
          {vouchers.map((voucher, index) => (
            <Col xs={24} sm={12} lg={8} key={voucher.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="voucher-card-wrapper"
              >
                <Card className="voucher-card" hoverable>
                  <div className="voucher-header">
                    <div className="voucher-discount-container">
                      <Title level={3} className="voucher-discount">{formatDiscount(voucher)}</Title>
                      <Text className="voucher-description">{voucher.description}</Text>
                    </div>
                    {voucher.isHot && (
                      <div className="hot-badge">
                        <FireOutlined />
                      </div>
                    )}
                  </div>
                  
                  <div className="voucher-body">
                    <div className="voucher-code-section">
                      <Text className="voucher-code-label">Mã giảm giá</Text>
                        <div
                        className={`voucher-code ${voucher.status === 'available' ? 'clickable' : 'disabled'}`}
                          onClick={() => voucher.status === 'available' && copyToClipboard(voucher.code)}
                        >
                        <Text strong className="voucher-code-text">{voucher.code}</Text>
                          {voucher.status === 'available' && (
                            <Tooltip title="Sao chép mã">
                            <CopyOutlined className="copy-icon" />
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      {voucher.status === 'unavailable' && (
                      <div className="voucher-status-message">
                        <Text className="status-text">{voucher.statusMessage}</Text>
                      </div>
                    )}

                    <Space direction="vertical" size="small" className="voucher-details">
                                              {voucher.minAmount && (
                          <Text className="voucher-detail">
                            <Tag color='blue' icon={<AimOutlined />}>Điều kiện</Tag> 
                            Đơn hàng từ {voucher.minAmount.toLocaleString()}đ
                          </Text>
                        )}
                        {voucher.maxDiscount && voucher.discountType === 'percentage' && (
                          <Text className="voucher-detail">
                            <Tag color='green' icon={<RiseOutlined />}>Tối đa</Tag> 
                            Giảm đến {voucher.maxDiscount.toLocaleString()}đ
                          </Text>
                        )}
                        <Text className="voucher-detail">
                          <ClockIcon className="detail-icon" />
                          Hạn sử dụng: {new Date(voucher.validTo).toLocaleDateString('vi-VN')}
                        </Text>
                        <Text className="voucher-detail">
                          <Tag color='orange' icon={<TeamOutlined />}>Đã sử dụng</Tag> 
                          {voucher.usedCount}/{voucher.usageLimit}
                        </Text>
                      </Space>

                    <Button 
                      type="primary" 
                      block 
                      size="large" 
                        className={`voucher-button ${voucher.status === 'unavailable' ? 'disabled' : ''}`}
                      disabled={voucher.status === 'unavailable'}
                        icon={voucher.status === 'available' ? <GiftOutlined /> : <SafetyOutlined />}
                    >
                      {voucher.status === 'available' ? 'Lưu mã' : 'Hết voucher'}
                    </Button>
                  </div>
                  
                  {voucher.status === 'unavailable' && (
                    <Badge.Ribbon text="Hết voucher" color="red" />
                  )}
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
        
        <div className="section-footer">
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate('/vouchers')}
              className="section-cta-button"
              icon={<GiftOutlined />}
            >
                Khám phá nhiều ưu đãi hơn
            </Button>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Courses Section */}
      <SectionWrapper className="courses-section">
        <div className="section-header">
          <div className="section-badge">
            <BookOutlined className="badge-icon" />
            <span>Khóa học chất lượng</span>
          </div>
          <Title level={2} className="section-title">Khám phá khóa học</Title>
          <Text className="section-subtitle">Chọn lựa khóa học phù hợp nhất với mục tiêu của bạn</Text>
        </div>

        <Tabs
          defaultActiveKey="free"
          size="large"
          centered
          className="courses-tabs"
          renderTabBar={(props, DefaultTabBar) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <DefaultTabBar {...props} />
            </motion.div>
          )}
          items={[
            {
              key: 'free',
              label: (
                <span className="tab-label">
                  <CheckCircleOutlined /> Miễn phí
                </span>
              ),
              children: (
                <AnimatePresence mode="wait">
                  <Row gutter={[24, 24]} className="courses-grid">
                    {freeCourses.map((course, idx) => (
                      <Col xs={24} sm={12} md={8} lg={8} key={course.id || course._id || idx}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 30 }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                          whileHover={{ y: -8 }}
                        >
                          <CourseCard course={course} isEnrolled={enrolledCourseIds.includes(course.id || course._id)} />
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </AnimatePresence>
              )
            },
            {
              key: 'popular',
              label: (
                <span className="tab-label">
                  <FireOutlined /> Phổ biến
                </span>
              ),
              children: (
                <AnimatePresence mode="wait">
                  <Row gutter={[24, 24]} className="courses-grid">
                    {popularCourses.map((course, idx) => (
                      <Col xs={24} sm={12} md={8} lg={8} key={course.id || course._id || idx}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 30 }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                          whileHover={{ y: -8 }}
                        >
                          <CourseCard course={course} isEnrolled={enrolledCourseIds.includes(course.id || course._id)} />
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </AnimatePresence>
              )
            },
            {
              key: 'paid',
              label: (
                <span className="tab-label">
                  <StarOutlined /> Có phí
                </span>
              ),
              children: (
                <AnimatePresence mode="wait">
                  <Row gutter={[24, 24]} className="courses-grid">
                    {paidCourses.map((course, idx) => (
                      <Col xs={24} sm={12} md={8} lg={8} key={course.id || course._id || idx}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 30 }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                          whileHover={{ y: -8 }}
                        >
                          <CourseCard course={course} isEnrolled={enrolledCourseIds.includes(course.id || course._id)} />
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </AnimatePresence>
              )
            }
          ]}
        />
        
        <div className="section-footer">
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
          <Button 
            type="default" 
            size="large" 
            onClick={() => navigate('/courses')}
              className="section-cta-button secondary"
              icon={<BookOutlined />}
          >
            Xem tất cả khóa học
          </Button>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Instructors Section */}
      <SectionWrapper className="instructors-section">
        <div className="section-header">
          <div className="section-badge">
            <CrownOutlined className="badge-icon" />
            <span>Giảng viên tiêu biểu</span>
          </div>
          <Title level={2} className="section-title">Đội ngũ giảng viên xuất sắc</Title>
          <Text className="section-subtitle">Học hỏi từ các chuyên gia hàng đầu</Text>
        </div>
        <Row gutter={[24, 24]} className="instructors-grid">
          {instructors.map((instructor, idx) => (
            <Col xs={24} sm={12} md={8} lg={6} key={instructor._id || idx}>
              <Card className="instructor-card" hoverable>
                <Avatar src={instructor.avatar || instructor.profilePicture || '/images/default-avatar.png'} size={80} />
                <Title level={4} style={{ marginTop: 12 }}>{instructor.fullname || instructor.name}</Title>
                <Text>{instructor.specialty || instructor.bio || 'Chuyên gia đào tạo'}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">Khóa học: {instructor.courseCount || instructor.courses?.length || 0}</Tag>
                  <Tag color="green">Học viên: {instructor.studentCount || instructor.students || 0}</Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </SectionWrapper>

      {/* Blogs Section */}
      <SectionWrapper className="blogs-section">
        <div className="section-header">
          <div className="section-badge">
            <BookOutlined className="badge-icon" />
            <span>Bài viết nổi bật</span>
          </div>
          <Title level={2} className="section-title">Tin tức & Chia sẻ</Title>
          <Text className="section-subtitle">Cập nhật kiến thức, xu hướng mới nhất</Text>
        </div>
        <Row gutter={[24, 24]} className="blogs-grid">
          {blogs.map((blog, idx) => (
            <Col xs={24} sm={12} md={8} lg={6} key={blog._id || idx}>
              <Card
                className="blog-card"
                hoverable
                cover={<img alt={blog.title} src={blog.thumbnail || '/images/no-image.png'} style={{ height: 160, objectFit: 'cover' }} />}
                onClick={() => navigate(`/blogs/${blog._id}`)}
              >
                <Title level={4}>{blog.title}</Title>
                <Paragraph ellipsis={{ rows: 2 }}>{blog.summary || blog.content?.slice(0, 80) || ''}</Paragraph>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                  <Avatar src={blog.author?.avatar || '/images/default-avatar.png'} size={24} />
                  <span style={{ marginLeft: 8 }}>{blog.author?.fullname || 'Tác giả'}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </SectionWrapper>

      {/* Testimonials Section */}
      <SectionWrapper className="testimonials-section">
        <div className="section-header">
          <div className="section-badge">
            <HeartOutlined className="badge-icon" />
            <span>Đánh giá từ học viên</span>
          </div>
          <Title level={2} className="section-title">Học viên nói về EduPro</Title>
          <Text className="section-subtitle">Những chia sẻ thực tế từ cộng đồng học viên của chúng tôi</Text>
        </div>

        <Carousel 
          autoplay 
          arrows
          prevArrow={<CustomArrow><LeftOutlined /></CustomArrow>}
          nextArrow={<CustomArrow><RightOutlined /></CustomArrow>}
          dots={{ className: 'testimonial-dots' }}
          className="testimonials-carousel"
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-slide">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="testimonial-card-wrapper"
              >
                <Card className="testimonial-card" variant="borderless">
                  <Space direction="vertical" size="large" className="testimonial-content">
                    <div className="testimonial-avatar-container">
                      <Avatar 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        size={80}
                        className="testimonial-avatar"
                      />
                      <div className="quote-icon">
                        <HeartOutlined />
                      </div>
                    </div>
                    <Paragraph className="testimonial-text">"{testimonial.content}"</Paragraph>
                    <Rate value={testimonial.rating} disabled className="testimonial-rating" />
                    <div className="testimonial-author">
                      <Text strong className="author-name">{testimonial.name}</Text>
                            <br />
                      <Text className="author-role">{testimonial.role}</Text>
                        </div>
                        </Space>
                    </Card>
                </motion.div>
            </div>
          ))}
        </Carousel>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper className="cta-section">
        <div className="cta-background">
          <div className="cta-pattern"></div>
        </div>
        <div className="cta-content">
          <div className="cta-badge">
            <ThunderboltOutlined className="badge-icon" />
            <span>Bắt đầu ngay hôm nay</span>
          </div>
          <Title level={2} className="cta-title">
            Sẵn sàng nâng tầm <span className="gradient-text">sự nghiệp</span>?
        </Title>
          <Paragraph className="cta-subtitle">
          Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt và bắt đầu hành trình chinh phục kiến thức mới!
        </Paragraph>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              type="primary" 
              size="large" 
              className="cta-button"
              onClick={() => navigate('/register')}
              icon={<RocketOutlined />}
            >
          Đăng ký ngay
        </Button>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default Homepage;