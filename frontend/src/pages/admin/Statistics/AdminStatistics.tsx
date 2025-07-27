import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Typography, 
  Progress, 
  Tooltip, 
  Avatar, 
  Spin, 
  Alert,
  DatePicker,
  Select,
  Button,
  Space,
  Divider,
  Tag,
  List,
  Badge
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  StarOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { config } from '../../../api/axios';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import '../../../styles/AdminStatistics.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface StatisticsData {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalOrders: number;
  newUsersToday: number;
  newCoursesToday: number;
  revenueToday: number;
  ordersToday: number;
  userGrowth: number;
  courseGrowth: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface TopCourse {
  id: string;
  title: string;
  instructor: string;
  sales: number;
  revenue: number;
  rating: number;
  thumbnail: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

const AdminStatistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    totalOrders: 0,
    newUsersToday: 0,
    newCoursesToday: 0,
    revenueToday: 0,
    ordersToday: 0,
    userGrowth: 0,
    courseGrowth: 0,
    revenueGrowth: 0,
    orderGrowth: 0
  });
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [timeRange, setTimeRange] = useState<string>('30d');

  // Fetch statistics data
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockStats: StatisticsData = {
        totalUsers: 15420,
        totalCourses: 342,
        totalRevenue: 1250000000,
        totalOrders: 8920,
        newUsersToday: 156,
        newCoursesToday: 8,
        revenueToday: 45000000,
        ordersToday: 234,
        userGrowth: 12.5,
        courseGrowth: 8.3,
        revenueGrowth: 23.7,
        orderGrowth: 15.2
      };

      const mockTopCourses: TopCourse[] = [
        {
          id: '1',
          title: 'React từ cơ bản đến nâng cao',
          instructor: 'Nguyễn Văn A',
          sales: 1250,
          revenue: 125000000,
          rating: 4.8,
          thumbnail: 'https://via.placeholder.com/60x40'
        },
        {
          id: '2',
          title: 'Node.js Backend Development',
          instructor: 'Trần Thị B',
          sales: 980,
          revenue: 98000000,
          rating: 4.9,
          thumbnail: 'https://via.placeholder.com/60x40'
        },
        {
          id: '3',
          title: 'Python Machine Learning',
          instructor: 'Lê Văn C',
          sales: 756,
          revenue: 75600000,
          rating: 4.7,
          thumbnail: 'https://via.placeholder.com/60x40'
        },
        {
          id: '4',
          title: 'Vue.js Frontend Mastery',
          instructor: 'Phạm Thị D',
          sales: 654,
          revenue: 65400000,
          rating: 4.6,
          thumbnail: 'https://via.placeholder.com/60x40'
        },
        {
          id: '5',
          title: 'DevOps với Docker & Kubernetes',
          instructor: 'Hoàng Văn E',
          sales: 543,
          revenue: 54300000,
          rating: 4.8,
          thumbnail: 'https://via.placeholder.com/60x40'
        }
      ];

      const mockRevenueData: RevenueData[] = Array.from({ length: 30 }, (_, i) => ({
        date: dayjs().subtract(29 - i, 'day').format('YYYY-MM-DD'),
        revenue: Math.floor(Math.random() * 5000000) + 1000000,
        orders: Math.floor(Math.random() * 100) + 20
      }));

      setStatistics(mockStats);
      setTopCourses(mockTopCourses);
      setRevenueData(mockRevenueData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Statistics cards data
  const statsCards = [
    {
      title: 'Tổng học viên',
      value: statistics.totalUsers,
      prefix: <UserOutlined />,
      suffix: '',
      color: '#1890ff',
      growth: statistics.userGrowth,
      icon: <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
    },
    {
      title: 'Tổng khóa học',
      value: statistics.totalCourses,
      prefix: <BookOutlined />,
      suffix: '',
      color: '#52c41a',
      growth: statistics.courseGrowth,
      icon: <BookOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
    },
    {
      title: 'Tổng doanh thu',
      value: statistics.totalRevenue,
      prefix: '',
      suffix: ' VNĐ',
      color: '#faad14',
      growth: statistics.revenueGrowth,
      icon: <DollarOutlined style={{ fontSize: '24px', color: '#faad14' }} />
    },
    {
      title: 'Tổng đơn hàng',
      value: statistics.totalOrders,
      prefix: <ShoppingCartOutlined />,
      suffix: '',
      color: '#722ed1',
      growth: statistics.orderGrowth,
      icon: <ShoppingCartOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
    }
  ];

  // Top courses table columns
  const columns = [
    {
      title: 'Khóa học',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: TopCourse) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            src={record.thumbnail} 
            size={40}
            shape="square"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.instructor}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'sales',
      key: 'sales',
      render: (value: number) => (
        <Badge count={value} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => (
        <Text strong style={{ color: '#faad14' }}>
          {value.toLocaleString()} VNĐ
        </Text>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (value: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <StarOutlined style={{ color: '#faad14' }} />
          <span>{value}</span>
        </div>
      ),
    },
  ];

  // Simple bar chart component
  const SimpleBarChart = ({ data }: { data: RevenueData[] }) => {
    const maxRevenue = Math.max(...data.map(item => item.revenue));
    
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'end', gap: '4px', padding: '20px 0' }}>
        {data.slice(-7).map((item, index) => (
          <Tooltip 
            key={index} 
            title={`${dayjs(item.date).format('DD/MM')}: ${item.revenue.toLocaleString()} VNĐ`}
          >
            <div
              style={{
                flex: 1,
                height: `${(item.revenue / maxRevenue) * 100}%`,
                backgroundColor: '#1890ff',
                borderRadius: '4px 4px 0 0',
                minHeight: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#40a9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1890ff';
              }}
            />
          </Tooltip>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <TrophyOutlined style={{ marginRight: '12px' }} />
            Dashboard Thống kê EduPro
          </Title>
          <Text type="secondary">
            Tổng quan về hoạt động và hiệu suất của nền tảng học trực tuyến
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {statsCards.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  hoverable
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Statistic
                        title={stat.title}
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        valueStyle={{ color: stat.color, fontSize: '24px', fontWeight: 'bold' }}
                      />
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stat.growth > 0 ? (
                          <ArrowUpOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                        )}
                        <Text 
                          type={stat.growth > 0 ? 'success' : 'danger'}
                          style={{ fontSize: '12px' }}
                        >
                          {Math.abs(stat.growth)}% so với tháng trước
                        </Text>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      borderRadius: '50%', 
                      backgroundColor: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Charts and Tables Section */}
        <Row gutter={[16, 16]}>
          {/* Revenue Chart */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <span>Biểu đồ doanh thu 7 ngày gần nhất</span>
                </div>
              }
              extra={
                <Space>
                  <Select 
                    defaultValue="7d" 
                    style={{ width: 120 }}
                    onChange={setTimeRange}
                  >
                    <Option value="7d">7 ngày</Option>
                    <Option value="30d">30 ngày</Option>
                    <Option value="90d">90 ngày</Option>
                  </Select>
                </Space>
              }
              style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <SimpleBarChart data={revenueData} />
            </Card>
          </Col>

          {/* Today's Stats */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FireOutlined style={{ color: '#ff4d4f' }} />
                  <span>Hôm nay</span>
                </div>
              }
              style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <List
                dataSource={[
                  { label: 'Học viên mới', value: statistics.newUsersToday, icon: <UserOutlined />, color: '#1890ff' },
                  { label: 'Khóa học mới', value: statistics.newCoursesToday, icon: <BookOutlined />, color: '#52c41a' },
                  { label: 'Doanh thu', value: `${statistics.revenueToday.toLocaleString()} VNĐ`, icon: <DollarOutlined />, color: '#faad14' },
                  { label: 'Đơn hàng', value: statistics.ordersToday, icon: <ShoppingCartOutlined />, color: '#722ed1' }
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          padding: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: `${item.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {React.cloneElement(item.icon, { style: { color: item.color } })}
                        </div>
                        <Text>{item.label}</Text>
                      </div>
                      <Text strong style={{ color: item.color }}>{item.value}</Text>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Top Courses Table */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrophyOutlined style={{ color: '#faad14' }} />
              <span>Top 5 khóa học bán chạy nhất</span>
            </div>
          }
          style={{ 
            marginTop: '16px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
        >
          <Table
            columns={columns}
            dataSource={topCourses}
            pagination={false}
            rowKey="id"
            size="middle"
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminStatistics;
