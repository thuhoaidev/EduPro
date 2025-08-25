import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Input,
  Select,
  Pagination,
  Tag,
  Tooltip,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Table,
  Image,
  Form,
  Typography,
  Badge,
  Divider,
  Progress,
  Alert,
  Spin,
} from "antd";
import {
  BookOutlined,
  DollarOutlined,
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  TagsOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from '../../../services/apiService';
import type { Course } from '../../../services/apiService';
import type { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const PAGE_SIZE = 15;

// Thêm mapping màu cho trạng thái
const statusColorMap: Record<string, string> = {
  draft: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
};

// FilterSection component
interface FilterSectionProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearch: (value: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  search: string;
}

const FilterSection = ({
  searchInput,
  setSearchInput,
  setSearch,
  selectedFilter,
  setSelectedFilter,
  search,
}: FilterSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
  >
    <Card 
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <Input
          placeholder="Tìm kiếm khóa học..."
          prefix={<SearchOutlined />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={() => setSearch(searchInput)}
          style={{ 
            minWidth: '250px',
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}
          allowClear
        />
        <Select
          placeholder="Lọc theo loại khóa học"
          value={selectedFilter}
          onChange={setSelectedFilter}
          style={{ 
            minWidth: '180px',
            borderRadius: '8px'
          }}
          allowClear
        >
          <Select.Option value="all">Tất cả khóa học</Select.Option>
          <Select.Option value="free">Khóa học miễn phí</Select.Option>
          <Select.Option value="paid">Khóa học tính phí</Select.Option>
        </Select>
        
      </div>
    </Card>
  </motion.div>
);

// StatCards component
interface StatCardsProps {
  courseStats: {
    total: number;
    free: number;
    paid: number;
    totalStudents: number;
  };
}

const StatCards = ({ courseStats }: StatCardsProps) => {
  const freePercentage = courseStats.total > 0 ? (courseStats.free / courseStats.total) * 100 : 0;
  const paidPercentage = courseStats.total > 0 ? (courseStats.paid / courseStats.total) * 100 : 0;

  return (
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
                <BookOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng số khóa học</Text>}
                  value={courseStats.total}
                  valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tất cả khóa học</Text>
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
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Khóa học miễn phí</Text>}
                  value={courseStats.free}
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{freePercentage.toFixed(1)}%</Text>
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
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Khóa học tính phí</Text>}
                  value={courseStats.paid}
                  valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#fa8c16' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{paidPercentage.toFixed(1)}%</Text>
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
                <UserOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng học viên</Text>}
                  value={courseStats.totalStudents}
                  valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#ff4d4f' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tổng cộng</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [rejectForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Vui lòng đăng nhập để truy cập');
          return;
        }

        // Kiểm tra role của user
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const userRole = user?.role?.name || user?.role_id?.name || user?.role;
          console.log('User role:', userRole);
          
          // Cho phép admin và instructor truy cập
          const allowedRoles = ['instructor', 'admin'];
          if (!allowedRoles.includes(userRole)) {
            message.error('Bạn không có quyền truy cập trang giảng viên');
            return;
          }
        }

        // Lấy khóa học của instructor từ API
        const data = await courseService.getInstructorCourses();
        setCourses(data);
      } catch (error: unknown) {
        console.error('Lỗi khi lấy danh sách khóa học:', error);
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 403) {
            message.error('Bạn không có quyền truy cập. Vui lòng kiểm tra lại tài khoản giảng viên.');
          } else if (axiosError.response?.status === 401) {
            message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else {
            message.error('Không thể tải danh sách khóa học');
          }
        } else {
          message.error('Không thể tải danh sách khóa học');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Chỉ hiển thị khóa học có trạng thái: pending, approved, rejected
    result = result.filter((course) => 
      ['pending', 'approved', 'rejected'].includes(course.status)
    );

    if (search) {
      result = result.filter((course) =>
        course.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedFilter === "free") {
      result = result.filter((course) => course.isFree);
    } else if (selectedFilter === "paid") {
      result = result.filter((course) => !course.isFree);
    }

    return result;
  }, [courses, search, selectedFilter]);



  const handleApprove = async (courseId: string) => {
    Modal.confirm({
      title: 'Duyệt khóa học',
      content: 'Bạn có chắc chắn muốn duyệt khóa học này?',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseService.approveCourse(courseId, 'approve');
          message.success('Đã duyệt khóa học thành công!');
          // Refresh danh sách khóa học
          const data = await courseService.getInstructorCourses();
          setCourses(data);
        } catch (error) {
          console.error('Lỗi khi duyệt khóa học:', error);
          message.error('Duyệt khóa học thất bại!');
        }
      },
    });
  };

  const handleReject = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setRejectModalVisible(true);
    rejectForm.resetFields();
  };

  const handleRejectSubmit = async (values: { reason: string }) => {
    if (!selectedCourseId) return;
    
    try {
      await courseService.approveCourse(selectedCourseId, 'reject', values.reason);
      message.success('Đã từ chối khóa học!');
      setRejectModalVisible(false);
      setSelectedCourseId(null);
      rejectForm.resetFields();
      // Refresh danh sách khóa học
      const data = await courseService.getInstructorCourses();
      setCourses(data);
    } catch (error) {
      console.error('Lỗi khi từ chối khóa học:', error);
      message.error('Từ chối khóa học thất bại!');
    }
  };

  const handleToggleDisplay = async (courseId: string, currentDisplayStatus: string) => {
    const newDisplayStatus = currentDisplayStatus === 'hidden' ? 'published' : 'hidden';
    const actionText = newDisplayStatus === 'published' ? 'hiển thị' : 'ẩn';
    
    Modal.confirm({
      title: `Thay đổi trạng thái hiển thị`,
      content: `Bạn có chắc chắn muốn ${actionText} khóa học này?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseService.updateCourseStatus(courseId, { displayStatus: newDisplayStatus });
          message.success(`Đã ${actionText} khóa học thành công!`);
          // Refresh danh sách khóa học
          const data = await courseService.getInstructorCourses();
          setCourses(data);
        } catch (error) {
          console.error('Lỗi khi thay đổi trạng thái hiển thị:', error);
          message.error(`Không thể ${actionText} khóa học!`);
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  };

  // Calculate statistics
  const courseStats = {
    total: courses.length,
    free: courses.filter(course => course.isFree).length,
    paid: courses.filter(course => !course.isFree).length,
    totalStudents: courses.reduce((sum, course) => sum + (course.reviews || 0), 0), // Using reviews as proxy for students
  };

  // Hàm xuất bản khóa học (gửi duyệt)
  const handlePublish = async (courseId: string) => {
    Modal.confirm({
      title: 'Gửi xét duyệt khóa học',
      content: 'Bạn có chắc chắn muốn gửi khóa học này đi xét duyệt? Khóa học sẽ được kiểm duyệt trong vòng 24h.',
      okText: 'Gửi duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseService.submitCourseForApproval(courseId);
          message.success('Đã gửi khóa học đi xét duyệt!');
          // Refresh danh sách khóa học
          const data = await courseService.getInstructorCourses();
          setCourses(data);
        } catch (error) {
          console.error('Lỗi khi gửi xét duyệt:', error);
          message.error('Gửi xét duyệt thất bại!');
        }
      },
    });
  };

  // Lấy thông tin user để kiểm tra role
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role?.name || user?.role_id?.name || user?.role;

  // Định nghĩa columns cho table
  const columns: ColumnsType<Course> = [
    {
      title: 'STT',
      dataIndex: 'number',
      key: 'number',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <Badge count={index + 1} showZero style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Khóa học',
      key: 'course',
      width: 400,
      render: (_, record) => (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => navigate(`/admin/courses/${record.id}`)}
        >
          <Image
            src={record.Image}
            alt={record.title}
            width={60}
            height={40}
            style={{ borderRadius: '8px', objectFit: 'cover' }}
            fallback="https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=Khóa+học"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: '500', 
              color: '#1a1a1a', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s ease'
            }}>
              {record.title}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {record.author.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Giá',
      key: 'price',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div>
          {record.isFree ? (
            <Tag color="success" style={{ fontSize: '12px' }}>Miễn phí</Tag>
          ) : (
            <span style={{ fontWeight: '500', color: '#52c41a' }}>
              {record.price.toLocaleString()}đ
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const statusText: Record<string, string> = {
          'draft': 'Bản nháp',
          'pending': 'Chờ duyệt',
          'approved': 'Đã duyệt',
          'rejected': 'Bị từ chối'
        };
        return (
          <div>
            <Tag color={statusColorMap[record.status] || 'default'} style={{ fontSize: '12px' }}>
              {statusText[record.status] || record.status}
            </Tag>
            {record.status === 'rejected' && record.rejection_reason && (
              <Tooltip title={record.rejection_reason}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#ff4d4f', 
                  marginTop: '4px', 
                  cursor: 'help' 
                }}>
                  Xem lý do từ chối
                </div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Tooltip title="Duyệt khóa học">
                <Button
                  type="primary"
                  onClick={() => handleApprove(record.id)}
                  size="small"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Duyệt
                </Button>
              </Tooltip>
              <Tooltip title="Từ chối khóa học">
                <Button
                  danger
                  onClick={() => handleReject(record.id)}
                  size="small"
                >
                  Từ chối
                </Button>
              </Tooltip>
            </>
          )}
          {/* Chỉ hiển thị nút "Gửi duyệt" cho instructor, không hiển thị cho admin */}
          {record.status === 'draft' && userRole === 'instructor' && (
            <Tooltip title="Gửi xét duyệt">
              <Button
                type="primary"
                onClick={() => handlePublish(record.id)}
                size="small"
                style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
              >
                Gửi duyệt
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (loading && courses.length === 0) {
    return (
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
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
            <Text style={{ marginTop: 16, fontSize: '16px' }}>Đang tải dữ liệu...</Text>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        {/* Page Header */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                  <TrophyOutlined style={{ marginRight: '12px', color: '#667eea' }} />
                  Quản lý Khóa học
                </Title>
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
                  Tạo và quản lý các khóa học của bạn trên EduPro
                </Paragraph>
                <div style={{ marginTop: '12px' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                    Cập nhật: {new Date().toLocaleString('vi-VN')}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <StatCards courseStats={courseStats} />

        {/* Filter Section */}
        <FilterSection
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setSearch={setSearch}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          search={search}
        />

        {/* Course List Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              paddingBottom: '12px', 
              borderBottom: '1px solid #f0f0f0',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                  Danh sách khóa học
                </Title>
                <Badge count={filteredCourses.length} style={{ 
                  backgroundColor: '#1890ff',
                  borderRadius: '8px'
                }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredCourses.length)} của {filteredCourses.length} khóa học
                </Text>
              </div>
            </div>
            
            <Table
              columns={columns}
              dataSource={filteredCourses}
              rowKey="id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredCourses.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khóa học`,
                pageSizeOptions: ['10', '20', '50', '100'],
                size: 'small',
                onChange: (page, newPageSize) => {
                  setCurrentPage(page);
                  if (newPageSize) {
                    setPageSize(newPageSize);
                  }
                }
              }}
              style={{ 
                borderRadius: '12px',
                overflow: 'hidden'
              }}
              scroll={{ x: 900 }}
              size="small"
            />
          </Card>
        </motion.div>

        {/* Modal từ chối khóa học */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
              <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                Từ chối khóa học
              </Text>
            </div>
          }
          open={rejectModalVisible}
          onCancel={() => {
            setRejectModalVisible(false);
            setSelectedCourseId(null);
            rejectForm.resetFields();
          }}
          footer={null}
          width={500}
          style={{ borderRadius: '16px' }}
        >
          <Form
            form={rejectForm}
            layout="vertical"
            onFinish={handleRejectSubmit}
            style={{ marginTop: '16px' }}
          >
            <Form.Item
              label={<Text strong>Lý do từ chối</Text>}
              name="reason"
              rules={[
                { required: true, message: 'Vui lòng nhập lý do từ chối!' },
                { min: 10, message: 'Lý do từ chối phải có ít nhất 10 ký tự!' }
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập lý do từ chối khóa học..."
                maxLength={500}
                showCount
                style={{ 
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    setRejectModalVisible(false);
                    setSelectedCourseId(null);
                    rejectForm.resetFields();
                  }}
                  style={{ 
                    borderRadius: '8px',
                    height: '40px'
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={loading}
                  style={{ 
                    borderRadius: '8px',
                    height: '40px'
                  }}
                >
                  Từ chối khóa học
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </motion.div>
  );
};

export default CourseList;
