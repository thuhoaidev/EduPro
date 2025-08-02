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
import styles from '../../admin/Users/UserPage.module.css';

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
  <Card className={styles.filterCard} bordered={false}>
    <div className={styles.filterGroup}>
      <Input
        placeholder="Tìm kiếm khóa học..."
        prefix={<SearchOutlined />}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onPressEnter={() => setSearch(searchInput)}
        className={styles.filterInput}
        allowClear
      />
      <Select
        placeholder="Lọc theo loại khóa học"
        value={selectedFilter}
        onChange={setSelectedFilter}
        className={styles.filterSelect}
        allowClear
      >
        <Select.Option value="all">Tất cả khóa học</Select.Option>
        <Select.Option value="free">Khóa học miễn phí</Select.Option>
        <Select.Option value="paid">Khóa học tính phí</Select.Option>
      </Select>
    </div>
  </Card>
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
    <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#1890ff' }}>
              <BookOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tổng số khóa học" 
                value={courseStats.total} 
                valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">Tất cả khóa học</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#52c41a' }}>
              <BookOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Khóa học miễn phí" 
                value={courseStats.free} 
                valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">{freePercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#fbbc05' }}>
              <DollarOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Khóa học tính phí" 
                value={courseStats.paid} 
                valueStyle={{ color: '#fbbc05', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#fbbc05' }} />
                <Text type="secondary">{paidPercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#ea4335' }}>
              <UserOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tổng học viên" 
                value={courseStats.totalStudents} 
                valueStyle={{ color: '#ea4335', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#ea4335' }} />
                <Text type="secondary">Tổng cộng</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
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
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
          onClick={() => navigate(`/admin/courses/${record.id}`)}
        >
          <Image
            src={record.Image}
            alt={record.title}
            width={60}
            height={40}
            className="rounded object-cover"
            fallback="https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=Khóa+học"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">{record.title}</div>
            <div className="text-sm text-gray-500">{record.author.name}</div>
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
            <Tag color="success" className="text-xs">Miễn phí</Tag>
          ) : (
            <span className="font-medium text-green-600">
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
            <Tag color={statusColorMap[record.status] || 'default'} className="text-xs">
              {statusText[record.status] || record.status}
            </Tag>
            {record.status === 'rejected' && record.rejection_reason && (
              <Tooltip title={record.rejection_reason}>
                <div className="text-xs text-red-500 mt-1 cursor-help">
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
                  className="bg-green-500"
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
                className="bg-orange-500"
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
      <div className={styles.userPageContainer}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <Text style={{ marginTop: 16 }}>Đang tải dữ liệu...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userPageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Title level={2} className={styles.pageTitle}>
            <TrophyOutlined className={styles.titleIcon} />
            Quản lý Khóa học
          </Title>
          <Paragraph className={styles.pageSubtitle}>
            Tạo và quản lý các khóa học của bạn trên EduPro
          </Paragraph>
        </div>
        <div className={styles.headerRight}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/instructor/courses/add')}
            className={styles.addUserBtn}
          >
            Tạo khóa học mới
          </Button>
        </div>
      </div>

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
      <Card className={styles.userTableCard} bordered={false}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitleSection}>
            <BookOutlined className={styles.tableIcon} />
            <Title level={4} className={styles.tableTitle}>
              Danh sách khóa học
            </Title>
            <Badge count={filteredCourses.length} className={styles.userCountBadge} />
          </div>
          <div className={styles.tableActions}>
            <Text type="secondary">
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
          className={styles.userTable}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>

      {/* Modal từ chối khóa học */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <ExclamationCircleOutlined className={styles.modalIcon} />
            Từ chối khóa học
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
        className={styles.userModal}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
          className={styles.userForm}
        >
          <Form.Item
            label="Lý do từ chối"
            name="reason"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do từ chối!' },
              { min: 10, message: 'Lý do từ chối phải có ít nhất 10 ký tự!' }
            ]}
            className={styles.formItem}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do từ chối khóa học..."
              maxLength={500}
              showCount
              className={styles.input}
            />
          </Form.Item>
          
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setRejectModalVisible(false);
                  setSelectedCourseId(null);
                  rejectForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={loading}
              >
                Từ chối khóa học
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>


    </div>
  );
};

export default CourseList;
