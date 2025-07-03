import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Tooltip,
  Modal,
  message,
  Spin,
  Table,
  Space,
  Typography,
  Avatar,
} from "antd";
import {
  BookOutlined,
  DollarOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from '../../../services/apiService';
import type { Course } from '../../../services/apiService';
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { Option } = Select;

const FADE_IN_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const MyCourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          message.error("Vui lòng đăng nhập để xem khóa học.");
          setCourses([]);
          return;
        }
        const user = JSON.parse(storedUser);
        const instructorId = user?._id || user?.id;
        if (!instructorId) {
          message.error("Không tìm thấy ID giảng viên.");
          setCourses([]);
          return;
        }
        const data = await courseService.getInstructorCourses(instructorId);
        setCourses(data);
      } catch (err) {
        setCourses([]);
        message.error('Không thể lấy danh sách khóa học.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setCourses((prev) => prev.filter((course) => course.id !== id));
        message.success("Đã xóa khóa học thành công.");
      },
    });
  };

  const columns: ColumnsType<Course> = [
    {
      title: "Khóa học",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <Space style={{ cursor: 'pointer' }} onClick={() => navigate(`/instructor/courses/${record.id}`)}>
          <Avatar shape="square" size={64} src={record.Image} />
          <Text strong>{record.title}</Text>
        </Space>
      ),
    },
    {
      title: "Học viên",
      dataIndex: "students",
      key: "students",
      render: () => Math.floor(Math.random() * 500) + 50,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => price === 0 ? <Tag color="green">Miễn phí</Tag> : price.toLocaleString('vi-VN') + 'đ',
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={status === 'published' ? 'blue' : 'orange'}>{status}</Tag>,
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: () => dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('DD/MM/YYYY'),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {/* <Tooltip title="Xem chi tiết"><Button icon={<EyeOutlined />} /></Tooltip> */}
          <Tooltip title="Sửa"><Button icon={<EditOutlined />} onClick={() => navigate(`/instructor/courses/edit/${record.id}`)} /></Tooltip>
          <Tooltip title="Xóa"><Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} /></Tooltip>
        </Space>
      ),
    },
  ];

  const stats = useMemo(() => ({
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.status === 'published').length,
    draftCourses: courses.filter(c => c.status === 'draft').length,
    totalStudents: 1234,
  }), [courses]);

  return (
    <div style={{ padding: 24 }}>
       <style>{`
        .ant-table-row:hover {
          background-color: #fafafa !important;
        }
        .ant-table-row:hover td {
            background: #fafafa !important;
        }
      `}</style>
      <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP_VARIANTS}>
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col span={6}><motion.div whileHover={{ y: -5 }}><Card><Statistic title="Tổng số khóa học" value={stats.totalCourses} prefix={<BookOutlined />} /></Card></motion.div></Col>
            <Col span={6}><motion.div whileHover={{ y: -5 }}><Card><Statistic title="Đã xuất bản" value={stats.publishedCourses} prefix={<BookOutlined />} valueStyle={{color: '#3f8600'}}/></Card></motion.div></Col>
            <Col span={6}><motion.div whileHover={{ y: -5 }}><Card><Statistic title="Bản nháp" value={stats.draftCourses} prefix={<BookOutlined />} valueStyle={{color: '#cf1322'}} /></Card></motion.div></Col>
            <Col span={6}><motion.div whileHover={{ y: -5 }}><Card><Statistic title="Tổng học viên" value={stats.totalStudents} prefix={<UserOutlined />} /></Card></motion.div></Col>
        </Row>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={{...FADE_IN_UP_VARIANTS, visible: {...FADE_IN_UP_VARIANTS.visible, transition: {delay: 0.2}}}}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title level={4} style={{ margin: 0 }}>Danh sách khóa học của tôi</Title>
            <Space>
              <Input
                placeholder="Tìm kiếm theo tên..."
                prefix={<SearchOutlined />}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                defaultValue="all"
                onChange={setStatusFilter}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="published">Đã xuất bản</Option>
                <Option value="draft">Bản nháp</Option>
              </Select>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/instructor/courses/create')}>
                Tạo khóa học mới
              </Button>
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={filteredCourses}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5, total: filteredCourses.length }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default MyCourseList; 