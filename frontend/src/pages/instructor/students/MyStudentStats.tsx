import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Avatar, 
  Input, 
  Select, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  message, 
  Spin, 
  Empty,
  Typography,
  Tooltip
} from "antd";
import { 
  SearchOutlined, 
  UserOutlined, 
  BookOutlined, 
  TrophyOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  TeamOutlined,
  CalendarOutlined,
  FireOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import instructorService, { type InstructorStudent } from "../../../services/instructorService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const FADE_IN_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface Student {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    phone: string;
  };
  course: {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
  };
  progress: number;
  completed: boolean;
  enrolledAt: string;
  lastActivity: string | null;
}

const MyStudentStats: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [uniqueStudents, setUniqueStudents] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courses, setCourses] = useState<Array<{id: string; title: string}>>([]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [currentPage, pageSize, search, selectedCourse]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };
      
      if (search) params.search = search;
      if (selectedCourse) params.courseId = selectedCourse;

      const response = await instructorService.getStudents(params);
      setStudents(response.students);
      setTotal(response.pagination.total);
      setUniqueStudents(response.pagination.uniqueStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesData = await instructorService.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCourseFilter = (value: string) => {
    setSelectedCourse(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 50) return "#faad14";
    return "#ff4d4f";
  };

  const getProgressTagColor = (progress: number) => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "warning";
    return "error";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Miễn phí" : `${price.toLocaleString()}đ`;
  };

  // Component thống kê tổng quan
  const StudentStatsOverview = () => {
    const totalEnrollments = total;
    const completedStudents = students.filter(s => s.completed).length;
    const activeStudents = students.filter(s => !s.completed && s.progress > 0).length;
    const averageProgress = students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
      : 0;

    return (
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="stats-card">
              <Statistic 
                title={<span style={{ color: '#667eea', fontWeight: '600' }}>Tổng học viên</span>}
                value={uniqueStudents} 
                prefix={<TeamOutlined style={{ color: '#667eea' }} />}
                valueStyle={{ color: '#2c3e50', fontWeight: '700', fontSize: '28px' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="stats-card">
              <Statistic 
                title={<span style={{ color: '#52c41a', fontWeight: '600' }}>Tổng đăng ký</span>}
                value={totalEnrollments} 
                prefix={<BookOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontWeight: '700', fontSize: '28px' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="stats-card">
              <Statistic 
                title={<span style={{ color: '#faad14', fontWeight: '600' }}>Đã hoàn thành</span>}
                value={completedStudents} 
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14', fontWeight: '700', fontSize: '28px' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="stats-card">
              <Statistic 
                title={<span style={{ color: '#722ed1', fontWeight: '600' }}>Tiến độ TB</span>}
                value={averageProgress} 
                suffix="%" 
                prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontWeight: '700', fontSize: '28px' }}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>
    );
  };

  const columns = [
    {
      title: "Học viên",
      key: "student",
      render: (record: Student) => (
        <div 
          style={{ 
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onClick={() => navigate(`/instructor/students/${record.student.id}`)}
        >
          <Space size="middle">
            <Avatar 
              size={64} 
              src={record.student.avatar} 
              icon={<UserOutlined />}
              style={{ 
                border: '2px solid #f0f0f0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
            <div>
              <Text strong style={{ 
                fontSize: '16px', 
                color: '#2c3e50',
                display: 'block',
                marginBottom: '4px'
              }}>
                {record.student.name}
              </Text>
              <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '2px' }}>
                {record.student.email}
              </Text>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {record.student.phone}
              </Text>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: "Khóa học",
      key: "course",
      render: (record: Student) => (
        <div>
          <Text strong style={{ 
            fontSize: '16px', 
            color: '#2c3e50',
            display: 'block',
            marginBottom: '4px'
          }}>
            {record.course.title}
          </Text>
          <Tag color="green" style={{ borderRadius: '6px', fontWeight: '500' }}>
            {formatPrice(record.course.price)}
          </Tag>
        </div>
      ),
    },
    {
      title: "Tiến độ",
      key: "progress",
      render: (record: Student) => (
        <div style={{ minWidth: 120 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Progress 
              percent={record.progress} 
              size="small" 
              strokeColor={getProgressColor(record.progress)}
              showInfo={false}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: getProgressColor(record.progress) }}>
              {record.progress}%
            </span>
          </div>
          <Tag color={getProgressTagColor(record.progress)} style={{ borderRadius: '6px' }}>
            {record.completed ? "✅ Hoàn thành" : record.progress > 0 ? "🔄 Đang học" : "⏳ Chưa bắt đầu"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Ngày đăng ký",
      key: "enrolledAt",
      render: (record: Student) => (
        <div style={{ textAlign: 'center' }}>
          <CalendarOutlined style={{ color: '#667eea', marginRight: 8, fontSize: '16px' }} />
          <Text style={{ fontSize: 14, color: '#595959' }}>
            {formatDate(record.enrolledAt)}
          </Text>
        </div>
      ),
    },
    {
      title: "Hoạt động cuối",
      key: "lastActivity",
      render: (record: Student) => (
        <div style={{ textAlign: 'center' }}>
          {record.lastActivity ? (
            <>
              <ClockCircleOutlined style={{ color: '#667eea', marginRight: 8, fontSize: '16px' }} />
              <Text style={{ fontSize: 14, color: '#595959' }}>
                {formatDate(record.lastActivity)}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 14, color: '#d9d9d9' }}>Chưa có</Text>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (record: Student) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="primary"
            size="middle"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/instructor/students/${record.student.id}`)}
            className="detail-button"
          >
            Chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: '32px 24px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <style>{`
        .stats-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
        }
        .main-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          border: none;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        .ant-table {
          background: transparent;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-weight: 600;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0;
          background: transparent;
        }
        .ant-table-tbody > tr:hover > td {
          background: rgba(102, 126, 234, 0.05) !important;
        }
        .search-input {
          border-radius: 12px;
          border: 2px solid #e8e8e8;
          transition: all 0.3s ease;
        }
        .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .filter-select {
          border-radius: 12px;
          border: 2px solid #e8e8e8;
        }
        .detail-button {
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        .detail-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }
        .page-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          margin-bottom: 32px;
        }
      `}</style>

      <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP_VARIANTS}>
        <Title level={2} className="page-title" style={{ textAlign: 'center' }}>
          <TeamOutlined style={{ marginRight: 12 }} />
          Thống kê học viên
        </Title>
        
        {/* Thống kê tổng quan */}
        <StudentStatsOverview />
      </motion.div>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ ...FADE_IN_UP_VARIANTS, visible: { ...FADE_IN_UP_VARIANTS.visible, transition: { delay: 0.2 } } }}
      >
        <Card className="main-card">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <Title level={3} style={{ 
                margin: 0, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '700'
              }}>
                <FireOutlined style={{ marginRight: 8 }} />
                Danh sách học viên
              </Title>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <Statistic
                  title="Hiển thị"
                  value={students.length}
                  suffix={`/ ${total}`}
                  valueStyle={{ fontSize: 16, color: '#667eea', fontWeight: '600' }}
                />
                <Statistic
                  title="Trang"
                  value={currentPage}
                  suffix={`/ ${Math.ceil(total / pageSize)}`}
                  valueStyle={{ fontSize: 16, color: '#667eea', fontWeight: '600' }}
                />
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Input
                placeholder="🔍 Tìm kiếm theo tên, email học viên hoặc tên khóa học..."
                prefix={<SearchOutlined style={{ color: '#667eea' }} />}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: 400 }}
                allowClear
                className="search-input"
                size="large"
              />
              <Select
                placeholder="📚 Lọc theo khóa học"
                allowClear
                style={{ width: 250 }}
                onChange={handleCourseFilter}
                className="filter-select"
                size="large"
              >
                {courses.map(course => (
                  <Option key={course.id} value={course.id}>
                    {course.title}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          
          <Table
            columns={columns}
            dataSource={students}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} học viên`,
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange,
              pageSizeOptions: ['10', '20', '50'],
              style: { marginTop: '24px' }
            }}
            style={{ borderRadius: '12px', overflow: 'hidden' }}
            locale={{
              emptyText: (
                <Empty
                  description="Không có học viên nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default MyStudentStats; 