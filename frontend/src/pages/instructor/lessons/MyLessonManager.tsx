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
  Modal,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import QuizQuestionForm from './QuizQuestionForm';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { DraggableProvided, DraggableStateSnapshot, DroppableProvided } from '@hello-pangea/dnd';
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
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [quizPreviewQuestions, setQuizPreviewQuestions] = useState<QuizQuestion[] | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [reorderedLessons, setReorderedLessons] = useState<Lesson[] | null>(null);


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
    console.log('Chọn chương (section_id):', value);
  };

  const handlePreviewVideo = (url: string) => {
    setVideoPreviewUrl(url);
    setIsVideoModalOpen(true);
  };
  const handlePreviewQuiz = (questions: QuizQuestion[]) => {
    setQuizPreviewQuestions(questions);
    setIsQuizModalOpen(true);
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

  const selectedSectionTitle = sections.find(s => s._id === selectedSection)?.title || "";

  // Xử lý kéo thả bài học và tự động lưu thứ tự mới
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const section = sections.find(s => s._id === selectedSection);
    if (!section) return;
    const lessons = Array.from(section.lessons);
    const [removed] = lessons.splice(result.source.index, 1);
    lessons.splice(result.destination.index, 0, removed);
    // Cập nhật lại position tạm thời trên giao diện
    setReorderedLessons(lessons.map((l: Lesson, idx: number) => ({ ...l, position: idx })));

    // Gọi API lưu thứ tự mới ngay sau khi kéo thả
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const body = {
        lessons: lessons.map((l: Lesson, idx: number) => ({ id: l._id, position: idx }))
      };
      const response = await fetch(`${apiUrl}/lessons/section/${selectedSection}/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      message.success('Cập nhật thứ tự bài học thành công!');
      // Refresh lại sections để lấy thứ tự mới từ server
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
            setReorderedLessons(null);
          }
        }
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Có lỗi khi lưu thứ tự bài học');
    } finally {
      // Không cần setSavingOrder nữa
    }
  };

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
                    {course.title} {course.status === 'draft' && '(Chưa xuất bản)'}
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
            2. Thêm bài học: <Text type="success">{selectedSectionTitle}</Text>
          </Title>
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={async (values) => {
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
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                // Lấy đúng trường title, is_preview từ từng lesson
                const lessons = (values.lessons || []).map((lesson: LessonFormData) => ({
                  title: lesson.title,
                  is_preview: lesson.is_preview || false,
                  section_id: selectedSection,
                  video: lesson.video,
                  quiz: lesson.quiz
                }));
                // Validate trước khi gửi
                if (lessons.some((l: LessonFormData) => !l.title || !l.section_id)) {
                  message.error("Vui lòng nhập đầy đủ tiêu đề bài học và chọn chương!");
                  setLoading(false);
                  return;
                }
                console.log('lessons gửi lên:', lessons);
                const response = await fetch(`${apiUrl}/lessons`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                  body: JSON.stringify({ lessons }),
                });
                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(errorText);
                }
                message.success("Tạo các bài học thành công!");
                form.resetFields(['lessons']);
                // Refresh sections để hiển thị bài học mới
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
              } catch (error) {
                console.error("Lỗi tạo bài học:", error);
                message.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo bài học");
              } finally {
                setLoading(false);
              }
            }}
            onFinishFailed={(errorInfo) => {
              console.log('Failed:', errorInfo);
              message.error('Vui lòng kiểm tra và điền đầy đủ tất cả các trường bắt buộc!');
            }}
            initialValues={{
              lessons: [
                {
                  is_preview: false,
                  video: { duration: 0 },
                  quiz: { questions: [] }
                }
              ]
            }}
          >
            <Form.List name="lessons">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, lessonIndex) => (
                    <Card key={key} style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item 
                            {...restField}
                            label="Tiêu đề bài học" 
                            name={[name, "title"]} 
                            rules={[
                              { required: true, message: "Vui lòng nhập tiêu đề bài học!" },
                              { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự!" }
                            ]}
                          > 
                            <Input placeholder="Ví dụ: Giới thiệu về React Components" size="large" /> 
                          </Form.Item>
                          <Form.Item 
                            {...restField}
                            name={[name, "is_preview"]} 
                            valuePropName="checked"
                          > 
                            <Checkbox>Cho phép xem trước (Preview)</Checkbox> 
                          </Form.Item>
                          <Divider>Video bài học</Divider>
                          <Form.Item 
                            {...restField}
                            label="File video" 
                            name={[name, "video", "file"]} 
                            valuePropName="fileList" 
                            getValueFromEvent={(e: unknown) => {
                              if (Array.isArray(e)) return e;
                              if (e && typeof e === 'object' && 'fileList' in e) {
                                return (e as { fileList: unknown }).fileList;
                              }
                              return e;
                            }}
                            rules={[{ required: true, message: "Vui lòng tải lên video bài học!" }]}
                          >
                            <Upload 
                              listType="text" 
                              maxCount={1} 
                              beforeUpload={() => false}
                              accept="video/*"
                              onChange={(info) => {
                                const fileList = info.fileList;
                                if (fileList && fileList.length > 0 && fileList[0].originFileObj) {
                                  const file = fileList[0].originFileObj;
                                  const url = URL.createObjectURL(file);
                                  const video = document.createElement('video');
                                  video.preload = 'metadata';
                                  video.src = url;
                                  video.onloadedmetadata = () => {
                                    const duration = Math.round(video.duration);
                                    const lessons = form.getFieldValue('lessons');
                                    lessons[name] = {
                                      ...lessons[name],
                                      video: { ...lessons[name].video, duration }
                                    };
                                    form.setFieldsValue({ lessons });
                                    URL.revokeObjectURL(url);
                                  };
                                }
                              }}
                            >
                              <Button icon={<UploadOutlined />}>Tải video lên</Button>
                            </Upload>
                          </Form.Item>
                          <Form.Item 
                            {...restField}
                            label="Thời lượng video (giây)" 
                            name={[name, "video", "duration"]} 
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
                          <Form.List name={[name, "quiz", "questions"]}>
                            {(quizFields, { add: addQuiz, remove: removeQuiz }) => (
                              <>
                                {quizFields.map(({ key: quizKey, name: quizName }) => (
                                  <QuizQuestionForm 
                                    key={quizKey} 
                                    name={quizName} 
                                    lessonIndex={lessonIndex}
                                    onRemove={() => removeQuiz(quizName)} 
                                  />
                                ))}
                                <Form.Item> 
                                  <Button 
                                    type="dashed" 
                                    onClick={() => addQuiz()} 
                                    block 
                                    icon={<PlusOutlined />}
                                  >
                                    Thêm câu hỏi
                                  </Button> 
                                </Form.Item>
                              </>
                            )}
                          </Form.List>
                          <Button danger type="text" onClick={() => remove(name)} style={{ marginTop: 8 }}>
                            Xóa bài học này
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Form.Item> 
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      Thêm bài học
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
                Tạo các bài học
              </Button> 
            </Form.Item>
          </Form>
        </Card>
      )}

      {selectedSection && sections.find(s => s._id === selectedSection)?.lessons && sections.find(s => s._id === selectedSection)!.lessons.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>Danh sách bài học hiện tại</Title>
          <div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="lessons-list">
                {(provided: DroppableProvided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {(reorderedLessons || sections.find(s => s._id === selectedSection)!.lessons)
                      .sort((a: Lesson, b: Lesson) => a.position - b.position)
                      .map((lesson: Lesson, index: number) => (
                        <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                padding: '12px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '6px',
                                marginBottom: '8px',
                                backgroundColor: snapshot.isDragging ? '#e6f7ff' : '#fafafa',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span {...provided.dragHandleProps} style={{ cursor: 'grab', marginRight: 8, fontSize: 18 }}>☰</span>
                                  <Text strong>Bài {index + 1}: {lesson.title}</Text>
                                  {lesson.is_preview && (
                                    <Text type="success" style={{ marginLeft: 8 }}>
                                      (Xem trước)
                                    </Text>
                                  )}
                                </div>
                                <div style={{ marginTop: 8 }}>
                                  {lesson.video ? (
                                    <>
                                      <Text type="secondary">
                                        📹 Video: {Math.floor(lesson.video.duration / 60)}:{String(lesson.video.duration % 60).padStart(2, '0')}
                                      </Text>
                                      <Button size="small" style={{ marginLeft: 8 }} onClick={() => handlePreviewVideo(lesson.video!.url)}>
                                        Xem video
                                      </Button>
                                    </>
                                  ) : (
                                    <Text type="warning">⚠️ Chưa có video</Text>
                                  )}
                                  {lesson.quiz ? (
                                    <>
                                      <Text type="secondary" style={{ marginLeft: 16 }}>
                                        📝 Quiz: {lesson.quiz.questions.length} câu hỏi
                                      </Text>
                                      <Button size="small" style={{ marginLeft: 8 }} onClick={() => handlePreviewQuiz(lesson.quiz!.questions)}>
                                        Xem quiz
                                      </Button>
                                    </>
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
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </Card>
      )}
      {/* Modal xem trước video */}
      <Modal
        open={isVideoModalOpen}
        onCancel={() => setIsVideoModalOpen(false)}
        footer={null}
        title="Xem trước video bài học"
        width={800}
        destroyOnHidden
      >
        {videoPreviewUrl && (
          <video src={videoPreviewUrl} controls style={{ width: '100%' }} />
        )}
      </Modal>
      {/* Modal xem trước quiz */}
      <Modal
        open={isQuizModalOpen}
        onCancel={() => setIsQuizModalOpen(false)}
        footer={null}
        title="Xem trước quiz bài học"
        width={600}
        destroyOnHidden
      >
        {quizPreviewQuestions && quizPreviewQuestions.length > 0 ? (
          <div>
            {quizPreviewQuestions.map((q, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <Text strong>Câu {idx + 1}: {q.question}</Text>
                <ul style={{ margin: '8px 0 0 16px' }}>
                  {q.options.map((opt, oidx) => (
                    <li key={oidx} style={{ color: oidx === q.correctIndex ? 'green' : undefined }}>
                      {String.fromCharCode(65 + oidx)}. {opt} {oidx === q.correctIndex && <b>(Đáp án đúng)</b>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <Text type="secondary">Quiz này chưa có câu hỏi nào.</Text>
        )}
      </Modal>
    </div>
  );
};

export default MyLessonManager; 