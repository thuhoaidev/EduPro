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
  Modal,
  Collapse,
  Progress,
  Descriptions,
  Empty,
} from "antd";
import { 
  ArrowLeftOutlined, 
  BookOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  StarFilled, 
  DollarOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  LockOutlined,
  VideoCameraOutlined,
  FormOutlined,
  ExpandOutlined,
  NodeCollapseOutlined,
} from "@ant-design/icons";
import { courseService, mapApiCourseToAppCourse } from '../../../services/apiService';
import { motion } from 'framer-motion';
import VideoManager from '../videos/VideoManager';
import QuizManager from '../quiz/QuizManager';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Định nghĩa interface cho dữ liệu course và section
interface Author {
  name: string;
  avatar?: string;
  bio?: string;
  expertise?: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Quiz {
  _id?: string;
  questions?: QuizQuestion[];
  title?: string;
}

interface Video {
  _id?: string;
  duration: number;
  url?: string;
  title?: string;
  description?: string;
  status?: string;
}

interface Lesson {
  _id: string;
  title: string;
  is_preview?: boolean;
  video?: Video;
  videos?: Video[];
  quiz?: Quiz;
  description?: string;
  duration?: number;
}

interface Section {
  _id: string;
  title: string;
  description?: string;
  lessons?: Lesson[];
}

interface CourseDetailData {
  id: string;
  title: string;
  subtitle?: string;
  Image?: string;
  status?: string;
  type?: string;

  level?: string;
  createdAt?: string;
  price: number;
  rating?: number;
  reviews?: number;
  students_count?: number;
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
  discount_percentage?: number;
  discount_amount?: number;
}

const FADE_IN = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Hàm chuyển đổi giây thành định dạng giờ:phút:giây
const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = '';
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0 || hours > 0) {
    result += `${minutes}m `;
  }
  if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
    result += `${remainingSeconds}s`;
  }

  return result.trim();
};

// Hàm chuyển đổi level sang tiếng Việt
const formatLevel = (level: string): string => {
  const levelMap: { [key: string]: string } = {
    'beginner': 'Người mới bắt đầu',
    'intermediate': 'Trung cấp',
    'advanced': 'Nâng cao',
    'all': 'Tất cả cấp độ',
    'basic': 'Cơ bản',
    'expert': 'Chuyên gia'
  };
  
  return levelMap[level?.toLowerCase()] || level || 'Không xác định';
};

