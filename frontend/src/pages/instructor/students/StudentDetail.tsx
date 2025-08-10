import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Tag, 
  Progress, 
  Timeline, 
  Button, 
  Space, 
  Statistic, 
  message, 
  Spin,
  Empty,
  Descriptions,
  Badge,
  Typography,
  Tooltip
} from "antd";
import { 
  UserOutlined, 
  BookOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  DollarOutlined,
  EyeOutlined,
  FireOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import instructorService from "../../../services/instructorService";

const { Title, Text } = Typography;

const FADE_IN_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface StudentDetail {
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
  lessonProgress?: Array<{
    lessonId: string;
    lessonTitle: string;
    watchedSeconds: number;
    videoDuration: number;
    completed: boolean;
    lastWatchedAt: string;
    quizPassed?: boolean;
  }>;
}

const StudentDetail: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetail();
    }
  }, [studentId]);

  const fetchStudentDetail = async () => {
    setLoading(true);
    try {
      if (!studentId) {
        message.error("Không tìm thấy ID học viên");
        return;
      }
      
      const data = await instructorService.getStudentDetail(studentId);
      setStudentDetail(data);
    } catch (error) {
      console.error("Error fetching student detail:", error);
      message.error("Không thể tải thông tin học viên");
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 50) return "#faad14";
    return "#ff4d4f";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Miễn phí" : `${price.toLocaleString()}đ`;
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, fontSize: 16, color: '#8c8c8c' }}>
          Đang tải thông tin học viên...
        </div>
      </div>
    );
  }

  if (!studentDetail) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <Empty description="Không tìm thấy thông tin học viên" />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '32px 24px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <style>{`
        .stats-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
        }
        .main-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          border: none;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        .back-button {
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          color: white;
        }
        .back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          color: white;
        }
        .page-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        .student-avatar {
          border: 4px solid #f0f0f0;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .timeline-item {
          padding: 16px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .timeline-item:hover {
          background: rgba(102, 126, 234, 0.05);
          transform: translateX(8px);
        }
      `}</style>

      <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP_VARIANTS}>
        {/* Header */}
        <Card className="main-card" style={{ marginBottom: 32 }}>
          <Space size="large">
            <Tooltip title="Quay lại danh sách">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/instructor/students')}
                className="back-button"
                size="large"
              >
                Quay lại
              </Button>
            </Tooltip>
            <div>
              <Title level={2} className="page-title" style={{ margin: 0 }}>
                <UserOutlined style={{ marginRight: 12 }} />
                Chi tiết học viên
              </Title>
              <Text type="secondary" style={{ fontSize: 16, marginTop: 8, display: 'block' }}>
                Thông tin chi tiết và tiến độ học tập của học viên
              </Text>
            </div>
          </Space>
        </Card>
      </motion.div>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ ...FADE_IN_UP_VARIANTS, visible: { ...FADE_IN_UP_VARIANTS.visible, transition: { delay: 0.2 } } }}
      >
        <Row gutter={[32, 32]}>
          {/* Student Info Card */}
          <Col xs={24} lg={8}>
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="stats-card">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <Avatar 
                    size={120} 
                    src={studentDetail.student.avatar} 
                    icon={<UserOutlined />}
                    className="student-avatar"
                    style={{ marginBottom: 16 }}
                  />
                  <Title level={3} style={{ margin: '16px 0 8px 0', color: '#2c3e50' }}>
                    {studentDetail.student.name}
                  </Title>
                  <Tag 
                    color={studentDetail.completed ? "success" : "processing"}
                    style={{ 
                      fontSize: 14, 
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontWeight: 600
                    }}
                  >
                    {studentDetail.completed ? "✅ Đã hoàn thành" : "🔄 Đang học"}
                  </Tag>
                </div>

                <Descriptions column={1} size="small">
                  <Descriptions.Item 
                    label={
                      <span style={{ color: '#667eea', fontWeight: 600 }}>
                        <MailOutlined style={{ marginRight: 8 }} />
                        Email
                      </span>
                    }
                  >
                    <Text style={{ color: '#2c3e50', fontWeight: 500 }}>{studentDetail.student.email}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={
                      <span style={{ color: '#667eea', fontWeight: 600 }}>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        Số điện thoại
                      </span>
                    }
                  >
                    <Text style={{ color: '#2c3e50', fontWeight: 500 }}>{studentDetail.student.phone}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={
                      <span style={{ color: '#667eea', fontWeight: 600 }}>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        Ngày đăng ký
                      </span>
                    }
                  >
                    <Text style={{ color: '#2c3e50', fontWeight: 500 }}>{formatDate(studentDetail.enrolledAt)}</Text>
                  </Descriptions.Item>
                  {studentDetail.lastActivity && (
                    <Descriptions.Item 
                      label={
                        <span style={{ color: '#667eea', fontWeight: 600 }}>
                          <ClockCircleOutlined style={{ marginRight: 8 }} />
                          Hoạt động cuối
                        </span>
                      }
                    >
                      <Text style={{ color: '#2c3e50', fontWeight: 500 }}>{formatDate(studentDetail.lastActivity)}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} lg={16}>
            {/* Course Info */}
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card 
                title={
                  <span style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '700'
                  }}>
                    <BookOutlined style={{ marginRight: 8 }} />
                    Thông tin khóa học
                  </span>
                }
                className="main-card"
                style={{ marginBottom: 24 }}
              >
                <Row gutter={24}>
                  <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                      <BookOutlined style={{ fontSize: 48, marginRight: 16, color: '#667eea' }} />
                      <div>
                        <Title level={4} style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
                          {studentDetail.course.title}
                        </Title>
                        <Tag color="green" style={{ fontSize: 16, fontWeight: 600, padding: '8px 16px', borderRadius: 8 }}>
                          {formatPrice(studentDetail.course.price)}
                        </Tag>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Statistic
                        title={<span style={{ color: '#667eea', fontWeight: '600' }}>Tiến độ tổng thể</span>}
                        value={studentDetail.progress}
                        suffix="%"
                        valueStyle={{ 
                          color: getProgressColor(studentDetail.progress),
                          fontSize: 36,
                          fontWeight: 'bold'
                        }}
                      />
                      <Progress 
                        percent={studentDetail.progress} 
                        strokeColor={getProgressColor(studentDetail.progress)}
                        size="small"
                        style={{ marginTop: 16 }}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            </motion.div>

            {/* Lesson Progress */}
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card 
                title={
                  <span style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '700'
                  }}>
                    <TrophyOutlined style={{ marginRight: 8 }} />
                    Tiến độ bài học
                  </span>
                }
                className="main-card"
              >
                {studentDetail.lessonProgress && studentDetail.lessonProgress.length > 0 ? (
                  <Timeline
                    style={{ padding: '24px 0' }}
                  >
                    {studentDetail.lessonProgress.map((lesson, index) => (
                      <Timeline.Item
                        key={lesson.lessonId}
                        dot={
                          lesson.completed ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                          ) : lesson.watchedSeconds > 0 ? (
                            <PlayCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                          ) : (
                            <ClockCircleOutlined style={{ color: '#d9d9d9', fontSize: 20 }} />
                          )
                        }
                        color={
                          lesson.completed ? '#52c41a' : 
                          lesson.watchedSeconds > 0 ? '#1890ff' : '#d9d9d9'
                        }
                      >
                        <div className="timeline-item">
                          <Title level={5} style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>
                            {lesson.lessonTitle}
                          </Title>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            {lesson.completed ? (
                              <Tag color="success" style={{ borderRadius: 8, padding: '4px 12px' }}>
                                <CheckCircleOutlined /> Hoàn thành
                              </Tag>
                            ) : lesson.watchedSeconds > 0 ? (
                              <Tag color="processing" style={{ borderRadius: 8, padding: '4px 12px' }}>
                                <PlayCircleOutlined /> Đang học
                              </Tag>
                            ) : (
                              <Tag color="default" style={{ borderRadius: 8, padding: '4px 12px' }}>
                                <ClockCircleOutlined /> Chưa bắt đầu
                              </Tag>
                            )}
                            
                            {lesson.watchedSeconds > 0 && (
                              <Text style={{ color: '#8c8c8c', fontSize: 14, fontWeight: 500 }}>
                                {formatDuration(lesson.watchedSeconds)} / {formatDuration(lesson.videoDuration)}
                              </Text>
                            )}
                          </div>
                          
                          {lesson.quizPassed !== undefined && (
                            <div style={{ marginBottom: 12 }}>
                              <Badge 
                                status={lesson.quizPassed ? "success" : "error"} 
                                text={
                                  <Text style={{ fontSize: 14, fontWeight: 500 }}>
                                    {lesson.quizPassed ? "✅ Đã làm quiz" : "❌ Chưa làm quiz"}
                                  </Text>
                                }
                              />
                            </div>
                          )}
                          
                          {lesson.lastWatchedAt && (
                            <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                              <ClockCircleOutlined style={{ marginRight: 8 }} />
                              Lần cuối: {formatDate(lesson.lastWatchedAt)}
                            </div>
                          )}
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty 
                    description="Chưa có dữ liệu tiến độ bài học" 
                    style={{ padding: '60px 0' }}
                  />
                )}
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Activity Summary */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ ...FADE_IN_UP_VARIANTS, visible: { ...FADE_IN_UP_VARIANTS.visible, transition: { delay: 0.4 } } }}
        style={{ marginTop: 32 }}
      >
        <Card 
          title={
            <span style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '700'
            }}>
              <FireOutlined style={{ marginRight: 8 }} />
              Tóm tắt hoạt động
            </span>
          }
          className="main-card"
        >
          <Row gutter={[24, 24]}>
            <Col xs={12} sm={6}>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
                <div style={{ textAlign: 'center' }}>
                  <BookOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
                  <Statistic
                    title={<span style={{ color: '#667eea', fontWeight: '600' }}>Tổng bài học</span>}
                    value={studentDetail.lessonProgress?.length || 0}
                    valueStyle={{ color: '#667eea', fontSize: 28, fontWeight: 'bold' }}
                  />
                </div>
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
                <div style={{ textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                  <Statistic
                    title={<span style={{ color: '#52c41a', fontWeight: '600' }}>Đã hoàn thành</span>}
                    value={studentDetail.lessonProgress?.filter(l => l.completed).length || 0}
                    valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 'bold' }}
                  />
                </div>
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
                <div style={{ textAlign: 'center' }}>
                  <TrophyOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                  <Statistic
                    title={<span style={{ color: '#faad14', fontWeight: '600' }}>Quiz đã làm</span>}
                    value={studentDetail.lessonProgress?.filter(l => l.quizPassed).length || 0}
                    valueStyle={{ color: '#faad14', fontSize: 28, fontWeight: 'bold' }}
                  />
                </div>
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
                <div style={{ textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                  <Statistic
                    title={<span style={{ color: '#722ed1', fontWeight: '600' }}>Thời gian học</span>}
                    value={Math.round((studentDetail.lessonProgress?.reduce((total, l) => total + l.watchedSeconds, 0) || 0) / 60)}
                    suffix="phút"
                    valueStyle={{ color: '#722ed1', fontSize: 28, fontWeight: 'bold' }}
                  />
                </div>
              </motion.div>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentDetail;
