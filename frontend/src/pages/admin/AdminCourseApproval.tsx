import React, { useEffect, useState } from 'react';
import { Card, Tag, Button, message, Tooltip, Modal, Row, Col } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { courseService } from '../../services/courseService';
import { useNavigate } from 'react-router-dom';

const statusColorMap: Record<string, string> = {
  draft: 'default',
  pending: 'orange',
  published: 'green',
  rejected: 'red',
  archived: 'gray',
};

const AdminCourseApproval: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPendingCourses = async () => {
    setLoading(true);
    try {
      // Lấy tất cả khóa học trạng thái pending
      const res = await fetch('/api/courses?status=pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setCourses(data.data || []);
    } catch (err) {
      message.error('Không thể tải danh sách khóa học chờ duyệt!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const handleApprove = async (courseId: string) => {
    Modal.confirm({
      title: 'Duyệt khóa học',
      content: 'Bạn chắc chắn muốn duyệt khóa học này?',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseService.updateCourseStatus(courseId, 'published');
          message.success('Khóa học đã được duyệt!');
          fetchPendingCourses();
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
          await courseService.updateCourseStatus(courseId, 'rejected');
          message.success('Đã từ chối khóa học!');
          fetchPendingCourses();
        } catch (err) {
          message.error('Từ chối khóa học thất bại!');
        }
      },
    });
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Duyệt khóa học chờ xuất bản</h2>
      <Row gutter={[24, 24]}>
        {courses.length === 0 && !loading && (
          <Col span={24}>
            <div className="text-center text-gray-500">Không có khóa học nào chờ duyệt.</div>
          </Col>
        )}
        {courses.map((course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course._id}>
            <Card
              hoverable
              cover={
                <img
                  alt={course.title}
                  src={course.thumbnail}
                  className="h-[180px] w-full object-cover rounded-t-lg"
                />
              }
              actions={[
                <Tooltip title="Xem chi tiết" key="view">
                  <Button
                    type="text"
                    icon={<EyeOutlined className="text-[#1a73e8]" />}
                    onClick={() => navigate(`/courses/${course._id}`)}
                  />
                </Tooltip>,
                <Tooltip title="Duyệt" key="approve">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove(course._id)}
                  >
                    Duyệt
                  </Button>
                </Tooltip>,
                <Tooltip title="Từ chối" key="reject">
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleReject(course._id)}
                  >
                    Từ chối
                  </Button>
                </Tooltip>,
              ]}
            >
              <Card.Meta
                title={
                  <div className="flex items-center">
                    <span className="font-semibold text-lg">{course.title}</span>
                    <Tag color={statusColorMap[course.status]} className="ml-2">
                      {course.status === 'pending' && 'Chờ duyệt'}
                    </Tag>
                  </div>
                }
                description={
                  <div className="mt-2">
                    <div className="text-gray-700 mb-1 line-clamp-2">{course.description}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Tác giả: {course.instructor?.fullname || course.instructor}</span>
                      <span className="text-sm font-medium text-green-600">
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