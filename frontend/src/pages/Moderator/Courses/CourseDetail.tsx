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
  Tabs,
  Collapse,
  Radio,
  Progress,
  Image,
  Spin,
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
  PlayCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleFilled,
  FileTextOutlined as FileTextIcon,
} from "@ant-design/icons";
import { courseService } from '../../../services/apiService';
import { getQuizByLesson } from '../../../services/courseService';
import { motion } from 'framer-motion';
import { CustomVideoPlayer } from '../../../components/CustomVideoPlayer';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Định nghĩa interface cho dữ liệu
interface Author {
  name: string;
  avatar?: string;
  bio?: string;
  expertise?: string[];
}

interface Lesson {
  _id: string;
  title: string;
  position: number;
  is_preview: boolean;
  video?: {
    _id: string;
    url: string;
    duration: number;
  };
  quiz?: {
    _id: string;
    questions: QuizQuestion[];
  };
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex?: number;
}

interface Section {
  _id: string;
  title: string;
  position: number;
  lessons: Lesson[];
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
  rejection_reason?: string;
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
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ success: boolean; message: string; wrongQuestions?: number[] } | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (id) {
          console.log('Fetching course data for ID:', id);
          const rawData = await courseService.getCourseById(id);
          console.log('Raw course data:', rawData);
          if (rawData) {
            const courseData = {
              id: rawData._id,
              title: rawData.title,
              subtitle: rawData.description,
              Image: rawData.thumbnail,
              status: rawData.status,
              type: rawData.category?.name,
              level: rawData.level,
              createdAt: rawData.createdAt,
              price: rawData.price,
              rating: rawData.rating,
              reviews: rawData.totalReviews,
              requirements: rawData.requirements,
              author: {
                name: rawData.instructor?.user?.fullname || 'Giảng viên EduPro',
                avatar: rawData.instructor?.user?.avatar,
                bio: rawData.instructor?.bio,
                expertise: rawData.instructor?.expertise,
              },
              instructor: rawData.instructor,
              category: rawData.category,
              thumbnail: rawData.thumbnail,
              description: rawData.description,
              discount: rawData.discount,
              displayStatus: rawData.displayStatus,
              views: rawData.views,
              enrollments: rawData.enrollments,
              rejection_reason: rawData.rejection_reason,
            };
            setCourse(courseData);

            // Fetch course content (sections and lessons) for moderator
            try {
              const contentData = await courseService.getCourseContentForModerator(id);
              setCourse(prev => prev ? { ...prev, sections: contentData } : null);
            } catch (contentError) {
              console.error('Error fetching course content:', contentError);
              // Fallback to public API if moderator API fails
              try {
                const publicContentData = await courseService.getCourseContent(id);
                setCourse(prev => prev ? { ...prev, sections: publicContentData } : null);
              } catch (fallbackError) {
                console.error('Error fetching public course content:', fallbackError);
                message.warning('Không thể tải nội dung khóa học');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        message.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return { color: "green", text: "ĐÃ DUYỆT", icon: <CheckCircleOutlined /> };
      case "pending":
        return { color: "orange", text: "CHỜ DUYỆT", icon: <ClockCircleFilled /> };
      case "rejected":
        return { color: "red", text: "BỊ TỪ CHỐI", icon: <CloseCircleOutlined /> };
      case "draft":
        return { color: "default", text: "BẢN NHÁP", icon: <FileTextIcon /> };
      default:
        return { color: "default", text: status.toUpperCase(), icon: <FileTextIcon /> };
    }
  };

  const handlePreviewVideo = async (lesson: Lesson) => {
    console.log('Preview video for lesson:', lesson);
    if (!lesson.video) {
      message.warning('Bài học này không có video');
      return;
    }
    
    try {
      setVideoLoading(true);
      setVideoError(null);
      
      // Lấy video URL với authentication
      const videoData = await courseService.getVideoUrlForModerator(lesson._id);
      console.log('Video data:', videoData);
      
      const lessonWithVideo = { 
        ...lesson, 
        video: { 
          ...lesson.video, 
          url: videoData.url 
        } 
      };
      setSelectedLesson(lessonWithVideo);
      setVideoModalVisible(true);
    } catch (error) {
      console.error('Error fetching video URL:', error);
      setVideoError('Không thể tải video. Vui lòng thử lại.');
      setVideoLoading(false);
    }
  };

  const handlePreviewQuiz = async (lesson: Lesson) => {
    try {
      // Fetch quiz data for the lesson
      const quizData = await getQuizByLesson(lesson._id);
      if (!quizData) {
        message.warning('Bài học này không có quiz');
        return;
      }
      
      const lessonWithQuiz = { ...lesson, quiz: quizData };
      setSelectedLesson(lessonWithQuiz);
      setQuizAnswers(new Array(quizData.questions.length).fill(-1));
      setQuizResult(null);
      setQuizModalVisible(true);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      message.warning('Không thể tải quiz cho bài học này');
    }
  };

  const handleQuizSubmit = () => {
    if (!selectedLesson?.quiz) return;

    const correctAnswers = selectedLesson.quiz.questions.map(q => q.correctIndex || 0);
    const wrongQuestions: number[] = [];
    
    quizAnswers.forEach((answer, index) => {
      if (answer !== correctAnswers[index]) {
        wrongQuestions.push(index);
      }
    });

    const isPassed = wrongQuestions.length === 0;
    setQuizResult({
      success: isPassed,
      message: isPassed 
        ? 'Tất cả đáp án đều đúng!' 
        : `Bạn đã trả lời sai ${wrongQuestions.length} câu hỏi.`,
      wrongQuestions
    });
  };

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
          navigate('/moderator/courses');
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
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseService.approveCourse(course.id, 'reject', 'Khóa học không đạt tiêu chuẩn');
          message.success('Đã từ chối khóa học!');
          navigate('/moderator/courses');
        } catch (error) {
          console.error('Lỗi khi từ chối khóa học:', error);
          message.error('Từ chối khóa học thất bại!');
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton active />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Không tìm thấy khóa học" type="error" />
      </div>
    );
  }

  const statusConfig = getStatusConfig(course.status || '');

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={FADE_IN}
      >
        {/* Header */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/moderator/courses')}
            >
              Quay lại
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Chi tiết khóa học
            </Title>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Image
                src={course.Image}
                alt={course.title}
                width="100%"
                height={200}
                style={{ borderRadius: '8px', objectFit: 'cover' }}
                fallback="https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=Khóa+học"
              />
            </Col>
            <Col xs={24} md={16}>
              <Title level={3}>{course.title}</Title>
              <Paragraph>{course.subtitle}</Paragraph>
              
              <Space size="large" style={{ marginBottom: '16px' }}>
                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                  {statusConfig.text}
                </Tag>
                <Text type="secondary">
                  <CalendarOutlined /> {new Date(course.createdAt || '').toLocaleDateString('vi-VN')}
                </Text>
                <Text type="secondary">
                  <EyeOutlined /> {course.views || 0} lượt xem
                </Text>
              </Space>

              <div style={{ marginBottom: '16px' }}>
                <Text strong>Giảng viên: </Text>
                <Space>
                  <Avatar 
                    src={course.author?.avatar || '/images/default-avatar.png'}
                    icon={<UserOutlined />}
                    size="small"
                  />
                  <Text>{course.author?.name}</Text>
                </Space>
              </div>

              {course.status === 'pending' && (
                <Space>
                  <Button 
                    type="primary" 
                    icon={<CheckOutlined />}
                    onClick={handleApprove}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Duyệt khóa học
                  </Button>
                  <Button 
                    danger 
                    icon={<CloseOutlined />}
                    onClick={handleReject}
                  >
                    Từ chối
                  </Button>
                </Space>
              )}
            </Col>
          </Row>
        </Card>

        {/* Course Information */}
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Thông tin khóa học">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Danh mục">{course.type}</Descriptions.Item>
                <Descriptions.Item label="Cấp độ">{course.level}</Descriptions.Item>
                <Descriptions.Item label="Giá">
                  {course.price === 0 ? (
                    <Tag color="success">Miễn phí</Tag>
                  ) : (
                    <Text strong style={{ color: '#52c41a' }}>
                      {course.price?.toLocaleString()}đ
                    </Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá">
                  <Space>
                    <Text>{course.rating || 0}/5</Text>
                    <Text type="secondary">({course.reviews || 0} đánh giá)</Text>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="Yêu cầu khóa học">
              {course.requirements && course.requirements.length > 0 ? (
                <List
                  size="small"
                  dataSource={course.requirements}
                  renderItem={(item, index) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Không có yêu cầu đặc biệt</Text>
              )}
            </Card>
          </Col>
        </Row>

        {/* Course Content */}
        <Card title="Nội dung khóa học" style={{ marginTop: '24px' }}>
          {course.sections && course.sections.length > 0 ? (
            <Collapse defaultActiveKey={['0']}>
              {course.sections.map((section, sectionIndex) => (
                <Panel 
                  header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOutlined />
                      <Text strong>{section.title}</Text>
                      <Badge count={section.lessons?.length || 0} style={{ backgroundColor: '#1890ff' }} />
                    </div>
                  } 
                  key={sectionIndex}
                >
                  <List
                    dataSource={section.lessons || []}
                    renderItem={(lesson, lessonIndex) => (
                      <List.Item
                        actions={[
                          lesson.video && (
                            <Tooltip title="Xem video">
                              <Button
                                type="text"
                                icon={<PlayCircleOutlined />}
                                onClick={() => handlePreviewVideo(lesson)}
                                style={{ color: '#1890ff' }}
                              >
                                Video
                              </Button>
                            </Tooltip>
                          ),
                          <Tooltip title="Làm quiz">
                            <Button
                              type="text"
                              icon={<FileTextOutlined />}
                              onClick={() => handlePreviewQuiz(lesson)}
                              style={{ color: '#52c41a' }}
                            >
                              Quiz
                            </Button>
                          </Tooltip>
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Text>{lesson.title}</Text>
                              {lesson.is_preview && (
                                <Tag color="blue" size="small">Preview</Tag>
                              )}
                            </div>
                          }
                          description={
                            <Space>
                              <Text type="secondary">Bài {lessonIndex + 1}</Text>
                              {lesson.video && (
                                <Text type="secondary">
                                  <ClockCircleOutlined /> {Math.round(lesson.video.duration / 60)} phút
                                </Text>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          ) : (
            <Alert message="Chưa có nội dung khóa học" type="info" />
          )}
        </Card>

        {/* Rejection Reason */}
        {course.rejection_reason && (
          <Card title="Lý do từ chối" style={{ marginTop: '24px' }}>
            <Alert 
              message={course.rejection_reason} 
              type="error" 
              showIcon
            />
          </Card>
        )}
      </motion.div>

      {/* Video Preview Modal */}
      <Modal
        title={`Xem video: ${selectedLesson?.title}`}
        open={videoModalVisible}
        onCancel={() => {
          setVideoModalVisible(false);
          setVideoError(null);
          setVideoLoading(false);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedLesson?.video ? (
          <div style={{ textAlign: 'center' }}>
            {videoLoading && (
              <div style={{ padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Đang tải video...</div>
              </div>
            )}
            
            {videoError && (
              <div style={{ padding: '40px' }}>
                <Alert 
                  message={videoError} 
                  type="error" 
                  showIcon
                />
                <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                  URL: {selectedLesson.video.url}
                </div>
              </div>
            )}
            
            {!videoLoading && !videoError && (
              <div style={{ width: '100%', height: '400px' }}>
                <video
                  src={selectedLesson.video.url}
                  controls
                  controlsList="nodownload noplaybackrate"
                  onContextMenu={(e) => e.preventDefault()}
                  onLoadStart={() => setVideoLoading(true)}
                  onLoadedData={() => setVideoLoading(false)}
                  onError={(e) => {
                    console.error('Video error:', e);
                    setVideoLoading(false);
                    setVideoError('Không thể tải video. Vui lòng kiểm tra lại URL.');
                  }}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '8px',
                    background: '#000',
                    objectFit: 'contain'
                  }}
                >
                  Trình duyệt không hỗ trợ video tag.
                </video>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Alert 
              message="Không có video cho bài học này" 
              type="info" 
              showIcon
            />
          </div>
        )}
      </Modal>

      {/* Quiz Preview Modal */}
      <Modal
        title={`Làm quiz: ${selectedLesson?.title}`}
        open={quizModalVisible}
        onCancel={() => setQuizModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedLesson?.quiz && (
          <div>
            {!quizResult ? (
              <div>
                {selectedLesson.quiz.questions.map((question, index) => (
                  <Card key={index} style={{ marginBottom: '16px' }}>
                    <Title level={5}>
                      Câu {index + 1}: {question.question}
                    </Title>
                    <Radio.Group
                      value={quizAnswers[index]}
                      onChange={(e) => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[index] = e.target.value;
                        setQuizAnswers(newAnswers);
                      }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {question.options.map((option, optionIndex) => (
                          <Radio key={optionIndex} value={optionIndex}>
                            {option}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </Card>
                ))}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Button 
                    type="primary" 
                    onClick={handleQuizSubmit}
                    disabled={quizAnswers.includes(-1)}
                  >
                    Nộp bài
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Alert
                  message={quizResult.message}
                  type={quizResult.success ? 'success' : 'error'}
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
                {quizResult.wrongQuestions && quizResult.wrongQuestions.length > 0 && (
                  <div>
                    <Text strong>Các câu trả lời sai:</Text>
                    <div style={{ marginTop: '8px' }}>
                      {quizResult.wrongQuestions.map((questionIndex) => (
                        <Tag key={questionIndex} color="red" style={{ margin: '4px' }}>
                          Câu {questionIndex + 1}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
                <Button 
                  type="primary" 
                  onClick={() => setQuizModalVisible(false)}
                  style={{ marginTop: '16px' }}
                >
                  Đóng
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseDetail;
