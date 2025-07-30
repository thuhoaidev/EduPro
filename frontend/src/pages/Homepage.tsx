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
  rating?: number; // Thêm rating cho carousel
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
  const { currentSlide, slideCount, ...filteredProps } = rest;
  return <span {...filteredProps}>{children}</span>;
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
        const commentsRes = await response.json();
        const commentsData = commentsRes.data || [];
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
            const vouchersDataRes = await vouchersResponse.json();
            const vouchersArr = vouchersDataRes.data || vouchersDataRes;
            if (Array.isArray(vouchersArr)) {
              const processedVouchers = vouchersArr.map((voucher: VoucherData) => {
              const now = new Date();
              const validTo = new Date(voucher.validTo);
              const isExpired = now > validTo;
              const daysLeft = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return {
                  id: String(voucher.id || voucher._id || ''),
                  code: String(voucher.code || ''),
                  title: String(voucher.title || ''),
                  description: String(voucher.description || ''),
                  discount: Number(voucher.discountValue ?? voucher.discount ?? 0),
                  discountType: (voucher.discountType === 'percentage' ? 'percentage' : 'fixed') as 'percentage' | 'fixed',
                  minAmount: Number(voucher.minOrderValue ?? voucher.minAmount ?? 0),
                  maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : undefined,
                  validFrom: String(voucher.startDate || voucher.validFrom || ''),
                  validTo: String(voucher.endDate || voucher.validTo || ''),
                  usageLimit: Number(voucher.usageLimit ?? 0),
                  usedCount: Number(voucher.usedCount ?? 0),
                  category: String(voucher.category || ''),
                  isHot: Boolean(voucher.isHot),
                  isNew: Boolean(voucher.isNew),
                isExpired,
                daysLeft: isExpired ? 0 : daysLeft,
                  statusMessage: isExpired ? 'Đã hết hạn' : Number(voucher.usedCount ?? 0) >= Number(voucher.usageLimit ?? 0) ? 'Hết voucher' : 'Có thể sử dụng'
              };
            });
            setVouchers(processedVouchers);
            } else {
              setVouchers([]);
            }
          }
        } catch (voucherError) {
          console.error('Error fetching vouchers:', voucherError);
        }
        // Fetch instructors
        try {
          const res = await fetch('http://localhost:5000/api/users/approved-instructors?limit=4');
          if (res.ok) {
            const data = await res.json();
            setInstructors((data.data && data.data.instructors) || []);
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

        {/* Banner Voucher chính */}
        {vouchers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="main-voucher-banner"
          >
            <div className="voucher-banner-background">
              <div className="voucher-banner-pattern"></div>
              <div className="voucher-banner-overlay"></div>
            </div>
            <div className="voucher-banner-content">
              <Row align="middle" gutter={[32, 24]}>
                <Col xs={24} lg={12}>
                  <div className="voucher-banner-info">
                    <div className="voucher-banner-badge">
                      <FireOutlined className="badge-icon" />
                      <span>Ưu đãi nổi bật</span>
                    </div>
                    <Title level={2} className="voucher-banner-title">
                      Giảm giá lên đến <span className="gradient-text">{formatDiscount(vouchers[0])}</span>
                    </Title>
                    <Paragraph className="voucher-banner-description">
                      {vouchers[0].description || 'Ưu đãi đặc biệt dành cho học viên mới'}
                    </Paragraph>
                    <div className="voucher-banner-features">
                      <div className="voucher-feature">
                        <CheckCircleOutlined className="feature-icon" />
                        <span>Áp dụng cho tất cả khóa học</span>
                      </div>
                      <div className="voucher-feature">
                        <CheckCircleOutlined className="feature-icon" />
                        <span>Không giới hạn số lần sử dụng</span>
                      </div>
                      <div className="voucher-feature">
                        <CheckCircleOutlined className="feature-icon" />
                        <span>Thanh toán an toàn</span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="voucher-banner-code-section">
                    <div className="voucher-code-display">
                      <Text className="voucher-code-label">Mã giảm giá</Text>
                      <div 
                        className={`voucher-code-main ${vouchers[0].status === 'available' ? 'clickable' : 'disabled'}`}
                        onClick={() => vouchers[0].status === 'available' && copyToClipboard(vouchers[0].code)}
                      >
                        <Text strong className="voucher-code-text">{vouchers[0].code}</Text>
                        {vouchers[0].status === 'available' && (
                          <Tooltip title="Sao chép mã">
                            <CopyOutlined className="copy-icon-large" />
                          </Tooltip>
                        )}
                      </div>
                      {vouchers[0].status === 'unavailable' && (
                        <div className="voucher-status-message">
                          <Text className="status-text">{vouchers[0].statusMessage}</Text>
                        </div>
                      )}
                      <div className="voucher-code-details">
                        <div className="voucher-detail-item">
                          <ClockIcon className="detail-icon" />
                          <span>Hạn sử dụng: {new Date(vouchers[0].validTo).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {vouchers[0].minAmount && (
                          <div className="voucher-detail-item">
                            <AimOutlined className="detail-icon" />
                            <span>Đơn hàng từ {vouchers[0].minAmount.toLocaleString()}đ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </motion.div>
        )}

        {/* Grid các voucher khác */}
        {vouchers.length > 1 && (
          <div className="other-vouchers-section">
            <Title level={3} className="other-vouchers-title">Các ưu đãi khác</Title>
            <div className="vouchers-horizontal-scroll">
              {vouchers.slice(1).map((voucher, index) => (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="voucher-item-compact"
                >
                  <div className="voucher-item-content">
                    <div className="voucher-item-header">
                      <div className="voucher-item-discount">
                        <Text strong className="discount-text">{formatDiscount(voucher)}</Text>
                      </div>
                      {voucher.isHot && (
                        <div className="hot-indicator">
                          <FireOutlined />
                        </div>
                      )}
                    </div>
                    <div 
                      className={`voucher-item-code ${voucher.status === 'available' ? 'clickable' : 'disabled'}`}
                      onClick={() => voucher.status === 'available' && copyToClipboard(voucher.code)}
                    >
                      <Text className="code-label">Mã: {voucher.code}</Text>
                      {voucher.status === 'available' && (
                        <Tooltip title="Sao chép mã">
                          <CopyOutlined className="copy-icon-compact" />
                        </Tooltip>
                      )}
                    </div>
                    <div className="voucher-item-footer">
                      <Text className="voucher-item-desc">{voucher.description}</Text>
                      <Text className="voucher-item-expiry">
                        Hết hạn: {new Date(voucher.validTo).toLocaleDateString('vi-VN')}
                      </Text>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
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
                <AnimatePresence>
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
                <AnimatePresence>
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
                <AnimatePresence>
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
        {/* Banner carousel cho 5 giảng viên có tổng đánh giá cao nhất */}
        <Carousel autoplay dots={true} className="instructor-banner-carousel">
          {instructors
            .slice()
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5)
            .map((instructor, idx) => (
              <div key={instructor._id || idx} className="instructor-banner-slide">
                <div className="instructor-banner-content flex flex-col items-center justify-center text-center py-10">
                  <div className="mb-6">
                    <Avatar src={instructor.avatar || instructor.profilePicture || '/images/default-avatar.png'} size={120} className="instructor-banner-avatar shadow-lg transition-transform duration-300 hover:scale-105" style={{ background: 'white' }} />
                  </div>
                  <div className="instructor-banner-info">
                    <Title level={3} className="instructor-banner-name gradient-text" style={{ marginBottom: 8, fontWeight: 800 }}>{instructor.fullname || instructor.name}</Title>
                    <Text className="instructor-banner-specialty" style={{ display: 'block', marginBottom: 12, color: '#2563eb', fontWeight: 500 }}>{instructor.specialty || instructor.bio || 'Chuyên gia đào tạo'}</Text>
                    <div className="instructor-banner-stats flex flex-wrap justify-center gap-8 mb-4">
                      <span className="flex items-center gap-1 text-base font-medium text-blue-600"><BookOutlined className="text-lg" /> {instructor.courseCount || instructor.courses?.length || 0} khóa học</span>
                      <span className="flex items-center gap-1 text-base font-medium text-emerald-600"><TeamOutlined className="text-lg" /> {instructor.studentCount || instructor.students || 0} học viên</span>
                      <span className="flex items-center gap-1 text-base font-medium text-yellow-500"><StarOutlined className="text-lg" /> {instructor.rating || 0} lượt đánh giá</span>
                    </div>
                    <Paragraph className="instructor-banner-desc" style={{ marginTop: 8, fontSize: 15, color: '#555', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
                      {instructor.bio || 'Giảng viên xuất sắc với nhiều năm kinh nghiệm đào tạo và truyền cảm hứng cho hàng ngàn học viên.'}
                    </Paragraph>
                  </div>
                </div>
              </div>
            ))}
        </Carousel>
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
        {/* Carousel banner cho blog */}
        <Carousel autoplay dots={true} className="blog-banner-carousel">
          {blogs.slice(0, 5).map((blog, idx) => (
            <div key={blog._id || idx} className="blog-banner-slide">
              <div className="blog-banner-wrapper relative flex flex-col items-center justify-center min-h-[340px] md:min-h-[420px]">
                <img src={blog.thumbnail || '/images/no-image.png'} alt={blog.title} className="blog-banner-img absolute inset-0 w-full h-full object-cover rounded-xl" style={{ filter: 'brightness(0.65) blur(0px)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-xl"></div>
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-10 w-full">
                  <Title level={2} className="blog-banner-title gradient-text mb-2" style={{ fontWeight: 800, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>{blog.title}</Title>
                  <Paragraph className="blog-banner-summary" style={{ color: '#f3f4f6', fontSize: 18, maxWidth: 700, margin: '0 auto 18px', textShadow: '0 1px 8px rgba(0,0,0,0.18)' }}>{blog.summary || blog.content?.slice(0, 120) || ''}</Paragraph>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Avatar src={blog.author?.avatar || '/images/default-avatar.png'} size={40} />
                    <span className="text-white font-semibold text-base">{blog.author?.fullname || 'Tác giả'}</span>
                    <span className="text-gray-200 text-sm">{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                  <Button type="primary" size="large" className="blog-banner-btn" style={{ fontWeight: 600, fontSize: 16 }} onClick={() => navigate(`/blogs/${blog._id}`)}>
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
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