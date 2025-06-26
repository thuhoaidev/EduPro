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
  Rate,
} from "antd";
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, TeamOutlined, StarFilled, DollarOutlined } from "@ant-design/icons";
import { courseService } from '../../../services/apiService';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

// Định nghĩa interface cho dữ liệu course và section
interface Author {
  name: string;
  avatar?: string;
  bio?: string;
  expertise?: string[];
}
interface Lesson {
  _id: string;
  title: string;
  is_preview?: boolean;
}
interface Section {
  _id: string;
  title: string;
  lessons?: Lesson[];
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
  instructor?: any;
  category?: any;
  thumbnail?: string;
  description?: string;
  discount?: number;
}

const FADE_IN = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CourseDetail: React.FC = () => {
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
          courseData = await courseService.getCourseById(id);
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

  if (loading) {
    return <Card style={{ margin: 24 }}><Skeleton active avatar paragraph={{ rows: 8 }} /></Card>;
  }
  if (!course) {
    return <Card style={{ margin: 24 }}><Text type="danger">Không tìm thấy khóa học.</Text></Card>;
  }

  const sections = course.sections || [];
  const instructor = course.instructor;
  const author = instructor?.user || course.author || {};
  const authorBio = instructor?.bio || course.author?.bio || '';
  const authorExpertise = instructor?.expertise || course.author?.expertise || [];
  const totalLessons = sections.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0);
  // Giả lập tổng thời lượng
  const totalDuration = totalLessons * 12 + 30; // phút

  // Tính giá sau giảm
  const hasDiscount = course.discount && course.discount > 0;
  const oldPrice = course.price;
  const discountPercent = hasDiscount ? course.discount ?? 0 : 0;
  const finalPrice = hasDiscount ? Math.round(course.price * (1 - discountPercent / 100)) : course.price;

  return (
    <motion.div initial="hidden" animate="visible" variants={FADE_IN} style={{ padding: 0, background: '#f5f7fa', minHeight: '100vh' }}>
      <style>{`
        .course-detail-main {
          max-width: 1100px;
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
        <Card
          className="course-detail-card"
          cover={<img alt={course.title} src={course.Image || course.thumbnail || ''} className="course-cover" />}
          variant="borderless"
        >
          <Row gutter={[32, 32]}>
            <Col xs={24} md={16}>
              <Title level={2} style={{ color: '#1a73e8', marginBottom: 0 }}>{course.title}</Title>
              <Space style={{ margin: '8px 0 16px 0', flexWrap: 'wrap' }}>
                <span className="course-badge">{course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span>
                <Tag color="purple">{course.type || course.category?.name || ''}</Tag>
                <Tag color="geekblue">{course.language}</Tag>
                <Tag color="cyan">{course.level}</Tag>
                <Tag icon={<CalendarOutlined />} color="default">{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : ''}</Tag>
              </Space>
              <Paragraph type="secondary" style={{ marginTop: 0, fontSize: 16 }}>{course.subtitle || course.description || ''}</Paragraph>
              <div className="course-meta">
                <div className="course-meta-item">
                  <DollarOutlined style={{ color: '#faad14' }} />
                  {oldPrice === 0 ? (
                    <Tag color="green">Miễn phí</Tag>
                  ) : (
                    <>
                      {hasDiscount && (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>
                            {oldPrice?.toLocaleString()}đ
                          </span>
                          <Tag color="red" style={{ fontWeight: 600, marginRight: 8 }}>-{discountPercent}%</Tag>
                        </>
                      )}
                      <Tag color="orange" style={{ fontWeight: 600 }}>{finalPrice?.toLocaleString()}đ</Tag>
                    </>
                  )}
                </div>
                <div className="course-meta-item"><TeamOutlined style={{ color: '#1a73e8' }} />{Math.floor(Math.random() * 500) + 50} học viên</div>
                <div className="course-meta-item"><StarFilled style={{ color: '#faad14' }} />{course.rating || 4.5} <span style={{ color: '#888', fontWeight: 400 }}>({course.reviews || 0} đánh giá)</span></div>
                <div className="course-meta-item"><BookOutlined style={{ color: '#1a73e8' }} />{totalLessons} bài học</div>
                <div className="course-meta-item"><ClockCircleOutlined style={{ color: '#1a73e8' }} />{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</div>
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <Row gutter={16} style={{ marginBottom: 12 }}>
                <Col><Text strong>Yêu cầu: </Text>{Array.isArray(course.requirements) && course.requirements.length > 0 ? course.requirements.join(', ') : 'Không có'}</Col>
              </Row>
              <Divider orientation="left" style={{ color: '#1a73e8', fontWeight: 600 }}>Nội dung khóa học</Divider>
              {sections.length === 0 ? <Text type="secondary">Chưa có chương nào.</Text> : (
                <div>
                  {sections.map((section: any, idx: number) => (
                    <Card key={section._id || idx} className="section-card" title={<span><BookOutlined style={{ color: '#1a73e8', marginRight: 8 }} />{section.title}</span>}>
                      <List
                        size="small"
                        dataSource={section.lessons || []}
                        renderItem={(lesson: any) => (
                          <List.Item className="lesson-item">
                            <Space>
                              <UserOutlined style={{ color: '#1a73e8' }} />
                              <Text>{lesson.title}</Text>
                              {lesson.is_preview && <Badge color="#1a73e8" text="Preview" />}
                            </Space>
                          </List.Item>
                        )}
                      />
                    </Card>
                  ))}
                </div>
              )}
            </Col>
            <Col xs={24} md={8}>
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card variant="borderless" style={{ background: '#f5f7fa', borderRadius: 14, boxShadow: '0 2px 8px 0 rgba(26,115,232,0.06)', marginBottom: 24 }}>
                  <Title level={5} style={{ color: '#23272f', marginBottom: 12 }}>Giảng viên</Title>
                  <Space align="start" style={{ width: '100%' }}>
                    <Tooltip title={author?.fullname || author?.name || ''}>
                      <Avatar src={author?.avatar || ''} size={72} className="author-avatar" />
                    </Tooltip>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ color: '#1a73e8', fontSize: 18 }}>{author?.fullname || author?.name || ''}</Text>
                      <Paragraph type="secondary" style={{ margin: 0, color: '#23272f', fontSize: 14 }}>{authorBio}</Paragraph>
                      {Array.isArray(authorExpertise) && authorExpertise.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {authorExpertise.map((exp: string, idx: number) => (
                            <span className="author-expertise" key={idx}>{exp}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Card>
      </div>
    </motion.div>
  );
};

export default CourseDetail;
