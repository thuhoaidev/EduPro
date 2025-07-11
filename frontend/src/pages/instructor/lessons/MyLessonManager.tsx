import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Row,
  Col,
  Typography,
  message,
  Badge,
  Tag,
  Collapse,
  Divider
} from "antd";
import { CaretRightOutlined, VideoCameraOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface Course {
  _id: string;
  title: string;
  slug: string;
  status: string;
}

interface Section {
  _id: string;
  title: string;
  position: number;
  lessons: Lesson[];
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
  correctIndex: number;
}

const MyLessonManager: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  // Đã xóa các biến không dùng: isVideoModalOpen, isQuizModalOpen, quizModalLesson, quizForm, handleSectionChange, handlePreviewVideo, handlePreviewQuiz, handleDragEnd


  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/lessons/test`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log('API test result:', data);
      } catch (error) {
        console.error('API test error:', error);
      }
    };
    testAPI();
  }, []);

  // Lấy danh sách khóa học của instructor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/courses/instructor`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Không thể tải danh sách khóa học: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await response.text();
          console.error('Non-JSON response:', errorText);
          throw new Error('Server trả về dữ liệu không hợp lệ');
        }
        
        const data = await response.json();
        if (data.success) {
          setCourses(data.data);
        } else {
          throw new Error(data.message || 'Không thể tải danh sách khóa học');
        }
      } catch (error) {
        console.error('Lỗi khi tải khóa học:', error);
        message.error('Không thể tải danh sách khóa học');
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Lấy danh sách chương khi chọn khóa học
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedCourse) {
        setSections([]);
        return;
      }

      try {
        // setSectionsLoading(true); // Không dùng nữa
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Không thể tải danh sách chương: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await response.text();
          console.error('Non-JSON response:', errorText);
          throw new Error('Server trả về dữ liệu không hợp lệ');
        }
        
        const data = await response.json();
        if (data.success) {
          setSections(data.data);
          console.log('Sections trả về:', data.data);
          if (!data.data || data.data.length === 0) {
            message.warning('Khóa học này chưa có chương nào. Hãy tạo chương trước khi thêm bài học!');
          }
        } else {
          throw new Error(data.message || 'Không thể tải danh sách chương');
        }
      } catch (error) {
        console.error('Lỗi khi tải chương:', error);
        message.error('Không thể tải danh sách chương');
      } finally {
        // setSectionsLoading(false); // Không dùng nữa
      }
    };

    fetchSections();
  }, [selectedCourse]);

  // Cập nhật form khi selectedSection thay đổi
  useEffect(() => {
    if (selectedSection) {
      form.setFieldsValue({ section_id: selectedSection });
      console.log('Form updated with section_id:', selectedSection);
    }
  }, [selectedSection, form]);

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    setSelectedSection(null);
    form.resetFields(['section_id']);
  };
  
  // Hàm xử lý khi chọn file video để tự động lấy duration
  // const handleVideoFileChange = (info: {
  //   fileList: {
  //     originFileObj?: File;
  //     [key: string]: any;
  //   }[];
  // }) => {
  //   const fileList = info.fileList;
  //   if (fileList && fileList.length > 0 && fileList[0].originFileObj) {
  //     const file = fileList[0].originFileObj;
  //     const url = URL.createObjectURL(file);
  //     const video = document.createElement('video');
  //     video.preload = 'metadata';
  //     video.src = url;
  //     video.onloadedmetadata = () => {
  //       const duration = Math.round(video.duration);
  //       form.setFieldsValue({ video: { ...form.getFieldValue('video'), duration } });
  //       URL.revokeObjectURL(url);
  //     };
  //   }
  // };

  // Đã xóa: selectedSectionTitle, handleDragEnd

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: 0 }}>Danh sách chương & bài học</Title>
        <Text type="secondary">Chọn khóa học để xem danh sách chương và bài học.</Text>
        <Divider />
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card size="small" style={{ background: '#f0f9ff' }}>
              <Form.Item label={<Text strong>Khóa học</Text>} style={{ marginBottom: 0 }}>
                <Select
                  placeholder="Chọn khóa học"
                  onChange={handleCourseChange}
                  value={selectedCourse}
                  loading={coursesLoading}
                  disabled={coursesLoading}
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                >
                  {courses.map(course => (
                    <Option key={course._id} value={course._id}>
                      {course.title} {course.status === 'draft' && <Tag color="orange">Nháp</Tag>}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
        {selectedCourse && sections.length > 0 && (
          <Card style={{ marginBottom: 32 }}>
            <Title level={4} style={{ color: '#52c41a' }}>Danh sách chương & bài học</Title>
            <Collapse
              defaultActiveKey={sections.map(s => s._id)}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              style={{ background: 'transparent' }}
            >
              {sections.map(section => (
                <Panel
                  key={section._id}
                  header={
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Text strong style={{ fontSize: 16 }}>{section.title}</Text>
                      <Badge count={section.lessons.length} style={{ backgroundColor: '#1890ff' }}>
                        <Tag color="blue">Bài học</Tag>
                      </Badge>
                    </span>
                  }
                  style={{ marginBottom: 8, border: '1px solid #d9d9d9', borderRadius: 8 }}
                >
                  {section.lessons.length === 0 ? (
                    <Text type="secondary">Chưa có bài học nào trong chương này.</Text>
                  ) : (
                    section.lessons
                      .sort((a: Lesson, b: Lesson) => a.position - b.position)
                      .map((lesson: Lesson, index: number) => (
                        <div key={lesson._id} style={{
                          padding: '12px',
                          border: '1px solid #d9d9d9',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          backgroundColor: '#fafafa',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16
                        }}>
                          <Text strong>Bài {index + 1}: {lesson.title}</Text>
                          {lesson.is_preview && (
                            <></>
                          )}
                          {lesson.video ? (
                            <Tag color="blue" icon={<VideoCameraOutlined />}>Đã có video</Tag>
                          ) : (
                            <Tag color="orange" icon={<VideoCameraOutlined />}>Chưa có video</Tag>
                          )}
                          {lesson.quiz ? (
                            <Tag color="purple">Quiz: {lesson.quiz.questions.length} câu hỏi</Tag>
                          ) : (
                            <Tag color="orange" style={{ marginLeft: 8 }}>Chưa có quiz</Tag>
                          )}
                        </div>
                      ))
                  )}
                </Panel>
              ))}
            </Collapse>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default MyLessonManager; 