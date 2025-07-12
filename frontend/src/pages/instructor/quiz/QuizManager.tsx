import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, Select, Spin, Form, Input, Space, message, Row, Col, Tag, Tooltip, Badge, Collapse, Checkbox } from 'antd';
import { FileOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CaretRightOutlined, QuestionCircleOutlined, DragOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Course {
  _id: string;
  title: string;
}

interface Section {
  _id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  _id: string;
  title: string;
  video?: {
    _id: string;
    url: string;
    duration: number;
  };
  quiz?: {
    _id: string;
    questions: QuizQuestion[];
  };
  section_id?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizItem {
  _id: string;
  questions: QuizQuestion[];
  lessonTitle: string;
  sectionTitle: string;
  courseId: string | null;
}

interface QuizFormQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// Component cho từng câu hỏi có thể kéo thả
interface SortableQuestionItemProps {
  question: QuizFormQuestion;
  index: number;
  quizQuestions: QuizFormQuestion[];
  setQuizQuestions: React.Dispatch<React.SetStateAction<QuizFormQuestion[]>>;
  showDragHandle?: boolean;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({ 
  question, 
  index, 
  quizQuestions, 
  setQuizQuestions, 
  showDragHandle = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card size="small" style={{ marginBottom: 16, border: '1px solid #d9d9d9' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          {showDragHandle && (
            <div 
              {...attributes} 
              {...listeners}
              style={{ 
                cursor: 'grab',
                padding: '8px',
                marginTop: '8px',
                borderRadius: '4px',
                border: '1px dashed #d9d9d9',
                backgroundColor: '#fafafa'
              }}
              title="Kéo để di chuyển câu hỏi"
            >
              <DragOutlined style={{ fontSize: '16px', color: '#666' }} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <Form.Item label={`Câu hỏi ${index + 1}`} required style={{ marginBottom: '8px' }}>
              <Input 
                value={question.question} 
                onChange={e => {
                  const arr = [...quizQuestions];
                  arr[index].question = e.target.value;
                  setQuizQuestions(arr);
                }}
                placeholder="Nhập câu hỏi..."
              />
            </Form.Item>
            <Form.Item label="Đáp án" style={{ marginBottom: '8px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {question.options.map((opt: string, oidx: number) => (
                  <div key={oidx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      checked={question.correctIndex === oidx}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const arr = [...quizQuestions];
                          arr[index].correctIndex = oidx;
                          setQuizQuestions(arr);
                        }
                      }}
                    />
                    <Input
                      value={opt}
                      placeholder={`Đáp án ${String.fromCharCode(65 + oidx)}`}
                      onChange={e => {
                        const arr = [...quizQuestions];
                        arr[index].options[oidx] = e.target.value;
                        setQuizQuestions(arr);
                      }}
                      style={{ flex: 1 }}
                    />
                  </div>
                ))}
                {question.options.length < 4 && (
                  <Button 
                    size="small" 
                    onClick={() => {
                      const arr = [...quizQuestions];
                      arr[index].options.push('');
                      setQuizQuestions(arr);
                    }}
                  >
                    Thêm đáp án
                  </Button>
                )}
              </Space>
            </Form.Item>
          </div>
        </div>
        {quizQuestions.length > 1 && (
          <Button 
            type="text" 
            danger 
            size="small"
            onClick={() => {
              const arr = [...quizQuestions];
              arr.splice(index, 1);
              setQuizQuestions(arr);
            }}
          >
            Xóa câu hỏi
          </Button>
        )}
      </Card>
    </div>
  );
};

// Component tái sử dụng cho form câu hỏi với khả năng sắp xếp
interface QuestionFormProps {
  quizQuestions: QuizFormQuestion[];
  setQuizQuestions: React.Dispatch<React.SetStateAction<QuizFormQuestion[]>>;
  showDragHandle?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ quizQuestions, setQuizQuestions, showDragHandle = false }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setQuizQuestions((items) => {
        const oldIndex = items.findIndex((_, index) => index.toString() === active.id);
        const newIndex = items.findIndex((_, index) => index.toString() === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={quizQuestions.map((_, index) => index.toString())} strategy={verticalListSortingStrategy}>
        {quizQuestions.map((question, index) => (
          <SortableQuestionItem
            key={index}
            question={question}
            index={index}
            quizQuestions={quizQuestions}
            setQuizQuestions={setQuizQuestions}
            showDragHandle={showDragHandle}
          />
        ))}
      </SortableContext>
      
      <Button 
        type="dashed" 
        onClick={() => setQuizQuestions([...quizQuestions, { question: '', options: ['', ''], correctIndex: 0 }])}
        style={{ width: '100%', marginBottom: 16 }}
      >
        Thêm câu hỏi
      </Button>
    </DndContext>
  );
};

const QuizManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([]);



  // State cho modal thêm quiz
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
  const [addingQuiz, setAddingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizFormQuestion[]>([
    { question: '', options: ['', ''], correctIndex: 0 }
  ]);

  // State cho modal sửa quiz
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/courses/instructor`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) setCourses(data.data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchSections = async () => {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        console.log('Sections data:', data.data);
        console.log('First section lessons:', data.data[0]?.lessons);
        console.log('First lesson video:', data.data[0]?.lessons[0]?.video);
        setSections(data.data);
      }
      setLoading(false);
    };
    fetchSections();
  }, [selectedCourse]);

  useEffect(() => {
    // Gộp tất cả quiz từ các lesson
    const quizzes: QuizItem[] = [];
    sections.forEach(section => {
      section.lessons.forEach(lesson => {
        if (lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0) {
          quizzes.push({
            _id: lesson.quiz._id,
            questions: lesson.quiz.questions,
            lessonTitle: lesson.title,
            sectionTitle: section.title,
            courseId: selectedCourse,
          });
        }
      });
    });
    setQuizList(quizzes);
  }, [sections, selectedCourse]);

  const sectionOptions = sections.map(s => ({ label: s.title, value: s._id }));
  const lessonOptions = selectedSection
    ? (sections.find(s => s._id === selectedSection)?.lessons || []).map(l => ({ 
        label: l.title, 
        value: l._id,
        video: l.video,
        quiz: l.quiz
      }))
    : [];

  // Hàm mở modal thêm quiz
  const handleAddQuiz = async (lessonId: string) => {
    console.log('handleAddQuiz called with lessonId:', lessonId);
    console.log('selectedSection:', selectedSection);
    console.log('sections:', sections);
    
    // Tìm lesson trong tất cả sections nếu không có selectedSection
    let lesson = null;
    if (selectedSection) {
      lesson = sections
        .find(s => s._id === selectedSection)
        ?.lessons.find(l => l._id === lessonId);
    } else {
      // Tìm lesson trong tất cả sections
      for (const section of sections) {
        lesson = section.lessons.find(l => l._id === lessonId);
        if (lesson) break;
      }
    }
    
    console.log('Found lesson:', lesson);
    console.log('Lesson video:', lesson?.video);
    console.log('Lesson quiz:', lesson?.quiz);
    console.log('Quiz questions:', lesson?.quiz?.questions);
    
    if (!lesson?.video) {
      message.warning('Bài học này chưa có video!');
      return;
    }
    
    // Kiểm tra quiz chi tiết hơn
    const hasQuiz = lesson.quiz && lesson.quiz.questions && Array.isArray(lesson.quiz.questions) && lesson.quiz.questions.length > 0;
    console.log('Has quiz:', hasQuiz);
    
    if (hasQuiz) {
      message.warning('Bài học này đã có quiz!');
      return;
    }

    // Kiểm tra quiz từ API để đảm bảo
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/quizzes/video/${lesson.video._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (res.ok) {
        const quizData = await res.json();
        if (quizData.success && quizData.data) {
          console.log('Found existing quiz from API:', quizData.data);
          message.warning('Bài học này đã có quiz!');
          return;
        }
      }
    } catch {
      console.log('No existing quiz found from API');
    }

    setSelectedLesson(lessonId);
    setQuizQuestions([{ question: '', options: ['', ''], correctIndex: 0 }]);
    setIsAddQuizModalOpen(true);
  };

  // Hàm đóng modal thêm quiz
  const handleCancelAddQuiz = () => {
    setIsAddQuizModalOpen(false);
    setQuizQuestions([{ question: '', options: ['', ''], correctIndex: 0 }]);
    setSelectedLesson(null);
  };

  // Hàm thêm quiz
  const handleSubmitAddQuiz = async () => {
    if (!selectedLesson) return;

    // Validate form
    const hasEmptyQuestions = quizQuestions.some(q => !q.question.trim());
    const hasEmptyOptions = quizQuestions.some(q => q.options.some(opt => !opt.trim()));
    
    if (hasEmptyQuestions) {
      message.error('Vui lòng điền đầy đủ câu hỏi!');
      return;
    }
    
    if (hasEmptyOptions) {
      message.error('Vui lòng điền đầy đủ các đáp án!');
      return;
    }

    setAddingQuiz(true);
    try {
      const lesson = sections
        .find(s => s._id === selectedSection)
        ?.lessons.find(l => l._id === selectedLesson);

      if (!lesson?.video?._id) {
        throw new Error('Không tìm thấy video cho bài học này');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          video_id: lesson.video._id,
          questions: quizQuestions,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        message.success('Tạo quiz thành công!');
        setIsAddQuizModalOpen(false);
        setQuizQuestions([{ question: '', options: ['', ''], correctIndex: 0 }]);
        setSelectedLesson(null);
        
        // Reload lại sections để cập nhật UI
        const resSec = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const dataSec = await resSec.json();
        if (dataSec.success) {
          console.log('Reloaded sections after creating quiz:', dataSec.data);
          setSections(dataSec.data);
        }
      } else {
        throw new Error(data.message || 'Lỗi tạo quiz');
      }
    } catch (error) {
      console.error('Lỗi khi tạo quiz:', error);
      message.error(error instanceof Error ? error.message : 'Lỗi tạo quiz');
    } finally {
      setAddingQuiz(false);
    }
  };

  // Hàm mở modal sửa quiz
  const handleEditQuiz = (quiz: QuizItem) => {
    setCurrentQuiz(quiz);
    setQuizQuestions([...quiz.questions]);
    setIsEditQuizModalOpen(true);
  };

  // Hàm đóng modal sửa quiz
  const handleCancelEditQuiz = () => {
    setIsEditQuizModalOpen(false);
    setQuizQuestions([{ question: '', options: ['', ''], correctIndex: 0 }]);
    setCurrentQuiz(null);
  };

  // Hàm sửa quiz
  const handleSubmitEditQuiz = async () => {
    if (!currentQuiz) return;

    // Validate form
    const hasEmptyQuestions = quizQuestions.some(q => !q.question.trim());
    const hasEmptyOptions = quizQuestions.some(q => q.options.some(opt => !opt.trim()));
    
    if (hasEmptyQuestions) {
      message.error('Vui lòng điền đầy đủ câu hỏi!');
      return;
    }
    
    if (hasEmptyOptions) {
      message.error('Vui lòng điền đầy đủ các đáp án!');
      return;
    }

    setEditingQuiz(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/quizzes/${currentQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          questions: quizQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật quiz');
      }

      const data = await response.json();
      if (data.success) {
        message.success('Cập nhật quiz thành công!');
        setIsEditQuizModalOpen(false);
        setQuizQuestions([{ question: '', options: ['', ''], correctIndex: 0 }]);
        setCurrentQuiz(null);
        
        // Refresh lại danh sách chương để hiển thị quiz đã cập nhật
        if (selectedCourse) {
          const refreshResponse = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setSections(refreshData.data);
            }
          }
        }
      } else {
        throw new Error(data.message || 'Không thể cập nhật quiz');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật quiz:', error);
      message.error(error instanceof Error ? error.message : 'Không thể cập nhật quiz');
    } finally {
      setEditingQuiz(false);
    }
  };

  // Hàm xóa quiz
  const handleDeleteQuiz = async (quiz: QuizItem) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/quizzes/${quiz._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa quiz');
      }

      const data = await response.json();
      if (data.success) {
        message.success('Xóa quiz thành công!');
        
        // Refresh lại danh sách chương để hiển thị quiz đã xóa
        if (selectedCourse) {
          const refreshResponse = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setSections(refreshData.data);
            }
          }
        }
      } else {
        throw new Error(data.message || 'Không thể xóa quiz');
      }
    } catch (error) {
      console.error('Lỗi khi xóa quiz:', error);
      message.error(error instanceof Error ? error.message : 'Không thể xóa quiz');
    }
  };

  // Thống kê
  const totalLessons = sections.reduce((acc, section) => acc + section.lessons.length, 0);
  const lessonsWithVideo = sections.reduce((acc, section) => 
    acc + section.lessons.filter(lesson => lesson.video).length, 0
  );
  const lessonsWithQuiz = quizList.length;

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <QuestionCircleOutlined />
            Quản lý Quiz
          </Title>
          <Text type="secondary">Quản lý và tạo quiz cho các bài học trong khóa học của bạn</Text>
        </div>

        {/* Thống kê */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center', background: '#f0f9ff' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>{totalLessons}</div>
              <Text type="secondary">Tổng bài học</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{lessonsWithVideo}</div>
              <Text type="secondary">Có video</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>{lessonsWithQuiz}</div>
              <Text type="secondary">Quiz</Text>
            </Card>
          </Col>
        </Row>

        {/* Bộ lọc */}
        <Card size="small" style={{ marginBottom: '24px', background: '#fafafa' }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Text strong>Khóa học:</Text>
        <Select
                style={{ width: '100%', marginTop: '8px' }}
          placeholder="Chọn khóa học"
          value={selectedCourse || undefined}
          onChange={v => {
            setSelectedCourse(v);
            setSelectedSection(null);
            setSelectedLesson(null);
          }}
          options={courses.map(c => ({ label: c.title, value: c._id }))}
          allowClear
                loading={loading}
        />
            </Col>
            <Col span={8}>
              <Text strong>Chương học:</Text>
        <Select
                style={{ width: '100%', marginTop: '8px' }}
          placeholder="Chọn chương học"
          value={selectedSection || undefined}
          onChange={v => {
            setSelectedSection(v);
            setSelectedLesson(null);
                  // Khi chọn chương, chỉ mở chương đó và đóng các chương khác
                  if (v) {
                    setActiveCollapseKeys([v]);
                  } else {
                    setActiveCollapseKeys([]);
                  }
          }}
          options={sectionOptions}
          disabled={!selectedCourse}
          allowClear
        />
            </Col>
            <Col span={8}>
              <Text strong>Bài học:</Text>
        <Select
                style={{ width: '100%', marginTop: '8px' }}
          placeholder="Chọn bài học"
          value={selectedLesson || undefined}
          onChange={setSelectedLesson}
          options={lessonOptions}
          disabled={!selectedSection}
          allowClear
        />
            </Col>
          </Row>
        </Card>

        {/* Bảng danh sách quiz */}
        <Card 
          title={
            <Space>
              <FileOutlined />
              <Text strong>Danh sách bài học và quiz</Text>
            </Space>
          }
          extra={
            <Space>
              <Badge count={lessonsWithQuiz} style={{ backgroundColor: '#52c41a' }}>
                <Tag color="success">Quiz</Tag>
              </Badge>
              <Badge count={lessonsWithVideo - lessonsWithQuiz} style={{ backgroundColor: '#fa8c16' }}>
                <Tag color="warning">Chưa có quiz</Tag>
              </Badge>
            </Space>
          }
        >
      <Spin spinning={loading}>
            {sections.length > 0 ? (
              <Collapse 
                activeKey={activeCollapseKeys}
                onChange={(keys) => setActiveCollapseKeys(Array.isArray(keys) ? keys : [keys])}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                style={{ background: 'transparent' }}
              >
                {sections.map(section => {
                  const sectionLessons = section.lessons.filter(lesson => {
                    if (selectedSection && selectedSection !== section._id) return false;
                    if (selectedLesson && selectedLesson !== lesson._id) return false;
                    return true;
                  });

                  const sectionLessonsWithVideo = sectionLessons.filter(l => l.video).length;
                  const sectionLessonsWithQuiz = sectionLessons.filter(l => l.quiz && l.quiz.questions && l.quiz.questions.length > 0).length;

                  return (
                    <Panel
                      key={section._id}
                      header={
                        <Space>
                          <Text strong style={{ fontSize: '16px' }}>{section.title}</Text>
                          <Badge count={sectionLessons.length} style={{ backgroundColor: '#1890ff' }}>
                            <Tag color="blue">Bài học</Tag>
                          </Badge>
                          <Badge count={sectionLessonsWithVideo} style={{ backgroundColor: '#52c41a' }}>
                            <Tag color="success">Có video</Tag>
                          </Badge>
                          <Badge count={sectionLessonsWithQuiz} style={{ backgroundColor: '#fa8c16' }}>
                            <Tag color="warning">Quiz</Tag>
                          </Badge>
                        </Space>
                      }
                      style={{ 
                        marginBottom: '8px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px'
                      }}
                    >
        <Table
                        dataSource={sectionLessons.map(lesson => ({
                          _id: lesson._id,
                          title: lesson.title,
                          hasVideo: !!lesson.video,
                          hasQuiz: (() => {
                            const hasQuiz = !!(lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0);
                            console.log(`Lesson ${lesson._id} hasQuiz:`, hasQuiz, 'quiz:', lesson.quiz);
                            return hasQuiz;
                          })(),
                          quiz: lesson.quiz,
                          sectionTitle: section.title,
                          courseId: selectedCourse,
                        }))}
          rowKey="_id"
          columns={[
                          { 
                            title: 'Tên bài học', 
                            dataIndex: 'title',
                            render: (text) => <Text>{text}</Text>
                          },
                          {
                            title: 'Video',
                            dataIndex: 'hasVideo',
                            render: (hasVideo) => hasVideo ? 
                              <Tag color="success">Đã có video</Tag> : 
                              <Tag color="error">Chưa có video</Tag>,
                            align: 'center'
                          },
                          {
                            title: 'Quiz',
                            dataIndex: 'hasQuiz',
                            render: (hasQuiz, record) => hasQuiz && record.quiz ? 
                              <Tag color="success">{record.quiz.questions?.length || 0} câu hỏi</Tag> : 
                              <Tag color="warning">Chưa có quiz</Tag>,
                            align: 'center'
                          },
                          {
                            title: 'Thao tác',
                            render: (_, record) => {
                              console.log('Rendering actions for lesson:', record._id, 'hasVideo:', record.hasVideo, 'hasQuiz:', record.hasQuiz, 'quiz:', record.quiz);
                              
                              if (!record.hasVideo) {
                                return <Text type="secondary">Cần video trước</Text>;
                              }
                              
                              if (record.hasQuiz && record.quiz) {
                                return (
                                  <Space>
                                    <Tooltip title="Sửa quiz">
                                      <Button 
                                        type="default" 
                                        size="small" 
                                        icon={<EditOutlined />} 
                                        onClick={() => {
                                          console.log('Editing quiz for lesson:', record.title);
                                          handleEditQuiz({
                                            _id: record.quiz!._id,
                                            questions: record.quiz!.questions,
                                            lessonTitle: record.title,
                                            sectionTitle: record.sectionTitle,
                                            courseId: record.courseId,
                                          });
                                        }}
                                      />
                                    </Tooltip>
                                    <Tooltip title="Xóa quiz">
                                      <Button 
                                        type="text" 
                                        size="small" 
                                        danger
                                        icon={<DeleteOutlined />} 
                                        onClick={() => {
                                          console.log('Deleting quiz for lesson:', record.title);
                                          handleDeleteQuiz({
                                            _id: record.quiz!._id,
                                            questions: record.quiz!.questions,
                                            lessonTitle: record.title,
                                            sectionTitle: record.sectionTitle,
                                            courseId: record.courseId,
                                          });
                                        }}
                                      />
                                    </Tooltip>
                                  </Space>
                                );
                              }
                              
                              return (
                                <Tooltip title="Thêm quiz">
                                  <Button 
                                    type="primary" 
                                    size="small" 
                                    icon={<PlusOutlined />} 
                                    onClick={() => {
                                      console.log('Clicking add quiz for lesson:', record._id);
                                      console.log('Current section:', section._id);
                                      console.log('Record data:', record);
                                      // Tự động set selectedSection nếu chưa có
                                      if (!selectedSection) {
                                        setSelectedSection(section._id);
                                      }
                                      handleAddQuiz(record._id);
                                    }}
                                  />
                                </Tooltip>
                              );
                            },
                            align: 'center'
            },
          ]}
          pagination={false}
                        size="small"
                        rowClassName={(record) => {
                          if (!record.hasVideo) return 'table-row-error';
                          if (record.hasQuiz) return 'table-row-success';
                          return 'table-row-warning';
                        }}
                        style={{ margin: 0 }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <FileOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>Chưa có dữ liệu bài học</div>
                <Text type="secondary">Vui lòng chọn khóa học để xem danh sách bài học</Text>
              </div>
            )}
      </Spin>
        </Card>
      </Card>



      {/* Modal thêm quiz */}
      <Modal
        title="Thêm quiz mới"
        open={isAddQuizModalOpen}
        onCancel={handleCancelAddQuiz}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <Form layout="vertical">
          <Form.Item label="Bài học:">
            <Text strong>{lessonOptions.find(l => l.value === selectedLesson)?.label}</Text>
          </Form.Item>

          <QuestionForm 
            quizQuestions={quizQuestions}
            setQuizQuestions={setQuizQuestions}
            showDragHandle={true}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancelAddQuiz}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                onClick={handleSubmitAddQuiz}
                loading={addingQuiz}
              >
                Tạo quiz
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa quiz */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#1890ff' }} />
            <Text strong>Sửa quiz - {currentQuiz?.lessonTitle}</Text>
          </Space>
        }
        open={isEditQuizModalOpen}
        onCancel={handleCancelEditQuiz}
        footer={null}
        width={800}
        destroyOnHidden
        centered
      >
        <Form layout="vertical">
          <div style={{ marginBottom: '16px', padding: '12px', background: '#fff7e6', borderRadius: '6px' }}>
            <Text strong>Bài học: </Text>
            <Text>{currentQuiz?.lessonTitle}</Text>
            <br />
            <Text strong>Chương: </Text>
            <Text>{currentQuiz?.sectionTitle}</Text>
            <br />
            <Text strong>Số câu hỏi hiện tại: </Text>
            <Text>{currentQuiz?.questions.length} câu</Text>
          </div>

          <QuestionForm 
            quizQuestions={quizQuestions}
            setQuizQuestions={setQuizQuestions}
            showDragHandle={true}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancelEditQuiz}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                onClick={handleSubmitEditQuiz}
                loading={editingQuiz}
                icon={<EditOutlined />}
              >
                Cập nhật quiz
              </Button>
                </Space>
              </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .table-row-success {
          background-color: #f6ffed;
        }
        .table-row-warning {
          background-color: #fff7e6;
        }
        .table-row-error {
          background-color: #fff2f0;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default QuizManager; 