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
} from "antd";
import {
  BookOutlined,
  DollarOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from '../../../services/apiService';
import type { Course } from '../../../services/apiService';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const PAGE_SIZE = 10;

// Thêm mapping màu cho trạng thái
const statusColorMap: Record<string, string> = {
  draft: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
};

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
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
          const userRole = user.role?.name || user.role_id?.name;
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
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  // Calculate statistics
  const stats = {
    totalCourses: courses.length,
    freeCourses: courses.filter(course => course.isFree).length,
    paidCourses: courses.filter(course => !course.isFree).length,
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
  const userRole = user?.role?.name || user?.role_id?.name;

  // Định nghĩa columns cho table
  const columns: ColumnsType<Course> = [
    {
      title: 'Khóa học',
      key: 'course',
      width: '50%',
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
      width: '15%',
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
      width: '15%',
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
    // Đã ẩn cột trạng thái hiển thị
    // {
    //   title: 'Trạng thái hiển thị',
    //   key: 'displayStatus',
    //   width: '15%',
    //   render: (_, record) => {
    //     const isApproved = record.status === 'approved';
    //     const isHidden = record.displayStatus === 'hidden';
    //     return (
    //       <Space>
    //         <Tag color={isHidden ? 'gray' : 'blue'} className="text-xs">
    //           {isHidden ? 'Ẩn' : 'Hiển thị'}
    //         </Tag>
    //         {isApproved && (
    //           <Button
    //             type="link"
    //             size="small"
    //             onClick={() => handleToggleDisplay(record.id, record.displayStatus || 'hidden')}
    //             style={{ padding: 0, height: 'auto', fontSize: '12px' }}
    //           >
    //             {isHidden ? 'Hiển thị' : 'Ẩn'}
    //           </Button>
    //         )}
    //       </Space>
    //     );
    //   },
    // },

    {
      title: 'Thao tác',
      key: 'actions',
      width: '20%',
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

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản lý Khóa học</h2>
          <p className="text-gray-500 mt-2">Tạo và quản lý các khóa học của bạn trên EduPro</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/instructor/courses/add')}
          size="large"
          className="bg-[#1a73e8] hover:bg-[#1557b0]"
        >
          Tạo khóa học mới
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-all border-none">
            <Statistic
              title="Tổng số khóa học"
              value={stats.totalCourses}
              prefix={<BookOutlined className="text-[#1a73e8]" />}
              valueStyle={{ color: '#1a73e8' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-all border-none">
            <Statistic
              title="Khóa học miễn phí"
              value={stats.freeCourses}
              prefix={<BookOutlined className="text-[#34a853]" />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-all border-none">
            <Statistic
              title="Khóa học tính phí"
              value={stats.paidCourses}
              prefix={<DollarOutlined className="text-[#fbbc05]" />}
              valueStyle={{ color: '#fbbc05' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-all border-none">
            <Statistic
              title="Tổng học viên"
              value={stats.totalStudents}
              prefix={<UserOutlined className="text-[#ea4335]" />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Card */}
      <Card className="shadow-sm mb-8 border-none">
        <Space className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Search
            placeholder="Tìm kiếm khóa học..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
            className="text-base"
          />
          <Select
            value={filterType}
            onChange={handleFilterChange}
            options={[
              { value: "all", label: "Tất cả khóa học" },
              { value: "free", label: "Khóa học miễn phí" },
              { value: "paid", label: "Khóa học tính phí" },
            ]}
            style={{ width: 200 }}
            className="text-base"
          />
        </Space>
      </Card>

      {/* Course List Table */}
      <Card className="shadow-sm border-none">
        <Table
          columns={columns}
          dataSource={paginatedCourses}
          rowKey="id"
          loading={loading}
          pagination={false}
          className="course-table"
        />
        
        {/* Pagination */}
        <div className="mt-6 text-center">
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={filteredCourses.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            showTotal={(total) => `Tổng số ${total} khóa học`}
            className="custom-pagination"
          />
        </div>
      </Card>

      {/* Modal từ chối khóa học */}
      <Modal
        title="Từ chối khóa học"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedCourseId(null);
          rejectForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
        >
          <Form.Item
            label="Lý do từ chối"
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

      {/* Custom styles */}
      <style>
        {`
          .course-table .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
            color: #262626;
          }
          .course-table .ant-table-tbody > tr:hover > td {
            background: #f5f5f5;
          }
          .custom-pagination .ant-pagination-item-active {
            background-color: #1a73e8;
            border-color: #1a73e8;
          }
          .custom-pagination .ant-pagination-item-active a {
            color: white;
          }
        `}
      </style>
    </div>
  );
};

export default CourseList;
