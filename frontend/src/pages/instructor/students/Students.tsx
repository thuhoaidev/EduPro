import React, { useEffect, useState } from "react";
import { Table, Tag, Card, Button, Input, Select, Space, Avatar, message, Empty, Row, Col, Statistic } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, BookOutlined, TrophyOutlined, ClockCircleOutlined } from "@ant-design/icons";
import instructorService from "../../../services/instructorService";

const { Search } = Input;
const { Option } = Select;

// Component hiển thị thống kê tổng quan
const StudentStatsOverview: React.FC<{ total: number; uniqueStudents: number }> = ({ total, uniqueStudents }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tổng đăng ký"
            value={total}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Học viên unique"
            value={uniqueStudents}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tỷ lệ hoàn thành"
            value={total > 0 ? Math.round((uniqueStudents / total) * 100) : 0}
            suffix="%"
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Khóa học active"
            value={0} // TODO: Tính từ API
            prefix={<BookOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    </Row>
  );
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

const StudentListPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [uniqueStudents, setUniqueStudents] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const navigate = useNavigate();

  // Fetch students data
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

  // Fetch instructor courses for filter
  const fetchCourses = async () => {
    try {
      const coursesData = await instructorService.getCourses();
      setCourses(coursesData.map(course => ({
        id: course.id,
        title: course.title
      })));
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Không thể tải danh sách khóa học");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, pageSize, search, selectedCourse]);

  useEffect(() => {
    fetchCourses();
  }, []);

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
    if (progress >= 80) return "green";
    if (progress >= 50) return "orange";
    return "red";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "student",
      key: "student",
      render: (student: any) => (
        <Space>
          <Avatar 
            src={student.avatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{student.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{student.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Khóa học",
      dataIndex: "course",
      key: "course",
      render: (course: any) => (
        <Space>
          <BookOutlined style={{ color: "#1890ff" }} />
          <div>
            <div style={{ fontWeight: 500 }}>{course.title}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number, record: Student) => (
        <div>
          <Tag color={getProgressColor(progress)}>
            {progress}%
          </Tag>
          {record.completed && (
            <Tag color="green" style={{ marginLeft: 4 }}>
              Hoàn thành
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "enrolledAt",
      key: "enrolledAt",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Hoạt động cuối",
      dataIndex: "lastActivity",
      key: "lastActivity",
      render: (date: string | null) => 
        date ? formatDate(date) : <span style={{ color: "#999" }}>Chưa có</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Student) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/instructor/students/${record.student.id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <StudentStatsOverview total={total} uniqueStudents={uniqueStudents} />
      
      <Card 
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Danh sách học viên</span>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Tổng: {total} đăng ký • {uniqueStudents} học viên
            </div>
          </div>
        }
      >
        <Space style={{ marginBottom: 16, width: "100%" }} direction="vertical" size="middle">
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Search
              placeholder="Tìm kiếm theo tên, email hoặc khóa học..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
              enterButton
            />
            <Select
              placeholder="Lọc theo khóa học"
              allowClear
              style={{ width: 200 }}
              onChange={handleCourseFilter}
              value={selectedCourse}
            >
              <Option value="">Tất cả khóa học</Option>
              {courses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </div>
        </Space>

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
          }}
          locale={{
            emptyText: (
              <Empty
                description="Chưa có học viên nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default StudentListPage;
