import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Select,
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
  Pagination,
  Typography,
  Avatar,
  Badge,
  Progress,
} from "antd";
import {
  BookOutlined,
  DollarOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
  FileTextOutlined,
} from "@ant-design/icons";
import { courseService } from '../../../services/apiService';
import type { Course } from '../../../services/apiService';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const PAGE_SIZE = 10;

const statusColorMap: Record<string, string> = {
  draft: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
};

const CoursesModerationPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        console.log('CoursesModerationPage - Fetching courses...');
        const data = await courseService.getAllCourses();
        console.log('CoursesModerationPage - API response:', data);
        const allCourses = Array.isArray(data) ? data : [];
        console.log('CoursesModerationPage - Processed courses:', allCourses);
        setCourses(allCourses);
      } catch (error) {
        message.error('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    let result = [...courses];
    if (searchTerm) {
      result = result.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType === "free") {
      result = result.filter((course) => course.isFree);
    } else if (filterType === "paid") {
      result = result.filter((course) => !course.isFree);
    }
    return result;
  }, [courses, searchTerm, filterType]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, currentPage]);

  const handleApprove = async (courseId: string) => {
    Modal.confirm({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleFilled style={{ color: '#52c41a' }} />
          <span>Duyệt khóa học</span>
        </div>
      ),
      content: 'Bạn có chắc chắn muốn duyệt khóa học này? Khóa học sẽ được hiển thị công khai sau khi duyệt.',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      okButtonProps: { 
        style: { 
          background: '#52c41a',
          borderColor: '#52c41a',
          borderRadius: '6px'
        } 
      },
      onOk: async () => {
        try {
          await courseService.approveCourse(courseId, 'approve');
          message.success('Đã duyệt khóa học thành công!');
          const data = await courseService.getAllCourses();
          const allCourses = Array.isArray(data) ? data : [];
          setCourses(allCourses);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message;
          message.error(`Duyệt khóa học thất bại: ${errorMessage}`);
        }
      },
    });
  };

  const handleReject = async (courseId: string) => {
    let rejectReason = '';
    
    Modal.confirm({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CloseCircleFilled style={{ color: '#ff4d4f' }} />
          <span>Từ chối khóa học</span>
        </div>
      ),
      content: (
        <div>
          <p style={{ marginBottom: '12px' }}>
            Bạn có chắc chắn muốn từ chối khóa học này? Khóa học sẽ bị ẩn khỏi hệ thống.
          </p>
          <Input.TextArea
            placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)..."
            rows={3}
            onChange={(e) => rejectReason = e.target.value}
            style={{ marginBottom: '8px' }}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            * Lý do từ chối là bắt buộc và phải có ít nhất 10 ký tự
          </Text>
        </div>
      ),
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      okButtonProps: { 
        style: { borderRadius: '6px' }
      },
      onOk: async () => {
        if (!rejectReason.trim() || rejectReason.trim().length < 10) {
          message.error('Lý do từ chối phải có ít nhất 10 ký tự!');
          return Promise.reject();
        }
        
        try {
          await courseService.approveCourse(courseId, 'reject', rejectReason.trim());
          message.success('Đã từ chối khóa học!');
          const data = await courseService.getAllCourses();
          const allCourses = Array.isArray(data) ? data : [];
          setCourses(allCourses);
        } catch (error) {
          message.error('Từ chối khóa học thất bại!');
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return { color: "green", text: "ĐÃ DUYỆT", icon: <CheckCircleFilled /> };
      case "pending":
        return { color: "orange", text: "CHỜ DUYỆT", icon: <ClockCircleFilled /> };
      case "rejected":
        return { color: "red", text: "BỊ TỪ CHỐI", icon: <CloseCircleFilled /> };
      case "draft":
        return { color: "default", text: "BẢN NHÁP", icon: <FileTextOutlined /> };
      default:
        return { color: "default", text: status.toUpperCase(), icon: <FileTextOutlined /> };
    }
  };

  const columns: ColumnsType<Course> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, record, idx) => (
        <Badge 
          count={(currentPage - 1) * PAGE_SIZE + idx + 1} 
          style={{ 
            backgroundColor: '#1890ff',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      ),
    },
    {
      title: 'Khóa học',
      key: 'course',
      width: '35%',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src={record.Image}
            alt={record.title}
            width={80}
            height={50}
            style={{ 
              borderRadius: '8px',
              objectFit: 'cover',
              border: '1px solid #f0f0f0'
            }}
            fallback="https://via.placeholder.com/80x50/4A90E2/FFFFFF?text=Khóa+học"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ 
              fontSize: '14px', 
              color: '#1e293b',
              display: 'block',
              marginBottom: '4px'
            }}>
              {record.title}
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar 
                icon={<UserOutlined />} 
                size="small"
                style={{ backgroundColor: '#1890ff' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.author?.name || 'Không rõ'}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Giá',
      key: 'price',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          {record.isFree ? (
            <Tag 
              color="success" 
              style={{ 
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              Miễn phí
            </Tag>
          ) : (
            <div>
              <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                {record.price?.toLocaleString()}đ
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '15%',
      align: 'center',
      render: (_, record) => {
        const config = getStatusConfig(record.status);
        return (
          <Tag 
            color={config.color} 
            icon={config.icon}
            style={{ 
              margin: 0, 
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '20%',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              style={{ color: '#1890ff' }}
              onClick={() => navigate(`/moderator/courses/${record.id}`)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Duyệt khóa học">
              <Button
                type="primary"
                onClick={() => handleApprove(record.id)}
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ 
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  borderRadius: '6px'
                }}
              >
                Duyệt
              </Button>
            </Tooltip>
          )}
          {record.status === 'pending' && (
            <Tooltip title="Từ chối khóa học">
              <Button
                danger
                onClick={() => handleReject(record.id)}
                size="small"
                icon={<CloseCircleOutlined />}
                style={{ borderRadius: '6px' }}
              >
                Từ chối
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    totalCourses: courses.length,
    pendingCourses: courses.filter(course => course.status === 'pending').length,
    approvedCourses: courses.filter(course => course.status === 'approved').length,
    rejectedCourses: courses.filter(course => course.status === 'rejected').length,
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
          📚 Quản lý duyệt khóa học
        </Title>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={12} sm={6} md={6}>
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
                    Tổng số khóa học
                  </Text>
                }
                value={stats.totalCourses}
                prefix={<BookOutlined style={{ color: '#1890ff', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6}>
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
                    Chờ duyệt
                  </Text>
                }
                value={stats.pendingCourses}
                prefix={<ClockCircleFilled style={{ color: '#faad14', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#faad14', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={stats.totalCourses > 0 ? (stats.pendingCourses / stats.totalCourses) * 100 : 0} 
                      size="small" 
                      strokeColor="#faad14"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6}>
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
                    Đã duyệt
                  </Text>
                }
                value={stats.approvedCourses}
                prefix={<CheckCircleFilled style={{ color: '#52c41a', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={stats.totalCourses > 0 ? (stats.approvedCourses / stats.totalCourses) * 100 : 0} 
                      size="small" 
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6}>
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
                    Bị từ chối
                  </Text>
                }
                value={stats.rejectedCourses}
                prefix={<CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#ff4d4f', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={stats.totalCourses > 0 ? (stats.rejectedCourses / stats.totalCourses) * 100 : 0} 
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

        {/* Search and Filter */}
        <Card 
          style={{ 
            marginBottom: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SearchOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              <Search
                placeholder="🔍 Tìm kiếm khóa học..."
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ 
                  width: 320,
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9'
                }}
                allowClear
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              <Select
                value={filterType}
                onChange={handleFilterChange}
                options={[
                  { value: "all", label: "Tất cả khóa học" },
                  { value: "free", label: "Khóa học miễn phí" },
                  { value: "paid", label: "Khóa học tính phí" },
                ]}
                style={{ 
                  width: 200,
                  borderRadius: '8px'
                }}
              />
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {filteredCourses.length} khóa học
            </Text>
          </div>
        </Card>

        {/* Table */}
        <Card 
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <Table
            columns={columns}
            dataSource={paginatedCourses}
            rowKey="id"
            loading={loading}
            pagination={false}
            className="course-moderation-table"
            scroll={{ x: 800 }}
          />
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={filteredCourses.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={true}
              showQuickJumper={true}
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} khóa học`}
              className="course-pagination"
            />
          </div>
        </Card>

        <style>{`
          .course-moderation-table .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding: 16px 12px;
          }
          .course-moderation-table .ant-table-tbody > tr:hover > td {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          }
          .course-moderation-table .ant-table-tbody > tr > td {
            padding: 16px 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          .course-pagination .ant-pagination-item-active {
            background: linear-gradient(135deg, #1890ff, #722ed1);
            border-color: #1890ff;
          }
          .course-pagination .ant-pagination-item-active a {
            color: white;
          }
          .ant-card {
            transition: all 0.3s ease;
          }
          .ant-card:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </div>
  );
};

export default CoursesModerationPage; 