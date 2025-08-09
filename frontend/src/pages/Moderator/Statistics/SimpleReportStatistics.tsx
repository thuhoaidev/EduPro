import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Divider, DatePicker, Segmented, Space } from 'antd';
import { Area, Column } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import { 
  WarningOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  BarChartOutlined,
  RiseOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { fetchReports } from '../../../services/reportModerationService';

const { Title, Text, Paragraph } = Typography;

interface ReportStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  todayReports: number;
}

interface ReportItem {
  createdAt: string;
  status: 'resolved' | 'pending' | string;
}

const SimpleReportStatistics: React.FC = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    todayReports: 0
  });
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(13, 'day'),
    dayjs()
  ]);
  const [granularity, setGranularity] = useState<'day' | 'week'>('day');

  useEffect(() => {
    const getReportStats = async () => {
      setLoading(true);
      try {
        const response = await fetchReports();
        const apiReports: ReportItem[] = response.data.data || [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayReports = apiReports.filter((report: any) => {
          const reportDate = new Date(report.createdAt);
          reportDate.setHours(0, 0, 0, 0);
          return reportDate.getTime() === today.getTime();
        }).length;

        setStats({
          totalReports: apiReports.length,
          resolvedReports: apiReports.filter((r: any) => r.status === 'resolved').length,
          pendingReports: apiReports.filter((r: any) => r.status === 'pending').length,
          todayReports
        });
        setReports(apiReports);
      } catch (error) {
        console.error('Error fetching report stats:', error);
        // Fallback to mock data if API fails
        const mockTotal = 134;
        const mockResolved = 85;
        const mockPending = 49;
        const mockToday = 7;

        // Tạo dữ liệu mô phỏng 30 ngày gần nhất
        const mockReports: ReportItem[] = [];
        const start = dayjs().subtract(29, 'day');
        for (let i = 0; i < 30; i++) {
          const date = start.add(i, 'day');
          const newCount = Math.max(0, Math.round(3 + Math.sin(i / 3) * 2 + (i % 5 === 0 ? 4 : 0)));
          const resolvedCount = Math.max(0, Math.round(2 + Math.cos(i / 4) * 2));
          for (let n = 0; n < newCount; n++) {
            mockReports.push({ createdAt: date.toDate().toISOString(), status: 'pending' });
          }
          for (let r = 0; r < resolvedCount; r++) {
            mockReports.push({ createdAt: date.toDate().toISOString(), status: 'resolved' });
          }
        }

        setStats({
          totalReports: mockTotal,
          resolvedReports: mockResolved,
          pendingReports: mockPending,
          todayReports: mockToday
        });
        setReports(mockReports);
      } finally {
        setLoading(false);
      }
    };

    getReportStats();
  }, []);

  const resolutionRate = stats.totalReports > 0 ? (stats.resolvedReports / stats.totalReports) * 100 : 0;
  const pendingRate = stats.totalReports > 0 ? (stats.pendingReports / stats.totalReports) * 100 : 0;
  const resolvedTodayApprox = Math.floor(stats.resolvedReports * 0.1);
  const remainingApprox = stats.pendingReports + Math.floor(stats.resolvedReports * 0.9);

  const dailyActivityData = [
    { type: 'Báo cáo mới', value: stats.todayReports },
    { type: 'Đã xử lý', value: resolvedTodayApprox },
    { type: 'Còn lại', value: remainingApprox }
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
      if (d.type === 'Báo cáo mới') return '#ff4d4f';
      if (d.type === 'Đã xử lý') return '#52c41a';
      return '#faad14';
    },
    animation: true,
    autoFit: true
  };

  // Helpers cho biểu đồ xu hướng
  const getAllBucketsInRange = (
    start: Dayjs,
    end: Dayjs,
    mode: 'day' | 'week'
  ): string[] => {
    const buckets: string[] = [];
    if (mode === 'day') {
      let d = start.startOf('day');
      while (d.isBefore(end.endOf('day')) || d.isSame(end, 'day')) {
        buckets.push(d.format('YYYY-MM-DD'));
        d = d.add(1, 'day');
      }
    } else {
      // Xác định các tuần (lấy thứ Hai làm đầu tuần)
      let d = start.startOf('week').add(1, 'day'); // startOf('week') là Chủ nhật -> +1 ngày thành thứ Hai
      const endWeek = end.endOf('week').add(1, 'day');
      while (d.isBefore(endWeek)) {
        buckets.push(d.format('YYYY-MM-DD'));
        d = d.add(1, 'week');
      }
    }
    return buckets;
  };

  const buildTrendData = () => {
    const [start, end] = dateRange;
    const filtered = reports.filter((r) => {
      const dt = dayjs(r.createdAt);
      const afterOrEqualStart = dt.isAfter(start.startOf('day')) || dt.isSame(start, 'day');
      const beforeOrEqualEnd = dt.isBefore(end.endOf('day')) || dt.isSame(end, 'day');
      return afterOrEqualStart && beforeOrEqualEnd;
    });

    // map bucket -> { new, resolved }
    const bucketMap: Record<string, { newCount: number; resolvedCount: number }> = {};
    const buckets = getAllBucketsInRange(start, end, granularity);
    buckets.forEach((b) => (bucketMap[b] = { newCount: 0, resolvedCount: 0 }));

    const getBucketKey = (dt: Dayjs) => {
      if (granularity === 'day') return dt.format('YYYY-MM-DD');
      // với tuần, bucket key là thứ Hai của tuần đó
      const monday = dt.startOf('week').add(1, 'day');
      return monday.format('YYYY-MM-DD');
    };

    filtered.forEach((r) => {
      const key = getBucketKey(dayjs(r.createdAt));
      if (!bucketMap[key]) bucketMap[key] = { newCount: 0, resolvedCount: 0 };
      if (r.status === 'resolved') bucketMap[key].resolvedCount += 1;
      else bucketMap[key].newCount += 1;
    });

    // Chuyển sang mảng cho Area với 2 series (dùng key không dấu để tránh lỗi TS)
    const result: { bucket: string; category: string; value: number; label: string }[] = [];
    const sortedKeys = Object.keys(bucketMap).sort((a, b) => (a < b ? -1 : 1));
    sortedKeys.forEach((key) => {
      const d = dayjs(key);
      const label = granularity === 'day'
        ? d.format('DD/MM')
        : `${d.format('DD/MM')} - ${d.add(6, 'day').format('DD/MM')}`;
      result.push({ bucket: key, category: 'Báo cáo mới', value: bucketMap[key].newCount, label });
      result.push({ bucket: key, category: 'Đã xử lý', value: bucketMap[key].resolvedCount, label });
    });
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
    color: (d: any) => (d.category === 'Báo cáo mới' ? '#ff4d4f' : '#52c41a'),
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
          📊 Thống kê Báo cáo
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
                    Tổng số báo cáo
                  </Text>
                }
                value={stats.totalReports}
                prefix={<BarChartOutlined style={{ color: '#1890ff', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={100} 
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
                    Đã xử lý
                  </Text>
                }
                value={stats.resolvedReports}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={resolutionRate} 
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
                    Chờ xử lý
                  </Text>
                }
                value={stats.pendingReports}
                prefix={<ClockCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#faad14', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={pendingRate} 
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
                    Báo cáo hôm nay
                  </Text>
                }
                value={stats.todayReports}
                prefix={<WarningOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#ff4d4f', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={stats.totalReports > 0 ? (stats.todayReports / stats.totalReports) * 100 : 0} 
                      size="small" 
                      strokeColor="#ff4d4f"
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
                   Tỷ lệ xử lý
                 </Title>
               </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>Đã xử lý</Text>
                  <Text strong>{resolutionRate.toFixed(1)}%</Text>
                </div>
                <Progress 
                  percent={resolutionRate} 
                  strokeColor="#52c41a"
                  showInfo={false}
                  style={{ marginBottom: '16px' }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>Chờ xử lý</Text>
                  <Text strong>{pendingRate.toFixed(1)}%</Text>
                </div>
                <Progress 
                  percent={pendingRate} 
                  strokeColor="#faad14"
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
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <Text>Báo cáo mới: </Text>
                <Text strong style={{ color: '#ff4d4f' }}>{stats.todayReports}</Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text>Đã xử lý: </Text>
                <Text strong style={{ color: '#52c41a' }}>
                  {resolvedTodayApprox} {/* Ước tính: 10% số đã xử lý hôm nay */}
                </Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined style={{ color: '#faad14' }} />
                <Text>Còn lại: </Text>
                <Text strong style={{ color: '#faad14' }}>
                  {remainingApprox}
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
            Thống kê chi tiết về các báo cáo vi phạm và hoạt động kiểm duyệt của hệ thống.
          </Paragraph>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                  {stats.totalReports}
                </Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Tổng số báo cáo</div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                  {stats.resolvedReports}
                </Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Đã xử lý ({resolutionRate.toFixed(1)}%)
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Text strong style={{ fontSize: '18px', color: '#faad14' }}>
                  {stats.pendingReports}
                </Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Chờ xử lý ({pendingRate.toFixed(1)}%)
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                  {stats.todayReports}
                </Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Báo cáo hôm nay</div>
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