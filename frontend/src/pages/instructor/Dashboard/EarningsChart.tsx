import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Alert, Button, Select, Space } from 'antd';
import { DollarOutlined, RiseOutlined, FallOutlined, BarChartOutlined } from '@ant-design/icons';
import instructorService, { type EarningsAnalytics } from '../../../services/instructorService';

const { Title, Text } = Typography;
const { Option } = Select;

interface EarningsChartProps {
  onRefresh?: () => void;
}

const EarningsChart: React.FC<EarningsChartProps> = ({ onRefresh }) => {
  const [earnings, setEarnings] = useState<EarningsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(30);

  useEffect(() => {
    fetchEarningsData();
  }, [period]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorService.getEarningsAnalytics(period);
      setEarnings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu thu nhập');
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

  const calculateGrowth = () => {
    if (!earnings || earnings.dailyEarnings.length < 2) return 0;
    
    const recent = earnings.dailyEarnings.slice(-7);
    const previous = earnings.dailyEarnings.slice(-14, -7);
    
    const recentTotal = recent.reduce((sum, day) => sum + day.earnings, 0);
    const previousTotal = previous.reduce((sum, day) => sum + day.earnings, 0);
    
    if (previousTotal === 0) return 100;
    return ((recentTotal - previousTotal) / previousTotal) * 100;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>Đang tải dữ liệu thu nhập...</div>
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
          <Button size="small" onClick={fetchEarningsData}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (!earnings) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Không thể tải dữ liệu thu nhập"
        type="warning"
        showIcon
      />
    );
  }

  const growth = calculateGrowth();

  return (
    <div>
      <Card
        title={
          <Space>
            <BarChartOutlined style={{ color: '#52c41a' }} />
            Phân tích thu nhập
          </Space>
        }
        extra={
          <Space>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 120 }}
            >
              <Option value={7}>7 ngày</Option>
              <Option value={30}>30 ngày</Option>
              <Option value={90}>90 ngày</Option>
            </Select>
            <Button onClick={fetchEarningsData} size="small">
              Làm mới
            </Button>
          </Space>
        }
      >
        {/* Thống kê tổng quan */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="Tổng thu nhập"
                value={formatCurrency(earnings.totalEarnings)}
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="Số giao dịch"
                value={earnings.totalTransactions}
                prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="Thu nhập trung bình"
                value={formatCurrency(earnings.averageEarnings)}
                prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="Tăng trưởng"
                value={growth.toFixed(1)}
                prefix={growth >= 0 ? <RiseOutlined style={{ color: '#52c41a' }} /> : <FallOutlined style={{ color: '#ff4d4f' }} />}
                suffix="%"
                valueStyle={{ color: growth >= 0 ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Top khóa học bán chạy */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Top khóa học bán chạy" size="small">
              {earnings.topCourses.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {earnings.topCourses.map((course, index) => (
                    <div key={course._id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px 0',
                      borderBottom: index < earnings.topCourses.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        backgroundColor: index < 3 ? '#faad14' : '#d9d9d9',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '12px'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: '14px' }}>{course.courseTitle}</Text>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {course.salesCount} giao dịch
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                          {formatCurrency(course.totalEarnings)}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <DollarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>Chưa có dữ liệu khóa học</div>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Thu nhập theo ngày" size="small">
              {earnings.dailyEarnings.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {earnings.dailyEarnings.slice(-10).reverse().map((day) => (
                    <div key={day.date} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <div>
                        <Text style={{ fontSize: '14px' }}>
                          {new Date(day.date).toLocaleDateString('vi-VN')}
                        </Text>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {day.transactions} giao dịch
                        </div>
                      </div>
                      <Text strong style={{ color: '#52c41a' }}>
                        {formatCurrency(day.earnings)}
                      </Text>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <BarChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>Chưa có dữ liệu thu nhập</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EarningsChart;
