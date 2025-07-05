import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Input,
  Checkbox,
  Space,
  Select,
  Row,
  Col,
  Typography,
  message,
  Upload,
  InputNumber,
  Divider,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import QuizQuestionForm from './QuizQuestionForm';
const { Title, Text } = Typography;
const { Option } = Select;

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

interface LessonFormData {
  title: string;
  is_preview: boolean;
  section_id: string;
  video: {
    file?: Array<{
      originFileObj: File;
      uid: string;
      name: string;
      status: string;
      url?: string;
    }>;
    duration: number;
  };
  quiz: {
    questions: QuizQuestion[];
  };
}

const MyLessonManager: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);


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
        const response = await fetch(`${apiUrl}/courses?instructor=true&includeDraft=true`, {
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
        setSectionsLoading(true);
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
        } else {
          throw new Error(data.message || 'Không thể tải danh sách chương');
        }
      } catch (error) {
        console.error('Lỗi khi tải chương:', error);
        message.error('Không thể tải danh sách chương');
      } finally {
        setSectionsLoading(false);
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
  
  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
    form.setFieldsValue({ section_id: value });
    console.log('Section changed to:', value);
  };

  const onFinish = async (values: LessonFormData) => {
    if (!selectedCourse) {
      message.error("Vui lòng chọn khóa học!");
      return;
    }
    
    if (!selectedSection) {
      message.error("Vui lòng chọn chương!");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Tạo bài học
      console.log('Form values:', values);
      console.log('Selected section:', selectedSection);
      console.log('Values section_id:', values.section_id);
      
      const lessonData = {
        title: values.title,
        is_preview: values.is_preview || false,
        section_id: values.section_id || selectedSection
      };
      
      console.log('Sending lesson data:', lessonData);
      console.log('Token:', localStorage.getItem("token"));
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('Full URL:', `${import.meta.env.VITE_API_URL}/lessons`);
      
      // Debug token và user info
      const token = localStorage.getItem("token");
      const userInfo = localStorage.getItem("user");
      const parsedUser = userInfo ? JSON.parse(userInfo) : null;
      console.log('User info from localStorage:', parsedUser);
      console.log('User roles:', parsedUser?.roles);
      console.log('User role:', parsedUser?.role);
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
        } catch {
          console.log('Cannot decode token');
        }
      }
      
      // Fallback URL nếu VITE_API_URL không có
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('Using API URL:', apiUrl);
      
      const lessonResponse = await fetch(`${apiUrl}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(lessonData),
      });
      
      console.log('Lesson response status:', lessonResponse.status);
      console.log('Lesson response headers:', Object.fromEntries(lessonResponse.headers.entries()));
      
      if (!lessonResponse.ok) {
        const errorText = await lessonResponse.text();
        console.error('Lesson creation error:', errorText);
        let errorMessage = "Có lỗi xảy ra khi tạo bài học";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `${errorMessage}: ${lessonResponse.status} ${lessonResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const contentType = lessonResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await lessonResponse.text();
        console.error('Non-JSON lesson response:', errorText);
        throw new Error('Server trả về dữ liệu không hợp lệ');
      }
      
      const lessonResult = await lessonResponse.json();
      const lessonId = lessonResult.data._id;
      
      // 2. Upload video
      if (values.video?.file?.[0]?.originFileObj) {
        const videoFormData = new FormData();
        videoFormData.append('lesson_id', lessonId);
        videoFormData.append('duration', values.video.duration.toString());
        videoFormData.append('video', values.video.file[0].originFileObj);
        
        const videoResponse = await fetch(`${apiUrl}/videos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: videoFormData,
        });
        
        if (!videoResponse.ok) {
          const errorText = await videoResponse.text();
          console.error('Video upload error:', errorText);
          let errorMessage = "Có lỗi xảy ra khi tải lên video";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = `${errorMessage}: ${videoResponse.status} ${videoResponse.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        const contentType = videoResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await videoResponse.text();
          console.error('Non-JSON video response:', errorText);
          throw new Error('Server trả về dữ liệu không hợp lệ');
        }
        
        const videoResult = await videoResponse.json();
        const videoId = videoResult.data._id;
        
        // 3. Tạo quiz nếu có câu hỏi
        if (values.quiz?.questions && values.quiz.questions.length > 0) {
          // Validate quiz data
          const validQuizQuestions = values.quiz.questions.filter(q => 
            q.question && 
            q.options && 
            q.options.length >= 2 && 
            q.options.length <= 4 &&
            typeof q.correctIndex === 'number' &&
            q.correctIndex >= 0 &&
            q.correctIndex < q.options.length
          );
          
          if (validQuizQuestions.length !== values.quiz.questions.length) {
            throw new Error("Dữ liệu quiz không hợp lệ. Mỗi câu hỏi cần có ít nhất 2 đáp án và tối đa 4 đáp án.");
          }
          
          // Xử lý dữ liệu quiz
          const quizQuestions = validQuizQuestions.map(q => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex
          }));
          
          const quizData = {
            video_id: videoId,
            questions: quizQuestions
          };
          
          const quizResponse = await fetch(`${apiUrl}/quizzes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(quizData),
          });
          
          if (!quizResponse.ok) {
            const errorText = await quizResponse.text();
            console.error('Quiz creation error:', errorText);
            let errorMessage = "Có lỗi xảy ra khi tạo quiz";
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;
            } catch {
              errorMessage = `${errorMessage}: ${quizResponse.status} ${quizResponse.statusText}`;
            }
            throw new Error(errorMessage);
          }
        }
      }
      
      message.success("Tạo bài học thành công!");
      form.resetFields();
      setSelectedSection("");
      
      // Refresh sections để hiển thị bài học mới
      if (selectedCourse) {
        const sectionsResponse = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (sectionsResponse.ok) {
          const contentType = sectionsResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const sectionsData = await sectionsResponse.json();
            if (sectionsData.success) {
              setSections(sectionsData.data);
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi tạo bài học:", error);
      message.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo bài học");
    } finally {
      setLoading(false);
    }
  };

  const selectedSectionTitle = sections.find(s => s._id === selectedSection)?.title || "";

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quản lý bài học</Title>
      <Text type="secondary">Thêm bài học cho từng chương trong khóa học của bạn.</Text>
      
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>1. Chọn Khóa học & Chương</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Khóa học">
              <Select 
                placeholder="Chọn khóa học" 
                onChange={handleCourseChange} 
                value={selectedCourse}
                loading={coursesLoading}
                disabled={coursesLoading}
              >
                {courses.map(course => (
                  <Option key={course._id} value={course._id}>
                    {course.title} {course.status === 'draft' && '(Nháp)'}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Chương">
              <Select 
                placeholder="Chọn chương" 
                disabled={!selectedCourse || sectionsLoading} 
                onChange={handleSectionChange} 
                value={selectedSection}
                loading={sectionsLoading}
              >
                {sections.map(section => (
                  <Option key={section._id} value={section._id}>
                    {section.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {selectedSection && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>
            2. Thêm bài học cho chương: <Text type="success">{selectedSectionTitle}</Text>
          </Title>
          
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={onFinish}
            onFinishFailed={(errorInfo) => {
              console.log('Failed:', errorInfo);
              message.error('Vui lòng kiểm tra và điền đầy đủ tất cả các trường bắt buộc!');
            }}
            initialValues={{
              is_preview: false,
              section_id: selectedSection,
              video: {
                duration: 0
              },
              quiz: {
                questions: []
              }
            }}
          >
            <Form.Item 
              label="Tiêu đề bài học" 
              name="title" 
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề bài học!" },
                { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự!" }
              ]}
            > 
              <Input placeholder="Ví dụ: Giới thiệu về React Components" size="large" /> 
            </Form.Item>
            
            <Form.Item 
              name="is_preview" 
              valuePropName="checked"
            > 
              <Checkbox>Cho phép xem trước (Preview)</Checkbox> 
            </Form.Item>
            
            <Divider>Video bài học</Divider>
            <Form.Item 
              label="File video" 
              name={["video", "file"]} 
              valuePropName="fileList" 
              getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
              rules={[{ required: true, message: "Vui lòng tải lên video bài học!" }]}
            >
              <Upload 
                listType="text" 
                maxCount={1} 
                beforeUpload={() => false}
                accept="video/*"
              >
                <Button icon={<UploadOutlined />}>Tải video lên</Button>
              </Upload>
            </Form.Item>
            
            <Form.Item 
              label="Thời lượng video (giây)" 
              name={["video", "duration"]} 
              rules={[
                { required: true, message: "Vui lòng nhập thời lượng video!" },
                { type: 'number', min: 1, message: 'Thời lượng phải lớn hơn 0!' }
              ]}
            > 
              <InputNumber 
                style={{ width: "100%" }} 
                min={1} 
                size="large" 
                placeholder="Ví dụ: 300 (5 phút)" 
              /> 
            </Form.Item>
            
            <Divider>Bài quiz (Tùy chọn)</Divider>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Tạo bài quiz để kiểm tra kiến thức học viên sau khi xem video. Mỗi câu hỏi cần có ít nhất 2 đáp án và tối đa 4 đáp án.
            </Text>
            <Form.List name={["quiz", "questions"]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <QuizQuestionForm 
                      key={key} 
                      name={name} 
                      onRemove={() => remove(name)} 
                    />
                  ))}
                  <Form.Item> 
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      Thêm câu hỏi
                    </Button> 
                  </Form.Item>
                </>
              )}
            </Form.List>
            
            <Form.Item style={{ marginTop: 24 }}> 
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large"
                loading={loading}
              >
                Tạo bài học
              </Button> 
            </Form.Item>
          </Form>
        </Card>
      )}

      {selectedSection && sections.find(s => s._id === selectedSection)?.lessons && sections.find(s => s._id === selectedSection)!.lessons.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>Danh sách bài học hiện tại</Title>
          <div>
            {sections
              .find(s => s._id === selectedSection)!
              .lessons
              .sort((a, b) => a.position - b.position)
              .map((lesson, index) => (
                <div 
                  key={lesson._id} 
                  style={{ 
                    padding: '12px', 
                    border: '1px solid #d9d9d9', 
                    borderRadius: '6px', 
                    marginBottom: '8px',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div>
                        <Text strong>Bài {index + 1}: {lesson.title}</Text>
                        {lesson.is_preview && (
                          <Text type="success" style={{ marginLeft: 8 }}>
                            (Xem trước)
                          </Text>
                        )}
                      </div>
                      
                      <div style={{ marginTop: 8 }}>
                        {lesson.video ? (
                          <Text type="secondary">
                            📹 Video: {Math.floor(lesson.video.duration / 60)}:{String(lesson.video.duration % 60).padStart(2, '0')}
                          </Text>
                        ) : (
                          <Text type="warning">⚠️ Chưa có video</Text>
                        )}
                        
                        {lesson.quiz ? (
                          <Text type="secondary" style={{ marginLeft: 16 }}>
                            📝 Quiz: {lesson.quiz.questions.length} câu hỏi
                          </Text>
                        ) : (
                          <Text type="warning" style={{ marginLeft: 16 }}>⚠️ Chưa có quiz</Text>
                        )}
                      </div>
                    </div>
                    
                    <Space>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/instructor/lessons/edit/${lesson._id}`)}
                      >
                        Chỉnh sửa
                      </Button>
                    </Space>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MyLessonManager; 