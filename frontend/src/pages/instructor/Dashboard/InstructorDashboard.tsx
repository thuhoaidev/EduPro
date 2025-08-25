import React, { useEffect, useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Spin, 
  Alert, 
  Progress, 
  List, 
  Avatar, 
  Tag, 
  Button,
  Space,
  Divider,
  Tooltip,
  Badge,
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
  ExclamationCircleOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FireOutlined,
  LineChartOutlined,
  TeamOutlined,
  WalletOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import instructorService from "../../../services/instructorService";
import type { InstructorDashboardStats } from "../../../services/instructorService";

const { Title, Text, Paragraph } = Typography;

const FADE_IN_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<InstructorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching dashboard stats...');
      const data = await instructorService.getDashboardStats();
      console.log('✅ Dashboard stats received:', data);
      setStats(data);
    } catch (err: any) {
      console.error('❌ Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'orange';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'draft':
        return 'Bản nháp';
      default:
        return status;
    }
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
          Đang tải dữ liệu dashboard...
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
            <Button size="small" onClick={fetchDashboardStats}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!stats) {
    console.log('❌ No stats data available');
    return (
      <div style={{ 
        padding: '24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <Alert
          message="Không có dữ liệu"
          description="Không thể tải dữ liệu dashboard"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  console.log('📊 Rendering dashboard with stats:', stats);

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
        .quick-action-btn {
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .quick-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        .course-item {
          transition: all 0.3s ease;
          border-radius: 12px;
          margin-bottom: 8px;
        }
        .course-item:hover {
          background: rgba(102, 126, 234, 0.05);
          transform: translateX(4px);
        }
        .progress-bar {
          border-radius: 8px;
        }
        .empty-state {
          padding: 40px;
          text-align: center;
          color: #8b9dc3;
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
          <Title level={2} className="page-title">
            <TrophyOutlined style={{ marginRight: '12px', fontSize: '32px' }} />
            Dashboard Giảng Viên
          </Title>
          <Text style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 500 }}>
            Chào mừng bạn trở lại! Đây là tổng quan về hoạt động giảng dạy của bạn.
          </Text>
        </motion.div>

        {/* Thống kê tổng quan */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="stats-card">
                  <Statistic
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <BookOutlined style={{ color: '#667eea', fontSize: 20 }} />
                        <span style={{ fontWeight: 600, color: '#2c3e50' }}>Tổng khóa học</span>
                      </div>
                    }
                    value={stats.overview?.totalCourses || 0}
                    valueStyle={{ 
                      fontSize: '32px', 
                      fontWeight: 700, 
                      color: '#667eea',
                      marginBottom: 8
                    }}
                    suffix={
                      <div style={{ fontSize: '14px', color: '#64748b', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          Đã duyệt: {stats.overview?.publishedCourses || 0}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined style={{ color: '#faad14' }} />
                          Chờ duyệt: {stats.overview?.pendingCourses || 0}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </motion.div>
            </Col>
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
                        <TeamOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        <span style={{ fontWeight: 600, color: '#2c3e50' }}>Tổng học viên</span>
                      </div>
                    }
                    value={stats.overview?.totalStudents || 0}
                    valueStyle={{ 
                      fontSize: '32px', 
                      fontWeight: 700, 
                      color: '#52c41a',
                      marginBottom: 8
                    }}
                    suffix={
                      <div style={{ fontSize: '14px', color: '#64748b', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UserOutlined style={{ color: '#1890ff' }} />
                          Đăng ký: {stats.overview?.totalEnrollments || 0}
                        </div>
                      </div>
                    }
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
                                                 <LineChartOutlined style={{ color: '#faad14', fontSize: 20 }} />
                        <span style={{ fontWeight: 600, color: '#2c3e50' }}>Tổng thu nhập</span>
                      </div>
                    }
                    value={formatCurrency(stats.overview.totalEarnings)}
                    valueStyle={{ 
                      fontSize: '28px', 
                      fontWeight: 700, 
                      color: '#faad14',
                      marginBottom: 8
                    }}
                    suffix={
                      <div style={{ fontSize: '14px', color: '#64748b', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <DollarOutlined style={{ color: '#52c41a' }} />
                          Giao dịch: {stats.overview.totalTransactions}
                        </div>
                      </div>
                    }
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
                        <WalletOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        <span style={{ fontWeight: 600, color: '#2c3e50' }}>Số dư hiện tại</span>
                      </div>
                    }
                    value={formatCurrency(stats.overview.currentBalance)}
                    valueStyle={{ 
                      fontSize: '28px', 
                      fontWeight: 700, 
                      color: '#52c41a',
                      marginBottom: 8
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Biểu đồ và thống kê chi tiết */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Row gutter={[24, 24]}>
            {/* Top khóa học bán chạy */}
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
                    <FireOutlined style={{ fontSize: 20 }} />
                    Top khóa học bán chạy
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
                {stats.topCourses.length > 0 ? (
                  <List
                    dataSource={stats.topCourses}
                    renderItem={(course, index) => (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <List.Item className="course-item">
                          <List.Item.Meta
                            avatar={
                              <Badge count={index + 1} style={{ 
                                backgroundColor: index < 3 ? '#faad14' : '#d9d9d9',
                                borderRadius: '50%'
                              }}>
                                <Avatar 
                                  size={56} 
                                  src={course.thumbnail} 
                                  shape="square"
                                  icon={<BookOutlined />}
                                  style={{ borderRadius: 12 }}
                                />
                              </Badge>
                            }
                            title={
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 16, color: '#2c3e50' }}>
                                  {course.title}
                                </Text>
                                <Tag color="green" style={{ borderRadius: 6, fontWeight: 600 }}>
                                  ✅ Đã duyệt
                                </Tag>
                              </div>
                            }
                            description={
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <UserOutlined style={{ color: '#1890ff' }} />
                                    <Text type="secondary" style={{ fontWeight: 500 }}>
                                      {course.enrollmentCount} học viên
                                    </Text>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <StarOutlined style={{ color: '#faad14' }} />
                                    <Text type="secondary" style={{ fontWeight: 500 }}>
                                      {course.rating?.toFixed(1) || '0.0'} ({course.totalReviews || 0} đánh giá)
                                    </Text>
                                  </div>
                                </div>
                                <Text strong style={{ 
                                  color: '#faad14', 
                                  fontSize: 16,
                                  fontWeight: 700
                                }}>
                                  {formatCurrency(course.price)}
                                </Text>
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
                    description="Chưa có khóa học nào"
                    className="empty-state"
                  />
                )}
              </Card>
            </Col>

            {/* Thống kê thu nhập theo tháng */}
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
                    Thu nhập theo tháng (6 tháng gần nhất)
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
                    onClick={() => navigate('/instructor/earnings')}
                  >
                    Xem chi tiết
                  </Button>
                }
              >
                <div style={{ height: '300px', overflowY: 'auto' }}>
                  {stats.monthlyEarnings.length > 0 ? (
                    stats.monthlyEarnings.map((item, index) => (
                      <motion.div
                        key={item.month}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        style={{ marginBottom: '20px' }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '12px' 
                        }}>
                          <Text strong style={{ fontSize: 14, color: '#2c3e50' }}>
                            {item.month}
                          </Text>
                          <Text strong style={{ 
                            color: '#52c41a', 
                            fontSize: 16,
                            fontWeight: 700
                          }}>
                            {formatCurrency(item.earnings)}
                          </Text>
                        </div>
                        <Progress
                          percent={Math.min((item.earnings / Math.max(...stats.monthlyEarnings.map(e => e.earnings))) * 100, 100)}
                          showInfo={false}
                          strokeColor={{
                            '0%': '#52c41a',
                            '100%': '#16a34a',
                          }}
                          className="progress-bar"
                          strokeWidth={8}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có dữ liệu thu nhập"
                      className="empty-state"
                    />
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/* Thống kê học viên mới */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
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
                <UserOutlined style={{ fontSize: 20 }} />
                Học viên mới (30 ngày qua)
              </div>
            }
          >
            {stats.recentEnrollments.length > 0 ? (
              <Row gutter={[16, 16]}>
                {stats.recentEnrollments.slice(-7).map((item, index) => (
                  <Col xs={12} sm={8} md={6} lg={3} key={item.date}>
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card size="small" className="stats-card">
                        <Statistic
                          title={
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#64748b',
                              fontWeight: 500,
                              textAlign: 'center'
                            }}>
                              {new Date(item.date).toLocaleDateString('vi-VN')}
                            </div>
                          }
                          value={item.count}
                          prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                          valueStyle={{ 
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#1890ff',
                            textAlign: 'center'
                          }}
                        />
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có học viên mới"
                className="empty-state"
              />
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
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
                <PlusOutlined style={{ fontSize: 20 }} />
                Thao tác nhanh
              </div>
            }
          >
            <Space wrap size="large">
              <Button 
                type="primary" 
                size="large"
                icon={<PlusOutlined />}
                className="quick-action-btn"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 600
                }}
                onClick={() => navigate('/instructor/courses/create')}
              >
                Tạo khóa học mới
              </Button>
              <Button 
                size="large"
                icon={<BookOutlined />}
                className="quick-action-btn"
                style={{ 
                  borderRadius: 12,
                  fontWeight: 600,
                  border: '2px solid #667eea',
                  color: '#667eea'
                }}
                onClick={() => navigate('/instructor/courses')}
              >
                Quản lý khóa học
              </Button>
              <Button 
                size="large"
                icon={<DollarOutlined />}
                className="quick-action-btn"
                style={{ 
                  borderRadius: 12,
                  fontWeight: 600,
                  border: '2px solid #52c41a',
                  color: '#52c41a'
                }}
                onClick={() => navigate('/instructor/earnings')}
              >
                Xem thu nhập
              </Button>
              <Button 
                size="large"
                icon={<UserOutlined />}
                className="quick-action-btn"
                style={{ 
                  borderRadius: 12,
                  fontWeight: 600,
                  border: '2px solid #1890ff',
                  color: '#1890ff'
                }}
                onClick={() => navigate('/instructor/students')}
              >
                Quản lý học viên
              </Button>
            </Space>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InstructorDashboard; 