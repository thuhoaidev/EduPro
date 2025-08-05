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

// Utility functions for localStorage
function getQuizCacheKey(courseId: string | null, lessonId: string | undefined) {
  return courseId && lessonId ? `quizAnswers_${courseId}_${lessonId}` : '';
}
function saveQuizAnswersToCache(courseId: string | null, lessonId: string | undefined, answers: number[]) {
  const key = getQuizCacheKey(courseId, lessonId);
  if (key) localStorage.setItem(key, JSON.stringify(answers));
}
function getQuizAnswersFromCache(courseId: string | null, lessonId: string | undefined): number[] | null {
  const key = getQuizCacheKey(courseId, lessonId);
  if (!key) return null;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
function clearQuizAnswersCache(courseId: string | null, lessonId: string | undefined) {
  const key = getQuizCacheKey(courseId, lessonId);
  if (key) localStorage.removeItem(key);
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
        // Đừng setAnswers ở đây, hãy để useEffect fetchProgress xử lý!
        // setAnswers(new Array(res.data.data.questions.length).fill(-1));
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

        console.log('🔍 Fetching progress for lesson:', lessonId);
        console.log('📊 Lesson progress:', lessonProgress);

        // Kiểm tra nếu đã hoàn thành quiz từ backend
        if (lessonProgress && lessonProgress.quizPassed === true) {
          console.log('✅ Quiz already completed - restoring from backend');
          // Đã hoàn thành quiz - khôi phục từ backend và xóa cache
          if (Array.isArray(lessonProgress.quizAnswers)) {
            setAnswers(lessonProgress.quizAnswers);
          }
          setResult({
            success: true,
            message: 'Tất cả đáp án đều đúng!',
            wrongQuestions: [],
          });
          // Xóa cache vì đã hoàn thành
          clearQuizAnswersCache(courseId, lessonId);
          return;
        }

        // Nếu có quizAnswers nhưng chưa hoàn thành (quizPassed !== true)
        if (lessonProgress && Array.isArray(lessonProgress.quizAnswers)) {
          console.log('📝 Found quiz answers from backend (not completed)');
          setAnswers(lessonProgress.quizAnswers);
          if (lessonProgress.quizPassed === false) {
            setResult({
              success: false,
              message: 'Có đáp án sai.',
              wrongQuestions: lessonProgress.wrongQuestions || [],
            });
          } else {
            setResult(null);
          }
        } else if (quiz) {
          // Không có progress từ backend - thử khôi phục từ cache
          console.log('🔍 No backend progress - checking cache');
          const cached = getQuizAnswersFromCache(courseId, lessonId);
          if (cached && Array.isArray(cached) && cached.length === quiz.questions.length) {
            console.log('💾 Restoring answers from cache:', cached);
            setAnswers(cached);
          } else {
            console.log('🆕 No cached answers - starting fresh');
            setAnswers(new Array(quiz.questions.length).fill(-1));
          }
          setResult(null);
        }
      } catch {
        console.log('❌ Error fetching progress - checking cache');
        // Không có progress cũng không sao
        if (quiz) {
          // Thử khôi phục từ cache
          const cached = getQuizAnswersFromCache(courseId, lessonId);
          if (cached && Array.isArray(cached) && cached.length === quiz.questions.length) {
            console.log('💾 Restoring answers from cache (error fallback):', cached);
            setAnswers(cached);
          } else {
            console.log('🆕 No cached answers - starting fresh (error fallback)');
            setAnswers(new Array(quiz.questions.length).fill(-1));
          }
          setResult(null);
        }
      }
    };
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId, quiz]);

  useEffect(() => {
    if (
      quiz &&
      answers.length === quiz.questions.length &&
      answers.every((a, idx) => a === quiz.questions[idx].correctIndex)
    ) {
      // Nếu đã trả lời đúng hết nhưng quizPassed chưa true, tự động lưu lại
      if (courseId && lessonId && (!result || !result.success)) {
        console.log('🎯 Auto-completing quiz - all answers correct');
        // Lấy watchedSeconds và videoDuration từ progress nếu có
        getProgress(courseId).then(progress => {
          const lessonProgress = progress[lessonId] || {};
          updateProgress(courseId, lessonId, {
            watchedSeconds: lessonProgress.watchedSeconds || 0,
            videoDuration: lessonProgress.videoDuration || 0,
            quizPassed: true,
            quizAnswers: answers,
          });
          setResult({
            success: true,
            message: 'Tất cả đáp án đều đúng!',
            wrongQuestions: [],
          });
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, answers, courseId, lessonId]);

  // Save answers to cache on every change (if not submitted)
  useEffect(() => {
    if (
      quiz &&
      answers.length === quiz.questions.length &&
      !result // Only cache if not submitted
    ) {
      console.log('💾 Saving answers to cache:', answers);
      saveQuizAnswersToCache(courseId, lessonId, answers);
    }
  }, [answers, quiz, courseId, lessonId, result]);

  // Clear cache when quiz is completed
  useEffect(() => {
    if (result && result.success && courseId && lessonId) {
      console.log('🗑️ Clearing cache - quiz completed');
      clearQuizAnswersCache(courseId, lessonId);
    }
  }, [result, courseId, lessonId]);

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
      console.log('📤 Submitting quiz answers:', answers);
      const res = await config.post(`/quizzes/${quiz._id}/submit`, { answers });
      console.log('📥 Quiz submission result:', res.data);
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
        // Clear cache on submit
        console.log('🗑️ Clearing cache after submit');
        clearQuizAnswersCache(courseId, lessonId);
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