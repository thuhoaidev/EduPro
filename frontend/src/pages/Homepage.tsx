import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Rate, Tag, Image, Space, Divider, Statistic, Tabs, Spin, message, Badge, Tooltip, Carousel, Avatar, Input, Select } from "antd";
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  PlayCircleOutlined,
  BookOutlined,
  UserOutlined,
  ReadOutlined,
  TrophyOutlined,
  LikeOutlined,
  GiftOutlined,
  CopyOutlined,
  ClockCircleOutlined as ClockIcon,
  LeftOutlined,
  RightOutlined,
  ArrowRightOutlined,
  CodeOutlined,
  BarChartOutlined,
  LaptopOutlined,
  FireOutlined,
  StarOutlined,
  RocketOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import "../styles/courseCard.css";
import "./Homepage.css";
import { courseService, type Course as ApiCourse } from '../services/apiService';
import voucherService from '../services/voucher.service';
import type { Voucher } from '../services/voucher.service';
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

const CustomArrow = ({ currentSlide, slideCount, children, ...rest }: {
  currentSlide?: number;
  slideCount?: number;
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <span {...rest}>{children}</span>
);

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
        <Select 
          value={searchType} 
          onChange={setSearchType} 
          className="search-type-select"
          size="large"
        >
          <Option value="course">Khóa học</Option>
          <Option value="user">Giảng viên</Option>
        </Select>
        <Input
          placeholder="Nhập từ khóa tìm kiếm..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          className="search-input"
          size="large"
        />
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
        const mappedTestimonials: Testimonial[] = commentsData.map((comment: any) => ({
          name: comment.user?.fullname || 'Học viên',
          role: 'Sinh viên',
          content: comment.content || 'Khóa học rất hay!',
          rating: comment.rating || 5
        }));
        setTestimonials(mappedTestimonials);
        
        try {
          const vouchersResponse = await fetch('http://localhost:5000/api/vouchers');
          if (vouchersResponse.ok) {
            const vouchersData = await vouchersResponse.json();
            const processedVouchers = vouchersData.map((voucher: any) => {
              const now = new Date();
              const validFrom = new Date(voucher.validFrom);
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

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'new-user': 'Người mới',
      'it-courses': 'Khóa học IT',
      'seasonal': 'Theo mùa',
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'new-user': 'blue',
      'it-courses': 'green',
      'seasonal': 'orange',
    };
    return colors[category] || 'default';
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
                <Title level={1} className="hero-title">
                  Nền tảng học tập cho tương lai
                </Title>
                <Paragraph className="hero-subtitle">
                  Trang bị cho bạn những kỹ năng cần thiết trong thế giới số. 
                  Bắt đầu hành trình chinh phục công nghệ cùng EduPro.
                </Paragraph>
                <Space size="large" className="hero-buttons">
                  <Button 
                    type="primary" 
                    size="large" 
                    className="hero-primary-btn"
                    onClick={() => navigate('/courses')}
                  >
                    <RocketOutlined /> Khám phá khóa học
                  </Button>
                  <Button 
                    ghost 
                    size="large" 
                    className="hero-secondary-btn"
                  >
                    <PlayCircleOutlined /> Giới thiệu
                  </Button>
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
          <Title level={2} className="section-title">Thống kê ấn tượng</Title>
          <Text className="section-subtitle">Những con số thể hiện sự tin tưởng của cộng đồng</Text>
        </div>
        <Row gutter={[32, 32]} className="stats-grid">
          {[
            { icon: <UserOutlined />, title: 'Học viên', value: 1200, suffix: '+', color: '#3b82f6' },
            { icon: <ReadOutlined />, title: 'Khóa học', value: 50, suffix: '+', color: '#10b981' },
            { icon: <TrophyOutlined />, title: 'Giảng viên', value: 12, suffix: '+', color: '#f59e0b' },
            { icon: <LikeOutlined />, title: 'Đánh giá', value: '4.9/5', suffix: '', color: '#ef4444' }
          ].map((stat, index) => (
            <Col xs={12} md={6} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
              >
                <Card className="stat-card" variant="borderless">
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <Statistic
                    title={<Text className="stat-title">{stat.title}</Text>}
                    value={stat.value}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color, fontWeight: "bold" }}
                    className="stat-value"
                  />
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </SectionWrapper>

      {/* Vouchers Section */}
      <SectionWrapper className="vouchers-section">
        <div className="section-header">
          <Title level={2} className="section-title">
            <GiftOutlined className="section-icon" />
            Ưu đãi hấp dẫn
          </Title>
          <Text className="section-subtitle">Đừng bỏ lỡ các mã giảm giá đặc biệt từ EduPro!</Text>
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
                    <Title level={3} className="voucher-discount">{formatDiscount(voucher)}</Title>
                    <Text className="voucher-description">{voucher.description}</Text>
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
                          <Tag color='blue'>Điều kiện</Tag> 
                          Đơn hàng từ {voucher.minAmount.toLocaleString()}đ
                        </Text>
                      )}
                      {voucher.maxDiscount && voucher.discountType === 'percentage' && (
                        <Text className="voucher-detail">
                          <Tag color='blue'>Tối đa</Tag> 
                          Giảm đến {voucher.maxDiscount.toLocaleString()}đ
                        </Text>
                      )}
                      <Text className="voucher-detail">
                        <ClockIcon className="detail-icon" />
                        Hạn sử dụng: {new Date(voucher.validTo).toLocaleDateString('vi-VN')}
                      </Text>
                      <Text className="voucher-detail">
                        <Tag color='orange'>Đã sử dụng</Tag> 
                        {voucher.usedCount}/{voucher.usageLimit}
                      </Text>
                    </Space>

                    <Button 
                      type="primary" 
                      block 
                      size="large" 
                      className={`voucher-button ${voucher.status === 'unavailable' ? 'disabled' : ''}`}
                      disabled={voucher.status === 'unavailable'}
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
          <Button 
            type="primary" 
            size="large" 
            onClick={() => navigate('/vouchers')}
            className="section-cta-button"
          >
            Khám phá nhiều ưu đãi hơn
          </Button>
        </div>
      </SectionWrapper>

      {/* Courses Section */}
      <SectionWrapper className="courses-section">
        <div className="section-header">
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
          <Button 
            type="default" 
            size="large" 
            onClick={() => navigate('/courses')}
            className="section-cta-button secondary"
          >
            Xem tất cả khóa học
          </Button>
        </div>
      </SectionWrapper>

      {/* Testimonials Section */}
      <SectionWrapper className="testimonials-section">
        <div className="section-header">
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
                    <Avatar 
                      src={`https://i.pravatar.cc/80?u=${testimonial.name}`} 
                      alt={testimonial.name} 
                      size={80}
                      className="testimonial-avatar"
                    />
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
        <div className="cta-content">
          <Title level={2} className="cta-title">
            Sẵn sàng nâng tầm sự nghiệp?
          </Title>
          <Paragraph className="cta-subtitle">
            Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt và bắt đầu hành trình chinh phục kiến thức mới!
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            className="cta-button"
            onClick={() => navigate('/register')}
          >
            <RocketOutlined /> Đăng ký ngay
          </Button>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default Homepage;