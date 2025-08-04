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
      render: (instructor: any, record: any) => {
        // Debug: log để kiểm tra dữ liệu
        console.log('Instructor data:', instructor);
        console.log('Record data:', record);
        console.log('AllPeople:', allPeople);
        
        // Xử lý nhiều trường hợp dữ liệu instructor
        let instructorName = 'Không rõ';
        let instructorAvatar = undefined;
        
        // Kiểm tra record.instructor trước
        if (record.instructor) {
          if (typeof record.instructor === 'object') {
            instructorName = record.instructor.fullname || record.instructor.name || record.instructor.username || 'Không rõ';
            instructorAvatar = record.instructor.avatar;
          } else if (typeof record.instructor === 'string') {
            // Tìm trong danh sách allPeople
            const foundInstructor = allPeople.find(p => 
              p._id === record.instructor || 
              p.id === record.instructor ||
              p._id?.toString() === record.instructor ||
              p.id?.toString() === record.instructor
            );
            if (foundInstructor) {
              instructorName = foundInstructor.fullname || foundInstructor.name || foundInstructor.username || 'Không rõ';
              instructorAvatar = foundInstructor.avatar;
            }
          }
        }
        
        // Kiểm tra instructor parameter
        if (instructorName === 'Không rõ' && instructor) {
          if (typeof instructor === 'object') {
            instructorName = instructor.fullname || instructor.name || instructor.username || 'Không rõ';
            instructorAvatar = instructor.avatar;
          } else if (typeof instructor === 'string') {
            const foundInstructor = allPeople.find(p => 
              p._id === instructor || 
              p.id === instructor ||
              p._id?.toString() === instructor ||
              p.id?.toString() === instructor
            );
            if (foundInstructor) {
              instructorName = foundInstructor.fullname || foundInstructor.name || foundInstructor.username || 'Không rõ';
              instructorAvatar = foundInstructor.avatar;
            }
          }
        }
        
        // Fallback: kiểm tra các field khác trong record
        if (instructorName === 'Không rõ') {
          instructorName = record.instructorName || 
                          record.instructor_name || 
                          record.instructorName || 
                          record.createdBy?.fullname ||
                          record.createdBy?.name ||
                          'Không rõ';
        }
        
        // Debug: log kết quả
        console.log('Final instructor name:', instructorName);
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar 
              src={instructorAvatar && instructorAvatar !== 'default-avatar.jpg' && instructorAvatar !== '' && (instructorAvatar.includes('googleusercontent.com') || instructorAvatar.startsWith('http')) ? instructorAvatar : undefined} 
              size="small"
            >
              {instructorName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Text style={{ fontSize: '13px' }}>{instructorName}</Text>
          </div>
        );
      },
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
                      formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M ₫`}
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

                     {/* Top Instructors - Full Width */}
           <Row gutter={[24, 24]} className={styles.mainContent}>
             <Col xs={24}>
               <Card
                 title={
                   <div className={styles.cardHeader}>
                     <Space>
                       <TrophyOutlined style={{ color: '#faad14' }} />
                       <Text strong>Giảng viên hàng đầu</Text>
                     </Space>
                     <Tag color="gold">6 giảng viên</Tag>
                   </div>
                 }
                 className={styles.mainCard}
                 bordered={false}

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
                         padding: '12px',
                         borderRadius: '8px',
                         border: '1px solid #f0f0f0',
                         minWidth: '300px',
                         flex: '1 1 300px',
                         maxWidth: '400px'
                       }}>
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

           {/* Latest Courses - Full Width */}
          <Row gutter={[24, 24]} className={styles.mainContent}>
             <Col xs={24}>
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
                
              >
                <Table
                                     dataSource={courses.slice(0, 7)}
                  columns={columns}
                  pagination={false}
                  className={styles.coursesTable}
                  rowKey="_id"
                  scroll={{ x: 800 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;