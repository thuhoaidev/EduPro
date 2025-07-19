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
  Divider,
  Button,
  Modal,
  Input,
  Space,
  Popconfirm
} from "antd";
import { CaretRightOutlined, VideoCameraOutlined, PlusOutlined, DragOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
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

interface AddLessonFormValues {
  section_id: string;
  title: string;
}

interface EditLessonFormValues {
  title: string;
}

const MyLessonManager: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  
  // Thêm state cho modal thêm bài học
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [addLessonForm] = Form.useForm();
  const [addingLesson, setAddingLesson] = useState(false);

  // Thêm state cho modal sửa bài học
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [editLessonForm] = Form.useForm();
  const [editingLesson, setEditingLesson] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

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
      }
    };

    fetchSections();
  }, [selectedCourse]);

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
  };

  // Hàm mở modal thêm bài học
  const handleAddLesson = (sectionId: string) => {
    addLessonForm.resetFields();
    addLessonForm.setFieldsValue({ section_id: sectionId });
    setIsAddLessonModalOpen(true);
  };

  // Hàm đóng modal thêm bài học
  const handleCancelAddLesson = () => {
    setIsAddLessonModalOpen(false);
    addLessonForm.resetFields();
  };

  // Hàm thêm bài học
  const handleSubmitAddLesson = async (values: AddLessonFormValues) => {
    try {
      setAddingLesson(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessons: [{
            section_id: values.section_id,
            title: values.title,
            is_preview: false
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thêm bài học');
      }

      const data = await response.json();
      if (data.success) {
        message.success('Thêm bài học thành công!');
        setIsAddLessonModalOpen(false);
        addLessonForm.resetFields();
        
        // Refresh lại danh sách chương để hiển thị bài học mới
        if (selectedCourse) {
          const refreshResponse = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setSections(refreshData.data);
            }
          }
        }
      } else {
        throw new Error(data.message || 'Không thể thêm bài học');
      }
    } catch (error) {
      console.error('Lỗi khi thêm bài học:', error);
      message.error(error instanceof Error ? error.message : 'Không thể thêm bài học');
    } finally {
      setAddingLesson(false);
    }
  };

  // Hàm mở modal sửa bài học
  const handleEditLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    editLessonForm.resetFields();
    editLessonForm.setFieldsValue({ title: lesson.title });
    setIsEditLessonModalOpen(true);
  };

  // Hàm đóng modal sửa bài học
  const handleCancelEditLesson = () => {
    setIsEditLessonModalOpen(false);
    editLessonForm.resetFields();
    setCurrentLesson(null);
  };

  // Hàm sửa bài học
  const handleSubmitEditLesson = async (values: EditLessonFormValues) => {
    if (!currentLesson) return;

    try {
      setEditingLesson(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/lessons/${currentLesson._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: values.title,
          is_preview: currentLesson.is_preview
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật bài học');
      }

      const data = await response.json();
      if (data.success) {
        message.success('Cập nhật bài học thành công!');
        setIsEditLessonModalOpen(false);
        editLessonForm.resetFields();
        setCurrentLesson(null);
        
        // Refresh lại danh sách chương để hiển thị bài học đã cập nhật
        if (selectedCourse) {
          const refreshResponse = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setSections(refreshData.data);
            }
          }
        }
      } else {
        throw new Error(data.message || 'Không thể cập nhật bài học');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật bài học:', error);
      message.error(error instanceof Error ? error.message : 'Không thể cập nhật bài học');
    } finally {
      setEditingLesson(false);
    }
  };

  // Hàm xóa bài học
  const handleDeleteLesson = async (lesson: Lesson) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/lessons/${lesson._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa bài học');
      }

      const data = await response.json();
      if (data.success) {
        message.success('Xóa bài học thành công!');
        
        // Refresh lại danh sách chương để hiển thị bài học đã xóa
        if (selectedCourse) {
          const refreshResponse = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setSections(refreshData.data);
            }
          }
        }
      } else {
        throw new Error(data.message || 'Không thể xóa bài học');
      }
    } catch (error) {
      console.error('Lỗi khi xóa bài học:', error);
      message.error(error instanceof Error ? error.message : 'Không thể xóa bài học');
    }
  };

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
                  extra={
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddLesson(section._id);
                      }}
                      title="Thêm bài học"
                    />
                  }
                >
                  {section.lessons.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text type="secondary">Chưa có bài học nào trong chương này.</Text>
                      <br />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddLesson(section._id)}
                        style={{ marginTop: 8 }}
                        title="Thêm bài học đầu tiên"
                      />
                    </div>
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
                          <DragOutlined style={{ color: '#999', cursor: 'grab' }} />
                          <Text strong>Bài {index + 1}: {lesson.title}</Text>
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
                          <Space style={{ marginLeft: 'auto' }}>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditLesson(lesson)}
                              title="Sửa bài học"
                            />
                            <Popconfirm
                              title="Xóa bài học"
                              description="Bạn có chắc chắn muốn xóa bài học này không?"
                              onConfirm={() => handleDeleteLesson(lesson)}
                              okText="Có"
                              cancelText="Không"
                            >
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                title="Xóa bài học"
                              />
                            </Popconfirm>
                          </Space>
                        </div>
                      ))
                  )}
                </Panel>
              ))}
            </Collapse>
          </Card>
        )}
      </Card>

      {/* Modal thêm bài học */}
      <Modal
        title="Thêm bài học mới"
        open={isAddLessonModalOpen}
        onCancel={handleCancelAddLesson}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={addLessonForm}
          layout="vertical"
          onFinish={handleSubmitAddLesson}
        >
          <Form.Item
            name="section_id"
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tiêu đề bài học"
            name="title"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề bài học!' },
              { min: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tiêu đề bài học" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancelAddLesson}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={addingLesson}
              >
                Thêm bài học
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa bài học */}
      <Modal
        title="Sửa bài học"
        open={isEditLessonModalOpen}
        onCancel={handleCancelEditLesson}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={editLessonForm}
          layout="vertical"
          onFinish={handleSubmitEditLesson}
        >
          <Form.Item
            label="Tiêu đề bài học"
            name="title"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề bài học!' },
              { min: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tiêu đề bài học" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancelEditLesson}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={editingLesson}
              >
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyLessonManager; 