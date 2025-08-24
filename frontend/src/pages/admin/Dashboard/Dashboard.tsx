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
  FallOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import styles from './Dashboard.module.css';
import { config } from '../../../api/axios';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  // State lưu trữ dữ liệu
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<number>(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState<number>(0);

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [coursesRes, usersRes, instructorsRes] = await Promise.all([
          config.get('/courses?populate=instructor,category&limit=10&sort=-createdAt'),
          config.get('/users'),
          config.get('/users/instructors'),
        ]);
        
        // Thử lấy doanh thu từ API riêng biệt
        let revenueData = { currentMonth: 0, growth: 0 };
        try {
          const revenueRes = await config.get('/transactions/revenue/monthly');
          if (revenueRes.data?.success) {
            revenueData = revenueRes.data.data || { currentMonth: 0, growth: 0 };
          }
        } catch (revenueErr) {
          console.log('Không thể lấy dữ liệu doanh thu:', revenueErr);
          // Fallback: tính toán doanh thu từ khóa học (giả định)
          const totalCourseValue = coursesRes.data.data?.reduce((sum: number, course: any) => {
            const price = course.price || 0;
            const discount = course.discount || 0;
            const finalPrice = price - (price * discount / 100);
            return sum + finalPrice;
          }, 0) || 0;
          revenueData = { 
            currentMonth: totalCourseValue * 0.3, // Giả định 30% khóa học được mua
            growth: Math.floor(Math.random() * 20) - 5 // Random growth từ -5% đến +15%
          };
        }
        setCourses(Array.isArray(coursesRes.data.data) ? coursesRes.data.data : []);
        setUsers(Array.isArray(usersRes.data.data?.users) ? usersRes.data.data.users : []);
        setInstructors(Array.isArray(instructorsRes.data.data?.instructors) ? instructorsRes.data.data.instructors : []);
        
        // Xử lý dữ liệu doanh thu
        setRevenue(revenueData.currentMonth);
        setMonthlyGrowth(revenueData.growth);
        
        // Debug logging
        console.log('Dashboard Data:', {
          courses: coursesRes.data.data,
          users: usersRes.data.data?.users,
          instructors: instructorsRes.data.data?.instructors,
          revenue: revenueData
        });
        
        // Debug chi tiết cho khóa học
        if (coursesRes.data.data && Array.isArray(coursesRes.data.data)) {
          console.log('Courses detail:', coursesRes.data.data.map((course: any) => ({
            id: course._id,
            title: course.title,
            instructor: course.instructor,
            instructorType: typeof course.instructor,
            category: course.category,
            createdAt: course.createdAt
          })));
        }
      } catch (err: any) {
        setCourses([]);
        setUsers([]);
        setInstructors([]);
        setRevenue(0);
        setMonthlyGrowth(0);
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

  // Lọc chỉ lấy học viên (student) từ danh sách users
  const students = (users || []).filter(
    (user: any) => user.role_id?.name === 'student' || user.role?.name === 'student'
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
  const activeUsers = students.length; // Chỉ đếm học viên, không đếm giảng viên
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
            src={record.thumbnail && record.thumbnail !== '' ? record.thumbnail : '/images/no-image.png'}
            alt="thumbnail"
            className={styles.courseThumbnail}
            onError={(e) => {
              e.currentTarget.src = '/images/no-image.png';
            }}
          />
          <div className={styles.courseInfo}>
            <Text strong className={styles.courseName} style={{ fontSize: '14px', lineHeight: '1.3' }}>
              {text || 'Không có tiêu đề'}
            </Text>
            <Text type="secondary" className={styles.courseCategory} style={{ fontSize: '12px', marginTop: '2px' }}>
              {record.category?.name || ''}
            </Text>
            {record.createdAt && (
              <Text type="secondary" style={{ fontSize: '11px', marginTop: '2px', display: 'block' }}>
                Tạo: {new Date(record.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            )}
          </div>
        </div>
      ),
    },
   
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 180,
      render: (value: number, record: any) => {
        const originalPrice = value || 0;
        const discount = record.discount || 0;
        const finalPrice = originalPrice - (originalPrice * discount / 100);
        
        // Nếu giá cuối là 0 hoặc âm, hiển thị miễn phí
        if (finalPrice <= 0) {
          return (
            <div style={{ minHeight: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                Miễn phí
              </Text>
              {originalPrice > 0 && discount > 0 && (
                <div style={{ marginTop: '2px' }}>
                  <Text delete style={{ color: '#999', fontSize: '12px' }}>
                    {originalPrice.toLocaleString('vi-VN')} ₫
                  </Text>
                  <Tag color="red" style={{ marginLeft: '4px', fontSize: '10px' }}>
                    -{discount}%
                  </Tag>
                </div>
              )}
            </div>
          );
        }
        
        return (
          <div style={{ minHeight: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
              {finalPrice.toLocaleString('vi-VN')} ₫
            </Text>
            {discount > 0 && (
              <div style={{ marginTop: '2px' }}>
                <Text delete style={{ color: '#999', fontSize: '12px' }}>
                  {originalPrice.toLocaleString('vi-VN')} ₫
                </Text>
                <Tag color="red" style={{ marginLeft: '4px', fontSize: '10px' }}>
                  -{discount}%
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: any) => {
        // Kiểm tra nhiều trường hợp trạng thái có thể có
        const isPublished = status === 'published' || 
                           status === 'active' || 
                           status === 'approved' ||
                           record.isPublished === true ||
                           record.approvalStatus === 'approved';
        
        const isDraft = status === 'draft' || 
                       status === 'pending' || 
                       status === 'inactive' ||
                       record.isPublished === false ||
                       record.approvalStatus === 'pending';
        
        const isRejected = status === 'rejected' || 
                          status === 'declined' ||
                          record.approvalStatus === 'rejected';
        
        if (isPublished) {
          return (
            <Badge
              status="success"
              text="Đã xuất bản"
            />
          );
        } else if (isRejected) {
          return (
            <Badge
              status="error"
              text="Từ chối"
            />
          );
        } else if (isDraft) {
          return (
            <Badge
              status="default"
              text="Bản nháp"
            />
          );
        } else {
          // Trường hợp không xác định được trạng thái
          return (
            <Badge
              status="processing"
              text="Đang xử lý"
            />
          );
        }
      },
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: '32px' }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                <DashboardOutlined style={{ marginRight: '12px', color: '#667eea' }} />
                Dashboard
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Tổng quan hệ thống EduPro
              </Text>
              <div style={{ marginTop: '12px' }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                  Cập nhật: {new Date().toLocaleString('vi-VN')}
                </Text>
              </div>
            </div>
          </Card>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card 
              style={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                padding: '80px 24px'
              }}
            >
              <Spin size="large" />
              <Text type="secondary" style={{ marginTop: 16, fontSize: '16px' }}>Đang tải dữ liệu...</Text>
            </Card>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ 
                borderRadius: '12px',
                marginBottom: '24px'
              }}
              action={
                <Button size="small" danger onClick={() => window.location.reload()}>
                  Thử lại
                </Button>
              }
            />
          </motion.div>
        ) : (
          <>
            {/* KPI Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    hoverable
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '12px', 
                        backgroundColor: '#e6f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <UserOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Statistic
                          title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng học viên</Text>}
                          value={activeUsers}
                          valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
                        />
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Tổng người dùng: {users.length} | Giảng viên: {approvedInstructorCount}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                          <RiseOutlined style={{ color: '#52c41a' }} />
                          <Text type="secondary" style={{ fontSize: '12px' }}>+12% tháng này</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    hoverable
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '12px', 
                        backgroundColor: '#f6ffed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BookOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Statistic
                          title={<Text style={{ fontSize: '14px', color: '#666' }}>Khóa học</Text>}
                          value={totalCourses}
                          valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                          <RiseOutlined style={{ color: '#52c41a' }} />
                          <Text type="secondary" style={{ fontSize: '12px' }}>+8% tháng này</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    hoverable
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '12px', 
                        backgroundColor: '#fff7e6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <DollarOutlined style={{ color: '#fa8c16', fontSize: '24px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Statistic
                          title={<Text style={{ fontSize: '14px', color: '#666' }}>Doanh thu tháng</Text>}
                          value={revenue}
                          valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 600 }}
                          formatter={(value) => {
                            const numValue = Number(value);
                            if (numValue === 0) return '0 ₫';
                            if (numValue < 1000000) return `${numValue.toLocaleString('vi-VN')} ₫`;
                            return `${(numValue / 1000000).toFixed(1)}M ₫`;
                          }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                          {monthlyGrowth > 0 ? (
                            <RiseOutlined style={{ color: '#52c41a' }} />
                          ) : monthlyGrowth < 0 ? (
                            <FallOutlined style={{ color: '#ff4d4f' }} />
                          ) : (
                            <ArrowUpOutlined style={{ color: '#8c8c8c' }} />
                          )}
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth}% tháng này
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    hoverable
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '12px', 
                        backgroundColor: '#fff1f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <TeamOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                          <RiseOutlined style={{ color: '#52c41a' }} />
                          <Text type="secondary" style={{ fontSize: '12px' }}>+5% tháng này</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </motion.div>

            {/* User Statistics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                <Col xs={24}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                      <UserOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                      <Text strong style={{ fontSize: '18px' }}>Thống kê người dùng</Text>
                    </div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} lg={6}>
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                          <Text style={{ display: 'block', marginBottom: '8px' }}>Học viên</Text>
                          <Text strong style={{ color: '#1890ff', fontSize: '24px', display: 'block' }}>{students.length}</Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                          <Text style={{ display: 'block', marginBottom: '8px' }}>Giảng viên đã duyệt</Text>
                          <Text strong style={{ color: '#52c41a', fontSize: '24px', display: 'block' }}>{approvedInstructorCount}</Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                          <Text style={{ display: 'block', marginBottom: '8px' }}>Giảng viên chờ duyệt</Text>
                          <Text strong style={{ color: '#faad14', fontSize: '24px', display: 'block' }}>{pendingInstructors}</Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                          <Text style={{ display: 'block', marginBottom: '8px' }}>Tổng người dùng</Text>
                          <Text strong style={{ color: '#722ed1', fontSize: '24px', display: 'block' }}>{users.length}</Text>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                <Col xs={24} sm={12} lg={8}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    hoverable
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                      <FireOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                      <Text strong style={{ fontSize: '16px' }}>Hoạt động nổi bật</Text>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Khóa học mới</Text>
                        <Badge count={courses.filter(c => (c.createdAt ? new Date(c.createdAt).getTime() : 0) > Date.now() - 7*24*60*60*1000).length} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Giảng viên chờ duyệt</Text>
                        <Badge count={pendingInstructors} style={{ backgroundColor: '#faad14' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Học viên mới</Text>
                        <Badge count={students.filter(s => (s.createdAt ? new Date(s.createdAt).getTime() : 0) > Date.now() - 7*24*60*60*1000).length} style={{ backgroundColor: '#52c41a' }} />
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    hoverable
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                      <ShoppingCartOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                      <Text strong style={{ fontSize: '16px' }}>Đơn hàng</Text>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Hôm nay</Text>
                        <Text strong style={{ color: '#52c41a' }}>24</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Tuần này</Text>
                        <Text strong style={{ color: '#1890ff' }}>156</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    hoverable
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                      <EyeOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                      <Text strong style={{ fontSize: '16px' }}>Lượt xem</Text>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Hôm nay</Text>
                        <Text strong style={{ color: '#722ed1' }}>1,234</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Tuần này</Text>
                        <Text strong style={{ color: '#eb2f96' }}>8,567</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </motion.div>

            {/* Top Instructors - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                <Col xs={24}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <TrophyOutlined style={{ color: '#faad14' }} />
                          <Text strong style={{ fontSize: '18px' }}>Giảng viên hàng đầu</Text>
                        </Space>
                        <Tag color="gold" style={{ borderRadius: '8px' }}>Giảng viên</Tag>
                      </div>
                    }
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between' }}>
                      {approvedInstructors.slice(0, 6).map((instructor, index) => {
                        const courseCount = Math.floor(Math.random() * 15) + 3;
                        const studentCount = Math.floor(Math.random() * 500) + 50;
                        const rating = (Math.random() * 2 + 3).toFixed(1);
                        
                        return (
                          <div key={instructor._id || instructor.id} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #f0f0f0',
                            minWidth: '300px',
                            flex: '1 1 300px',
                            maxWidth: '400px',
                            backgroundColor: '#fafafa',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          >
                            <div style={{ position: 'relative' }}>
                              {index < 3 ? (
                                <div style={{ 
                                  position: 'absolute',
                                  top: '-8px',
                                  right: '-8px',
                                  width: 24, 
                                  height: 24, 
                                  borderRadius: '50%', 
                                  backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  zIndex: 1
                                }}>
                                  {index + 1}
                                </div>
                              ) : (
                                <Badge count={index + 1} style={{ 
                                  backgroundColor: '#d9d9d9',
                                  position: 'absolute',
                                  top: '-8px',
                                  right: '-8px',
                                  zIndex: 1
                                }} />
                              )}
                              <Avatar 
                                src={instructor.avatar && instructor.avatar !== 'default-avatar.jpg' && instructor.avatar !== '' && (instructor.avatar.includes('googleusercontent.com') || instructor.avatar.startsWith('http')) ? instructor.avatar : undefined} 
                                size="large" 
                              >
                                {instructor.fullname?.charAt(0) || instructor.name?.charAt(0)}
                              </Avatar>
                            </div>
                            <div style={{ flex: 1 }}>
                              <Text strong style={{ fontSize: '14px', display: 'block' }}>
                                {instructor.fullname || instructor.name}
                              </Text>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                <StarOutlined style={{ color: '#faad14', fontSize: '12px' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {rating} ({studentCount} học viên)
                                </Text>
                              </div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '60px' }}>
                              <Text strong style={{ color: '#1890ff', fontSize: '16px', display: 'block' }}>
                                {courseCount}
                              </Text>
                              <div style={{ fontSize: '11px', color: '#666' }}>
                                khóa học
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {approvedInstructors.length === 0 && (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '40px 20px',
                          color: '#999',
                          width: '100%'
                        }}>
                          <TeamOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                          <div>Chưa có giảng viên nào</div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Các giảng viên sẽ xuất hiện ở đây sau khi được duyệt
                          </Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </motion.div>

            {/* Latest Courses - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                <Col xs={24}>
                  <Card 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <BookOutlined />
                          <Text strong style={{ fontSize: '18px' }}>Khóa học mới nhất</Text>
                        </Space>
                        <Tag color="blue" style={{ borderRadius: '8px' }}>{courses.length} khóa học</Tag>
                      </div>
                    }
                  >
                    {courses.length > 0 ? (
                      <Table
                        dataSource={courses.slice(0, 7)}
                        columns={columns}
                        pagination={false}
                        className={styles.coursesTable}
                        rowKey="_id"
                        scroll={{ x: 800 }}
                        size="small"
                        style={{ 
                          borderRadius: '12px',
                          overflow: 'hidden'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '40px 20px',
                        color: '#999'
                      }}>
                        <BookOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                        <div>Chưa có khóa học nào</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Các khóa học sẽ xuất hiện ở đây sau khi được tạo
                        </Text>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;