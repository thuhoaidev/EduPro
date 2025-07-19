import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Card, Typography, Button, Divider, List, Input, message, Row, Col, Radio, Avatar } from 'antd';
import { config } from '../../../api/axios';
import { LockOutlined, CheckCircleOutlined, UserOutlined, SendOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { getProgress, updateProgress, getUnlockedLessons, getVideoProgress, updateVideoProgress } from '../../../services/progressService';
import { getComments, addComment, replyComment } from '../../../services/lessonCommentService';
import SectionSidebar from './SectionSidebar';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useAuth from '../../../hooks/Auths/useAuth';
import leoProfanity from 'leo-profanity';
dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

type Lesson = { _id: string; title: string };
type Section = { _id: string; title: string; lessons: Lesson[] };
type Comment = { user?: { name?: string }; content: string; createdAt?: string };

const LessonVideoPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [courseSections, setCourseSections] = useState<Section[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [progress, setProgress] = useState<{ completedLessons: string[]; lastWatched?: string; [lessonId: string]: any }>({ completedLessons: [] });
  const [quiz, setQuiz] = useState<{ _id: string; questions: { question: string; options: string[]; correctIndex?: number }[] } | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ success: boolean; message: string; wrongQuestions?: number[] } | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizUnlocked, setQuizUnlocked] = useState(false);

  const [unlockedLessons, setUnlockedLessons] = useState<string[]>([]);
  const [videoProgress, setVideoProgress] = useState(0);
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const updateProgressTimeout = useRef<NodeJS.Timeout | null>(null);
  const [savedVideoTime, setSavedVideoTime] = useState<number>(0);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [commentWarning, setCommentWarning] = useState('');
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [isFree, setIsFree] = useState<boolean | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Debounce function để tránh gọi API liên tục
  const debouncedUpdateProgress = useCallback((courseId: string, lessonId: string, time: number, duration: number) => {
    if (updateProgressTimeout.current) {
      clearTimeout(updateProgressTimeout.current);
    }
    updateProgressTimeout.current = setTimeout(() => {
      updateVideoProgress(courseId, lessonId, time, duration).catch(e => console.error("Failed to update progress", e));
    }, 1000); // Cập nhật 1 giây một lần
  }, []);

  // Hàm chuyển sang bài tiếp theo
  const goToNextLesson = () => {
    if (hasNavigated) return;
    let found = false;
    let nextLessonId = null;
    for (let s = 0; s < courseSections.length; s++) {
      const lessons = courseSections[s].lessons;
      for (let l = 0; l < lessons.length; l++) {
        if (lessons[l]._id === currentLessonId) {
          if (l + 1 < lessons.length) {
            nextLessonId = lessons[l + 1]._id;
          } else if (s + 1 < courseSections.length && courseSections[s + 1].lessons.length > 0) {
            nextLessonId = courseSections[s + 1].lessons[0]._id;
          }
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (nextLessonId) {
      setHasNavigated(true);
      setTimeout(() => {
        navigate(`/lessons/${nextLessonId}/video`);
        setHasNavigated(false);
      }, 2000);
    } else {
      message.success('Bạn đã hoàn thành tất cả các bài học!');
    }
  };

  // Cập nhật tiến độ xem video
  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (courseId && currentLessonId) {
      debouncedUpdateProgress(courseId, currentLessonId, video.currentTime, video.duration);
      if (video.duration > 0) {
        const progressRatio = video.currentTime / video.duration;
        setVideoProgress(progressRatio);
        if (progressRatio >= 0.9 && !videoWatched) {
          // Chỉ đánh dấu đã xem hết video, chưa unlock bài mới
          updateVideoProgress(courseId, currentLessonId, video.currentTime, video.duration).catch(e => console.error("Failed to update progress", e));
          setVideoWatched(true);
        }
      }
    }
  };


  // Khi vào lại bài học, lấy tiến độ đã lưu từ backend
  useEffect(() => {
    if (courseId && lessonId) {
      getVideoProgress(courseId, lessonId)
        .then(progress => {
          // Chỉ set nếu lessonId vẫn là bài học hiện tại
          if (progress && 'videoCompleted' in progress && progress.videoCompleted === false && (!progress.watchedSeconds || progress.watchedSeconds < 5)) {
            setSavedVideoTime(0);
          } else {
            setSavedVideoTime(progress.watchedSeconds);
          }
        })
        .catch(err => console.error("Lỗi lấy tiến độ video", err));
    }
  }, [courseId, lessonId, currentLessonId]);

  // Đảm bảo khi savedVideoTime thay đổi và video đã load, sẽ tua lại đúng vị trí
  useEffect(() => {
    if (videoRef.current && savedVideoTime > 0) {
      videoRef.current.currentTime = savedVideoTime;
    }
  }, [savedVideoTime]);

  // Khi video load xong, tua đến vị trí đã lưu
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current && savedVideoTime > 0) {
      videoRef.current.currentTime = savedVideoTime;
    }
  };

  // Khi xem hết video
  const handleVideoEnded = () => {
    setVideoWatched(true);
    message.info('Bạn đã xem hết video, hãy hoàn thành quiz để mở khóa bài tiếp theo.');
    if (courseId && currentLessonId && videoRef.current) {
      updateVideoProgress(courseId, currentLessonId, videoRef.current.duration, videoRef.current.duration)
        .catch(e => console.error("Failed to update final progress", e));
    }
  };

  useEffect(() => {
    const fetchLessonVideo = async () => {
      try {
        setLoading(true);
        // Lấy video
        const videoRes = await config.get(`/videos/lesson/${lessonId}`);
        setVideoUrl(videoRes.data.data.url);
        setVideoId(videoRes.data.data._id || videoRes.data.data.id || null);
        // Lấy tên bài học từ lesson
        const lessonRes = await config.get(`/lessons/${lessonId}`);
        setLessonTitle(lessonRes.data.data.title || '');
      } catch (e) {
        setError('Không tìm thấy video cho bài học này.');
      } finally {
        setLoading(false);
      }
    };
    fetchLessonVideo();
  }, [lessonId]);

  useEffect(() => {
    if (!lessonId) return;
    (async () => {
      try {
        setCommentLoading(true);
        const commentsData = await getComments(lessonId);
        setComments(commentsData || []);
      } catch (e) { }
      setCommentLoading(false);
    })().catch(() => { });
  }, [lessonId]);

  useEffect(() => {
    setVideoWatched(false);
    setQuizPassed(false);
    setQuizCompleted(false);
    setQuizResult(null);
    setQuizAnswers([]);
    setShowQuiz(false);
    setQuizUnlocked(false);
    setVideoProgress(0); // Reset luôn tiến độ video
  }, [currentLessonId]);

  useEffect(() => {
    setCurrentLessonId(lessonId || null);
  }, [lessonId]);


  useEffect(() => {
    // Lấy thông tin section và course để lấy toàn bộ chương/bài học
    const fetchCourseSections = async () => {
      try {
        setSidebarLoading(true);
        // 1. Lấy lesson để lấy section_id
        const lessonRes = await config.get(`/lessons/${lessonId}`);
        const sectionId = lessonRes.data.data.section_id;
        // 2. Lấy section để lấy course_id
        const sectionRes = await config.get(`/sections/${sectionId}`);
        const courseId = sectionRes.data.data.course_id;
        setCourseId(courseId);
        // 3. Lấy toàn bộ section + lesson của course
        const courseSectionsRes = await config.get(`/courses/${courseId}/sections`);
        setCourseSections(courseSectionsRes.data.data || []);
      } catch (e) {
        setCourseSections([]);
      } finally {
        setSidebarLoading(false);
      }
    };
    if (lessonId) fetchCourseSections();
  }, [lessonId]);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        const progressData = await getProgress(courseId);
        setProgress(progressData || {});
        const unlocked = await getUnlockedLessons(courseId);
        setUnlockedLessons(unlocked || []);
        // Fetch course details to get isFree
        const courseRes = await import('../../../services/apiService');
        const courseApi = courseRes.courseService;
        const courseData = await courseApi.getCourseById(courseId);
        if (courseData) {
          // Use mapApiCourseToAppCourse to get isFree
          const mapped = courseApi.mapApiCourseToAppCourse(courseData);
          setIsFree(mapped.isFree);
        } else {
          setIsFree(false);
        }
      } catch (e) {
        setIsFree(false);
      }
    })().catch(() => { });
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!videoId) return;
    const fetchQuiz = async () => {
      try {
        setQuizLoading(true);
        setQuizError(null);
        const res = await config.get(`/quizzes/video/${videoId}`);
        setQuiz(res.data.data);
        setAnswers(new Array(res.data.data.questions.length).fill(-1));
      } catch (e) {
        setQuizError(e instanceof Error ? e.message : 'Không tìm thấy quiz cho video này.');
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuiz();
  }, [videoId]);

  // Khi component unmount, dọn dẹp timeout
  useEffect(() => {
    return () => {
      if (updateProgressTimeout.current) {
        clearTimeout(updateProgressTimeout.current);
      }
    };
  }, []);

  // Khi load quiz, nếu đã đạt thì set quizResult.success = true để giữ giao diện ĐẠT
  useEffect(() => {
    if (quiz && currentLessonId) {
      const passed = localStorage.getItem(`quiz-passed-${currentLessonId}`);
      if (passed === '1') {
        setQuizResult({ success: true, message: 'Tất cả đáp án đều đúng!' });
      }
    }
  }, [quiz, currentLessonId]);

  // Khi chuyển bài học, reset videoProgress
  useEffect(() => {
    setVideoProgress(0);
  }, [currentLessonId]);

  // Unlock quiz duy nhất 1 lần khi đạt 90%
  useEffect(() => {
    if (!quizUnlocked && videoProgress >= 0.9 && quiz) {
      setQuizUnlocked(true);
    }
  }, [videoProgress, quiz, quizUnlocked]);

  // Quiz chỉ hiển thị nếu đã unlock
  useEffect(() => {
    setShowQuiz(quizUnlocked && !!quiz);
  }, [quizUnlocked, quiz]);

  // Khi load quiz mới, reset quizAnswers đúng số lượng câu hỏi
  useEffect(() => {
    if (quiz) {
      const lessonKey = String(currentLessonId);
      const prevAnswers = progress && progress[lessonKey] && progress[lessonKey].quizAnswers;
      const quizPassed = progress && progress[lessonKey] && progress[lessonKey].quizPassed;
      // Log debug
      console.log('progress:', progress, 'lessonKey:', lessonKey, 'prevAnswers:', prevAnswers, 'quizPassed:', quizPassed, 'quiz:', quiz, 'quizLen:', quiz.questions.length);
      if (Array.isArray(prevAnswers) && prevAnswers.length === quiz.questions.length) {
        setQuizAnswers(prevAnswers);
        // Tự động chấm lại quizResult khi reload
        const wrongQuestions = quiz.questions
          .map((q, idx) => prevAnswers[idx] !== q.correctIndex ? idx : -1)
          .filter(idx => idx !== -1);
        if (quizPassed === true) {
          setQuizResult({ success: true, message: 'Tất cả đáp án đều đúng!' });
        } else if (quizPassed === false) {
          setQuizResult({ success: false, message: 'Có đáp án sai.', wrongQuestions });
        } else {
          setQuizResult(null);
        }
      } else {
        setQuizAnswers(new Array(quiz.questions.length).fill(-1));
        setQuizResult(null);
      }
      setQuizCompleted(false);
    }
  }, [quiz, progress, currentLessonId]);

  // Hàm kiểm tra bài học có được mở không
  const canAccessLesson = (lessonId: string) => {
    return unlockedLessons.map(String).includes(String(lessonId));
  };

  // Hàm gửi bình luận
  const handleComment = async () => {
    if (!newComment.trim() || !lessonId) return;
    try {
      const res = await addComment(lessonId, newComment);
      if (res && res.success === false) {
        if (res.message && res.message.includes('ngôn từ không phù hợp')) {
          message.error('Bình luận của bạn chứa ngôn từ không phù hợp. Vui lòng điều chỉnh lại nội dung!');
        } else {
          message.error(res.message || 'Không thể gửi bình luận');
        }
        return;
      }
      setNewComment('');
      // Reload comments
      const commentsData = await getComments(lessonId);
      setComments(commentsData || []);
      message.success('Đã gửi bình luận!');
    } catch (e: any) {
      if (e?.response?.data?.message && e.response.data.message.includes('ngôn từ không phù hợp')) {
        message.error('Bình luận của bạn chứa ngôn từ không phù hợp. Vui lòng điều chỉnh lại nội dung!');
      } else {
        message.error(e instanceof Error ? e.message : 'Không gửi được bình luận.');
      }
    }
  };

  // Khi submit quiz
  const handleQuizSubmit = async () => {
    if (!quiz) return;
    if (quizAnswers.some(a => a === -1)) {
      message.warning('Bạn cần trả lời tất cả các câu hỏi!');
      return;
    }
    try {
      const res = await config.post(`/quizzes/${quiz._id}/submit`, { answers: quizAnswers });
      setQuizResult(res.data);

      if (courseId && currentLessonId) {
        await updateProgress(courseId, currentLessonId, {
          watchedSeconds: videoRef.current?.currentTime || 0,
          videoDuration: videoRef.current?.duration || 1,
          quizPassed: res.data.success,
          quizAnswers: quizAnswers,
        });

        if (res.data.success) {
          const unlocked = await getUnlockedLessons(courseId);
          setUnlockedLessons(unlocked || []);
          message.success('Bạn đã hoàn thành bài học, bài tiếp theo đã được mở khóa!');
        } else {
          message.warning('Quiz chưa đạt, hãy thử lại.');
        }
      }

      setQuizCompleted(res.data.success);
    } catch (err) {
      message.error('Có lỗi khi nộp bài!');
    }
  };



  // Cho phép làm lại quiz không giới hạn
  const handleQuizRetry = () => {
    setQuizResult(null);
    setQuizAnswers(new Array(quiz?.questions.length || 0).fill(-1));
    setQuizCompleted(false);
  };

  // Định nghĩa điều kiện hiển thị quiz: chỉ cần có quiz hoặc đã từng nộp bài
  const shouldShowQuiz = !!quiz && videoProgress >= 0.9;

  useEffect(() => {
    leoProfanity.add([
      'đm', 'dm', 'cc', 'vcl', 'clm', 'cl', 'dcm', 'địt', 'dit', 'lồn', 'lon', 'cặc', 'cu', 'buồi', 'buoi', 'đụ', 'đéo', 'má', 'me', 'mẹ', 'bố', 'bo', 'chim', 'cai', 'cai...', 'thang', 'thang...', 'con', 'con...', 'chó', 'cho', 'cho chet', 'do ngu', 'mặt dày', 'mat day', 'chó chết', 'cho chet', 'ngu', 'fuck', 'shit'
    ]);
  }, []);

  // Kiểm tra enroll trước khi cho phép học
  useEffect(() => {
    const checkEnrolled = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsEnrolled(false);
        return;
      }
      try {
        // Lấy courseId từ section/lesson
        let courseIdToCheck = courseId;
        if (!courseIdToCheck && lessonId) {
          // Lấy lesson để lấy section_id
          const lessonRes = await config.get(`/lessons/${lessonId}`);
          const sectionId = lessonRes.data.data.section_id;
          // Lấy section để lấy course_id
          const sectionRes = await config.get(`/sections/${sectionId}`);
          courseIdToCheck = sectionRes.data.data.course_id;
        }
        if (!courseIdToCheck) {
          setIsEnrolled(false);
          return;
        }
        const res = await config.get('/users/me/enrollments');
        const enrolledIds = (res.data.data || []).map((enroll: { course: { _id?: string; id?: string } }) => String(enroll.course?._id || enroll.course?.id));
        setIsEnrolled(enrolledIds.includes(String(courseIdToCheck)));
      } catch {
        setIsEnrolled(false);
      }
    };
    checkEnrolled();
  }, [courseId, lessonId]);

  // Nếu chưa enroll và không phải khóa học free
  if (isEnrolled === false && !isFree) {
    return <Alert message="Bạn cần đăng ký khóa học để học bài này." type="warning" showIcon style={{ margin: 32 }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', height: '100vh', background: '#f4f6fa' }}>
      <div style={{ width: '30%', minWidth: 280, maxWidth: 400, background: '#fff', boxShadow: '0 2px 16px #e6e6e6', borderRadius: 16, margin: 16, height: 'calc(100vh - 32px)' }}>
        <SectionSidebar
          sections={courseSections}
          unlockedLessons={unlockedLessons}
          currentLessonId={currentLessonId}
          progress={progress}
          currentVideoProgress={Math.round(videoProgress * 100)}
          isVideoPlaying={isVideoPlaying}
          onSelectLesson={(lessonId) => {
            navigate(`/lessons/${lessonId}/video`);
          }}
        />
      </div>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{ flex: '0 0 70%', padding: '32px 40px', overflowY: 'auto', height: '100vh', background: 'transparent' }}
      >
        {loading ? (
          <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>
        ) : error ? (
          <Alert message="Lỗi" description={error} type="error" showIcon style={{ margin: 32 }} />
        ) : (
          <>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>{lessonTitle}</Title>
            <Divider style={{ margin: '12px 0 24px 0' }} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', marginBottom: 32, padding: 0 }} bodyStyle={{ padding: 0 }}>
                {videoUrl ? (
                  <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden' }}>
                    <video
                      ref={videoRef}
                      key={videoUrl}
                      src={videoUrl}
                      controls
                      style={{ width: '100%', borderRadius: 0, background: '#000' }}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleVideoEnded}
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                    >
                      Trình duyệt không hỗ trợ video tag.
                    </video>
                    {videoWatched && !quiz && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 right-4 z-10">
                        <span style={{ background: '#52c41a', color: '#fff', padding: '10px 24px', borderRadius: 32, boxShadow: '0 2px 8px #b7eb8f', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 18 }}>
                          <CheckCircleOutlined style={{ fontSize: 22 }} /> Đã hoàn thành bài học
                        </span>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Alert message="Không có video" type="warning" style={{ borderRadius: 12, margin: 24 }} />
                )}
              </Card>
            </motion.div>

            {/* Quiz Section */}
            {showQuiz && quiz && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', marginBottom: 32, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
                  {quiz.questions.map((q, idx) => (
                    <div key={idx} style={{ marginBottom: 32, background: '#f8fafc', borderRadius: 12, padding: 18, boxShadow: '0 1px 6px #f0f0f0' }}>
                      <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 17 }}>Câu {idx + 1}: {q.question}</div>
                      <Radio.Group
                        onChange={e => setQuizAnswers(prev => prev.map((a, i) => (i === idx ? e.target.value : a)))}
                        value={quizAnswers[idx]}
                        disabled={!!quizResult && quizResult.success}
                        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                      >
                        {q.options.map((opt, oIdx) => (
                          <Radio key={oIdx} value={oIdx} style={{
                            background: quizResult && quizResult.success && q.correctIndex === oIdx ? '#e6fffb' : undefined,
                            color: quizResult && quizResult.success && q.correctIndex === oIdx ? '#389e8a' : undefined,
                            borderRadius: 8,
                            padding: '6px 12px',
                            marginBottom: 4,
                            fontWeight: 500,
                            fontSize: 16,
                            border: quizResult && quizResult.success && q.correctIndex === oIdx ? '1.5px solid #52c41a' : '1px solid #e0e0e0',
                            boxShadow: quizResult && quizResult.success && q.correctIndex === oIdx ? '0 2px 8px #b7eb8f' : undefined
                          }}>
                            {opt}
                            {quizResult && quizResult.success && q.correctIndex === oIdx && (
                              <span style={{ color: '#52c41a', marginLeft: 8, fontWeight: 600 }}>(Đáp án đúng)</span>
                            )}
                          </Radio>
                        ))}
                      </Radio.Group>
                      {quizResult && quizResult.wrongQuestions?.includes(idx) && (
                        <div style={{ color: '#ff4d4f', marginTop: 8, fontWeight: 500 }}>Đáp án chưa đúng</div>
                      )}
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                    <Button type="primary" size="large" onClick={handleQuizSubmit} disabled={!!quizResult && quizResult.success} style={{ minWidth: 120, fontWeight: 600, fontSize: 17 }}>Nộp bài</Button>
                    {quizResult && !quizResult.success && (
                      <Button onClick={handleQuizRetry} style={{ minWidth: 100 }}>Làm lại</Button>
                    )}
                  </div>
                  {quizResult && (
                    <div style={{ marginTop: 24 }}>
                      <Alert
                        message={quizResult.success ? '🎉 Chúc mừng!' : 'Kết quả'}
                        description={quizResult.message}
                        type={quizResult.success ? 'success' : 'error'}
                        showIcon
                        style={{ borderRadius: 10, fontWeight: 500, fontSize: 16 }}
                      />
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Comments Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card title={<span style={{ fontWeight: 700, fontSize: 20 }}>Bình luận</span>} style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
                <List
                  loading={commentLoading}
                  dataSource={comments}
                  locale={{ emptyText: 'Chưa có bình luận nào.' }}
                  renderItem={(item) => (
                    <List.Item style={{ alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} style={{ background: '#e6f7ff', color: '#1890ff' }} />}
                        title={<span style={{ fontWeight: 600 }}>{item.user?.name || 'Anonymous'}</span>}
                        description={<span style={{ fontSize: 16 }}>{item.content}</span>}
                      />
                      <div style={{ color: '#888', fontSize: 13, minWidth: 80, textAlign: 'right' }}>{dayjs(item.createdAt).fromNow()}</div>
                    </List.Item>
                  )}
                />
                <Row style={{ marginTop: 24, alignItems: 'flex-end' }} gutter={12}>
                  <Col flex="auto">
                    <TextArea
                      rows={3}
                      value={newComment}
                      onChange={(e) => {
                        setNewComment(e.target.value);
                        if (leoProfanity.check(e.target.value)) setCommentWarning('⚠️ Bình luận của bạn chứa ngôn từ không phù hợp!');
                        else setCommentWarning('');
                      }}
                      placeholder="Viết bình luận của bạn..."
                      style={{ borderRadius: 10, fontSize: 16, padding: 12, boxShadow: '0 1px 4px #f0f0f0' }}
                    />
                    {commentWarning && <div style={{ color: '#ff4d4f', margin: '8px 0', fontWeight: 500 }}>{commentWarning}</div>}
                  </Col>
                  <Col>
                    <Button type="primary" icon={<SendOutlined />} onClick={handleComment} style={{ height: 48, width: 60, borderRadius: 10, fontSize: 20 }} disabled={!newComment.trim() || !!commentWarning}>
                      Gửi
                    </Button>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LessonVideoPage; 
