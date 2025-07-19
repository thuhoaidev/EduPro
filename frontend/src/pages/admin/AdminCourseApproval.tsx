import React, { useEffect, useState } from 'react';
import { Card, Tag, Button, message, Tooltip, Modal, Row, Col, Input, Select, Space, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { courseService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const statusColorMap: Record<string, string> = {
  draft: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  hidden: 'gray',
  published: 'blue',
};

const statusLabels: Record<string, string> = {
  draft: 'Chưa Duyệt',
  pending: 'Chờ Duyệt',
  approved: 'Đã Duyệt',
  rejected: 'Bị Từ Chối',
  hidden: 'Ẩn',
  published: 'Hiển Thị'
};

const AdminCourseApproval: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const allCourses = await courseService.getAllCourses();
      setCourses(allCourses);
    } catch (err) {
      message.error('Không thể tải danh sách khóa học!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (courseId: string) => {
    Modal.confirm({
      title: 'Duyệt khóa học',
      content: 'Bạn chắc chắn muốn duyệt khóa học này?',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await courseService.approveCourse(courseId, 'approve');
          if (response.success) {
            message.success('Khóa học đã được duyệt!');
            fetchCourses();
          } else {
            message.error('Duyệt khóa học thất bại!');
          }
        } catch (err) {
          message.error('Duyệt khóa học thất bại!');
        }
      },
    });
  };

  const handleReject = async (courseId: string) => {
    Modal.confirm({
      title: 'Từ chối khóa học',
      content: 'Bạn chắc chắn muốn từ chối khóa học này?',
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await courseService.approveCourse(courseId, 'reject');
          if (response.success) {
            message.success('Đã từ chối khóa học!');
            fetchCourses();
          } else {
            message.error('Từ chối khóa học thất bại!');
          }
        } catch (err) {
          message.error('Từ chối khóa học thất bại!');
        }
      },
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý duyệt khóa học</Title>
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên..."
            prefix={<SearchOutlined />}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            defaultValue="pending"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="draft">Chưa Duyệt</Option>
            <Option value="pending">Chờ Duyệt</Option>
            <Option value="approved">Đã Duyệt</Option>
            <Option value="rejected">Bị Từ Chối</Option>
          </Select>
        </Space>
      </div>
      <Row gutter={[24, 24]}>
        {filteredCourses.length === 0 && !loading && (
          <Col span={24}>
            <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '40px 0' }}>
              Không có khóa học nào phù hợp với bộ lọc.
            </div>
          </Col>
        )}
        {filteredCourses.map((course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course._id}>
            <Card
              hoverable
              cover={
                <img
                  alt={course.title}
                  src={course.Image}
                  style={{ height: 180, width: '100%', objectFit: 'cover' }}
                />
              }
              actions={[
                <Tooltip title="Xem chi tiết" key="view">
                  <Button
                    type="text"
                    icon={<EyeOutlined style={{ color: '#1a73e8' }} />}
                    onClick={() => navigate(`/courses/${course.id}`)}
                  />
                </Tooltip>,
                ...(course.status === 'pending' ? [
                  <Tooltip title="Duyệt" key="approve">
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleApprove(course.id)}
                    >
                      Duyệt
                    </Button>
                  </Tooltip>,
                  <Tooltip title="Từ chối" key="reject">
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => handleReject(course.id)}
                    >
                      Từ chối
                    </Button>
                  </Tooltip>,
                ] : []),
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '16px' }}>{course.title}</span>
                    <Tag color={statusColorMap[course.status]} style={{ marginLeft: 8 }}>
                      {statusLabels[course.status] || course.status}
                    </Tag>
                  </div>
                }
                description={
                  <div style={{ marginTop: 8 }}>
                    <div style={{ color: '#595959', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {course.subtitle}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Tác giả: {course.author.name}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#52c41a' }}>
                        {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()}đ`}
                      </span>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminCourseApproval; 