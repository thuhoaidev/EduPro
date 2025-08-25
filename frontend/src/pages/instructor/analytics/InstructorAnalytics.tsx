import React, { useEffect, useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Spin, 
  Alert, 
  Button,
  Space,
  Select,
  DatePicker,
  Divider,
  Tag,
  Progress,
  List,
  Avatar,
  Empty
} from "antd";
import { 
  BookOutlined, 
  UserOutlined, 
  DollarOutlined, 
  TrophyOutlined,
  EyeOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  CalendarOutlined,
  DownloadOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import instructorService from "../../../services/instructorService";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const FADE_IN_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface AnalyticsData {
  overview: {
    totalCourses: number;
    totalStudents: number;
    totalEarnings: number;
    totalEnrollments: number;
    averageRating: number;
    completionRate: number;
  };
  monthlyStats: Array<{
    month: string;
    enrollments: number;
    earnings: number;
    courses: number;
  }>;
  coursePerformance: Array<{
    courseId: string;
    title: string;
    enrollments: number;
    earnings: number;
    rating: number;
    completionRate: number;
  }>;
  studentEngagement: Array<{
    date: string;
    activeStudents: number;
    newEnrollments: number;
    completedLessons: number;
  }>;
  earningsBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  topPerformingCourses: Array<{
    courseId: string;
    title: string;
    thumbnail: string;
    enrollments: number;
    earnings: number;
    rating: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const InstructorAnalytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching analytics data...');
      
      const params: any = { timeRange };
      if (dateRange) {
        params.startDate = dateRange[0];
        params.endDate = dateRange[1];
      }
      
      const data = await instructorService.getAnalytics(params);
      console.log('✅ Analytics data received:', data);
      
      // Kiểm tra và xử lý dữ liệu
      if (data && typeof data === 'object') {
        setAnalyticsData(data);
      } else {
        throw new Error('Dữ liệu không hợp lệ');
      }
    } catch (err: any) {
      console.error('❌ Error fetching analytics data:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log('Exporting analytics data...', analyticsData);
    
    // Tạo file CSV để export
    if (analyticsData) {
      const csvContent = generateCSVData(analyticsData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateCSVData = (data: AnalyticsData) => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Tổng khóa học', data.overview?.totalCourses || 0],
      ['Tổng học viên', data.overview?.totalStudents || 0],
      ['Tổng thu nhập', data.overview?.totalEarnings || 0],
      ['Đánh giá trung bình', (data.overview?.averageRating || 0).toFixed(1)],
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px', color: '#2c3e50', fontWeight: 500 }}>
          Đang tải dữ liệu thống kê...
        </div>
        <div style={{ marginTop: '10px', color: '#7f8c8d', fontSize: '14px' }}>
          Vui lòng chờ trong giây lát
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchAnalyticsData}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div style={{ 
        padding: '24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <Alert
          message="Không có dữ liệu"
          description="Không thể tải dữ liệu thống kê"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <style>{`
        .stats-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        .main-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        .page-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        .chart-container {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
        }
        .filter-section {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
      `}</style>

      <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP_VARIANTS}>
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '32px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={2} className="page-title">
              <BarChartOutlined style={{ marginRight: '12px', fontSize: '32px' }} />
              Báo cáo thống kê
            </Title>
            <Button 
              type="primary"
              icon={<DownloadOutlined />}
              style={{ 
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 600
              }}
              onClick={handleExportData}
            >
              Xuất báo cáo
            </Button>
          </div>
          <Text style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 500 }}>
            Phân tích chi tiết về hiệu suất giảng dạy và thu nhập của bạn
          </Text>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="filter-section">
            <Space size="large">
              <div>
                <Text strong style={{ marginRight: 8 }}>Thời gian:</Text>
                <Select
                  value={timeRange}
                  onChange={setTimeRange}
                  style={{ width: 120 }}
                  options={[
                    { value: '7d', label: '7 ngày' },
                    { value: '30d', label: '30 ngày' },
                    { value: '90d', label: '90 ngày' },
                    { value: '1y', label: '1 năm' },
                    { value: 'custom', label: 'Tùy chỉnh' }
                  ]}
                />
              </div>
              {timeRange === 'custom' && (
                <div>
                  <Text strong style={{ marginRight: 8 }}>Khoảng thời gian:</Text>
                  <RangePicker
                    onChange={(dates) => {
                      if (dates) {
                        setDateRange([
                          dates[0]?.toISOString().split('T')[0] || '',
                          dates[1]?.toISOString().split('T')[0] || ''
                        ]);
                      }
                    }}
                  />
                </div>
              )}
            </Space>
          </Card>
        </motion.div>

        {/* Overview Statistics */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: '32px' }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="stats-card">
                  <Statistic
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <BookOutlined style={{ color: '#667eea', fontSize: 20 }} />
                        <span style={{ fontWeight: 600, color: '#2c3e50' }}>Tổng khóa học</span>
                      </div>
                    }
                                         value={analyticsData.overview?.totalCourses || 0}
                    valueStyle={{ 
                      fontSize: '32px', 
                      fontWeight: 700, 
                      color: '#667eea'
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="stats-card">
                  <Statistic
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <UserOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        <span style={{ fontWeight: 600, color: '#2c3e50' }}>Tổng học viên</span>
                      </div>
                    }
                                         value={analyticsData.overview?.totalStudents || 0}
                    valueStyle={{ 
                      fontSize: '32px', 
                      fontWeight: 700, 
                      color: '#52c41a'
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="stats-card">
                  <Statistic
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <DollarOutlined style={{ color: '#faad14', fontSize: 20 }} />
                        <span style={{ fontWeight: 600, color: '#2c3e50' }}>Tổng thu nhập</span>
                      </div>
                    }
                                         value={formatCurrency(analyticsData.overview?.totalEarnings || 0)}
                    valueStyle={{ 
                      fontSize: '28px', 
                      fontWeight: 700, 
                      color: '#faad14'
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="stats-card">
                  <Statistic
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <StarOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                        <span style={{ fontWeight: 600, color: '#2c3e50' }}>Đánh giá TB</span>
                      </div>
                    }
                                         value={(analyticsData.overview?.averageRating || 0).toFixed(1)}
                    suffix="/ 5.0"
                    valueStyle={{ 
                      fontSize: '32px', 
                      fontWeight: 700, 
                      color: '#ff4d4f'
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Row gutter={[24, 24]}>
            {/* Monthly Trends */}
            <Col xs={24} lg={12}>
              <Card
                className="main-card"
                title={
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '700'
                  }}>
                    <LineChartOutlined style={{ fontSize: 20 }} />
                    Xu hướng hàng tháng
                  </div>
                }
              >
                                 <div className="chart-container">
                   {(analyticsData.monthlyStats || []).length > 0 ? (
                     <ResponsiveContainer width="100%" height={300}>
                       <LineChart data={analyticsData.monthlyStats}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="month" />
                         <YAxis />
                         <Tooltip />
                         <Legend />
                         <Line 
                           type="monotone" 
                           dataKey="enrollments" 
                           stroke="#667eea" 
                           strokeWidth={3}
                           name="Đăng ký"
                         />
                         <Line 
                           type="monotone" 
                           dataKey="earnings" 
                           stroke="#52c41a" 
                           strokeWidth={3}
                           name="Thu nhập (x1000)"
                         />
                       </LineChart>
                     </ResponsiveContainer>
                   ) : (
                     <div style={{ 
                       textAlign: 'center', 
                       padding: '60px 20px',
                       color: '#7f8c8d'
                     }}>
                       <LineChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                       <div>Chưa có dữ liệu xu hướng hàng tháng</div>
                     </div>
                   )}
                 </div>
              </Card>
            </Col>

            {/* Earnings Breakdown */}
            <Col xs={24} lg={12}>
              <Card
                className="main-card"
                title={
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '700'
                  }}>
                    <PieChartOutlined style={{ fontSize: 20 }} />
                    Phân bổ thu nhập
                  </div>
                }
              >
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                                             <Pie
                         data={analyticsData.earningsBreakdown || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                                                 {(analyticsData.earningsBreakdown || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

            {/* Student Engagement */}
            <Col xs={24} lg={12}>
              <Card
                className="main-card"
                title={
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '700'
                  }}>
                    <RiseOutlined style={{ fontSize: 20 }} />
                    Tương tác học viên
                  </div>
                }
              >
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                                         <AreaChart data={analyticsData.studentEngagement || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="activeStudents" 
                        stackId="1"
                        stroke="#667eea" 
                        fill="#667eea" 
                        fillOpacity={0.6}
                        name="Học viên hoạt động"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="newEnrollments" 
                        stackId="1"
                        stroke="#52c41a" 
                        fill="#52c41a" 
                        fillOpacity={0.6}
                        name="Đăng ký mới"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

            {/* Course Performance */}
            <Col xs={24} lg={12}>
              <Card
                className="main-card"
                title={
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '700'
                  }}>
                    <BarChartOutlined style={{ fontSize: 20 }} />
                    Hiệu suất khóa học
                  </div>
                }
              >
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                                         <BarChart data={(analyticsData.coursePerformance || []).slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="enrollments" fill="#667eea" name="Đăng ký" />
                      <Bar dataKey="earnings" fill="#52c41a" name="Thu nhập (x1000)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/* Top Performing Courses */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ marginTop: '32px' }}
        >
          <Card
            className="main-card"
            title={
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '700'
              }}>
                <TrophyOutlined style={{ fontSize: 20 }} />
                Khóa học hiệu suất cao
              </div>
            }
            extra={
              <Button 
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                style={{ 
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 600
                }}
                onClick={() => navigate('/instructor/courses')}
              >
                Xem tất cả
              </Button>
            }
          >
                         {(analyticsData.topPerformingCourses || []).length > 0 ? (
                               <List
                   dataSource={analyticsData.topPerformingCourses || []}
                renderItem={(course, index) => (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <List.Item style={{ 
                      padding: '16px',
                      borderRadius: 12,
                      marginBottom: 8,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    >
                      <List.Item.Meta
                        avatar={
                          <div style={{ position: 'relative' }}>
                            <Avatar 
                              size={56} 
                              src={course.thumbnail} 
                              shape="square"
                              icon={<BookOutlined />}
                              style={{ borderRadius: 12 }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              background: index < 3 ? '#faad14' : '#d9d9d9',
                              color: 'white',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </div>
                          </div>
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Text strong style={{ fontSize: 16, color: '#2c3e50' }}>
                              {course.title}
                            </Text>
                            <Tag color="green" style={{ borderRadius: 6, fontWeight: 600 }}>
                              ⭐ {course.rating.toFixed(1)}
                            </Tag>
                          </div>
                        }
                        description={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <UserOutlined style={{ color: '#1890ff' }} />
                                <Text type="secondary" style={{ fontWeight: 500 }}>
                                  {course.enrollments} học viên
                                </Text>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <DollarOutlined style={{ color: '#52c41a' }} />
                                <Text type="secondary" style={{ fontWeight: 500 }}>
                                  {formatCurrency(course.earnings)}
                                </Text>
                              </div>
                            </div>
                            <Progress
                                                             percent={Math.min((course.enrollments / Math.max(...(analyticsData.topPerformingCourses || []).map(c => c.enrollments))) * 100, 100)}
                              showInfo={false}
                              strokeColor={{
                                '0%': '#667eea',
                                '100%': '#764ba2',
                              }}
                              strokeWidth={6}
                            />
                          </div>
                        }
                      />
                    </List.Item>
                  </motion.div>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có dữ liệu khóa học"
                style={{ padding: '40px' }}
              />
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InstructorAnalytics;
