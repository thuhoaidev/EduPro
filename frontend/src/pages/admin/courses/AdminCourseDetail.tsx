import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Typography,
  Tag, 
  Row, 
  Col, 
  Avatar,
  Divider,
  Skeleton,
  List,
  Space,
  Button,
  message,
  Badge,
  Tooltip,
  Descriptions,
  Modal,
  Alert,
} from "antd";
import { 
  ArrowLeftOutlined, 
  BookOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  DollarOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { courseService, mapApiCourseToAppCourse } from '../../../services/apiService';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

// Định nghĩa interface cho dữ liệu course và section
interface Author {
  name: string;
  avatar?: string;
  bio?: string;
  expertise?: string[];
}

interface Section {
  _id: string;
  title: string;
  position: number;
  lessons?: any[];
}

interface CourseDetailData {
  id: string;
  title: string;
  subtitle?: string;
  Image?: string;
  status?: string;
  type?: string;
  language?: string;
  level?: string;
  createdAt?: string;
  price: number;
  rating?: number;
  reviews?: number;
  requirements?: string[];
  author?: Author;
  sections?: Section[];
  instructor?: {
    bio?: string;
    expertise?: string[];
    user?: Author;
  };
  category?: { name?: string };
  thumbnail?: string;
  description?: string;
  discount?: number;
  displayStatus?: string;
  views?: number;
  enrollments?: number;
}

const FADE_IN = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AdminCourseDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetailData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let courseData = null;
        if (id) {
          const rawData = await courseService.getCourseById(id);
          courseData = rawData ? { 
            ...mapApiCourseToAppCourse(rawData), 
            sections: rawData.sections,
            createdAt: rawData.createdAt || rawData.created_at
          } : null;
        }
        setCourse(courseData);
      } catch {
        message.error('Không thể lấy chi tiết khóa học.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApprove = async () => {
    if (!course) return;
    
    Modal.confirm({
      title: 'Duyệt khóa học',
      content: 'Bạn có chắc chắn muốn duyệt khóa học này?',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseService.approveCourse(course.id, 'approve');
          message.success('Đã duyệt khóa học thành công!');
          // Refresh data
          const rawData = await courseService.getCourseById(course.id);
          const updatedCourse = rawData ? { 
            ...mapApiCourseToAppCourse(rawData), 
            sections: rawData.sections,
            createdAt: rawData.createdAt || rawData.created_at
          } : null;
          setCourse(updatedCourse);
        } catch (error) {
          console.error('Lỗi khi duyệt khóa học:', error);
          message.error('Duyệt khóa học thất bại!');
        }
      },
    });
  };

  const handleReject = async () => {
    if (!course) return;
    
    Modal.confirm({
      title: 'Từ chối khóa học',
      content: 'Bạn có chắc chắn muốn từ chối khóa học này?',
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseService.approveCourse(course.id, 'reject');
          message.success('Đã từ chối khóa học!');
          // Refresh data
          const rawData = await courseService.getCourseById(course.id);
          const updatedCourse = rawData ? { 
            ...mapApiCourseToAppCourse(rawData), 
            sections: rawData.sections,
            createdAt: rawData.createdAt || rawData.created_at
          } : null;
          setCourse(updatedCourse);
        } catch (error) {
          console.error('Lỗi khi từ chối khóa học:', error);
          message.error('Từ chối khóa học thất bại!');
        }
      },
    });
  };



  if (loading) {
    return <Card style={{ margin: 24 }}><Skeleton active avatar paragraph={{ rows: 8 }} /></Card>;
  }
  if (!course) {
    return <Card style={{ margin: 24 }}><Text type="danger">Không tìm thấy khóa học.</Text></Card>;
  }

  const sections: Section[] = Array.isArray(course.sections) ? course.sections : [];
  const instructor = course.instructor;
  const author: Record<string, any> = instructor?.user || course.author || {};
  const authorBio = instructor?.bio || course.author?.bio || '';
  const authorExpertise = instructor?.expertise || course.author?.expertise || [];
  const totalLessons = sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);
  const totalDuration = totalLessons * 12 + 30; // phút

  // Tính giá sau giảm
  const hasDiscount = course.discount && course.discount > 0;
  const oldPrice = course.price;
  const discountPercent = hasDiscount ? course.discount ?? 0 : 0;
  const finalPrice = hasDiscount ? Math.round(course.price * (1 - discountPercent / 100)) : course.price;

  // Status color mapping
  const statusColorMap: Record<string, string> = {
    draft: 'default',
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
  };

  const statusText: Record<string, string> = {
    'draft': 'Bản nháp',
    'pending': 'Chờ duyệt',
    'approved': 'Đã duyệt',
    'rejected': 'Bị từ chối'
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={FADE_IN} style={{ padding: 0, background: '#f5f7fa', minHeight: '100vh' }}>
      <style>{`
        .course-detail-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 16px 48px 16px;
        }
        .course-detail-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px 0 rgba(26,115,232,0.10);
          border: none;
          margin-bottom: 32px;
        }
        .course-cover {
          border-radius: 18px 18px 0 0;
          object-fit: cover;
          max-height: 340px;
          min-height: 220px;
          background: #f5f7fa;
        }
        .section-card {
          background: #f5f7fa;
          border-radius: 12px;
          margin-bottom: 18px;
          border: none;
          box-shadow: 0 2px 8px 0 rgba(26,115,232,0.04);
          transition: box-shadow 0.2s;
        }
        .section-card:hover {
          box-shadow: 0 4px 16px 0 rgba(26,115,232,0.10);
        }
        .lesson-item {
          border-radius: 8px;
          transition: background 0.2s;
        }
        .lesson-item:hover {
          background: #e3f0fd;
        }
        .author-avatar {
          border: 3px solid #1a73e8;
          transition: box-shadow 0.2s;
        }
        .author-avatar:hover {
          box-shadow: 0 0 0 4px #e3f0fd;
        }
        .course-badge {
          background: #1a73e8;
          color: #fff;
          border-radius: 6px;
          padding: 2px 10px;
          font-size: 13px;
          margin-right: 8px;
        }
        .author-expertise {
          color: #1a73e8;
          font-size: 13px;
          font-weight: 500;
          background: #e3f0fd;
          border-radius: 6px;
          padding: 2px 8px;
          margin-right: 6px;
        }
        .course-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 12px;
        }
        .course-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          color: #23272f;
        }
        @media (max-width: 900px) {
          .course-detail-main { padding: 12px 2vw 32px 2vw; }
        }
      `}</style>
      
      <div className="course-detail-main">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 18, background: '#f5f7fa', border: 'none', color: '#1a73e8', fontWeight: 500 }}>Quay lại</Button>
        
        {/* Header với actions */}
        <Card className="course-detail-card" style={{ marginBottom: 24 }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={16}>
              <Title level={2} style={{ color: '#1a73e8', marginBottom: 8 }}>{course.title}</Title>
              <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
                <Tag color={statusColorMap[course.status || 'draft']} className="text-sm">
                  {statusText[course.status || 'draft']}
                </Tag>
                <Tag color={course.displayStatus === 'hidden' ? 'gray' : 'blue'} className="text-sm">
                  {course.displayStatus === 'hidden' ? 'Ẩn' : 'Hiển thị'}
                </Tag>
                <Tag color="purple">{course.type || course.category?.name || ''}</Tag>
                <Tag color="geekblue">{course.language === 'vi' ? 'Tiếng Việt' : course.language === 'en' ? 'Tiếng Anh' : course.language}</Tag>
                <Tag color="cyan">{course.level === 'beginner' ? 'Cơ bản' : course.level === 'intermediate' ? 'Trung cấp' : course.level === 'advanced' ? 'Nâng cao' : course.level}</Tag>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {course.status === 'pending' && (
                  <>
                    <Button 
                      type="primary" 
                      icon={<CheckOutlined />} 
                      onClick={handleApprove}
                      style={{ width: '100%' }}
                      className="bg-green-500"
                    >
                      Duyệt khóa học
                    </Button>
                    <Button 
                      danger 
                      icon={<CloseOutlined />} 
                      onClick={handleReject}
                      style={{ width: '100%' }}
                    >
                      Từ chối
                    </Button>
                  </>
                )}

              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            {/* Course Image */}
            <Card className="course-detail-card" style={{ marginBottom: 24 }}>
              <img alt={course.title} src={course.Image || course.thumbnail || ''} className="course-cover" style={{ width: '100%' }} />
            </Card>

            {/* Course Description */}
            <Card className="course-detail-card" style={{ marginBottom: 24 }}>
              <Title level={3} style={{ marginBottom: 16 }}>Mô tả khóa học</Title>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>
                {course.subtitle || course.description || 'Chưa có mô tả'}
              </Paragraph>
            </Card>

            {/* Course Content */}
            <Card className="course-detail-card" style={{ marginBottom: 24 }}>
              <Title level={3} style={{ marginBottom: 16 }}>Nội dung khóa học</Title>
              {sections.length > 0 ? (
                <List
                  dataSource={sections}
                  renderItem={(section, index) => (
                    <List.Item style={{ padding: 0, marginBottom: 16 }}>
                      <Card className="section-card" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <Text strong style={{ fontSize: 16 }}>
                            Chương {index + 1}: {section.title}
                          </Text>
                          <Text type="secondary">
                            {section.lessons?.length || 0} bài học
                          </Text>
                        </div>
                        {section.lessons && section.lessons.length > 0 && (
                          <List
                            size="small"
                            dataSource={section.lessons}
                            renderItem={(lesson, lessonIndex) => (
                              <List.Item style={{ padding: '8px 0', border: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Text type="secondary" style={{ fontSize: 12, minWidth: 40 }}>
                                    {lessonIndex + 1}.
                                  </Text>
                                  <Text>{lesson.title}</Text>
                                  {lesson.is_preview && (
                                    <Tag color="blue" size="small">Xem trước</Tag>
                                  )}
                                </div>
                              </List.Item>
                            )}
                          />
                        )}
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Alert
                  message="Chưa có nội dung"
                  description="Khóa học này chưa có chương học nào."
                  type="info"
                  showIcon
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            {/* Course Information */}
            <Card className="course-detail-card" style={{ marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 16 }}>Thông tin khóa học</Title>
              <Descriptions column={1} size="small">
                {hasDiscount ? (
                  <>
                    <Descriptions.Item label="Giá gốc">
                      <Text delete style={{ color: '#999' }}>
                        {oldPrice.toLocaleString()}đ
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giảm giá">
                      <Text type="danger">-{discountPercent}%</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá sau giảm">
                      <Text strong style={{ color: '#34a853', fontSize: 16 }}>
                        {finalPrice.toLocaleString()}đ
                      </Text>
                    </Descriptions.Item>
                  </>
                ) : (
                  <Descriptions.Item label="Giá">
                    <Text strong style={{ color: '#34a853', fontSize: 16 }}>
                      {oldPrice.toLocaleString()}đ
                    </Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Thời lượng">
                  <Text>{totalDuration} phút</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  <Text>{course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Instructor Information */}
            <Card className="course-detail-card">
              <Title level={4} style={{ marginBottom: 16 }}>Thông tin giảng viên</Title>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Avatar 
                  src={author.avatar} 
                  icon={<UserOutlined />} 
                  size={64}
                  className="author-avatar"
                />
                <div style={{ marginLeft: 16 }}>
                  <Text strong style={{ fontSize: 16, display: 'block' }}>
                    {author.name}
                  </Text>
                  <Text type="secondary">Giảng viên</Text>
                </div>
              </div>
              {authorBio && (
                <Paragraph style={{ marginBottom: 16 }}>
                  {authorBio}
                </Paragraph>
              )}
              {authorExpertise && authorExpertise.length > 0 && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Chuyên môn:</Text>
                  <Space wrap>
                    {authorExpertise.map((exp, index) => (
                      <span key={index} className="author-expertise">{exp}</span>
                    ))}
                  </Space>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

export default AdminCourseDetail; 