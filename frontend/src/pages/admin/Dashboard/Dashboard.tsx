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
  Badge,
  Divider,
  Space,
  Tag,
  Button
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
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import styles from './Dashboard.module.css';
import { config } from '../../../api/axios';

const { Title, Text, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  // State lưu trữ dữ liệu
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [coursesRes, usersRes, instructorsRes] = await Promise.all([
          config.get('/courses'),
          config.get('/users'),
          config.get('/users/instructors'),
        ]);
        setCourses(Array.isArray(coursesRes.data.data) ? coursesRes.data.data : []);
        setUsers(Array.isArray(usersRes.data.data?.users) ? usersRes.data.data.users : []);
        setInstructors(Array.isArray(instructorsRes.data.data?.instructors) ? instructorsRes.data.data.instructors : []);
      } catch (err: any) {
        setCourses([]);
        setUsers([]);
        setInstructors([]);
        setError('Không thể lấy dữ liệu từ server hoặc token không hợp lệ!');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Lọc chỉ lấy giảng viên đã duyệt
  const approvedInstructors = (instructors || []).filter(
    (ins: any) => ins.approvalStatus === 'approved' || ins.approval_status === 'approved'
  );

  // Gộp tất cả user và instructor đã duyệt lại để tìm kiếm
  const allPeople = [...(users || []), ...approvedInstructors];

  // Hàm lấy tên và avatar từ object, ObjectId hoặc ID string
  const getInfo = (ins: any) => {
    if (!ins) return { name: 'Không rõ', avatar: undefined };
    if (typeof ins === 'object' && (ins.fullname || ins.name)) {
      return {
        name: ins.fullname || ins.name,
        avatar: ins.avatar,
      };
    }
    if (typeof ins === 'object' && (ins._id || ins.id)) {
      const idStr = String(ins._id || ins.id);
      const found = allPeople.find(
        u => u && (String(u._id) === idStr || String(u.id) === idStr)
      );
      return found
        ? { name: found.fullname || found.name, avatar: found.avatar }
        : { name: 'Không rõ', avatar: undefined };
    }
    const idStr = String(ins);
    const found = allPeople.find(
      u => u && (String(u._id) === idStr || String(u.id) === idStr)
    );
    return found
      ? { name: found.fullname || found.name, avatar: found.avatar }
      : { name: 'Không rõ', avatar: undefined };
  };

  // Tính toán các chỉ số KPI
  const totalRevenue = 45600000;
  const monthlyGrowth = 15;
  const activeUsers = users.length;
  const totalCourses = courses.length;
  const approvedInstructorCount = approvedInstructors.length;
  const pendingInstructors = instructors.length - approvedInstructorCount;

  // Cột cho bảng khóa học
  const columns = [
    {
      title: 'Khóa học',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string, record: any) => (
        <div className={styles.courseCell}>
          <img
            src={record.thumbnail || '/images/no-image.png'}
            alt="thumbnail"
            className={styles.courseThumbnail}
          />
          <div className={styles.courseInfo}>
            <Text strong className={styles.courseName}>{text}</Text>
            <Text type="secondary" className={styles.courseCategory}>
              {record.category?.name || 'Chưa phân loại'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Giảng viên',
      dataIndex: 'instructor',
      key: 'instructor',
      width: 200,
      render: (instructor: any) => {
        const info = getInfo(instructor);
        return (
          <div className={styles.instructorCell}>
            <Avatar src={info.avatar} size="small" className={styles.instructorAvatar}>
              {info.name?.charAt(0)}
            </Avatar>
            <Text>{info.name}</Text>
          </div>
        );
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (value: number) => (
        <div className={styles.priceCell}>
          <Text strong style={{ color: '#52c41a' }}>
            {value?.toLocaleString('vi-VN')} ₫
          </Text>
        </div>
      ),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (value: number) => (
        value > 0 ? (
          <Tag color="red" className={styles.discountTag}>
            -{value}%
          </Tag>
        ) : (
          <Text type="secondary">Không giảm</Text>
        )
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Badge
          status={status === 'published' ? 'success' : 'default'}
          text={status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
        />
      ),
    }
  ];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <Title level={2} className={styles.dashboardTitle}>
            <TrophyOutlined className={styles.titleIcon} />
            Dashboard
          </Title>
          <Text type="secondary" className={styles.dashboardSubtitle}>
            Tổng quan hệ thống EduPro
          </Text>
        </div>
        <div className={styles.headerRight}>
          <Text type="secondary" className={styles.lastUpdated}>
            <ClockCircleOutlined /> Cập nhật: {new Date().toLocaleString('vi-VN')}
          </Text>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 16 }}>Đang tải dữ liệu...</Text>
        </div>
      ) : error ? (
        <Alert
          message={error}
          type="error"
          showIcon
          className={styles.errorAlert}
          action={
            <Button size="small" danger onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          }
        />
      ) : (
        <>
          {/* KPI Cards */}
          <Row gutter={[24, 24]} className={styles.statsRow}>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} bordered={false}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#e6f7ff' }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                  </div>
                  <div className={styles.statInfo}>
                    <Statistic
                      title="Tổng học viên"
                      value={activeUsers}
                      valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 600 }}
                    />
                    <div className={styles.statTrend}>
                      <RiseOutlined style={{ color: '#52c41a' }} />
                      <Text type="secondary">+12% tháng này</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} bordered={false}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#f6ffed' }}>
                    <BookOutlined style={{ color: '#52c41a' }} />
                  </div>
                  <div className={styles.statInfo}>
                    <Statistic
                      title="Khóa học"
                      value={totalCourses}
                      valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
                    />
                    <div className={styles.statTrend}>
                      <RiseOutlined style={{ color: '#52c41a' }} />
                      <Text type="secondary">+8% tháng này</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} bordered={false}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#fff7e6' }}>
                    <DollarOutlined style={{ color: '#fa8c16' }} />
                  </div>
                  <div className={styles.statInfo}>
                    <Statistic
                      title="Doanh thu tháng"
                      value={totalRevenue}
                      valueStyle={{ color: '#fa8c16', fontSize: 28, fontWeight: 600 }}
                      formatter={(value) => `${(value / 1000000).toFixed(1)}M ₫`}
                    />
                    <div className={styles.statTrend}>
                      <RiseOutlined style={{ color: '#52c41a' }} />
                      <Text type="secondary">+{monthlyGrowth}% tháng này</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} bordered={false}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#fff1f0' }}>
                    <TeamOutlined style={{ color: '#ff4d4f' }} />
                  </div>
                  <div className={styles.statInfo}>
                    <Statistic
                      title="Giảng viên"
                      value={approvedInstructorCount}
                      valueStyle={{ color: '#ff4d4f', fontSize: 28, fontWeight: 600 }}
                    />
                    <div className={styles.statTrend}>
                      <RiseOutlined style={{ color: '#52c41a' }} />
                      <Text type="secondary">+5% tháng này</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Quick Stats */}
          <Row gutter={[24, 24]} className={styles.quickStatsRow}>
            <Col xs={24} sm={12} lg={8}>
              <Card className={styles.quickStatCard} bordered={false}>
                <div className={styles.quickStatHeader}>
                  <FireOutlined className={styles.quickStatIcon} />
                  <Text strong>Hoạt động nổi bật</Text>
                </div>
                <div className={styles.quickStatContent}>
                                     <div className={styles.quickStatItem}>
                     <Text>Khóa học mới</Text>
                     <Badge count={courses.filter(c => (c.createdAt ? new Date(c.createdAt).getTime() : 0) > Date.now() - 7*24*60*60*1000).length} />
                   </div>
                  <div className={styles.quickStatItem}>
                    <Text>Giảng viên chờ duyệt</Text>
                    <Badge count={pendingInstructors} style={{ backgroundColor: '#faad14' }} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className={styles.quickStatCard} bordered={false}>
                <div className={styles.quickStatHeader}>
                  <ShoppingCartOutlined className={styles.quickStatIcon} />
                  <Text strong>Đơn hàng</Text>
                </div>
                <div className={styles.quickStatContent}>
                  <div className={styles.quickStatItem}>
                    <Text>Hôm nay</Text>
                    <Text strong style={{ color: '#52c41a' }}>24</Text>
                  </div>
                  <div className={styles.quickStatItem}>
                    <Text>Tuần này</Text>
                    <Text strong style={{ color: '#1890ff' }}>156</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className={styles.quickStatCard} bordered={false}>
                <div className={styles.quickStatHeader}>
                  <EyeOutlined className={styles.quickStatIcon} />
                  <Text strong>Lượt xem</Text>
                </div>
                <div className={styles.quickStatContent}>
                  <div className={styles.quickStatItem}>
                    <Text>Hôm nay</Text>
                    <Text strong style={{ color: '#722ed1' }}>1,234</Text>
                  </div>
                  <div className={styles.quickStatItem}>
                    <Text>Tuần này</Text>
                    <Text strong style={{ color: '#eb2f96' }}>8,567</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Main Content */}
          <Row gutter={[24, 24]} className={styles.mainContent}>
            <Col xs={24} lg={16}>
              <Card
                title={
                  <div className={styles.cardHeader}>
                    <Space>
                      <BookOutlined />
                      <Text strong>Khóa học mới nhất</Text>
                    </Space>
                    <Tag color="blue">{courses.length} khóa học</Tag>
                  </div>
                }
                className={styles.mainCard}
                bordered={false}
                extra={
                  <Button type="link" size="small">
                    Xem tất cả
                  </Button>
                }
              >
                <Table
                  dataSource={courses.slice(0, 8)}
                  columns={columns}
                  pagination={false}
                  className={styles.coursesTable}
                  rowKey="_id"
                  scroll={{ x: 800 }}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                title={
                  <div className={styles.cardHeader}>
                    <Space>
                      <TeamOutlined />
                      <Text strong>Giảng viên hàng đầu</Text>
                    </Space>
                  </div>
                }
                className={styles.mainCard}
                bordered={false}
              >
                <div className={styles.topInstructors}>
                  {approvedInstructors.slice(0, 5).map((instructor, index) => (
                    <div key={instructor._id || instructor.id} className={styles.instructorItem}>
                      <div className={styles.instructorRank}>
                        <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#faad14' : '#d9d9d9' }} />
                      </div>
                      <Avatar src={instructor.avatar} size="large" className={styles.instructorAvatar}>
                        {instructor.fullname?.charAt(0) || instructor.name?.charAt(0)}
                      </Avatar>
                      <div className={styles.instructorInfo}>
                        <Text strong>{instructor.fullname || instructor.name}</Text>
                        <Text type="secondary">{instructor.email}</Text>
                      </div>
                      <div className={styles.instructorStats}>
                        <Text type="secondary">{Math.floor(Math.random() * 20) + 5} khóa học</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;