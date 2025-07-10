import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Badge,
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
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  DollarOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from '../../../services/courseService';

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  price: number;
  category: string;
  isNew?: boolean;
  status: string;
}

export const getCourses = async (): Promise<Course[]> => {
  return [
    {
      id: "1",
      title: "React Cơ Bản",
      thumbnail: "https://i.imgur.com/xsKJ4Eh.png",
      author: "Nguyễn Văn A",
      price: 0,
      category: "Frontend",
      isNew: true,
      status: "published",
    },
    {
      id: "2",
      title: "NodeJS Nâng Cao",
      thumbnail: "https://i.imgur.com/xsKJ4Eh.png",
      author: "Trần Thị B",
      price: 499000,
      category: "Backend",
      isNew: false,
      status: "published",
    },
    // ... thêm khóa học khác nếu muốn
  ];
};

const { Meta } = Card;
const { Search } = Input;
const PAGE_SIZE = 8;

// Thêm mapping màu cho trạng thái
const statusColorMap = {
  draft: 'default',
  pending: 'orange',
  published: 'green',
  rejected: 'red',
  archived: 'gray',
};

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      // Lấy khóa học của instructor từ API
      const data = await courseService.getInstructorCourses('me'); // 'me' sẽ được backend hiểu là instructor hiện tại
      setCourses(data);
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
      result = result.filter((course) => course.price === 0);
    } else if (filterType === "paid") {
      result = result.filter((course) => course.price > 0);
    }

    return result;
  }, [courses, searchTerm, filterType]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, currentPage]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa khóa học này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setCourses((prev) => prev.filter((course) => course.id !== id));
        message.success("Đã xóa khóa học.");
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
    freeCourses: courses.filter(course => course.price === 0).length,
    paidCourses: courses.filter(course => course.price > 0).length,
    totalStudents: 1234, // Mock data - replace with actual data
  };

  // Hàm xuất bản khóa học (gửi duyệt)
  const handlePublish = async (courseId: string) => {
    Modal.info({
      title: 'Gửi xét duyệt khóa học',
      content: 'Khóa học của bạn đã được gửi đi xét duyệt. Vui lòng chờ trong 24h để được kiểm duyệt.',
      okText: 'Đã hiểu',
      onOk: async () => {
        try {
          await courseService.updateCourseStatus(courseId, 'pending');
          message.success('Đã gửi khóa học đi xét duyệt!');
          const data = await courseService.getInstructorCourses();
          setCourses(data);
        } catch (err) {
          message.error('Gửi xét duyệt thất bại!');
        }
      },
    });
  };

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

      {/* Course List Card */}
      <Card className="shadow-sm border-none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedCourses.map((course) => (
            <Badge.Ribbon
              key={course.id}
              text={course.isNew ? "Mới" : ""}
              color="#1a73e8"
            >
              <Card
                hoverable
                className="h-full transition-all duration-300 hover:shadow-lg border-none"
                cover={
                  <div className="relative">
                    <img
                      alt={course.title}
                      src={course.thumbnail || course.Image}
                      className="h-[200px] w-full object-cover rounded-t-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-center py-2">
                      <span className="text-sm font-medium">{course.category || course.type}</span>
                    </div>
                  </div>
                }
                actions={[
                  <Tooltip title="Xem chi tiết" key="view">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined className="text-[#1a73e8]" />} 
                      onClick={() => navigate(`/instructor/courses/${course.id}`)}
                    />
                  </Tooltip>,
                  <Tooltip title="Chỉnh sửa" key="edit">
                    <Button 
                      type="text" 
                      icon={<EditOutlined className="text-[#34a853]" />} 
                      onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                      disabled={!(course.status === 'draft' || course.status === 'rejected')}
                    />
                  </Tooltip>,
                  <Tooltip title="Xóa" key="delete">
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDelete(course.id)}
                      disabled={!(course.status === 'draft' || course.status === 'rejected')}
                    />
                  </Tooltip>,
                  // Thêm nút xuất bản nếu là draft
                  course.status === 'draft' && (
                    <Tooltip title="Xuất bản (gửi xét duyệt)" key="publish">
                      <Button
                        type="primary"
                        onClick={() => handlePublish(course.id)}
                        size="small"
                        className="bg-orange-500"
                      >
                        Xuất bản
                      </Button>
                    </Tooltip>
                  )
                ].filter(Boolean)}
              >
                <Meta
                  title={
                    <div className="text-lg font-medium text-gray-800 line-clamp-2">
                      {course.title}
                      {/* Hiển thị trạng thái */}
                      <Tag color={statusColorMap[course.status] || 'default'} className="ml-2">
                        {course.status === 'draft' && 'Chưa xuất bản'}
                        {course.status === 'pending' && 'Chờ duyệt'}
                        {course.status === 'published' && 'Đã xuất bản'}
                        {course.status === 'rejected' && 'Bị từ chối'}
                        {course.status === 'archived' && 'Lưu trữ'}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="flex justify-between items-center mt-3">
                      <span>
                        {course.price === 0 ? (
                          <Tag color="success" className="px-2 py-1 text-sm">Miễn phí</Tag>
                        ) : (
                          <Tag color="processing" className="px-2 py-1 text-sm">
                            {course.price.toLocaleString()}đ
                          </Tag>
                        )}
                      </span>
                      <span className="text-sm text-gray-500">{course.author?.name || course.author}</span>
                    </div>
                  }
                />
              </Card>
            </Badge.Ribbon>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 text-center">
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

      {/* Custom styles */}
      <style>
        {`
          .ant-card-meta-title {
            margin-bottom: 12px !important;
          }
          .ant-card-actions {
            background: #fafafa;
          }
          .ant-card-actions > li {
            margin: 0 !important;
          }
          .ant-card-actions .ant-btn {
            width: 100%;
            height: 100%;
            border: none;
            padding: 12px 0;
          }
          .ant-card-actions .ant-btn:hover {
            background: #f0f0f0;
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
