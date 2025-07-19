import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Checkbox, Button, Upload, Divider, Spin, Typography, message, InputNumber, Popconfirm } from 'antd';
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadChangeParam } from 'antd/es/upload/interface';
import styles from './LessonEdit.module.css';
import { Card } from 'antd';
import { CheckCircleTwoTone, DeleteOutlined, EditOutlined, VideoCameraOutlined, FileTextOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface LessonData {
  _id: string;
  title: string;
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

const LessonEdit: React.FC = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [videoFile, setVideoFile] = useState<UploadFile[]>([]);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizChanged, setQuizChanged] = useState(false);
  const [videoChanged, setVideoChanged] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/lessons/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data.success) {
          setLesson(data.data);
          form.setFieldsValue({
            title: data.data.title,
            is_preview: data.data.is_preview,
          });
          setVideoDuration(data.data.video?.duration || 0);
          setQuizQuestions(data.data.quiz?.questions || []);
          setQuizId(data.data.quiz?._id || null);
        } else {
          message.error(data.message || 'Không thể tải bài học');
        }
      } catch {
        message.error('Lỗi khi tải bài học');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLesson();
    // eslint-disable-next-line
  }, [id, form]);

  // Video handlers
  const handleVideoChange = (info: UploadChangeParam<UploadFile>) => {
    const fileList = info.fileList.slice(-1);
    setVideoFile(fileList);
    setVideoChanged(true);
    // Lấy duration từ file video
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj as File;
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        setVideoDuration(Math.round(video.duration));
      };
      video.src = URL.createObjectURL(file);
    }
  };
  const handleRemoveVideo = () => {
    setVideoFile([]);
    setVideoChanged(true);
  };

  // Quiz handlers
  const handleAddQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: '', options: ['', ''], correctIndex: 0 }]);
    setQuizChanged(true);
  };
  const handleRemoveQuestion = (idx: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
    setQuizChanged(true);
  };
  const handleQuestionChange = (idx: number, value: string) => {
    const newQuestions = [...quizQuestions];
    newQuestions[idx].question = value;
    setQuizQuestions(newQuestions);
    setQuizChanged(true);
  };
  const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
    const newQuestions = [...quizQuestions];
    newQuestions[qIdx].options[oIdx] = value;
    setQuizQuestions(newQuestions);
    setQuizChanged(true);
  };
  const handleAddOption = (qIdx: number) => {
    const newQuestions = [...quizQuestions];
    if (newQuestions[qIdx].options.length < 4) {
      newQuestions[qIdx].options.push('');
      setQuizQuestions(newQuestions);
      setQuizChanged(true);
    }
  };
  const handleRemoveOption = (qIdx: number, oIdx: number) => {
    const newQuestions = [...quizQuestions];
    if (newQuestions[qIdx].options.length > 2) {
      newQuestions[qIdx].options.splice(oIdx, 1);
      if (newQuestions[qIdx].correctIndex >= newQuestions[qIdx].options.length) {
        newQuestions[qIdx].correctIndex = 0;
      }
      setQuizQuestions(newQuestions);
      setQuizChanged(true);
    }
  };
  const handleCorrectIndexChange = (qIdx: number, value: number) => {
    const newQuestions = [...quizQuestions];
    newQuestions[qIdx].correctIndex = value;
    setQuizQuestions(newQuestions);
    setQuizChanged(true);
  };
  const handleRemoveQuiz = () => {
    setQuizQuestions([]);
    setQuizChanged(true);
  };

  // Validate quiz
  const validateQuiz = () => {
    for (const q of quizQuestions) {
      if (!q.question.trim()) return 'Mỗi câu hỏi phải có nội dung.';
      if (q.options.length < 2) return 'Mỗi câu hỏi phải có ít nhất 2 đáp án.';
      if (q.options.length > 4) return 'Mỗi câu hỏi tối đa 4 đáp án.';
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) return 'Chọn đáp án đúng cho mỗi câu hỏi.';
      for (const opt of q.options) if (!opt.trim()) return 'Không được để trống đáp án.';
    }
    return null;
  };

  // Submit handler
  const onFinish = async (values: { title: string; is_preview: boolean }) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // 1. Update lesson info
      const resLesson = await fetch(`${apiUrl}/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: values.title,
          is_preview: values.is_preview,
        }),
      });
      const dataLesson = await resLesson.json();
      if (!dataLesson.success) throw new Error(dataLesson.message || 'Cập nhật bài học thất bại');

      // 2. Update video if changed
      if (videoChanged && (videoFile.length > 0 || lesson?.video)) {
        if (videoFile.length > 0) {
          // Upload new video
          const formData = new FormData();
          formData.append('lesson_id', id!);
          formData.append('duration', videoDuration.toString());
          // Lấy file gốc từ UploadFile
          const fileObj = videoFile[0].originFileObj as File;
          formData.append('video', fileObj);
          const resVideo = await fetch(`${apiUrl}/videos`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });
          const dataVideo = await resVideo.json();
          if (!dataVideo.success) throw new Error(dataVideo.message || 'Cập nhật video thất bại');
        } else if (!videoFile.length && lesson?.video) {
          // Xóa video (nếu muốn hỗ trợ, cần API backend)
          // Hiện tại chỉ hỗ trợ upload mới
        }
      }
      // 3. Update quiz if changed
      if (quizChanged) {
        if (quizQuestions.length > 0) {
          const quizError = validateQuiz();
          if (quizError) throw new Error(quizError);
          // Tìm videoId
          const videoId = lesson?.video?._id;
          if (!videoId) throw new Error('Cần có video để tạo quiz');
          if (quizId) {
            // Cập nhật quiz cũ
            const resQuiz = await fetch(`${apiUrl}/quizzes/${quizId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                video_id: videoId,
                questions: quizQuestions,
              }),
            });
            const dataQuiz = await resQuiz.json();
            if (!dataQuiz.success) throw new Error(dataQuiz.message || 'Cập nhật quiz thất bại');
          } else {
            // Tạo quiz mới
            const resQuiz = await fetch(`${apiUrl}/quizzes`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                video_id: videoId,
                questions: quizQuestions,
              }),
            });
            const dataQuiz = await resQuiz.json();
            if (!dataQuiz.success) throw new Error(dataQuiz.message || 'Cập nhật quiz thất bại');
          }
        } else if (lesson?.quiz) {
          // Xóa quiz (nếu muốn hỗ trợ, cần API backend)
          // Hiện tại chỉ hỗ trợ cập nhật quiz
        }
      }
      message.success('Cập nhật bài học thành công!');
      // Không chuyển trang
      setQuizChanged(false);
      setVideoChanged(false);
      // Fetch lại dữ liệu bài học để đồng bộ UI
      if (id) {
        const res = await fetch(`${apiUrl}/lessons/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data.success) {
          setLesson(data.data);
          form.setFieldsValue({
            title: data.data.title,
            is_preview: data.data.is_preview,
          });
          setVideoDuration(data.data.video?.duration || 0);
          setQuizQuestions(data.data.quiz?.questions || []);
          setQuizId(data.data.quiz?._id || null);
        }
      }
    } catch (err) {
      const error = err as Error;
      let msg = error.message || 'Lỗi khi cập nhật bài học';
      if (msg.toLowerCase().includes('route') || msg.toLowerCase().includes('trang')) {
        msg = 'Không tìm thấy bài học. Có thể bài học đã bị xóa hoặc không tồn tại.';
      }
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !lesson) return <Spin style={{ marginTop: 40 }} />;

  return (
    <div className={styles.lessonEditContainer}>
      <Card className={styles.lessonCard} variant="outlined">
        <Title level={3} className={styles.title}><EditOutlined /> Chỉnh sửa bài học</Title>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{
          title: lesson.title,
          is_preview: lesson.is_preview,
        }}>
          <Form.Item label="Tiêu đề bài học" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}> 
            <Input className={styles.input} />
          </Form.Item>
          <Form.Item name="is_preview" valuePropName="checked">
            <Checkbox>Cho phép xem trước (Preview)</Checkbox>
          </Form.Item>
          <Divider orientation="left"><VideoCameraOutlined /> Video bài học</Divider>
          {lesson.video && (
            <div className={styles.videoInfoRow}>
              <div className={styles.videoInfoLeft}>
                <Text strong>Video hiện tại:</Text>
                <span className={styles.videoDuration}>Thời lượng: {lesson.video.duration} giây</span>
                <Popconfirm title="Xóa video này?" onConfirm={handleRemoveVideo} okText="Xóa" cancelText="Hủy">
                  <Button size="small" danger icon={<DeleteOutlined />} shape="circle" style={{ marginLeft: 8 }} title="Xóa video" />
                </Popconfirm>
              </div>
              <div className={styles.videoPreviewInline}>
                <video src={lesson.video.url} controls width="220" style={{ borderRadius: 8, background: '#000' }} />
              </div>
            </div>
          )}
          <Form.Item label="Tải video mới (nếu muốn thay thế)" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList} style={{ marginBottom: 0 }}>
            <Upload beforeUpload={() => false} maxCount={1} onChange={handleVideoChange} fileList={videoFile} accept="video/*">
              <Button icon={<UploadOutlined />}>Chọn video mới</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Thời lượng video (giây)" style={{ marginBottom: 16 }}>
            <InputNumber min={1} value={videoDuration} onChange={v => setVideoDuration(Number(v))} style={{ width: 120 }} />
          </Form.Item>
          <Divider orientation="left"><FileTextOutlined /> Quiz (Tùy chọn)</Divider>
          {(quizQuestions.length > 0 || (lesson.quiz && Array.isArray(lesson.quiz.questions) && lesson.quiz.questions.length > 0)) ? (
            <div className={styles.quizList}>
              {(quizQuestions.length > 0 ? quizQuestions : lesson.quiz?.questions || []).map((q, qIdx) => (
                <Card key={qIdx} className={styles.quizCard} size="small" title={`Câu hỏi ${qIdx + 1}`}
                  extra={
                    <Popconfirm title="Xóa câu hỏi này?" onConfirm={() => handleRemoveQuestion(qIdx)} okText="Xóa" cancelText="Hủy">
                      <Button icon={<DeleteOutlined />} danger size="small" />
                    </Popconfirm>
                  }
                >
                  <Input
                    placeholder={`Nhập nội dung câu hỏi...`}
                    value={q.question}
                    onChange={e => handleQuestionChange(qIdx, e.target.value)}
                    className={styles.input}
                  />
                  <div className={styles.optionsList}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={q.correctIndex === oIdx ? styles.correctOption : styles.option}>
                        <Input
                          placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                          value={opt}
                          onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                          className={styles.input}
                        />
                        <Checkbox
                          checked={q.correctIndex === oIdx}
                          onChange={() => handleCorrectIndexChange(qIdx, oIdx)}
                          className={styles.correctCheckbox}
                        >{q.correctIndex === oIdx ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : 'Đáp án đúng'}</Checkbox>
                        {q.options.length > 2 && (
                          <Button icon={<MinusCircleOutlined />} size="small" danger onClick={() => handleRemoveOption(qIdx, oIdx)} />
                        )}
                      </div>
                    ))}
                  </div>
                  {q.options.length < 4 && (
                    <Button icon={<PlusOutlined />} size="small" onClick={() => handleAddOption(qIdx)} style={{ marginTop: 4 }}>Thêm đáp án</Button>
                  )}
                </Card>
              ))}
              <div className={styles.quizActions}>
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddQuestion} style={{ marginBottom: 8 }}>Thêm câu hỏi</Button>
                <Popconfirm title="Xóa toàn bộ quiz?" onConfirm={handleRemoveQuiz} okText="Xóa" cancelText="Hủy">
                  <Button danger type="dashed">Xóa quiz</Button>
                </Popconfirm>
              </div>
            </div>
          ) : (
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddQuestion}>Thêm quiz</Button>
          )}
          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} block icon={<EditOutlined />}>Cập nhật</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LessonEdit; 