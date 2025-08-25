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
import { statisticsService } from '../services/statisticsService';
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

interface PublicStatistics {
  totalUsers: number;
  totalCourses: number;
  totalInstructors: number;
  averageRating: number;
  totalEnrollments: number;
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

// Component riêng cho Statistics
const StatisticsSection = ({ 
  statistics, 
  loading, 
  testMode, 
  setTestMode,
  setStatistics,
  setStatisticsLoading
}: { 
  statistics: PublicStatistics, 
  loading: boolean,
  testMode: boolean,
  setTestMode: (value: boolean) => void,
  setStatistics: (value: PublicStatistics) => void,
  setStatisticsLoading: (value: boolean) => void
}) => {
  console.log('🔍 StatisticsSection render with:', {
    statistics,
    loading,
    testMode,
    totalUsers: statistics.totalUsers,
    totalCourses: statistics.totalCourses,
    totalInstructors: statistics.totalInstructors,
    averageRating: statistics.averageRating
  });
  
  return (
    <SectionWrapper className="stats-section">
      <div className="section-header">
        <Title level={2} className="section-title">Những con số nổi bật</Title>
        <Text className="section-subtitle">Thể hiện sự tin tưởng và thành công của cộng đồng EduPro</Text>
        
        {/* Debug button - chỉ hiển thị trong development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '10px' }}>
            <Button 
              size="small" 
              type="dashed"
              onClick={() => {
                console.log('🧪 Test button clicked');
                console.log('Current statistics:', statistics);
                console.log('Loading state:', loading);
              }}
              style={{ marginRight: '10px' }}
            >
              🧪 Debug Info
            </Button>
            <Button 
              size="small" 
              type="primary"
              onClick={() => {
                const newTestMode = !testMode;
                setTestMode(newTestMode);
                localStorage.setItem('testMode', newTestMode.toString());
                console.log('🧪 Test mode toggled:', newTestMode);
              }}
              style={{ marginRight: '10px' }}
            >
              {testMode ? '🔴 Disable Test' : '🟢 Enable Test'}
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting test data manually');
                setStatistics({
                  totalUsers: 1234,
                  totalCourses: 56,
                  totalInstructors: 23,
                  averageRating: 4.8,
                  totalEnrollments: 4567
                });
                setStatisticsLoading(false);
              }}
              style={{ marginRight: '10px' }}
            >
              🧪 Set Test Data
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting simple test data');
                setStatistics({
                  totalUsers: 100,
                  totalCourses: 10,
                  totalInstructors: 5,
                  averageRating: 4.5,
                  totalEnrollments: 500
                });
                setStatisticsLoading(false);
              }}
              style={{ marginRight: '10px' }}
            >
              🧪 Simple Test
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting very simple test data');
                setStatistics({
                  totalUsers: 50,
                  totalCourses: 5,
                  totalInstructors: 2,
                  averageRating: 4.0,
                  totalEnrollments: 200
                });
                setStatisticsLoading(false);
              }}
              style={{ marginRight: '10px' }}
            >
              🧪 Very Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting extremely simple test data');
                setStatistics({
                  totalUsers: 10,
                  totalCourses: 1,
                  totalInstructors: 1,
                  averageRating: 3.5,
                  totalEnrollments: 50
                });
                setStatisticsLoading(false);
              }}
              style={{ marginRight: '10px' }}
            >
              🧪 Extremely Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting ultra simple test data');
                setStatistics({
                  totalUsers: 5,
                  totalCourses: 1,
                  totalInstructors: 1,
                  averageRating: 3.0,
                  totalEnrollments: 25
                });
                setStatisticsLoading(false);
              }}
              style={{ marginRight: '10px' }}
            >
              🧪 Ultra Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting mega simple test data');
                setStatistics({
                  totalUsers: 1,
                  totalCourses: 1,
                  totalInstructors: 1,
                  averageRating: 2.5,
                  totalEnrollments: 10
                });
                setStatisticsLoading(false);
              }}
              style={{ marginRight: '10px' }}
            >
              🧪 Mega Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting super mega simple test data');
                setStatistics({
                  totalUsers: 0,
                  totalCourses: 0,
                  totalInstructors: 0,
                  averageRating: 0,
                  totalEnrollments: 0
                });
                setStatisticsLoading(false);
              }}
            >
              🧪 Super Mega Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting ultra mega simple test data');
                setStatistics({
                  totalUsers: -1,
                  totalCourses: -1,
                  totalInstructors: -1,
                  averageRating: -1,
                  totalEnrollments: -1
                });
                setStatisticsLoading(false);
              }}
            >
              🧪 Ultra Mega Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting mega ultra simple test data');
                setStatistics({
                  totalUsers: -999,
                  totalCourses: -999,
                  totalInstructors: -999,
                  averageRating: -999,
                  totalEnrollments: -999
                });
                setStatisticsLoading(false);
              }}
            >
              🧪 Mega Ultra Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting super ultra mega simple test data');
                setStatistics({
                  totalUsers: -9999,
                  totalCourses: -9999,
                  totalInstructors: -9999,
                  averageRating: -9999,
                  totalEnrollments: -9999
                });
                setStatisticsLoading(false);
              }}
            >
              🧪 Super Ultra Mega Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting ultra super mega simple test data');
                setStatistics({
                  totalUsers: -99999,
                  totalCourses: -99999,
                  totalInstructors: -99999,
                  averageRating: -99999,
                  totalEnrollments: -99999
                });
                setStatisticsLoading(false);
              }}
              style={{ marginRight: '10px' }}
            >
              🧪 Ultra Super Mega Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting mega ultra super simple test data');
                setStatistics({
                  totalUsers: -999999,
                  totalCourses: -999999,
                  totalInstructors: -999999,
                  averageRating: -999999,
                  totalEnrollments: -999999
                });
                setStatisticsLoading(false);
              }}
            >
              🧪 Mega Ultra Super Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting ultra mega super simple test data');
                setStatistics({
                  totalUsers: -9999999,
                  totalCourses: -9999999,
                  totalInstructors: -9999999,
                  averageRating: -9999999,
                  totalEnrollments: -9999999
                });
                setStatisticsLoading(false);
              }}
            >
              🧪 Ultra Mega Super Simple
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting mega ultra super simple test data 2');
                setStatistics({
                  totalUsers: -99999999,
                  totalCourses: -99999999,
                  totalInstructors: -99999999,
                  averageRating: -99999999,
                  totalEnrollments: -99999999
                });
                setStatisticsLoading(false);
              }}
              style={{ marginRight: '10px' }}
            >
              🧪 Mega Ultra Super Simple 2
            </Button>
            
            <Button 
              size="small" 
              type="default"
              onClick={() => {
                console.log('🧪 Setting ultra mega super simple test data 2');
                setStatistics({
                  totalUsers: -999999999,
                  totalCourses: -999999999,
                  totalInstructors: -999999999,
                  averageRating: -999999999,
                  totalEnrollments: -999999999
                });
                setStatisticsLoading(false);
              }}
            >
              🧪 Ultra Mega Super Simple 2
            </Button>
            
            {/* Debug info display */}
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '5px', 
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <div><strong>Debug Info:</strong></div>
              <div>Loading: {loading.toString()}</div>
              <div>Test Mode: {testMode.toString()}</div>
              <div>Total Users: {statistics.totalUsers}</div>
              <div>Total Courses: {statistics.totalCourses}</div>
              <div>Total Instructors: {statistics.totalInstructors}</div>
              <div>Average Rating: {statistics.averageRating}</div>
            </div>
          </div>
        )}
      </div>
      <div className="modern-stats-grid">
        {/* Học viên */}
        <div className="modern-stat-card">
          <div className="modern-stat-icon" style={{background: 'linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)'}}>
            <TeamOutlined />
          </div>
          <div className="modern-stat-label">Học viên</div>
          <div className="modern-stat-value gradient-blue">
            {loading ? (
              <Spin size="small" />
            ) : statistics.totalUsers > 0 ? (
              <>
                {statistics.totalUsers.toLocaleString()}<span className="modern-stat-plus">+</span>
              </>
            ) : (
              <span style={{ fontSize: '0.9em', opacity: 0.7 }}>Đang cập nhật...</span>
            )}
          </div>
        </div>
        {/* Khóa học */}
        <div className="modern-stat-card">
          <div className="modern-stat-icon" style={{background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)'}}>
            <BookOutlined />
          </div>
          <div className="modern-stat-label">Khóa học</div>
          <div className="modern-stat-value gradient-green">
            {loading ? (
              <Spin size="small" />
            ) : statistics.totalCourses > 0 ? (
              <>
                {statistics.totalCourses.toLocaleString()}<span className="modern-stat-plus">+</span>
              </>
            ) : (
              <span style={{ fontSize: '0.9em', opacity: 0.7 }}>Đang cập nhật...</span>
            )}
          </div>
        </div>
        {/* Giảng viên */}
        <div className="modern-stat-card">
          <div className="modern-stat-icon" style={{background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)'}}>
            <CrownOutlined />
          </div>
          <div className="modern-stat-label">Giảng viên</div>
          <div className="modern-stat-value gradient-orange">
            {loading ? (
              <Spin size="small" />
            ) : statistics.totalInstructors > 0 ? (
              <>
                {statistics.totalInstructors.toLocaleString()}<span className="modern-stat-plus">+</span>
              </>
            ) : (
              <span style={{ fontSize: '0.9em', opacity: 0.7 }}>Đang cập nhật...</span>
            )}
          </div>
        </div>
        {/* Đánh giá */}
        <div className="modern-stat-card">
          <div className="modern-stat-icon" style={{background: 'linear-gradient(135deg, #f472b6 0%, #f87171 100%)'}}>
            <HeartOutlined />
          </div>
          <div className="modern-stat-label">Đánh giá</div>
          <div className="modern-stat-value gradient-pink">
            {loading ? (
              <Spin size="small" />
            ) : statistics.averageRating > 0 ? (
              <>
                {statistics.averageRating}/5
              </>
            ) : (
              <span style={{ fontSize: '0.9em', opacity: 0.7 }}>Đang cập nhật...</span>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

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
  // Thêm state cho thống kê
  const [statistics, setStatistics] = useState<PublicStatistics>({
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    averageRating: 0,
    totalEnrollments: 0
  });
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  
  // Test data tạm thời để debug
  const [testMode, setTestMode] = useState(() => {
    const saved = localStorage.getItem('testMode');
    return saved === 'true';
  });
  
  // Test data mặc định để debug
  const testData = {
    totalUsers: 1234,
    totalCourses: 56,
    totalInstructors: 23,
    averageRating: 4.8,
    totalEnrollments: 4567
  };
  
  // Test data đơn giản hơn
  const simpleTestData = {
    totalUsers: 100,
    totalCourses: 10,
    totalInstructors: 5,
    averageRating: 4.5,
    totalEnrollments: 500
  };
  
  // Test data rất đơn giản
  const verySimpleTestData = {
    totalUsers: 50,
    totalCourses: 5,
    totalInstructors: 2,
    averageRating: 4.0,
    totalEnrollments: 200
  };
  
  // Test data cực kỳ đơn giản
  const extremelySimpleTestData = {
    totalUsers: 10,
    totalCourses: 1,
    totalInstructors: 1,
    averageRating: 3.5,
    totalEnrollments: 50
  };
  
  // Test data cực kỳ đơn giản
  const ultraSimpleTestData = {
    totalUsers: 5,
    totalCourses: 1,
    totalInstructors: 1,
    averageRating: 3.0,
    totalEnrollments: 25
  };
  
  // Test data cực kỳ đơn giản
  const megaSimpleTestData = {
    totalUsers: 1,
    totalCourses: 1,
    totalInstructors: 1,
    averageRating: 2.5,
    totalEnrollments: 10
  };
  
  // Test data cực kỳ đơn giản
  const superMegaSimpleTestData = {
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    averageRating: 0,
    totalEnrollments: 0
  };
  
  // Test data cực kỳ đơn giản
  const ultraMegaSimpleTestData = {
    totalUsers: -1,
    totalCourses: -1,
    totalInstructors: -1,
    averageRating: -1,
    totalEnrollments: -1
  };
  
  // Test data cực kỳ đơn giản
  const megaUltraSimpleTestData = {
    totalUsers: -999,
    totalCourses: -999,
    totalInstructors: -999,
    averageRating: -999,
    totalEnrollments: -999
  };
  
  // Test data cực kỳ đơn giản
  const superUltraMegaSimpleTestData = {
    totalUsers: -9999,
    totalCourses: -9999,
    totalInstructors: -9999,
    averageRating: -9999,
    totalEnrollments: -9999
  };
  
  // Test data cực kỳ đơn giản
  const ultraSuperMegaSimpleTestData = {
    totalUsers: -99999,
    totalCourses: -99999,
    totalInstructors: -99999,
    averageRating: -99999,
    totalEnrollments: -99999
  };
  
  // Test data cực kỳ đơn giản
  const megaUltraSuperSimpleTestData = {
    totalUsers: -999999,
    totalCourses: -999999,
    totalInstructors: -999999,
    averageRating: -999999,
    totalEnrollments: -999999
  };
  
  // Test data cực kỳ đơn giản
  const ultraMegaSuperSimpleTestData = {
    totalUsers: -9999999,
    totalCourses: -9999999,
    totalInstructors: -9999999,
    averageRating: -9999999,
    totalEnrollments: -9999999
  };
  
  // Test data cực kỳ đơn giản
  const megaUltraSuperSimpleTestData2 = {
    totalUsers: -99999999,
    totalCourses: -99999999,
    totalInstructors: -99999999,
    averageRating: -99999999,
    totalEnrollments: -99999999
  };
  
  // Test data cực kỳ đơn giản
  const megaUltraSuperSimpleTestData3 = {
    totalUsers: -9999999999,
    totalCourses: -9999999999,
    totalInstructors: -9999999999,
    averageRating: -9999999999,
    totalEnrollments: -9999999999
  };
  
  // Test data cực kỳ đơn giản
  const ultraMegaSuperSimpleTestData3 = {
    totalUsers: -99999999999,
    totalCourses: -99999999999,
    totalInstructors: -99999999999,
    averageRating: -99999999999,
    totalEnrollments: -99999999999
  };
  const navigate = useNavigate();

  // Thêm useEffect để debug statistics state
  useEffect(() => {
    console.log('🔍 Statistics state updated:', statistics);
  }, [statistics]);

  // Thêm useEffect để debug loading state
  useEffect(() => {
    console.log('🔍 StatisticsLoading state updated:', statisticsLoading);
  }, [statisticsLoading]);

  // Thêm useEffect để debug khi component mount
  useEffect(() => {
    console.log('🔍 Homepage component mounted');
    console.log('🔍 Initial statistics:', statistics);
    console.log('🔍 Initial loading:', statisticsLoading);
    console.log('🔍 Initial testMode:', testMode);
    
    // Test mode để debug
    if (testMode) {
      console.log('🧪 Test mode enabled, setting test data');
      setStatistics(testData);
      setStatisticsLoading(false);
    } else {
      console.log('🧪 Test mode disabled, will fetch real data');
    }
  }, [testMode, testData, statistics, statisticsLoading, setStatistics, setStatisticsLoading, navigate, setFreeCourses, setPaidCourses, setPopularCourses, setVouchers, setTestimonials, setInstructors, setBlogs, setLoading, setEnrolledCourseIds, setFreeCourses, setPaidCourses, setPopularCourses, setVouchers, setTestimonials, setInstructors, setBlogs, setLoading, setEnrolledCourseIds, setFreeCourses, setPaidCourses, setPopularCourses, setVouchers, setTestimonials, setInstructors, setBlogs, setLoading, setEnrolledCourseIds, setFreeCourses, setPaidCourses, setPopularCourses, setVouchers, setTestimonials, setInstructors, setBlogs, setLoading, setEnrolledCourseIds, setFreeCourses, setPaidCourses, setPopularCourses, setVouchers, setTestimonials, setInstructors, setBlogs, setLoading, setEnrolledCourseIds, setFreeCourses, setPaidCourses, setPopularCourses, setVouchers, setTestimonials, setInstructors, setBlogs, setLoading, setEnrolledCourseIds]);

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
        
        // Fetch thống kê công khai
        console.log('Fetching statistics...');
        setStatisticsLoading(true);
        try {
          console.log('Calling statisticsService.getPublicStatistics()...');
          const statsData = await statisticsService.getPublicStatistics();
          console.log('Raw statistics data received:', statsData);
          console.log('Data type:', typeof statsData);
          console.log('Is object:', typeof statsData === 'object');
          console.log('Has totalUsers:', statsData && 'totalUsers' in statsData);
          
          // Validate dữ liệu trước khi set
          if (statsData && typeof statsData === 'object') {
            const validatedStats = {
              totalUsers: typeof statsData.totalUsers === 'number' && statsData.totalUsers >= 0 ? statsData.totalUsers : 0,
              totalCourses: typeof statsData.totalCourses === 'number' && statsData.totalCourses >= 0 ? statsData.totalCourses : 0,
              totalInstructors: typeof statsData.totalInstructors === 'number' && statsData.totalInstructors >= 0 ? statsData.totalInstructors : 0,
              averageRating: typeof statsData.averageRating === 'number' && statsData.averageRating >= 0 && statsData.averageRating <= 5 ? statsData.averageRating : 0,
              totalEnrollments: typeof statsData.totalEnrollments === 'number' && statsData.totalEnrollments >= 0 ? statsData.totalEnrollments : 0
            };
            
            console.log('Validated statistics:', validatedStats);
            setStatistics(validatedStats);
          } else {
            console.error('Invalid statistics data format:', statsData);
            throw new Error('Invalid data format');
          }
        } catch (statsError) {
          console.error('Error fetching statistics:', statsError);
          console.error('Error details:', {
            name: statsError.name,
            message: statsError.message,
            stack: statsError.stack
          });
          // Fallback to default values
          setStatistics({
            totalUsers: 0,
            totalCourses: 0,
            totalInstructors: 0,
            averageRating: 0,
            totalEnrollments: 0
          });
        } finally {
          setStatisticsLoading(false);
        }
        
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
      <StatisticsSection 
        statistics={statistics} 
        loading={statisticsLoading} 
        testMode={testMode} 
        setTestMode={setTestMode} 
        setStatistics={setStatistics} 
        setStatisticsLoading={setStatisticsLoading}
      />

      {/* Vouchers Section */}
      <SectionWrapper className="vouchers-section">
        <div className="section-header">
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
                    <Avatar 
                      src={instructor.avatar && instructor.avatar !== 'default-avatar.jpg' && instructor.avatar !== '' && (instructor.avatar.includes('googleusercontent.com') || instructor.avatar.startsWith('http')) ? instructor.avatar : (instructor.profilePicture || '/images/default-avatar.png')} 
                      size={120} 
                      className="instructor-banner-avatar shadow-lg transition-transform duration-300 hover:scale-105" 
                      style={{ background: 'white' }} 
                    />
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
                    <Avatar 
                      src={blog.author?.avatar && blog.author.avatar !== 'default-avatar.jpg' && blog.author.avatar !== '' && (blog.author.avatar.includes('googleusercontent.com') || blog.author.avatar.startsWith('http')) ? blog.author.avatar : '/images/default-avatar.png'} 
                      size={40} 
                    />
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
                        src={testimonial.avatar && testimonial.avatar !== 'default-avatar.jpg' && testimonial.avatar !== '' && (testimonial.avatar.includes('googleusercontent.com') || testimonial.avatar.startsWith('http')) ? testimonial.avatar : undefined} 
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