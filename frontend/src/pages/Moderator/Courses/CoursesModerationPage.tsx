import React, { useEffect, useState, useMemo } from "react";
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
} from "antd";
import {
  BookOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { courseService } from '../../../services/apiService';
import type { Course } from '../../../services/apiService';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const PAGE_SIZE = 10;

const statusColorMap: Record<string, string> = {
  draft: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
};

const CoursesModerationPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseService.getAllCourses();
        const pendingCourses = Array.isArray(data) ? data.filter(course => course.status === 'pending') : [];
        setCourses(pendingCourses);
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
      title: 'Duyệt khóa học',
      content: 'Bạn có chắc chắn muốn duyệt khóa học này?',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseService.approveCourse(courseId, 'approve');
          message.success('Đã duyệt khóa học thành công!');
          const data = await courseService.getAllCourses();
          const pendingCourses = Array.isArray(data) ? data.filter(course => course.status === 'pending') : [];
          setCourses(pendingCourses);
        } catch (error) {
          message.error('Duyệt khóa học thất bại!');
        }
      },
    });
  };

  const handleReject = async (courseId: string) => {
    Modal.confirm({
      title: 'Từ chối khóa học',
      content: 'Bạn có chắc chắn muốn từ chối khóa học này?',
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseService.approveCourse(courseId, 'reject');
          message.success('Đã từ chối khóa học!');
          const data = await courseService.getAllCourses();
          const pendingCourses = Array.isArray(data) ? data.filter(course => course.status === 'pending') : [];
          setCourses(pendingCourses);
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

  const columns: ColumnsType<Course> = [
    {
      title: 'Khóa học',
      key: 'course',
      width: '40%',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
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
            <div className="text-sm text-gray-500">{record.author?.name}</div>
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
              {record.price?.toLocaleString()}đ
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
          <Tag color={statusColorMap[record.status] || 'default'} className="text-xs">
            {statusText[record.status] || record.status}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="primary"
                  onClick={() => handleApprove(record.id)}
                  size="small"
                  className="bg-green-500"
                >
                  Duyệt
                </Button>
              </Tooltip>
              <Tooltip title="Từ chối">
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
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    totalCourses: courses.length,
    freeCourses: courses.filter(course => course.isFree).length,
    paidCourses: courses.filter(course => !course.isFree).length,
    totalStudents: courses.reduce((sum, course) => sum + (course.reviews || 0), 0),
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Kiểm duyệt Khóa học</h2>
          <p className="text-gray-500 mt-2">Duyệt và quản lý các khóa học trên hệ thống</p>
        </div>
      </div>
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
      <Card className="shadow-sm border-none">
        <Table
          columns={columns}
          dataSource={paginatedCourses}
          rowKey="id"
          loading={loading}
          pagination={false}
          className="course-table"
        />
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

export default CoursesModerationPage; 