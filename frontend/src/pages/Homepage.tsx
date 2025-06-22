import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Rate, Tag, Image, Space, Divider, Statistic, Tabs, Spin, message, Badge, Tooltip, Carousel, Avatar } from "antd";
import { motion, useAnimation } from 'framer-motion';
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

interface Voucher {
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
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
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

        const mockVouchers: Voucher[] = [
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
            daysLeft: 45
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
            daysLeft: 12
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
            daysLeft: 78
          },
        ];
        setVouchers(mockVouchers);

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

  const freeCourses = courses.filter((course) => course.price === "Miễn phí");
  const paidCourses = courses.filter((course) => course.price !== "Miễn phí");
  const popularCourses = [...courses].sort(() => Math.random() - 0.5).slice(0, 4);

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

  const formatDiscount = (voucher: Voucher) => {
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
                  style={{ borderRadius: "16px", overflow: "hidden", border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}
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
                          style={{ border: '2px dashed #d1d5db', padding: '8px 16px', borderRadius: '8px', margin: '8px auto', display: 'inline-block', cursor: 'pointer' }}
                          onClick={() => copyToClipboard(voucher.code)}
                        >
                          <Text strong style={{ fontSize: '20px', letterSpacing: '2px', color: '#1e3a8a' }}>{voucher.code}</Text>
                          <Tooltip title="Sao chép mã">
                            <CopyOutlined style={{ marginLeft: '12px', color: '#6b7280' }} />
                          </Tooltip>
                        </div>
                      </div>

                      <Space direction="vertical" size="small" style={{ width: "100%"}}>
                        {voucher.minAmount && <Text type="secondary"><Tag color='blue'>Điều kiện</Tag> Đơn hàng từ {voucher.minAmount.toLocaleString()}đ</Text>}
                        {voucher.maxDiscount && voucher.discountType === 'percentage' && <Text type="secondary"><Tag color='blue'>Tối đa</Tag> Giảm đến {voucher.maxDiscount.toLocaleString()}đ</Text>}
                        <Text type="secondary"><ClockIcon style={{ marginRight: "4px" }} />Hạn sử dụng: {new Date(voucher.validTo).toLocaleDateString('vi-VN')}</Text>
                      </Space>
                    </div>

                    <Button type="primary" block size="large" style={{ background: '#1e3a8a', height: '48px', marginTop: '24px' }}>
                      Lưu mã
                    </Button>
                  </div>
                  {voucher.isExpired && (
                    <Badge.Ribbon text="Đã hết hạn" color="red" />
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
          items={[
            {
              key: 'free',
              label: 'Miễn phí',
              children: (
                <Row gutter={[24, 24]}>
                  {freeCourses.map((course, idx) => (
                    <Col xs={24} sm={12} md={8} lg={8} key={course.id || course._id || idx}>
                      <CourseCard course={course} />
                    </Col>
                  ))}
                </Row>
              )
            },
            {
              key: 'popular',
              label: 'Phổ biến',
              children: (
                <Row gutter={[24, 24]}>
                  {popularCourses.map((course, idx) => (
                    <Col xs={24} sm={12} md={8} lg={8} key={course.id || course._id || idx}>
                      <CourseCard course={course} />
                    </Col>
                  ))}
                </Row>
              )
            },
            {
              key: 'paid',
              label: 'Có phí',
              children: (
                <Row gutter={[24, 24]}>
                  {paidCourses.map((course, idx) => (
                    <Col xs={24} sm={12} md={8} lg={8} key={course.id || course._id || idx}>
                      <CourseCard course={course} />
                    </Col>
                  ))}
                </Row>
              )
            }
          ]}
        />
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <Button type="default" size="large" style={{ height: '48px', padding: '0 32px' }}>
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

const CourseCard = ({ course }: { course: Course }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03, boxShadow: '0 12px 32px 0 rgba(56,189,248,0.12)' }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%' }}
    >
      <Card
        className="course-card"
        hoverable
        variant="borderless"
        style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(56,189,248,0.08)', height: '100%', padding: 0 }}
        styles={{ body: { padding: 20, display: 'flex', flexDirection: 'column', height: '100%' } }}
        cover={
          <div style={{ position: "relative" }}>
            <Image
              src={course.Image || "/placeholder.svg"}
              alt={course.title}
              preview={false}
              style={{ height: "180px", objectFit: "cover", borderTopLeftRadius: 20, borderTopRightRadius: 20, transition: 'transform 0.4s', width: '100%' }}
            />
            <div style={{ position: 'absolute', inset: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 60%)' }} />
            {course.isFree ? (
              <Tag color="green" style={{ position: "absolute", top: 12, left: 12, fontWeight: 600, fontSize: 13, borderRadius: 999, padding: '4px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>Miễn phí</Tag>
            ) : course.oldPrice && course.oldPrice > course.price ? (
              <Tag color="red" style={{ position: "absolute", top: 12, left: 12, fontWeight: 700, fontSize: 15, borderRadius: 999, padding: '4px 18px', letterSpacing: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                -{Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)}% | {course.price.toLocaleString('vi-VN')} VND
              </Tag>
            ) : null}
          </div>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar src={course.author.avatar} size={32} icon={<UserOutlined />} />
          <span style={{ fontWeight: 500, color: '#334155', fontSize: 15 }}>{course.author.name}</span>
        </div>
        <Typography.Title level={5} ellipsis={{ rows: 2 }} style={{ minHeight: 48, marginBottom: 8, fontWeight: 700, fontSize: 20, color: '#1e293b', lineHeight: 1.3 }}>
          {course.title}
        </Typography.Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#64748b', marginBottom: 8 }}>
          <BookOutlined style={{ marginRight: 4 }} /> {course.lessons || 30} bài
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span><ClockIcon style={{ marginRight: 4 }} />{course.duration || '15 giờ'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Rate value={course.rating} disabled allowHalf style={{ fontSize: 15, color: '#f59e0b' }} />
          <span style={{ fontWeight: 600, color: '#f59e0b', fontSize: 14 }}>{course.rating.toFixed(1)}</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>({course.reviews})</span>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', margin: '10px 0 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {course.isFree ? (
              <span style={{ fontWeight: 800, fontSize: 20, color: '#16a34a' }}>Miễn phí</span>
            ) : course.oldPrice && course.oldPrice > course.price ? (
              <>
                <span style={{ fontWeight: 800, fontSize: 20, color: '#1e3a8a' }}>{course.price.toLocaleString('vi-VN')} VND</span>
                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: 15 }}>{course.oldPrice.toLocaleString('vi-VN')} VND</span>
                <Tag color="red" style={{ marginLeft: 8, fontWeight: 700, fontSize: 14, borderRadius: 999, padding: '2px 12px', letterSpacing: 1, display: 'inline-flex', alignItems: 'center' }}>
                  -{Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)}%
                </Tag>
              </>
            ) : (
              <span style={{ fontWeight: 800, fontSize: 20, color: '#1e3a8a' }}>{course.price.toLocaleString('vi-VN')} VND</span>
            )}
          </div>
          <Button type="primary" shape="round" size="middle" style={{ background: 'linear-gradient(90deg,#06b6d4,#6366f1)', border: 0, fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px rgba(56,189,248,0.10)' }} onClick={() => window.location.href = `/courses/${course.slug}`}>Xem chi tiết</Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default Homepage;