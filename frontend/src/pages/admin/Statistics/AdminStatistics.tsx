import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip,
  Spin,
  Alert,
  Select,
  Button,
  Space,
  List,
  message
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingCartOutlined,
  FireOutlined,
  RiseOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import '../../../styles/AdminStatistics.css';
import statisticsService from '../../../services/statisticsService';
import type { StatisticsData, RevenueData } from '../../../types/statistics';
import { usePermissions as usePermissionsHook } from '../../../hooks/usePermissions';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

type TimeRangeOption = '7d' | '30d' | '90d';

const AdminStatistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [courseStats, setCourseStats] = useState<any>(null);
  const [userData, setUserData] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30d');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // Permissions & auth
  const { canViewOverviewStats, canViewRevenueStats, canViewUserStats, canViewCourseStats } = usePermissionsHook();
  const { token } = useAuth();
  const navigate = useNavigate();

  const checkPermissions = () => {
    if (!token) {
      message.error('Vui lòng đăng nhập để xem thống kê');
      navigate('/login');
      return false;
    }

    if (!canViewOverviewStats() && !canViewRevenueStats() && !canViewUserStats() && !canViewCourseStats()) {
      message.error('Bạn không có quyền xem thống kê');
      navigate('/');
      return false;
    }

    return true;
  };

  const getDaysFromTimeRange = (range: TimeRangeOption): number => {
    switch (range) {
      case '7d':
        return 7;
      case '90d':
        return 90;
      case '30d':
      default:
        return 30;
    }
  };

  const normalizeRevenueData = (raw: RevenueData[] | any, days: number): RevenueData[] => {
    // Đảm bảo raw là array
    if (!Array.isArray(raw)) {
      console.warn('⚠️ Revenue data is not an array, using empty array:', raw);
      raw = [];
    }

    // Map existing data by yyyy-mm-dd
    const byDate = new Map<string, RevenueData>();
    raw.forEach((item: RevenueData) => {
      const key = dayjs(item.date).format('YYYY-MM-DD');
      byDate.set(key, { ...item, date: key });
    });

    // Build continuous series for the last N days including today
    const series: RevenueData[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const found = byDate.get(d);
      series.push(
        found ?? {
          date: d,
          revenue: 0,
          orders: 0
        }
      );
    }
    return series;
  };

  const normalizeUserData = (raw: any[], days: number): any[] => {
    // Đảm bảo raw là array
    if (!Array.isArray(raw)) {
      console.warn('⚠️ User data is not an array, using empty array:', raw);
      raw = [];
    }

    // Map existing data by yyyy-mm-dd
    const byDate = new Map<string, any>();
    raw.forEach((item: any) => {
      const key = dayjs(item.date).format('YYYY-MM-DD');
      byDate.set(key, { ...item, date: key });
    });

    // Build continuous series for the last N days including today
    const series: any[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const found = byDate.get(d);
      series.push(
        found ?? {
          date: d,
          users: 0
        }
      );
    }
    return series;
  };

  const normalizeCourseData = (raw: any[], days: number): any[] => {
    // Đảm bảo raw là array
    if (!Array.isArray(raw)) {
      console.warn('⚠️ Course data is not an array, using empty array:', raw);
      raw = [];
    }

    // Map existing data by yyyy-mm-dd
    const byDate = new Map<string, any>();
    raw.forEach((item: any) => {
      const key = dayjs(item.date).format('YYYY-MM-DD');
      byDate.set(key, { ...item, date: key });
    });

    // Build continuous series for the last N days including today
    const series: any[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const found = byDate.get(d);
      series.push(
        found ?? {
          date: d,
          courses: 0
        }
      );
    }
    return series;
  };

  const fetchStatistics = async (isSilent = false) => {
    if (!checkPermissions()) return;

    if (!isSilent) setLoading(true);
    setError(null);

    try {
      const [statsData, revenue, courseStats] = await Promise.all([
        statisticsService.getOverviewStatistics().catch(err => {
          console.error('Error fetching overview stats:', err);
          throw new Error('Không thể tải dữ liệu tổng quan');
        }),
        statisticsService.getOrderStatistics(getDaysFromTimeRange(timeRange)).catch(err => {
          console.error('Error fetching order statistics:', err);
          return [];
        }),
        statisticsService.getCourseStatistics(getDaysFromTimeRange(timeRange)).catch(err => {
          console.error('Error fetching course statistics:', err);
          return { total: 0, active: 0, pending: 0, today: 0 };
        })
      ]);

      console.log('📊 Course statistics received:', courseStats);
      setStatistics(statsData);
      setTopCourses([]);
      setCourseStats(courseStats);
      setRevenueData(normalizeRevenueData(revenue, getDaysFromTimeRange(timeRange)));
      
      // Tạo dữ liệu học viên mẫu dựa trên tổng số học viên
      const mockUserData = Array.from({ length: getDaysFromTimeRange(timeRange) }, (_, i) => {
        const date = dayjs().subtract(getDaysFromTimeRange(timeRange) - 1 - i, 'day');
        // Tạo dữ liệu tăng dần theo thời gian với một số biến động ngẫu nhiên
        const baseUsers = Math.floor(statsData.totalUsers / getDaysFromTimeRange(timeRange));
        const growthFactor = 1 + (i / getDaysFromTimeRange(timeRange)) * 0.3; // Tăng 30% theo thời gian
        const randomVariation = Math.floor(Math.random() * 5) - 2; // Biến động -2 đến +2
        const users = Math.max(0, Math.floor(baseUsers * growthFactor) + randomVariation);
        
        return {
          date: date.format('YYYY-MM-DD'),
          users: users
        };
      });
      setUserData(normalizeUserData(mockUserData, getDaysFromTimeRange(timeRange)));

      // Tạo dữ liệu khóa học mẫu dựa trên tổng số khóa học
      const mockCourseData = Array.from({ length: getDaysFromTimeRange(timeRange) }, (_, i) => {
        const date = dayjs().subtract(getDaysFromTimeRange(timeRange) - 1 - i, 'day');
        // Tạo dữ liệu tăng dần theo thời gian với một số biến động ngẫu nhiên
        const baseCourses = Math.floor(statsData.totalCourses / getDaysFromTimeRange(timeRange));
        const growthFactor = 1 + (i / getDaysFromTimeRange(timeRange)) * 0.2; // Tăng 20% theo thời gian
        const randomVariation = Math.floor(Math.random() * 3) - 1; // Biến động -1 đến +1
        const courses = Math.max(0, Math.floor(baseCourses * growthFactor) + randomVariation);
        
        return {
          date: date.format('YYYY-MM-DD'),
          courses: courses
        };
      });
      setCourseData(normalizeCourseData(mockCourseData, getDaysFromTimeRange(timeRange)));

      if (!isSilent && !isInitialLoad.current) message.success('Dữ liệu đã được cập nhật');
      isInitialLoad.current = false;
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      if (!isSilent) message.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const startRealtimeUpdates = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchStatistics(true), 30000);
  };

  const stopRealtimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleTimeRangeChange = (value: TimeRangeOption) => {
    setTimeRange(value);
    fetchStatistics(false);
  };

  useEffect(() => {
    fetchStatistics();
    startRealtimeUpdates();
    return () => stopRealtimeUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statsCards = [
    {
      title: 'Tổng học viên',
      value: statistics.totalUsers,
      prefix: <UserOutlined />,
      suffix: '',
      color: '#1890ff',
      growth: statistics.userGrowth,
      icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      visible: canViewUserStats()
    },
    {
      title: 'Tổng khóa học',
      value: statistics.totalCourses,
      prefix: <BookOutlined />,
      suffix: '',
      color: '#52c41a',
      growth: statistics.courseGrowth,
      icon: <BookOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      visible: canViewCourseStats()
    },
    {
      title: 'Tổng doanh thu',
      value: statistics.totalRevenue,
      prefix: '',
      suffix: ' VNĐ',
      color: '#faad14',
      growth: statistics.revenueGrowth,
      icon: <DollarOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      visible: canViewRevenueStats()
    },
    {
      title: 'Tổng đơn hàng',
      value: statistics.totalOrders,
      prefix: <ShoppingCartOutlined />,
      suffix: '',
      color: '#722ed1',
      growth: statistics.orderGrowth,
      icon: <ShoppingCartOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      visible: canViewOverviewStats()
    }
  ].filter(card => card.visible);



  const SimpleBarChart = ({ data }: { data: RevenueData[] }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Không có dữ liệu doanh thu
        </div>
      );
    }

    const maxRevenue = Math.max(1, ...data.map(item => item.revenue));

    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'end', gap: 6, padding: '20px 10px', position: 'relative' }}>
        {data.map((item, index) => {
          const height = `${(item.revenue / maxRevenue) * 100}%`;
          const isToday = dayjs(item.date).isSame(dayjs(), 'day');
          
          return (
            <Tooltip key={index} title={`${dayjs(item.date).format('DD/MM')}: ${item.revenue.toLocaleString()} VNĐ`}>
              <div
                style={{
                  flex: 1,
                  height,
                  background: isToday 
                    ? 'linear-gradient(135deg, #faad14 0%, #ffd666 100%)'
                    : 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                  borderRadius: '8px 8px 4px 4px',
                  minHeight: 20,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isToday 
                    ? '0 4px 12px rgba(250, 173, 20, 0.4)'
                    : '0 2px 8px rgba(250, 173, 20, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(250, 173, 20, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = isToday 
                    ? '0 4px 12px rgba(250, 173, 20, 0.4)'
                    : '0 2px 8px rgba(250, 173, 20, 0.2)';
                }}
              >
                {isToday && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const UserBarChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Không có dữ liệu học viên
        </div>
      );
    }

    const maxUsers = Math.max(1, ...data.map(item => item.users || 0));

    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'end', gap: 6, padding: '20px 10px', position: 'relative' }}>
        {data.map((item, index) => {
          const height = `${((item.users || 0) / maxUsers) * 100}%`;
          const isToday = dayjs(item.date).isSame(dayjs(), 'day');
          
          return (
            <Tooltip key={index} title={`${dayjs(item.date).format('DD/MM')}: ${item.users || 0} học viên`}>
              <div
                style={{
                  flex: 1,
                  height,
                  background: isToday 
                    ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                    : 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
                  borderRadius: '8px 8px 4px 4px',
                  minHeight: 20,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isToday 
                    ? '0 4px 12px rgba(24, 144, 255, 0.4)'
                    : '0 2px 8px rgba(24, 144, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(24, 144, 255, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = isToday 
                    ? '0 4px 12px rgba(24, 144, 255, 0.4)'
                    : '0 2px 8px rgba(24, 144, 255, 0.2)';
                }}
              >
                {isToday && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const OrderBarChart = ({ data }: { data: RevenueData[] }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Không có dữ liệu đơn hàng
        </div>
      );
    }

    const maxOrders = Math.max(1, ...data.map(item => item.orders || 0));

    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'end', gap: 6, padding: '20px 10px', position: 'relative' }}>
        {data.map((item, index) => {
          const height = `${((item.orders || 0) / maxOrders) * 100}%`;
          const isToday = dayjs(item.date).isSame(dayjs(), 'day');
          
          return (
            <Tooltip key={index} title={`${dayjs(item.date).format('DD/MM')}: ${item.orders || 0} đơn hàng`}>
              <div
                style={{
                  flex: 1,
                  height,
                  background: isToday 
                    ? 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)'
                    : 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
                  borderRadius: '8px 8px 4px 4px',
                  minHeight: 20,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isToday 
                    ? '0 4px 12px rgba(114, 46, 209, 0.4)'
                    : '0 2px 8px rgba(114, 46, 209, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(114, 46, 209, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = isToday 
                    ? '0 4px 12px rgba(114, 46, 209, 0.4)'
                    : '0 2px 8px rgba(114, 46, 209, 0.2)';
                }}
              >
                {isToday && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const CourseBarChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Không có dữ liệu khóa học
        </div>
      );
    }

    const maxCourses = Math.max(1, ...data.map(item => item.courses || 0));

    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'end', gap: 6, padding: '20px 10px', position: 'relative' }}>
        {data.map((item, index) => {
          const height = `${((item.courses || 0) / maxCourses) * 100}%`;
          const isToday = dayjs(item.date).isSame(dayjs(), 'day');
          
          return (
            <Tooltip key={index} title={`${dayjs(item.date).format('DD/MM')}: ${item.courses || 0} khóa học`}>
              <div
                style={{
                  flex: 1,
                  height,
                  background: isToday 
                    ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                    : 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
                  borderRadius: '8px 8px 4px 4px',
                  minHeight: 20,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isToday 
                    ? '0 4px 12px rgba(82, 196, 26, 0.4)'
                    : '0 2px 8px rgba(82, 196, 26, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(82, 196, 26, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = isToday 
                    ? '0 4px 12px rgba(82, 196, 26, 0.4)'
                    : '0 2px 8px rgba(82, 196, 26, 0.2)';
                }}
              >
                {isToday && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  if (error && !loading) {
    return (
      <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => fetchStatistics()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, background: '#f0f2f5' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <RiseOutlined style={{ marginRight: 12 }} />
            Dashboard Thống kê EduPro
          </Title>
          <Text type="secondary">Tổng quan về hoạt động và hiệu suất của nền tảng học trực tuyến</Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statsCards.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Card hoverable style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Statistic
                        title={stat.title}
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        valueStyle={{ color: stat.color, fontSize: 24, fontWeight: 'bold' }}
                      />
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {stat.growth > 0 ? <ArrowUpOutlined style={{ color: '#52c41a' }} /> : <ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
                        <Text type={stat.growth > 0 ? 'success' : 'danger'} style={{ fontSize: 12 }}>
                          {Math.abs(stat.growth)}% so với tháng trước
                        </Text>
                      </div>
                    </div>
                    <div style={{ padding: 16, borderRadius: '50%', backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Selector khoảng thời gian */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} style={{ textAlign: 'right' }}>
            <Select
              value={timeRange}
              style={{ width: 140 }}
              onChange={(v) => handleTimeRangeChange(v as TimeRangeOption)}
              options={[
                { label: '7 ngày', value: '7d' },
                { label: '30 ngày', value: '30d' },
                { label: '90 ngày', value: '90d' }
              ]}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Biểu đồ học viên */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <span>Học viên</span>
                </div>
              }
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <UserBarChart data={userData} />
            </Card>
          </Col>

          {/* Biểu đồ khóa học */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOutlined style={{ color: '#52c41a' }} />
                  <span>Khóa học</span>
                </div>
              }
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <CourseBarChart data={courseData} />
            </Card>
          </Col>

          {/* Biểu đồ doanh thu */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarOutlined style={{ color: '#faad14' }} />
                  <span>Doanh thu</span>
                </div>
              }
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <SimpleBarChart data={revenueData} />
            </Card>
          </Col>

          {/* Biểu đồ đơn hàng */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCartOutlined style={{ color: '#722ed1' }} />
                  <span>Đơn hàng</span>
                </div>
              }
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <OrderBarChart data={revenueData} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FireOutlined style={{ color: '#ff4d4f' }} />
                  <span>Hôm nay</span>
                </div>
              }
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <List
                dataSource={[
                  { label: 'Học viên mới', value: statistics.newUsersToday, icon: <UserOutlined />, color: '#1890ff' },
                  { label: 'Khóa học mới', value: statistics.newCoursesToday, icon: <BookOutlined />, color: '#52c41a' },
                  { label: 'Doanh thu', value: `${statistics.revenueToday.toLocaleString()} VNĐ`, icon: <DollarOutlined />, color: '#faad14' },
                  { label: 'Đơn hàng', value: statistics.ordersToday, icon: <ShoppingCartOutlined />, color: '#722ed1' }
                ]}
                renderItem={(item: any) => (
                  <List.Item>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ padding: 8, borderRadius: '50%', backgroundColor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* Thống kê khóa học chi tiết */}
        {courseStats && (
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOutlined style={{ color: '#52c41a' }} />
                    <span>Thống kê khóa học chi tiết</span>
                  </div>
                }
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Tổng khóa học"
                      value={courseStats.total || 0}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Khóa học đã duyệt"
                      value={courseStats.active || 0}
                      prefix={<CheckOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Khóa học chờ duyệt"
                      value={courseStats.pending || 0}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Khóa học mới hôm nay"
                      value={courseStats.today || 0}
                      prefix={<FireOutlined />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}


      </motion.div>
    </div>
  );
};

export default AdminStatistics;


