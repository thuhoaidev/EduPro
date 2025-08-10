import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Alert, Button, Progress, Space, Avatar, Tag } from 'antd';
import { BookOutlined, UserOutlined, StarOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import instructorService, { type CourseAnalytics } from '../../../services/instructorService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface CourseAnalyticsProps {
  courseId: string;
}

const CourseAnalytics: React.FC<CourseAnalyticsProps> = ({ courseId }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseAnalytics();
    }
  }, [courseId]);

  const fetchCourseAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorService.getCourseAnalytics(courseId);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu khóa học');
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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>Đang tải dữ liệu khóa học...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchCourseAnalytics}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (!analytics) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Không thể tải dữ liệu khóa học"
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <BookOutlined style={{ color: '#1890ff' }} />
            Phân tích khóa học
          </Space>
        }
        extra={
          <Button 
            type="link" 
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            icon={<EyeOutlined />}
          >
            Xem chi tiết
          </Button>
        }
      >
        {/* Thông tin khóa học */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Avatar 
                size={64} 
                src={analytics.course.thumbnail} 
                shape="square"
                icon={<BookOutlined />}
                style={{ marginRight: '16px' }}
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>{analytics.course.title}</Title>
                <Tag color={getStatusColor(analytics.course.status)}>
                  {getStatusText(analytics.course.status)}
                </Tag>
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Giá khóa học"
                  value={formatCurrency(analytics.course.price)}
                  prefix={<BookOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Đánh giá"
                  value={analytics.course.rating?.toFixed(1) || '0.0'}
                  prefix={<StarOutlined />}
                  suffix={`(${analytics.course.totalReviews || 0})`}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Học viên đăng ký"
                  value={analytics.course.enrolledStudents || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tổng đăng ký"
                  value={analytics.analytics.totalEnrollments}
                  prefix={<UserOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Thống kê chi tiết */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Tỷ lệ hoàn thành" size="small">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Progress
                  type="circle"
                  percent={analytics.analytics.completionRate}
                  format={(percent) => `${percent?.toFixed(1)}%`}
                  strokeColor="#52c41a"
                  size={120}
                />
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary">
                    {analytics.analytics.completedEnrollments} / {analytics.analytics.totalEnrollments} học viên đã hoàn thành
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Thống kê đăng ký" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Tổng đăng ký"
                    value={analytics.analytics.totalEnrollments}
                    prefix={<UserOutlined />}
                    valueStyle={{ fontSize: '20px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Đã hoàn thành"
                    value={analytics.analytics.completedEnrollments}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Xu hướng đăng ký */}
        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Xu hướng đăng ký (7 ngày gần nhất)" size="small">
              {analytics.analytics.enrollmentTrend.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {analytics.analytics.enrollmentTrend.slice(-7).map((item) => (
                    <div key={item._id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <Text>{new Date(item._id).toLocaleDateString('vi-VN')}</Text>
                      <Text strong>{item.count} đăng ký</Text>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  <UserOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <div>Chưa có dữ liệu đăng ký</div>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Xu hướng hoàn thành (7 ngày gần nhất)" size="small">
              {analytics.analytics.completionTrend.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {analytics.analytics.completionTrend.slice(-7).map((item) => (
                    <div key={item._id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <Text>{new Date(item._id).toLocaleDateString('vi-VN')}</Text>
                      <Text strong style={{ color: '#52c41a' }}>
                        {item.completedCount} hoàn thành
                      </Text>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <div>Chưa có dữ liệu hoàn thành</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CourseAnalytics;
