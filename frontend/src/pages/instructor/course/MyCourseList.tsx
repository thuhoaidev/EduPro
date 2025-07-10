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
  message,
  Table,
  Space,
  Typography,
  Avatar,
  Popconfirm,
  Dropdown,
  Menu,
} from "antd";
import {
  BookOutlined,
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
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
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
      } catch {
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

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      const success = await courseService.deleteCourse(id);
      if (success) {
        setCourses((prev) => prev.filter((course) => course.id !== id));
        message.success("Đã xóa khóa học thành công.");
      } else {
        message.error("Không thể xóa khóa học. Vui lòng thử lại.");
      }
    } catch (error: unknown) {
      console.error('Lỗi khi xóa khóa học:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa khóa học.";
      message.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    try {
      await courseService.updateCourseStatus(courseId, newStatus);
      setCourses((prev) => 
        prev.map((course) => 
          course.id === courseId ? { ...course, status: newStatus } : course
        )
      );
      message.success(`Đã cập nhật trạng thái khóa học thành ${newStatus === 'published' ? 'đã xuất bản' : newStatus === 'draft' ? 'chưa xuất bản' : newStatus}`);
    } catch (error: unknown) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật trạng thái.";
      message.error(errorMessage);
    }
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
      render: (status: string, record) => {
        const statusColors: Record<string, string> = {
          published: 'green',
          draft: 'orange',
          pending: 'blue',
          rejected: 'red',
          archived: 'default'
        };
        
        const statusLabels: Record<string, string> = {
          published: 'Đã xuất bản',
          draft: 'Chưa xuất bản',
          pending: 'Chờ duyệt',
          rejected: 'Từ chối',
          archived: 'Lưu trữ'
        };

        return (
          <Dropdown
            overlay={
              <Menu>
                {status !== 'published' && (
                  <Menu.Item key="publish" onClick={() => handleStatusChange(record.id, 'published')}>
                    Xuất bản
                  </Menu.Item>
                )}
                {status !== 'draft' && (
                  <Menu.Item key="draft" onClick={() => handleStatusChange(record.id, 'draft')}>
                    Chuyển thành bản nháp
                  </Menu.Item>
                )}
                {status !== 'archived' && (
                  <Menu.Item key="archive" onClick={() => handleStatusChange(record.id, 'archived')}>
                    Lưu trữ
                  </Menu.Item>
                )}
              </Menu>
            }
            trigger={['click']}
          >
            <Tag color={statusColors[status] || 'default'} style={{ cursor: 'pointer' }}>
              {statusLabels[status] || status}
            </Tag>
          </Dropdown>
        );
      },
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
          <Tooltip title="Sửa">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/instructor/courses/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                loading={deleteLoading === record.id}
              />
            </Tooltip>
          </Popconfirm>
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
            <Col span={6}><motion.div whileHover={{ y: -5 }}><Card><Statistic title="Chưa xuất bản" value={stats.draftCourses} prefix={<BookOutlined />} valueStyle={{color: '#cf1322'}} /></Card></motion.div></Col>
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
                <Option value="draft">Chưa xuất bản</Option>
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