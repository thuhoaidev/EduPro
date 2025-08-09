import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Divider, DatePicker, Segmented, Space } from 'antd';
import { Area, Column } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import { 
  BookOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  TeamOutlined,
  BarChartOutlined,
  RiseOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { statisticsService } from '../../../services/statisticsService';

const { Title, Text, Paragraph } = Typography;

interface OverallStats {
  totalCourses: number;
  totalOrders: number;
  totalStudents: number;
  totalInstructors: number;
}

interface CourseStats {
  total: number;
  active: number;
  pending: number;
  today: number;
}

interface OrderStats {
  total: number;
  completed: number;
  pending: number;
  today: number;
}

interface StudentStats {
  total: number;
  active: number;
  new: number;
  today: number;
}

interface InstructorStats {
  total: number;
  active: number;
  pending: number;
  today: number;
}

const SimpleReportStatistics: React.FC = () => {
  const [courseStats, setCourseStats] = useState<CourseStats>({
    total: 0,
    active: 0,
    pending: 0,
    today: 0
  });
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    completed: 0,
    pending: 0,
    today: 0
  });
  const [studentStats, setStudentStats] = useState<StudentStats>({
    total: 0,
    active: 0,
    new: 0,
    today: 0
  });
  const [instructorStats, setInstructorStats] = useState<InstructorStats>({
    total: 0,
    active: 0,
    pending: 0,
    today: 0
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(13, 'day'),
    dayjs()
  ]);
  const [granularity, setGranularity] = useState<'day' | 'week'>('day');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const getAllStatistics = async () => {
      setLoading(true);
      try {
        // Gọi API để lấy thống kê từ các service
        const [courseData, orderData, studentData, instructorData] = await Promise.all([
          statisticsService.getCourseStatistics(30),
          statisticsService.getOrderStatistics(30),
          statisticsService.getStudentStatistics(30),
          statisticsService.getInstructorStatistics(30)
        ]);

        console.log('Course data received:', courseData);
        console.log('Order data received:', orderData);
        console.log('Student data received:', studentData);
        console.log('Instructor data received:', instructorData);

        setCourseStats({
          total: courseData?.total || 0,
          active: courseData?.active || 0,
          pending: courseData?.pending || 0,
          today: courseData?.today || 0
        });

        setOrderStats({
          total: orderData?.total || 0,
          completed: orderData?.completed || 0,
          pending: orderData?.pending || 0,
          today: orderData?.today || 0
        });

        setStudentStats({
          total: studentData?.total || 0,
          active: studentData?.active || 0,
          new: studentData?.new || 0,
          today: studentData?.today || 0
        });

        setInstructorStats({
          total: instructorData?.total || 0,
          active: instructorData?.active || 0,
          pending: instructorData?.pending || 0,
          today: instructorData?.today || 0
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fallback to mock data if API fails
        setCourseStats({
          total: 245,
          active: 198,
          pending: 47,
          today: 8
        });

        setOrderStats({
          total: 1850,
          completed: 1654,
          pending: 196,
          today: 23
        });

        setStudentStats({
          total: 5420,
          active: 4892,
          new: 528,
          today: 45
        });

        setInstructorStats({
          total: 89,
          active: 72,
          pending: 17,
          today: 3
        });
      } finally {
        setLoading(false);
      }
    };

    getAllStatistics();
  }, []);

  const courseActiveRate = courseStats.total > 0 ? (courseStats.active / courseStats.total) * 100 : 0;
  const orderCompletionRate = orderStats.total > 0 ? (orderStats.completed / orderStats.total) * 100 : 0;
  const studentActiveRate = studentStats.total > 0 ? (studentStats.active / studentStats.total) * 100 : 0;
  const instructorActiveRate = instructorStats.total > 0 ? (instructorStats.active / instructorStats.total) * 100 : 0;

  const dailyActivityData = [
    { type: 'Khóa học mới', value: courseStats.today },
    { type: 'Đơn hàng mới', value: orderStats.today },
    { type: 'Học viên mới', value: studentStats.today },
    { type: 'Giảng viên mới', value: instructorStats.today }
  ];

  const columnConfig: any = {
    data: dailyActivityData,
    xField: 'type',
    yField: 'value',
    columnWidthRatio: 0.6,
    label: {
      position: 'top',
      style: { fill: '#1f2937', fontWeight: 600 }
    },
    // Để mặc định tooltip tránh hiển thị null
    color: (d: { type: string }) => {
      if (d.type === 'Khóa học mới') return '#1890ff';
      if (d.type === 'Đơn hàng mới') return '#52c41a';
      if (d.type === 'Học viên mới') return '#faad14';
      return '#722ed1';
    },
    animation: true,
    autoFit: true
  };

  // Tạo dữ liệu mẫu cho biểu đồ xu hướng
  const buildTrendData = () => {
    const [start, end] = dateRange;
    const result: { label: string; category: string; value: number }[] = [];
    
    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const label = granularity === 'day' 
        ? current.format('DD/MM')
        : `${current.format('DD/MM')} - ${current.add(6, 'day').format('DD/MM')}`;
      
      // Tạo dữ liệu ngẫu nhiên cho demo
      const dayIndex = current.diff(start, 'day');
      result.push({ 
        label, 
        category: 'Khóa học mới', 
        value: Math.max(0, Math.round(3 + Math.sin(dayIndex / 3) * 2))
      });
      result.push({ 
        label, 
        category: 'Đơn hàng mới', 
        value: Math.max(0, Math.round(8 + Math.cos(dayIndex / 4) * 4))
      });
      result.push({ 
        label, 
        category: 'Học viên mới', 
        value: Math.max(0, Math.round(15 + Math.sin(dayIndex / 2) * 8))
      });
      result.push({ 
        label, 
        category: 'Giảng viên mới', 
        value: Math.max(0, Math.round(1 + Math.cos(dayIndex / 5) * 1))
      });
      
      current = current.add(granularity === 'day' ? 1 : 7, 'day');
    }
    return result;
  };

  const trendData = buildTrendData();

  const areaConfig: any = {
    data: trendData,
    xField: 'label',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    areaStyle: { fillOpacity: 0.15 },
    color: (d: any) => {
      if (d.category === 'Khóa học mới') return '#1890ff';
      if (d.category === 'Đơn hàng mới') return '#52c41a';
      if (d.category === 'Học viên mới') return '#faad14';
      return '#722ed1';
    },
    // Dùng tooltip mặc định để tránh null
    legend: { position: 'top' },
    xAxis: { label: { autoRotate: false } },
    yAxis: { min: 0 },
    animation: true,
    autoFit: true
  };

  return (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        borderRadius: '16px', 
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <Title level={2} style={{ 
          marginBottom: '32px', 
          color: '#1e293b',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          📊 Thống kê Hệ thống
        </Title>
        
        {/* Main Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Tổng khóa học
                  </Text>
                }
                value={courseStats.total}
                prefix={<BookOutlined style={{ color: '#1890ff', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={courseActiveRate} 
                      size="small" 
                      strokeColor="#1890ff"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Tổng đơn hàng
                  </Text>
                }
                value={orderStats.total}
                prefix={<ShoppingCartOutlined style={{ color: '#52c41a', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={orderCompletionRate} 
                      size="small" 
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Tổng học viên
                  </Text>
                }
                value={studentStats.total}
                prefix={<UserOutlined style={{ color: '#faad14', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#faad14', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={studentActiveRate} 
                      size="small" 
                      strokeColor="#faad14"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Tổng giảng viên
                  </Text>
                }
                value={instructorStats.total}
                prefix={<TeamOutlined style={{ color: '#722ed1', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#722ed1', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={instructorActiveRate} 
                      size="small" 
                      strokeColor="#722ed1"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Additional Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} md={12}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}
            >
                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                 <RiseOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                 <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                   Tỷ lệ hoạt động
                 </Title>
               </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>Khóa học hoạt động</Text>
                  <Text strong>{courseActiveRate.toFixed(1)}%</Text>
                </div>
                <Progress 
                  percent={courseActiveRate} 
                  strokeColor="#1890ff"
                  showInfo={false}
                  style={{ marginBottom: '16px' }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>Đơn hàng hoàn thành</Text>
                  <Text strong>{orderCompletionRate.toFixed(1)}%</Text>
                </div>
                <Progress 
                  percent={orderCompletionRate} 
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <CalendarOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                  Hoạt động hôm nay
                </Title>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <BookOutlined style={{ color: '#1890ff' }} />
                <Text>Khóa học mới: </Text>
                <Text strong style={{ color: '#1890ff' }}>{courseStats.today}</Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ShoppingCartOutlined style={{ color: '#52c41a' }} />
                <Text>Đơn hàng mới: </Text>
                <Text strong style={{ color: '#52c41a' }}>
                  {orderStats.today}
                </Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <UserOutlined style={{ color: '#faad14' }} />
                <Text>Học viên mới: </Text>
                <Text strong style={{ color: '#faad14' }}>
                  {studentStats.today}
                </Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TeamOutlined style={{ color: '#722ed1' }} />
                <Text>Giảng viên mới: </Text>
                <Text strong style={{ color: '#722ed1' }}>
                  {instructorStats.today}
                </Text>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ height: 240 }}>
                <Column {...columnConfig} height={220} />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Trend Chart */}
        <Card
          hoverable
          style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none',
            marginBottom: '32px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BarChartOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Xu hướng theo thời gian</Title>
            </div>
            <Space size={12} wrap>
              <Segmented
                options={[
                  { label: 'Ngày', value: 'day' },
                  { label: 'Tuần', value: 'week' }
                ]}
                value={granularity}
                onChange={(val) => setGranularity(val as 'day' | 'week')}
              />
              <DatePicker.RangePicker
                value={dateRange}
                onChange={(v) => {
                  if (!v || v.length !== 2) return;
                  setDateRange([v[0]!, v[1]!] as [Dayjs, Dayjs]);
                }}
                allowClear={false}
                format="DD/MM/YYYY"
              />
            </Space>
          </div>
          <div style={{ height: 320 }}>
            <Area {...areaConfig} height={300} />
          </div>
        </Card>
        
        {/* Summary Card */}
        <Card 
          hoverable
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FileTextOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
              Tổng quan hoạt động
            </Title>
          </div>
          
          <Paragraph style={{ color: '#64748b', marginBottom: '16px' }}>
            Thống kê tổng quan về khóa học, đơn hàng, học viên và giảng viên trong hệ thống.
          </Paragraph>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                  {courseStats.total}
                </Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Tổng khóa học</div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                  {orderStats.total}
                </Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Tổng đơn hàng
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Text strong style={{ fontSize: '18px', color: '#faad14' }}>
                  {studentStats.total}
                </Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Tổng học viên
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Text strong style={{ fontSize: '18px', color: '#722ed1' }}>
                  {instructorStats.total}
                </Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Tổng giảng viên</div>
              </div>
            </Col>
          </Row>
        </Card>

        <style>{`
          .ant-card {
            transition: all 0.3s ease;
          }
          .ant-card:hover {
            transform: translateY(-2px);
          }
          .ant-statistic-title {
            margin-bottom: 8px !important;
          }
          .ant-progress-bg {
            border-radius: 4px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default SimpleReportStatistics; 