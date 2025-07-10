import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Card, Typography, Button, Divider, List, Input, message, Row, Col, Radio, Avatar } from 'antd';
import { config } from '../../../api/axios';
import { LockOutlined, CheckCircleOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import { getProgress, updateProgress, getUnlockedLessons, getVideoProgress, updateVideoProgress } from '../../../services/progressService';
import { getComments, addComment, replyComment } from '../../../services/lessonCommentService';
import SectionSidebar from './SectionSidebar';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useAuth from '../../../hooks/Auths/useAuth';
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
  const [progress, setProgress] = useState<{ completedLessons: string[]; lastWatched?: string }>({ completedLessons: [] });
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
        // Nếu vừa đạt 90% thì gọi updateProgress để backend mở khóa bài tiếp theo
        if (progressRatio >= 0.9 && !videoWatched) {
          // Chỉ cần 90% video là đủ, không cần quizPassed
          updateProgress(courseId, currentLessonId, {
            watchedSeconds: video.currentTime,
            videoDuration: video.duration,
            quizPassed: false // Không cần quizPassed, chỉ cần videoCompleted
          }).then(() => {
            getUnlockedLessons(courseId).then(unlocked => {
              setUnlockedLessons(unlocked || []);
              console.log('Đã cập nhật unlockedLessons sau khi đạt 90% video:', unlocked);
            });
          });
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
          if (progress && typeof progress.watchedSeconds === 'number' && lessonId === currentLessonId) {
            // Nếu bài học vừa unlock (videoCompleted === false và watchedSeconds < 5), luôn phát từ đầu
            if (progress.videoCompleted === false && (!progress.watchedSeconds || progress.watchedSeconds < 5)) {
              setSavedVideoTime(0);
            } else {
              setSavedVideoTime(progress.watchedSeconds);
            }
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
      } catch (e) {}
      setCommentLoading(false);
    })().catch(() => {});
  }, [lessonId]);

  useEffect(() => {
    setCurrentLessonId(lessonId || null);
    setVideoWatched(false); // Reset lại khi chuyển bài
    setQuizPassed(false);
    setQuizCompleted(false);
    setQuizResult(null);
    setQuizAnswers([]);
    setShowQuiz(false);
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
      } catch (e) {}
    })().catch(() => {});
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

  // Khi video đạt >= 50% thì mới show quiz
  useEffect(() => {
    if (videoProgress >= 0.5 && quiz && !quizCompleted) {
      setShowQuiz(true);
    } else {
      setShowQuiz(false);
    }
  }, [videoProgress, quiz, quizCompleted]);

  // Khi quiz đúng 100% và video >= 90% thì mở khóa bài tiếp theo
  useEffect(() => {
    if (quizCompleted && videoProgress >= 0.9 && courseId && currentLessonId) {
      updateProgress(courseId, currentLessonId, {
        watchedSeconds: videoRef.current?.currentTime || 0,
        videoDuration: videoRef.current?.duration || 1,
        quizPassed: true
      }).then(() => {
        getUnlockedLessons(courseId).then(unlocked => setUnlockedLessons(unlocked || []));
      });
    }
  }, [quizCompleted, videoProgress, courseId, currentLessonId]);

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
      await addComment(lessonId, newComment);
      setNewComment('');
      // Reload comments
      const commentsData = await getComments(lessonId);
      setComments(commentsData || []);
      message.success('Đã gửi bình luận!');
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Không gửi được bình luận.');
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
        updateProgress(courseId, currentLessonId, {
          watchedSeconds: videoRef.current?.currentTime || 0,
          videoDuration: videoRef.current?.duration || 1,
          quizPassed: res.data.success,
          quizAnswers: quizAnswers
        }).then(() => {
          getUnlockedLessons(courseId).then(unlocked => setUnlockedLessons(unlocked || []));
        });
      }
      if (res.data.success) {
        setQuizCompleted(true);
      } else {
        setQuizCompleted(false);
      }
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
  const shouldShowQuiz = !!quiz;

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;

  return (
    <div style={{ display: 'flex' }}>
      <SectionSidebar
        sections={courseSections}
        unlockedLessons={unlockedLessons}
        currentLessonId={currentLessonId}
        progress={progress}
        onSelectLesson={(lessonId) => {
          navigate(`/lessons/${lessonId}/video`);
        }}
        canAccessLesson={canAccessLesson}
      />
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{ flex: 1, padding: '20px', overflowY: 'auto', height: '100vh' }}
      >
        {loading ? (
          <Spin size="large" />
        ) : error ? (
          <Alert message={error} type="error" />
        ) : (
          <>
            <Title level={2}>{lessonTitle}</Title>
            <div className="relative">
                <Card>
                    {videoUrl ? (
                    <video
                        ref={videoRef}
                        key={videoUrl}
                        src={videoUrl}
                        controls
                        style={{ width: '100%' }}
                        onTimeUpdate={handleVideoTimeUpdate}
                        onEnded={handleVideoEnded}
                        onLoadedMetadata={handleVideoLoadedMetadata}
                    >
                        Trình duyệt không hỗ trợ video tag.
                    </video>
                    ) : (
                    <Alert message="Không có video" type="warning" />
                    )}
                </Card>

                {videoWatched && !quiz && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 right-4 z-10">
                        <span className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <CheckCircleOutlined className="text-xl" /> Đã hoàn thành bài học
                        </span>
                    </motion.div>
                )}
            </div>

            <Divider />

            {/* Quiz Section */}
            {shouldShowQuiz && quiz && (
              <div className="mt-8">
                <Card variant="outlined" className="shadow-lg rounded-xl">
                  <Title level={3}>Quiz: {quiz.questions.length} câu hỏi</Title>
                  {quiz.questions.map((q, idx) => (
                    <div key={idx} className="mb-6">
                      <div className="font-semibold mb-2">Câu {idx + 1}: {q.question}</div>
                      <Radio.Group
                        onChange={e => setQuizAnswers(prev => prev.map((a, i) => (i === idx ? e.target.value : a)))}
                        value={quizAnswers[idx]}
                        disabled={false}
                      >
                        {q.options.map((opt, oIdx) => (
                          <Radio key={oIdx} value={oIdx} className="block mb-1">
                            {opt}
                            {quizResult && quizResult.success && q.correctIndex === oIdx && (
                              <span style={{ color: '#52c41a', marginLeft: 8 }}>(Đáp án đúng)</span>
                            )}
                          </Radio>
                        ))}
                      </Radio.Group>
                      {quizResult && quizResult.wrongQuestions?.includes(idx) && (
                        <div className="text-red-600 mt-1">Đáp án chưa đúng</div>
                      )}
                    </div>
                  ))}
                  <Button type="primary" size="large" onClick={handleQuizSubmit} disabled={!!quizResult && quizResult.success}>Nộp bài</Button>
                  {quizResult && (
                    <Button className="ml-4" onClick={handleQuizRetry}>Làm lại</Button>
                  )}
                  {quizResult && (
                    <Alert
                      className="mt-6"
                      message={quizResult.success ? 'Chúc mừng!' : 'Kết quả'}
                      description={quizResult.message}
                      type={quizResult.success ? 'success' : 'error'}
                      showIcon
                    />
                  )}
                </Card>
              </div>
            )}

            <Divider />

            {/* Comments Section */}
            <Card title="Bình luận">
                <List
                    loading={commentLoading}
                    dataSource={comments}
                    renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={item.user?.name || 'Anonymous'}
                        description={item.content}
                        />
                        <div>{dayjs(item.createdAt).fromNow()}</div>
                    </List.Item>
                    )}
                />
                <Row style={{ marginTop: 20 }}>
                    <Col flex="auto">
                    <TextArea
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                    />
                    </Col>
                    <Col>
                    <Button type="primary" icon={<SendOutlined />} onClick={handleComment} style={{ height: '100%' }}>
                        Gửi
                    </Button>
                    </Col>
                </Row>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LessonVideoPage; 