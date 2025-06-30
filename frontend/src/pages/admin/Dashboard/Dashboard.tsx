import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Progress, Tooltip, Avatar } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import styles from './Dashboard.module.css';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  // Dữ liệu mẫu cho bảng khóa học mới
  const newCoursesData = [
    {
      key: '1',
      name: 'React.js Cơ Bản đến Nâng Cao',
      instructor: 'Nguyễn Văn A',
      students: 45,
      rating: 4.8,
      duration: '20 giờ',
      lastUpdated: '2 ngày trước',
    },
    {
      key: '2',
      name: 'Node.js và Express từ Zero đến Hero',
      instructor: 'Trần Thị B',
      students: 38,
      rating: 4.6,
      duration: '15 giờ',
      lastUpdated: '3 ngày trước',
    },
    {
      key: '3',
      name: 'TypeScript cho người mới bắt đầu',
      instructor: 'Lê Văn C',
      students: 52,
      rating: 4.9,
      duration: '18 giờ',
      lastUpdated: '1 ngày trước',
    },
    {
      key: '4',
      name: 'Docker và Kubernetes cơ bản',
      instructor: 'Phạm Thị D',
      students: 35,
      rating: 4.7,
      duration: '25 giờ',
      lastUpdated: '4 ngày trước',
    },
  ];

  // Cột cho bảng khóa học mới
  const columns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Text strong className={styles.courseName}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Giảng viên',
      dataIndex: 'instructor',
      key: 'instructor',
      render: (text: string) => (
        <div className={styles.instructorCell}>
          <Avatar size="small" icon={<UserOutlined />} className={styles.instructorAvatar} />
          <Text>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      render: (text: string) => (
        <Tooltip title="Tổng thời lượng khóa học">
          <div className={styles.durationCell}>
            <ClockCircleOutlined className={styles.durationIcon} />
            <Text>{text}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Học viên',
      dataIndex: 'students',
      key: 'students',
      render: (value: number) => (
        <Tooltip title="Số học viên đã đăng ký">
          <div className={styles.studentsCell}>
            <TeamOutlined className={styles.studentsIcon} />
            <Text>{value}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div className={styles.ratingCell}>
          <StarOutlined className={styles.ratingIcon} />
          <Text strong>{rating}</Text>
        </div>
      ),
    },
  ];

  // Dữ liệu cho biểu đồ doanh thu
  const revenueData = [
    { category: 'Lập trình Web', students: 450, revenue: 125000000, growth: 15 },
    { category: 'Mobile Development', students: 380, revenue: 98000000, growth: 12 },
    { category: 'Machine Learning', students: 280, revenue: 85000000, growth: 8 },
    { category: 'DevOps', students: 220, revenue: 65000000, growth: 10 },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <Title level={2}>Tổng quan</Title>
        <Text type="secondary" className={styles.lastUpdated}>
          Cập nhật lần cuối: Hôm nay, 15:30
        </Text>
      </div>
      
      {/* Thống kê tổng quan */}
      <Row gutter={[24, 24]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className={styles.statCard}>
            <Statistic
              title={
                <div className={styles.cardTitle}>
                  <UserOutlined className={styles.cardIcon} />
                  <span>Tổng số học viên</span>
                </div>
              }
              value={1234}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <Tooltip title="Tăng 12% so với tháng trước">
                  <span className={styles.trendUp}>
                    <ArrowUpOutlined /> 12%
                  </span>
                </Tooltip>
              }
            />
            <div className={styles.cardFooter}>
              <Text type="secondary">So với tháng trước</Text>
              <Progress percent={12} size="small" showInfo={false} strokeColor="#1890ff" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className={styles.statCard}>
            <Statistic
              title={
                <div className={styles.cardTitle}>
                  <BookOutlined className={styles.cardIcon} />
                  <span>Khóa học</span>
                </div>
              }
              value={56}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <Tooltip title="Tăng 8% so với tháng trước">
                  <span className={styles.trendUp}>
                    <ArrowUpOutlined /> 8%
                  </span>
                </Tooltip>
              }
            />
            <div className={styles.cardFooter}>
              <Text type="secondary">4 khóa học mới trong tháng</Text>
              <Progress percent={8} size="small" showInfo={false} strokeColor="#52c41a" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className={styles.statCard}>
            <Statistic
              title={
                <div className={styles.cardTitle}>
                  <DollarOutlined className={styles.cardIcon} />
                  <span>Doanh thu tháng</span>
                </div>
              }
              value={45600000}
              valueStyle={{ color: '#faad14' }}
              formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
            />
            <div className={styles.cardFooter}>
              <Text type="secondary">Tăng 15% so với tháng trước</Text>
              <Progress percent={15} size="small" showInfo={false} strokeColor="#faad14" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className={styles.statCard}>
            <Statistic
              title={
                <div className={styles.cardTitle}>
                  <TeamOutlined className={styles.cardIcon} />
                  <span>Giảng viên</span>
                </div>
              }
              value={28}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <Tooltip title="Tăng 5% so với tháng trước">
                  <span className={styles.trendUp}>
                    <ArrowUpOutlined /> 5%
                  </span>
                </Tooltip>
              }
            />
            <div className={styles.cardFooter}>
              <Text type="secondary">2 giảng viên mới trong tháng</Text>
              <Progress percent={5} size="small" showInfo={false} strokeColor="#722ed1" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Thống kê chi tiết */}
      <Row gutter={[24, 24]} className={styles.detailsRow}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className={styles.cardHeader}>
                <Text strong>Khóa học mới cập nhật</Text>
                <Text type="secondary">4 khóa học</Text>
              </div>
            } 
            bordered={false}
            className={styles.tableCard}
          >
            <Table
              dataSource={newCoursesData}
              columns={columns}
              pagination={false}
              className={styles.coursesTable}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className={styles.cardHeader}>
                <Text strong>Danh mục phổ biến</Text>
                <Text type="secondary">Theo doanh thu</Text>
              </div>
            } 
            bordered={false}
            className={styles.categoryCard}
          >
            <div className={styles.categoryStats}>
              {revenueData.map((item, index) => (
                <div key={index} className={styles.categoryItem}>
                  <div className={styles.categoryHeader}>
                    <Text strong>{item.category}</Text>
                    <Text type="secondary">{item.revenue.toLocaleString('vi-VN')} ₫</Text>
                  </div>
                  <Progress 
                    percent={Math.round((item.revenue / 150000000) * 100)} 
                    strokeColor={{
                      '0%': '#1890ff',
                      '100%': '#52c41a',
                    }}
                    showInfo={false}
                  />
                  <div className={styles.categoryFooter}>
                    <Text type="secondary">{item.students} học viên</Text>
                    <Text className={styles.growth} type="success">
                      <ArrowUpOutlined /> {item.growth}%
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 