const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ type: 'video' | 'quiz', data: any } | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let courseData = null;
        if (id) {
          let rawData: any = null;
          // Detect if id is a Mongo ObjectId
          const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

          if (isObjectId) {
            rawData = await courseService.getCourseById(id);
            if (!rawData) {
              // Fallback to slug if not found by id
              const bySlug = await courseService.getCourseBySlug(id);
              if (bySlug) {
                // Fetch full detail by id to get sections regardless of publish state
                const fullDetail = await courseService.getCourseById(bySlug.id);
                const mapped = mapApiCourseToAppCourse(fullDetail || bySlug as any);
                courseData = {
                  ...mapped,
                  sections: (fullDetail && fullDetail.sections) || [],
                  discount_percentage: (fullDetail || bySlug as any).discount_percentage,
                  discount_amount: (fullDetail || bySlug as any).discount_amount,
                  discount: (fullDetail || bySlug as any).discount,
                } as any;
              }
            } else {
              // rawData found, map it
              const mappedData = mapApiCourseToAppCourse(rawData);
              courseData = {
                ...mappedData,
                sections: rawData.sections || [],
                discount_percentage: rawData.discount_percentage,
                discount_amount: rawData.discount_amount,
                discount: rawData.discount,
              } as any;
            }
          } else {
            // Treat param as slug first
            const bySlug = await courseService.getCourseBySlug(id);
            if (bySlug) {
              const fullDetail = await courseService.getCourseById(bySlug.id);
              const mapped = mapApiCourseToAppCourse(fullDetail || bySlug as any);
              courseData = {
                ...mapped,
                sections: (fullDetail && fullDetail.sections) || [],
                discount_percentage: (fullDetail || bySlug as any).discount_percentage,
                discount_amount: (fullDetail || bySlug as any).discount_amount,
                discount: (fullDetail || bySlug as any).discount,
              } as any;
            } else {
              // Fallback to try as id
              rawData = await courseService.getCourseById(id);
              if (rawData) {
                const mappedData = mapApiCourseToAppCourse(rawData);
                courseData = {
                  ...mappedData,
                  sections: rawData.sections || [],
                  discount_percentage: rawData.discount_percentage,
                  discount_amount: rawData.discount_amount,
                  discount: rawData.discount,
                } as any;
              }
            }
          }
        }
        setCourse(courseData);
        if (courseData) {
          console.log('Course data loaded:', courseData);
          console.log('Sections data:', courseData.sections);
          console.log('Sections type:', typeof courseData.sections);
          console.log('Is sections array:', Array.isArray(courseData.sections));
          console.log('Raw sections:', JSON.stringify(courseData.sections, null, 2));
          if (courseData.sections && courseData.sections.length > 0) {
            courseData.sections.forEach((section: any, index: number) => {
              console.log(`Section ${index + 1}:`, section);
              console.log(`Lessons in section ${index + 1}:`, section.lessons);
              console.log(`Lessons type:`, typeof section.lessons);
              console.log(`Is lessons array:`, Array.isArray(section.lessons));

              // Debug video duration
              if (section.lessons && Array.isArray(section.lessons)) {
                section.lessons.forEach((lesson: any, lessonIndex: number) => {
                  console.log(`Lesson ${lessonIndex + 1} video:`, lesson.video);
                  console.log(`Lesson ${lessonIndex + 1} duration:`, lesson.video?.duration);
                  console.log(`Lesson ${lessonIndex + 1} videos:`, lesson.videos);
                  console.log(`Lesson ${lessonIndex + 1} quiz:`, lesson.quiz);
                });
              }
            });
          } else {
            console.log('No sections found or sections is empty');
          }
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        message.error('Không thể lấy chi tiết khóa học.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePreviewVideo = (video: Video) => {
    setPreviewContent({ type: 'video', data: video });
    setPreviewModalVisible(true);
  };

  const handlePreviewQuiz = (quiz: Quiz) => {
    setPreviewContent({ type: 'quiz', data: quiz });
    setPreviewModalVisible(true);
  };

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderVideoPreview = (video: Video) => (
    <div style={{ padding: '0 16px' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white',
        textAlign: 'center'
      }}>
        <VideoCameraOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.9 }} />
        <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
          {video.title || 'Video Preview'}
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClockCircleOutlined />
            <span>{formatDuration(video.duration)}</span>
          </div>
          {video.description && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileTextOutlined />
              <span>Có mô tả</span>
            </div>
          )}
        </div>
      </div>

      {video.url ? (
        <div style={{ 
          background: '#000', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          marginBottom: '24px'
        }}>
          <video 
            controls 
            style={{ 
              width: '100%', 
              height: 'auto',
              display: 'block'
            }}
            src={video.url}
            poster={video.url ? undefined : 'https://via.placeholder.com/800x450/1a73e8/FFFFFF?text=Video+Preview'}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '16px',
          height: '300px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px',
          border: '2px dashed #d9d9d9'
        }}>
          <VideoCameraOutlined style={{ fontSize: '64px', color: '#bfbfbf', marginBottom: '16px' }} />
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '8px' }}>
            Video không khả dụng
          </Text>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Video này chưa được tải lên hoặc đã bị xóa
          </Text>
        </div>
      )}

      {video.description && (
        <Card 
          style={{ 
            borderRadius: '12px',
            border: '1px solid #f0f0f0',
            background: '#fafafa'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <FileTextOutlined style={{ color: '#1a73e8', fontSize: '18px', marginTop: '2px' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Mô tả video:</Text>
              <Paragraph style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>
                {video.description}
              </Paragraph>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderQuizPreview = (quiz: Quiz) => (
    <div style={{ padding: '0 16px' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white',
        textAlign: 'center'
      }}>
        <FormOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.9 }} />
        <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
          {quiz.title || 'Quiz Preview'}
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FormOutlined />
            <span>{quiz.questions?.length || 0} câu hỏi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircleOutlined />
            <span>Đáp án đúng được đánh dấu</span>
          </div>
        </div>
      </div>

      {quiz.questions && quiz.questions.length > 0 ? (
        <div>
          <div style={{ 
            background: '#f8f9fa', 
            borderRadius: '12px', 
            padding: '16px', 
            marginBottom: '20px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FormOutlined style={{ color: '#1a73e8', fontSize: '18px' }} />
              <Text strong style={{ fontSize: '16px' }}>Tổng quan Quiz</Text>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ 
                background: 'white', 
                padding: '12px 16px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a73e8' }}>
                  {quiz.questions.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Tổng câu hỏi</div>
              </div>
              <div style={{ 
                background: 'white', 
                padding: '12px 16px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {quiz.questions.reduce((count, q) => count + (q.options?.length || 0), 0)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Tổng lựa chọn</div>
              </div>
            </div>
          </div>

          <Title level={4} style={{ marginBottom: '20px', color: '#1a73e8' }}>
            <FormOutlined style={{ marginRight: '8px' }} />
            Danh sách câu hỏi
          </Title>
          
          {quiz.questions.map((question, index) => (
            <Card 
              key={index} 
              style={{ 
                marginBottom: '16px',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ 
                background: '#1a73e8', 
                color: 'white', 
                padding: '6px 12px', 
                borderRadius: '20px',
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '16px'
              }}>
                Câu {index + 1}
              </div>
              
              <Paragraph style={{ 
                marginBottom: '16px', 
                fontSize: '16px',
                fontWeight: '500',
                color: '#2c3e50',
                lineHeight: '1.6'
              }}>
                {question.question}
              </Paragraph>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {question.options.map((option, optionIndex) => (
                  <div 
                    key={optionIndex}
                    style={{
                      padding: '12px 16px',
                      background: optionIndex === question.correctIndex 
                        ? 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)' 
                        : '#fafafa',
                      border: optionIndex === question.correctIndex 
                        ? '2px solid #52c41a' 
                        : '1px solid #e9ecef',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                      cursor: 'default'
                    }}
                  >
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      border: optionIndex === question.correctIndex ? '2px solid #52c41a' : '2px solid #d9d9d9',
                      background: optionIndex === question.correctIndex ? '#52c41a' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {optionIndex === question.correctIndex ? (
                        <CheckCircleOutlined style={{ color: 'white', fontSize: '12px' }} />
                      ) : (
                        <span style={{ fontSize: '10px', color: '#666' }}>
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                      )}
                    </div>
                    <Text style={{ 
                      flex: 1,
                      color: optionIndex === question.correctIndex ? '#1f1f1f' : '#666',
                      fontWeight: optionIndex === question.correctIndex ? '500' : 'normal'
                    }}>
                      {option}
                    </Text>
                    {optionIndex === question.correctIndex && (
                      <Tag color="success" style={{ marginLeft: 'auto' }}>
                        Đáp án đúng
                      </Tag>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '16px',
          height: '200px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          border: '2px dashed #d9d9d9'
        }}>
          <FormOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '8px' }}>
            Chưa có câu hỏi nào
          </Text>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Quiz này chưa được tạo hoặc đã bị xóa
          </Text>
        </div>
      )}
    </div>
  );

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

  // Tính tổng thời lượng từ video thực tế
  const totalDuration = sections.reduce((totalSeconds, section) => {
    const sectionDuration = section.lessons?.reduce((sectionSeconds, lesson) => {
      // Lấy duration từ video hoặc videos array
      let lessonDuration = 300; // 300 giây = 5 phút mặc định
      if (lesson.video?.duration) {
        lessonDuration = lesson.video.duration;
      } else if (lesson.videos && lesson.videos.length > 0) {
        lessonDuration = lesson.videos.reduce((total, video) => total + (video.duration || 0), 0);
      }
      console.log(`Lesson "${lesson.title}" duration:`, lessonDuration, 'seconds');
      return sectionSeconds + lessonDuration;
    }, 0) || 0;
    console.log(`Section "${section.title}" total duration:`, sectionDuration, 'seconds');
    return totalSeconds + sectionDuration;
  }, 0);

  console.log('Total course duration:', totalDuration, 'seconds');
  console.log('Formatted duration:', formatDuration(totalDuration));

  // Tính giá sau giảm
  const hasDiscount = (course.discount && course.discount > 0) || (course.discount_percentage && course.discount_percentage > 0) || (course.discount_amount && course.discount_amount > 0);
  const oldPrice = course.price;
  let discountPercent = 0;
  let finalPrice = course.price;

  if (course.discount_percentage && course.discount_percentage > 0) {
    discountPercent = course.discount_percentage;
    finalPrice = Math.round(course.price * (1 - discountPercent / 100));
  } else if (course.discount_amount && course.discount_amount > 0) {
    discountPercent = Math.round((course.discount_amount / course.price) * 100);
    finalPrice = Math.max(0, course.price - course.discount_amount);
  } else if (course.discount && course.discount > 0) {
    discountPercent = course.discount;
    finalPrice = Math.round(course.price * (1 - discountPercent / 100));
  }

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
           padding: 8px 12px;
           margin-bottom: 6px;
           background: #fff;
           border: 1px solid #e8e8e8;
        }
        .lesson-item:hover {
          background: #e3f0fd;
          border-color: #1a73e8;
        }
        .lesson-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .lesson-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .lesson-actions {
          display: flex;
          gap: 8px;
        }
                 .preview-button {
           background: #1a73e8;
           border-color: #1a73e8;
           color: white;
           border-radius: 6px;
           padding: 2px 6px;
           font-size: 11px;
           height: auto;
         }
        .preview-button:hover {
          background: #1557b0;
          border-color: #1557b0;
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
                 .section-header {
           display: flex;
           align-items: center;
           justify-content: space-between;
           width: 100%;
           cursor: pointer;
           padding: 12px 16px;
           background: #fff;
           border-radius: 8px;
           border: 1px solid #e8e8e8;
           margin-bottom: 12px;
         }
        .section-header:hover {
          background: #fafafa;
        }
                 .section-title {
           display: flex;
           align-items: center;
           gap: 4px;
           font-weight: 50;
           color: #1a73e8;
           font-size: 10px;
           span {
            font-size: 20px;
           }
         }
                 .section-stats {
           display: flex;
           align-items: center;
           gap: 16px;
           color: #666;
           font-size: 12px;
         }
                 .lesson-type-icon {
           width: 16px;
           height: 16px;
           display: flex;
           align-items: center;
           justify-content: center;
           border-radius: 4px;
           background: #e3f0fd;
           color: #1a73e8;
           font-size: 10px;
        }
        @media (max-width: 900px) {
          .course-detail-main { padding: 12px 2vw 32px 2vw; }
          .lesson-content { flex-direction: column; align-items: flex-start; gap: 8px; }
          .lesson-actions { width: 100%; justify-content: flex-end; }
        }
      `}</style>
      <div className="course-detail-main">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 18, background: '#f5f7fa', border: 'none', color: '#1a73e8', fontWeight: 500 }}>Quay lại</Button>
        <Card
          className="course-detail-card"
          cover={<img alt={course.title} src={course.Image || course.thumbnail || 'https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Khóa+học'} className="course-cover" />}
          variant="borderless"
        >
          <Row gutter={[32, 32]}>
            <Col xs={24} md={16}>
              <Title level={2} style={{ color: '#1a73e8', marginBottom: 0 }}>{course.title}</Title>
              <Space style={{ margin: '8px 0 16px 0', flexWrap: 'wrap' }}>
                <span className="course-badge">{course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span>
                <Tag color="purple">{course.type || course.category?.name || ''}</Tag>
                <Tag color="cyan">{formatLevel(course.level)}</Tag>
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
                <div className="course-meta-item"><TeamOutlined style={{ color: '#1a73e8' }} />{course.students_count || 0} học viên</div>
                <div className="course-meta-item"><StarFilled style={{ color: '#faad14' }} />{course.rating ? course.rating.toFixed(1) : 'Chưa có'} <span style={{ color: '#888', fontWeight: 400 }}>({course.reviews || 0} đánh giá)</span></div>
                <div className="course-meta-item"><BookOutlined style={{ color: '#1a73e8' }} />{totalLessons} bài học</div>
                <div className="course-meta-item"><ClockCircleOutlined style={{ color: '#1a73e8' }} />{formatDuration(totalDuration)}</div>
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <Row gutter={16} style={{ marginBottom: 12 }}>
                <Col>
                  <Text strong>Yêu cầu: </Text>
                  {Array.isArray(course.requirements) && course.requirements.length > 0 ? (
                    <Space wrap>
                      {course.requirements.map((req, idx) => (
                        <Tag color="blue" key={idx}>{req}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">Không có</Text>
                  )}
                </Col>
              </Row>
              <Divider orientation="left" style={{ color: '#1a73e8', fontWeight: 600 }}>Nội dung khóa học</Divider>
              
              {sections.length === 0 ? (
                <Empty description="Chưa có chương nào." />
              ) : (
                <div>
                  {sections.map((section, sectionIndex) => {
                    const isExpanded = expandedSections.includes(section._id);
                    const sectionLessons = section.lessons || [];
                    const sectionDuration = sectionLessons.reduce((total, lesson) => {
                      let lessonDuration = 300; // 5 phút mặc định
                      if (lesson.video?.duration) {
                        lessonDuration = lesson.video.duration;
                      } else if (lesson.videos && lesson.videos.length > 0) {
                        lessonDuration = lesson.videos.reduce((total, video) => total + (video.duration || 0), 0);
                      }
                      return total + lessonDuration;
                    }, 0);
                    const previewLessons = sectionLessons.filter(lesson => lesson.is_preview).length;
                    
                    return (
                      <Card key={section._id || sectionIndex} className="section-card" variant="borderless">
                        <div 
                          className="section-header"
                          onClick={() => handleSectionToggle(section._id)}
                        >
                          <div className="section-title">
                            <BookOutlined style={{ color: '#1a73e8' }} />
                            <span>Chương {sectionIndex + 1}: {section.title}</span>
                                                         {isExpanded ? <NodeCollapseOutlined /> : <ExpandOutlined />}
                          </div>
                          <div className="section-stats">
                            <span>{sectionLessons.length} bài học</span>
                            {previewLessons > 0 && (
                              <Badge count={previewLessons} style={{ backgroundColor: '#1a73e8' }} />
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div style={{ padding: '0 16px 16px 16px' }}>
                            {section.description && (
                              <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                                {section.description}
                              </Paragraph>
                            )}
                            
                                                         {sectionLessons.length === 0 ? (
                               <Empty description="Chưa có bài học nào trong chương này." />
                             ) : (
                              <div>
                                {sectionLessons.map((lesson, lessonIndex) => (
                                  <div key={lesson._id || lessonIndex} className="lesson-item">
                                    <div className="lesson-content">
                                      <div className="lesson-info">
                                        <div className="lesson-type-icon">
                                          {(lesson.video || (lesson.videos && lesson.videos.length > 0)) ? <VideoCameraOutlined /> : lesson.quiz ? <FormOutlined /> : <FileTextOutlined />}
                                        </div>
                                        <div>
                                                                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                             <Text strong style={{ fontSize: '13px' }}>Bài {lessonIndex + 1}: {lesson.title}</Text>
                                             {lesson.is_preview && <Badge color="#1a73e8" text="Preview" />}
                                           </div>
                                                                                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#666' }}>
                                            {(lesson.video || (lesson.videos && lesson.videos.length > 0)) && (
                                              <span>
                                                <VideoCameraOutlined /> {formatDuration(
                                                  lesson.video?.duration || 
                                                  (lesson.videos && lesson.videos.length > 0 ? 
                                                    lesson.videos.reduce((total, video) => total + (video.duration || 0), 0) : 0)
                                                )}
                                              </span>
                                            )}
                                            {lesson.quiz && (
                                              <span>
                                                <FormOutlined /> {lesson.quiz.questions?.length || 0} câu hỏi
                                              </span>
                                            )}
                                            {lesson.description && (
                                              <span style={{ color: '#999' }}>{lesson.description}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                                                             <div className="lesson-actions">
                                         {/* Giảng viên có thể xem tất cả bài học */}
                                         {(lesson.video || (lesson.videos && lesson.videos.length > 0)) && (
                                           <Button
                                             type="primary"
                                             size="small"
                                             icon={<PlayCircleOutlined />}
                                             className="preview-button"
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               const videoToPreview = lesson.video || (lesson.videos && lesson.videos.length > 0 ? lesson.videos[0] : null);
                                               if (videoToPreview) {
                                                 handlePreviewVideo(videoToPreview);
                                               }
                                             }}
                                           >
                                             {lesson.is_preview ? 'Xem video' : 'Xem video (GV)'}
                                           </Button>
                                         )}
                                         {lesson.quiz && (
                                           <Button
                                             type="primary"
                                             size="small"
                                             icon={<FormOutlined />}
                                             className="preview-button"
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               handlePreviewQuiz(lesson.quiz!);
                                             }}
                                           >
                                             {lesson.is_preview ? 'Xem quiz' : 'Xem quiz (GV)'}
                                           </Button>
                                         )}
                                         {!lesson.video && (!lesson.videos || lesson.videos.length === 0) && !lesson.quiz && (
                                           <Tooltip title="Bài học này chưa có nội dung">
                                             <Button
                                               size="small"
                                               icon={<FileTextOutlined />}
                                               disabled
                                               style={{ color: '#999' }}
                                             >
                                               Chưa có nội dung
                                             </Button>
                                           </Tooltip>
                                         )}
                                       </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </Card>
                    );
                  })}
                </div>
              )}
            </Col>
            <Col xs={24} md={8}>
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card variant="borderless" style={{ background: '#f5f7fa', borderRadius: 14, boxShadow: '0 2px 8px 0 rgba(26,115,232,0.06)', marginBottom: 24 }}>
                  <Title level={5} style={{ color: '#23272f', marginBottom: 12 }}>Giảng viên</Title>
                  <Space align="start" style={{ width: '100%' }}>
                    <Tooltip title={author.fullname || author.name || ''}>
                      <Avatar
                        size={64}
                        src={course.author?.avatar && course.author.avatar !== 'default-avatar.jpg' && course.author.avatar !== '' && (course.author.avatar.includes('googleusercontent.com') || course.author.avatar.startsWith('http')) ? course.author.avatar : undefined}
                        icon={<UserOutlined />}
                      />
                    </Tooltip>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ color: '#1a73e8', fontSize: 18 }}>{author.fullname || author.name || ''}</Text>
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

      {/* Modal xem trước video/quiz */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {previewContent?.type === 'video' ? (
              <>
                <VideoCameraOutlined style={{ color: '#1a73e8', fontSize: '20px' }} />
                <span>Xem trước Video</span>
              </>
            ) : (
              <>
                <FormOutlined style={{ color: '#1a73e8', fontSize: '20px' }} />
                <span>Xem trước Quiz</span>
              </>
            )}
          </div>
        }
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false);
          setPreviewContent(null);
        }}
        footer={null}
        width={900}
        style={{ top: 20 }}
        bodyStyle={{ 
          padding: '24px 0',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        destroyOnClose
      >
        {previewContent?.type === 'video' && renderVideoPreview(previewContent.data)}
        {previewContent?.type === 'quiz' && renderQuizPreview(previewContent.data)}
      </Modal>
    </motion.div>
  );
};

export default CourseDetail;
