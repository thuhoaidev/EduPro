import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Rate, Tag, Image, Space, Divider, Statistic, Tabs, Spin, message, Badge, Tooltip, Carousel, Avatar } from "antd";
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
  StarOutlined
} from "@ant-design/icons";
import "../styles/courseCard.css";
import { courseService, type Course as ApiCourse } from '../services/apiService';
import voucherService from '../services/voucher.service';
import type { Voucher } from '../services/voucher.service';
import CourseCard from '../components/course/CourseCard';

const { Title, Text, Paragraph } = Typography;

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

const CustomArrow = ({ currentSlide, slideCount, children, ...rest }) => (
  <span {...rest}>{children}</span>
);

const SectionWrapper = ({ children, style = {} }: { children: React.ReactNode, style?: React.CSSProperties }) => {
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
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
        hidden: { opacity: 0, y: 50 },
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
};

const Homepage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [vouchers, setVouchers] = useState<VoucherDisplay[]>([]);
  const [loading, setLoading] = useState({
    courses: true,
    testimonials: true,
    vouchers: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await courseService.getAllCourses() as Course[];
        setCourses(coursesData);
        
        const response = await fetch('http://localhost:5000/api/blogs/68547db672358427a53d9ece/comments');
        const commentsData = await response.json();
        
        const mappedTestimonials = commentsData.data.map((comment: { user?: { name: string }, course?: { title: string }, content: string, rating?: number }) => ({
          name: comment.user?.name || 'Ẩn danh',
          role: `Học viên khóa ${comment.course?.title || 'EduPro'}`,
          content: comment.content,
          rating: comment.rating || 5
        }));
        setTestimonials(mappedTestimonials);

        // Fetch vouchers from API
        try {
          const voucherResponse = await voucherService.getAvailable();
          if (voucherResponse.success) {
            const mappedVouchers = voucherResponse.data.map((v: Voucher) => ({
              id: v.id,
              code: v.code,
              title: v.title,
              description: v.description,
              discount: v.discountValue,
              discountType: v.discountType,
              minAmount: v.minOrderValue,
              maxDiscount: v.maxDiscount,
              validFrom: v.startDate,
              validTo: v.endDate || '',
              usageLimit: v.usageLimit,
              usedCount: v.usedCount,
              category: v.categories && v.categories.length > 0 ? v.categories[0] : 'all',
              isHot: v.isHot,
              isNew: v.isNew,
              isExpired: v.endDate ? new Date(v.endDate) < new Date() : false,
              daysLeft: v.endDate ? Math.max(0, Math.ceil((new Date(v.endDate).getTime() - Date.now()) / (1000*60*60*24))) : 999,
              status: v.status || 'available',
              statusMessage: v.statusMessage || 'Có thể sử dụng'
            }));
            setVouchers(mappedVouchers);
          }
        } catch (voucherError) {
          console.error('Error fetching vouchers:', voucherError);
          // Fallback to mock data if API fails
          const mockVouchers: VoucherDisplay[] = [
            {
              id: '1',
              code: 'WELCOME50',
              title: 'Giảm 50% cho người mới',
              description: 'Áp dụng cho tất cả khóa học, tối đa 500K',
              discount: 50,
              discountType: 'percentage',
              minAmount: 100000,
              maxDiscount: 500000,
              validFrom: '2024-01-01',
              validTo: '2024-12-31',
              usageLimit: 1000,
              usedCount: 234,
              category: 'new-user',
              isHot: true,
              isNew: true,
              isExpired: false,
              daysLeft: 45,
              status: 'available',
              statusMessage: 'Có thể sử dụng'
            },
            {
              id: '2',
              code: 'FLASH200K',
              title: 'Giảm 200K cho khóa học IT',
              description: 'Áp dụng cho khóa học Công nghệ thông tin',
              discount: 200000,
              discountType: 'fixed',
              minAmount: 500000,
              validFrom: '2024-01-01',
              validTo: '2024-06-30',
              usageLimit: 500,
              usedCount: 156,
              category: 'it-courses',
              isHot: true,
              isExpired: false,
              daysLeft: 12,
              status: 'available',
              statusMessage: 'Có thể sử dụng'
            },
            {
              id: '3',
              code: 'SUMMER30',
              title: 'Giảm 30% mùa hè',
              description: 'Áp dụng cho tất cả khóa học',
              discount: 30,
              discountType: 'percentage',
              minAmount: 200000,
              maxDiscount: 300000,
              validFrom: '2024-06-01',
              validTo: '2024-08-31',
              usageLimit: 2000,
              usedCount: 892,
              category: 'seasonal',
              isExpired: false,
              daysLeft: 78,
              status: 'available',
              statusMessage: 'Có thể sử dụng'
            },
          ];
          setVouchers(mockVouchers);
        }

      } catch (err) {
        if (err instanceof Error) {
          message.error('Có lỗi xảy ra khi tải dữ liệu: ' + err.message);
        } else {
          message.error('Có lỗi xảy ra khi tải dữ liệu.');
        }
      } finally {
        setLoading({ courses: false, testimonials: false, vouchers: false });
      }
    };

    fetchData();
  }, []);

  const freeCourses = courses.filter((course) => course.isFree === true);
  const paidCourses = courses.filter((course) => course.isFree === false);
  const popularCourses = [...courses]
    .sort((a, b) => b.reviews - a.reviews || b.rating - a.rating)
    .slice(0, 4);

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

  if (loading.courses || loading.testimonials || loading.vouchers) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large">
          <div style={{ padding: '50px 0' }}>
            <div>Đang tải dữ liệu...</div>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="homepage-container" style={{ background: '#f8f9fa' }}>
      {/* Hero Section */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", padding: "80px 0", textAlign: 'center', overflow: 'hidden' }}>
        <Row justify="center">
          <Col xs={22} md={18} lg={14}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <Title level={1} style={{ color: "white", fontSize: "48px", marginBottom: "24px", fontWeight: 'bold' }}>
                Nền tảng học tập cho tương lai
                </Title>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
                <Paragraph style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "18px", marginBottom: "32px", maxWidth: '700px', margin: '0 auto 32px' }}>
                Trang bị cho bạn những kỹ năng cần thiết trong thế giới số. Bắt đầu hành trình chinh phục công nghệ cùng EduPro.
                </Paragraph>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
                <Space size="large">
                <Button type="primary" size="large" style={{ height: "52px", fontSize: "16px", padding: "0 32px", background: '#facc15', borderColor: '#facc15', color: '#1e3a8a', fontWeight: 'bold' }}>
                    Khám phá khóa học
                </Button>
                <Button ghost size="large" style={{ height: "52px", fontSize: "16px", padding: "0 32px", borderColor: 'white', color: 'white' }}>
                    <PlayCircleOutlined /> Giới thiệu
                </Button>
                </Space>
            </motion.div>
          </Col>
        </Row>
      </div>

      {/* Stats Section */}
      <SectionWrapper style={{ padding: "64px 0", background: 'white' }}>
        <Row gutter={[32, 32]} style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: <UserOutlined />, title: 'Học viên', value: 1200, suffix: '+' },
            { icon: <ReadOutlined />, title: 'Khóa học', value: 50, suffix: '+' },
            { icon: <TrophyOutlined />, title: 'Giảng viên', value: 12, suffix: '+' },
            { icon: <LikeOutlined />, title: 'Đánh giá', value: '4.9/5', suffix: '' }
          ].map((stat, index) => (
            <Col xs={12} md={6} key={stat.title}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                    <Card variant="borderless" style={{ textAlign: "center" }}>
                        <Statistic
                        title={<Text style={{ fontSize: '16px', color: '#6c757d' }}>{stat.title}</Text>}
                        value={stat.value}
                        prefix={<span style={{ color: '#3b82f6', fontSize: '24px', marginRight: '8px' }}>{stat.icon}</span>}
                        suffix={stat.suffix}
                        valueStyle={{ color: "#1e3a8a", fontWeight: "bold", fontSize: '36px' }}
                        />
                    </Card>
                </motion.div>
            </Col>
          ))}
        </Row>
      </SectionWrapper>

      {/* Vouchers Section */}
      <SectionWrapper style={{ padding: "64px 24px" }}>
        <div style={{ textAlign: 'center', marginBottom: "48px" }}>
          <Title level={2} style={{ fontSize: "36px", marginBottom: "12px", color: '#1e3a8a' }}>
            <GiftOutlined style={{ marginRight: "12px", color: "#ef4444" }} />
            Ưu đãi hấp dẫn
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>Đừng bỏ lỡ các mã giảm giá đặc biệt từ EduPro!</Text>
        </div>

        <Row gutter={[24, 24]}>
          {vouchers.map((voucher) => (
            <Col xs={24} sm={12} lg={8} key={voucher.id} style={{ display: 'flex' }}>
              <motion.div
                style={{ width: '100%' }}
                whileHover={{ y: -8, boxShadow: '0 12px 28px rgba(0,0,0,0.12)' }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  hoverable
                  variant="borderless"
                  style={{ 
                    borderRadius: "16px", 
                    overflow: "hidden", 
                    border: 'none', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
                    width: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    opacity: voucher.status === 'unavailable' ? 0.6 : 1
                  }}
                  styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', flex: 1 } }}
                >
                  <div style={{ background: "linear-gradient(135deg, #ef4444, #f87171)", padding: '24px', color: 'white', textAlign: 'center' }}>
                    <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 'bold' }}>{formatDiscount(voucher)}</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{voucher.description}</Text>
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Text type='secondary'>Mã giảm giá</Text>
                        <div
                          style={{ 
                            border: '2px dashed #d1d5db', 
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            margin: '8px auto', 
                            display: 'inline-block', 
                            cursor: voucher.status === 'available' ? 'pointer' : 'not-allowed',
                            opacity: voucher.status === 'available' ? 1 : 0.5
                          }}
                          onClick={() => voucher.status === 'available' && copyToClipboard(voucher.code)}
                        >
                          <Text strong style={{ fontSize: '20px', letterSpacing: '2px', color: '#1e3a8a' }}>{voucher.code}</Text>
                          {voucher.status === 'available' && (
                            <Tooltip title="Sao chép mã">
                              <CopyOutlined style={{ marginLeft: '12px', color: '#6b7280' }} />
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      {/* Status Message */}
                      {voucher.status === 'unavailable' && (
                        <div style={{ 
                          background: '#fef2f2', 
                          border: '1px solid #fecaca', 
                          borderRadius: '8px', 
                          padding: '8px 12px', 
                          marginBottom: '16px',
                          textAlign: 'center'
                        }}>
                          <Text style={{ color: '#dc2626', fontSize: '12px' }}>
                            {voucher.statusMessage}
                          </Text>
                        </div>
                      )}

                      <Space direction="vertical" size="small" style={{ width: "100%"}}>
                        {voucher.minAmount && <Text type="secondary"><Tag color='blue'>Điều kiện</Tag> Đơn hàng từ {voucher.minAmount.toLocaleString()}đ</Text>}
                        {voucher.maxDiscount && voucher.discountType === 'percentage' && <Text type="secondary"><Tag color='blue'>Tối đa</Tag> Giảm đến {voucher.maxDiscount.toLocaleString()}đ</Text>}
                        <Text type="secondary"><ClockIcon style={{ marginRight: "4px" }} />Hạn sử dụng: {new Date(voucher.validTo).toLocaleDateString('vi-VN')}</Text>
                        <Text type="secondary"><Tag color='orange'>Đã sử dụng</Tag> {voucher.usedCount}/{voucher.usageLimit}</Text>
                      </Space>
                    </div>

                    <Button 
                      type="primary" 
                      block 
                      size="large" 
                      style={{ 
                        background: voucher.status === 'available' ? '#1e3a8a' : '#9ca3af', 
                        height: '48px', 
                        marginTop: '24px' 
                      }}
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
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate('/vouchers')}
                style={{ background: '#1e3a8a', height: '48px', padding: '0 32px' }}
            >
                Khám phá nhiều ưu đãi hơn
            </Button>
        </div>
      </SectionWrapper>

      {/* Courses Section with Tabs */}
      <SectionWrapper style={{ padding: "64px 24px", background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: "48px" }}>
          <Title level={2} style={{ fontSize: "36px", marginBottom: "12px", color: '#1e3a8a' }}>Khám phá khóa học</Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>Chọn lựa khóa học phù hợp nhất với mục tiêu của bạn</Text>
        </div>

        <Tabs
          defaultActiveKey="free"
          size="large"
          centered
          renderTabBar={(props, DefaultTabBar) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DefaultTabBar {...props} />
            </motion.div>
          )}
          items={[
            {
              key: 'free',
              label: 'Miễn phí',
              children: (
                <AnimatePresence mode="wait">
                  <Row gutter={[24, 24]}>
                    {freeCourses.map((course, idx) => (
                      <Col xs={24} sm={12} md={8} lg={8} key={course.id || course._id || idx}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 30 }}
                          transition={{ duration: 0.5, delay: idx * 0.08 }}
                        >
                          <CourseCard course={course} isEnrolled={false} />
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </AnimatePresence>
              )
            },
            {
              key: 'popular',
              label: 'Phổ biến',
              children: (
                <AnimatePresence mode="wait">
                  <Row gutter={[24, 24]}>
                    {popularCourses.map((course, idx) => (
                      <Col xs={24} sm={12} md={8} lg={8} key={course.id || course._id || idx}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 30 }}
                          transition={{ duration: 0.5, delay: idx * 0.08 }}
                        >
                          <CourseCard course={course} isEnrolled={false} />
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </AnimatePresence>
              )
            },
            {
              key: 'paid',
              label: 'Có phí',
              children: (
                <AnimatePresence mode="wait">
                  <Row gutter={[24, 24]}>
                    {paidCourses.map((course, idx) => (
                      <Col xs={24} sm={12} md={8} lg={8} key={course.id || course._id || idx}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 30 }}
                          transition={{ duration: 0.5, delay: idx * 0.08 }}
                        >
                          <CourseCard course={course} isEnrolled={false} />
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </AnimatePresence>
              )
            }
          ]}
        />
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <Button 
            type="default" 
            size="large" 
            style={{ height: '48px', padding: '0 32px' }}
            onClick={() => navigate('/courses')}
          >
            Xem tất cả khóa học
          </Button>
        </div>
      </SectionWrapper>

      {/* Testimonials Section */}
      <SectionWrapper style={{ padding: "80px 24px", background: '#f8f9fa' }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Title level={2} style={{ fontSize: "36px", marginBottom: "16px", color: '#1e3a8a' }}>Học viên nói về EduPro</Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>Những chia sẻ thực tế từ cộng đồng học viên của chúng tôi.</Text>
        </div>

        <Carousel 
          autoplay 
          arrows
          prevArrow={<CustomArrow><LeftOutlined /></CustomArrow>}
          nextArrow={<CustomArrow><RightOutlined /></CustomArrow>}
          dots={{ className: 'testimonial-dots' }}
          style={{ maxWidth: '900px', margin: '0 auto' }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card variant="borderless" style={{ margin: '0 16px', padding: '32px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
                        <Image src={`https://i.pravatar.cc/80?u=${testimonial.name}`} alt={testimonial.name} style={{ borderRadius: '50%', width: '80px', height: '80px' }} />
                        <Paragraph style={{ fontSize: "18px", fontStyle: 'italic', color: '#495057' }}>"{testimonial.content}"</Paragraph>
                        <Rate value={testimonial.rating} disabled />
                        <div>
                            <Text strong style={{ fontSize: '16px', color: '#1e3a8a' }}>{testimonial.name}</Text>
                            <br />
                            <Text type="secondary">{testimonial.role}</Text>
                        </div>
                        </Space>
                    </Card>
                </motion.div>
            </div>
          ))}
        </Carousel>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", padding: "80px 24px", textAlign: 'center' }}>
        <Title level={2} style={{ color: "white", fontSize: "36px", marginBottom: "16px", fontWeight: 'bold' }}>
          Sẵn sàng nâng tầm sự nghiệp?
        </Title>
        <Paragraph style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "16px", marginBottom: "32px", maxWidth: "700px", margin: "0 auto 32px" }}>
          Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt và bắt đầu hành trình chinh phục kiến thức mới!
        </Paragraph>
        <Button type="primary" size="large" style={{ height: "52px", fontSize: "16px", padding: "0 32px", background: '#facc15', borderColor: '#facc15', color: '#1e3a8a', fontWeight: 'bold' }}>
          Đăng ký ngay
        </Button>
      </SectionWrapper>
    </div>
  );
};

export default Homepage;