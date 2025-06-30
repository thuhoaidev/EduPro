import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Alert, Card, Typography, Button, Radio, message } from 'antd';
import { config } from '../../../api/axios';
import { getLessonById, getSectionById } from '../../../services/courseService';
import { getProgress, updateProgress } from '../../../services/progressService';

const { Title } = Typography;

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex?: number;
}

const LessonQuizPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [quiz, setQuiz] = useState<{ _id: string; questions: QuizQuestion[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ success: boolean; message: string; wrongQuestions?: number[] } | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        const lessonRes = await getLessonById(lessonId!);
        const lesson = lessonRes.data;
        const sectionRes = await getSectionById(lesson.section_id);
        const section = sectionRes.data;
        setCourseId(section.course_id);
      } catch {
        setError('Không lấy được thông tin khóa học.');
      }
    };
    if (lessonId) fetchCourseId();
  }, [lessonId]);

  useEffect(() => {
    const fetchQuizAndProgress = async () => {
      try {
        setLoading(true);
        const res = await config.get(`/quizzes/lesson/${lessonId}`);
        setQuiz(res.data.data);
        setAnswers(new Array(res.data.data.questions.length).fill(-1));
      } catch {
        setError('Không tìm thấy quiz cho bài học này.');
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetchQuizAndProgress();
  }, [lessonId]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!courseId || !lessonId || !quiz) return;
      try {
        const progress = await getProgress(courseId);
        const lessonProgress = progress[lessonId];
        if (lessonProgress && Array.isArray(lessonProgress.quizAnswers)) {
          setAnswers(lessonProgress.quizAnswers);
          if (lessonProgress.quizPassed !== undefined) {
            setResult({
              success: lessonProgress.quizPassed,
              message: lessonProgress.quizPassed ? 'Tất cả đáp án đều đúng!' : 'Có đáp án sai.',
              wrongQuestions: lessonProgress.quizPassed ? [] : undefined,
            });
          }
        }
      } catch {
        // Không có progress cũng không sao
      }
    };
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId, quiz]);

  const handleChange = (qIdx: number, value: number) => {
    setAnswers(prev => prev.map((a, idx) => (idx === qIdx ? value : a)));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    if (answers.some(a => a === -1)) {
      message.warning('Bạn cần trả lời tất cả các câu hỏi!');
      return;
    }
    try {
      const res = await config.post(`/quizzes/${quiz._id}/submit`, { answers });
      setResult(res.data);
      if (courseId && lessonId) {
        const progress = await getProgress(courseId);
        const lessonProgress = progress[lessonId] || {};
        await updateProgress(courseId, lessonId, {
          watchedSeconds: lessonProgress.watchedSeconds || 0,
          videoDuration: lessonProgress.videoDuration || 0,
          quizPassed: res.data.success,
          quizAnswers: answers,
        });
      }
    } catch {
      message.error('Có lỗi khi nộp bài!');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;
  if (!quiz) return <Alert message="Không tìm thấy quiz cho bài học này." type="warning" showIcon />;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card variant="outlined" className="shadow-lg rounded-xl">
        <Title level={3}>Quiz: {quiz.questions.length} câu hỏi</Title>
        {quiz.questions.map((q, idx) => (
          <div key={idx} className="mb-6">
            <div className="font-semibold mb-2">Câu {idx + 1}: {q.question}</div>
            <Radio.Group
              onChange={e => handleChange(idx, e.target.value)}
              value={answers[idx]}
              disabled={!!result}
            >
              {q.options.map((opt, oIdx) => (
                <Radio key={oIdx} value={oIdx} className="block mb-1">{opt}</Radio>
              ))}
            </Radio.Group>
            {result && result.wrongQuestions?.includes(idx) && (
              <div className="text-red-600 mt-1">Đáp án chưa đúng</div>
            )}
          </div>
        ))}
        <Button type="primary" size="large" onClick={handleSubmit} disabled={!!result}>Nộp bài</Button>
        {result && (
          <Alert
            className="mt-6"
            message={result.success ? 'Chúc mừng!' : 'Kết quả'}
            description={result.message}
            type={result.success ? 'success' : 'error'}
            showIcon
          />
        )}
      </Card>
    </div>
  );
};

export default LessonQuizPage; 