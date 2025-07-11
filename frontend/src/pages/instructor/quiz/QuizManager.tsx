import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, Select, Spin, List, Form, Input, Space, message } from 'antd';

const { Title } = Typography;

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

const QuizManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizList, setQuizList] = useState<any[]>([]);
  const [quizModal, setQuizModal] = useState<{ questions: QuizQuestion[]; lessonTitle: string } | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLessonTitle, setQuizLessonTitle] = useState<string>('');
  const [addingQuiz, setAddingQuiz] = useState(false);

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
      if (data.success) setSections(data.data);
      setLoading(false);
    };
    fetchSections();
  }, [selectedCourse]);

  useEffect(() => {
    // Gộp tất cả quiz từ các lesson
    const quizzes: any[] = [];
    sections.forEach(section => {
      section.lessons.forEach(lesson => {
        if (lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0) {
          quizzes.push({
            ...lesson.quiz,
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
    ? (sections.find(s => s._id === selectedSection)?.lessons || []).map(l => ({ label: l.title, value: l._id }))
    : [];

  // Thêm quiz mới cho lesson đã chọn
  const handleAddQuiz = () => {
    if (!selectedLesson) return;
    // Không cho phép tạo quiz nếu lesson chưa có video hoặc đã có quiz
    const lesson = sections.find(s => s._id === selectedSection)?.lessons.find(l => l._id === selectedLesson);
    if (!lesson?.video) {
      message.warning('Bài học này chưa có video!');
      return;
    }
    if (lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0) {
      message.warning('Bài học này đã có quiz!');
      return;
    }
    setQuizLessonTitle(lessonOptions.find(l => l.value === selectedLesson)?.label || '');
    setQuizQuestions([{ question: '', options: ['', ''], correctIndex: 0 }]);
    setQuizModalVisible(true);
  };

  // Lưu quiz mới
  const handleSaveQuiz = async () => {
    if (!selectedLesson) return;
    setAddingQuiz(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          video_id: (sections.find(s => s._id === selectedSection)?.lessons.find(l => l._id === selectedLesson)?.video?._id),
          questions: quizQuestions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success('Tạo quiz thành công!');
        setQuizModalVisible(false);
        // Reload lại sections để cập nhật UI
        const resSec = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const dataSec = await resSec.json();
        if (dataSec.success) setSections(dataSec.data);
      } else {
        message.error(data.message || 'Lỗi tạo quiz');
      }
    } catch {
      message.error('Lỗi tạo quiz');
    } finally {
      setAddingQuiz(false);
    }
  };

  return (
    <Card>
      <Title level={3}>Quản lý Quiz</Title>
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 300, marginRight: 8 }}
          placeholder="Chọn khóa học"
          value={selectedCourse || undefined}
          onChange={v => {
            setSelectedCourse(v);
            setSelectedSection(null);
            setSelectedLesson(null);
          }}
          options={courses.map(c => ({ label: c.title, value: c._id }))}
          allowClear
        />
        <Select
          style={{ width: 220, marginRight: 8 }}
          placeholder="Chọn chương học"
          value={selectedSection || undefined}
          onChange={v => {
            setSelectedSection(v);
            setSelectedLesson(null);
          }}
          options={sectionOptions}
          disabled={!selectedCourse}
          allowClear
        />
        <Select
          style={{ width: 220, marginRight: 8 }}
          placeholder="Chọn bài học"
          value={selectedLesson || undefined}
          onChange={setSelectedLesson}
          options={lessonOptions}
          disabled={!selectedSection}
          allowClear
        />
        <Button type="primary" onClick={handleAddQuiz} disabled={!selectedLesson || !lessonOptions.find(l => l.value === selectedLesson)?.video || !!lessonOptions.find(l => l.value === selectedLesson)?.quiz} style={{ marginRight: 8 }}>
          Thêm quiz cho bài học
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table
          dataSource={quizList}
          rowKey="_id"
          columns={[
            { title: 'Tên bài học', dataIndex: 'lessonTitle' },
            { title: 'Chương', dataIndex: 'sectionTitle' },
            { title: 'Số câu hỏi', dataIndex: ['questions', 'length'], render: (_: any, record: any) => record.questions.length },
            {
              title: 'Xem quiz',
              render: (_, record) => (
                <Button onClick={() => setQuizModal({ questions: record.questions, lessonTitle: record.lessonTitle })}>Xem</Button>
              ),
            },
          ]}
          pagination={false}
        />
      </Spin>
      <Modal
        open={!!quizModal}
        onCancel={() => setQuizModal(null)}
        footer={null}
        title={quizModal ? `Quiz cho bài học: ${quizModal.lessonTitle}` : ''}
        width={600}
        destroyOnClose
      >
        {quizModal && (
          <List
            dataSource={quizModal.questions}
            renderItem={(q, idx) => (
              <List.Item>
                <div>
                  <b>Câu {idx + 1}:</b> {q.question}
                  <ul style={{ margin: '8px 0 0 16px' }}>
                    {q.options.map((opt, oidx) => (
                      <li key={oidx} style={{ color: oidx === q.correctIndex ? 'green' : undefined }}>
                        {String.fromCharCode(65 + oidx)}. {opt} {oidx === q.correctIndex && <b>(Đáp án)</b>}
                      </li>
                    ))}
                  </ul>
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
      <Modal
        open={quizModalVisible}
        onCancel={() => setQuizModalVisible(false)}
        onOk={handleSaveQuiz}
        confirmLoading={addingQuiz}
        title={`Tạo quiz cho bài học: ${quizLessonTitle}`}
        width={600}
        destroyOnClose
      >
        <Form layout="vertical">
          {quizQuestions.map((q, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <Form.Item label={`Câu hỏi ${idx + 1}`} required>
                <Input value={q.question} onChange={e => {
                  const arr = [...quizQuestions];
                  arr[idx].question = e.target.value;
                  setQuizQuestions(arr);
                }} />
              </Form.Item>
              <Form.Item label="Đáp án">
                <Space direction="vertical">
                  {q.options.map((opt: string, oidx: number) => (
                    <Input
                      key={oidx}
                      value={opt}
                      placeholder={`Đáp án ${String.fromCharCode(65 + oidx)}`}
                      onChange={e => {
                        const arr = [...quizQuestions];
                        arr[idx].options[oidx] = e.target.value;
                        setQuizQuestions(arr);
                      }}
                      style={{ width: 400 }}
                    />
                  ))}
                  <Button size="small" onClick={() => {
                    if (q.options.length < 4) {
                      const arr = [...quizQuestions];
                      arr[idx].options.push('');
                      setQuizQuestions(arr);
                    }
                  }}>Thêm đáp án</Button>
                </Space>
              </Form.Item>
              <Form.Item label="Đáp án đúng">
                <Select
                  value={q.correctIndex}
                  onChange={v => {
                    const arr = [...quizQuestions];
                    arr[idx].correctIndex = v;
                    setQuizQuestions(arr);
                  }}
                  options={q.options.map((_, oidx) => ({ label: `Đáp án ${String.fromCharCode(65 + oidx)}`, value: oidx }))}
                  style={{ width: 200 }}
                />
              </Form.Item>
            </div>
          ))}
          <Button onClick={() => setQuizQuestions([...quizQuestions, { question: '', options: ['', ''], correctIndex: 0 }])}>
            Thêm câu hỏi
          </Button>
        </Form>
      </Modal>
    </Card>
  );
};

export default QuizManager; 