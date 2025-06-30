import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Card, Typography, Button, Divider, List, Input, message, Row, Col, Radio, Avatar } from 'antd';
import { config } from '../../../api/axios';
import { LockOutlined, CheckCircleOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import { getProgress, updateProgress, getUnlockedLessons } from '../../../services/progressService';
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

  // Lưu thời gian xem video vào localStorage
  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (currentLessonId) {
      localStorage.setItem(`video-progress-${currentLessonId}`, String(video.currentTime));
      if (video.duration > 0) {
        setVideoProgress(video.currentTime / video.duration);
      }
    }
  };

  // Khi vào lại bài học, nếu có thời gian đã lưu thì tự động tua video đến thời gian đó
  const videoRef = React.useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (currentLessonId && videoRef.current) {
      const saved = localStorage.getItem(`video-progress-${currentLessonId}`);
      if (saved && !isNaN(Number(saved))) {
        videoRef.current.currentTime = Number(saved);
      }
    }
  }, [videoUrl, currentLessonId]);

  // Khi video load xong, set lại currentTime nếu có
  const handleVideoLoadedMetadata = () => {
    if (currentLessonId && videoRef.current) {
      const saved = localStorage.getItem(`video-progress-${currentLessonId}`);
      if (saved && !isNaN(Number(saved))) {
        videoRef.current.currentTime = Number(saved);
      }
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
    setVideoWatched(false);
    setQuizPassed(false);
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
        // Nếu lỗi, thử lấy từ localStorage (nếu đã từng vào trang chi tiết khóa học)
        const cached = localStorage.getItem('lastCourseSections');
        if (cached) {
          setCourseSections(JSON.parse(cached));
        } else {
          setCourseSections([]);
        }
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

  // Khi load quiz, khôi phục đáp án từ localStorage nếu có
  useEffect(() => {
    if (quiz && currentLessonId) {
      const saved = localStorage.getItem(`quiz-answers-${currentLessonId}`);
      if (saved) {
        try {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length === quiz.questions.length) {
            setAnswers(arr);
          }
        } catch (e) {}
      }
    }
  }, [quiz, currentLessonId]);

  // Khi chọn đáp án hoặc nộp quiz, lưu đáp án vào localStorage
  useEffect(() => {
    if (currentLessonId && answers.length > 0) {
      localStorage.setItem(`quiz-answers-${currentLessonId}`, JSON.stringify(answers));
    }
  }, [answers, currentLessonId]);

  // Khi làm lại quiz, xóa đáp án khỏi localStorage
  const handleQuizRetry = () => {
    if (currentLessonId) {
      localStorage.removeItem(`quiz-answers-${currentLessonId}`);
      localStorage.removeItem(`quiz-passed-${currentLessonId}`);
    }
    setQuizResult(null);
    setAnswers(new Array(quiz?.questions.length).fill(-1));
  };

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

  const handleQuizChange = (qIdx: number, value: number) => {
    setAnswers(prev => prev.map((a, idx) => (idx === qIdx ? value : a)));
  };

  const handleQuizSubmit = async () => {
    if (!quiz) return;
    if (answers.some(a => a === -1)) {
      message.warning('Bạn cần trả lời tất cả các câu hỏi!');
      return;
    }
    try {
      const res = await config.post(`/quizzes/${quiz._id}/submit`, { answers });
      setQuizResult(res.data);
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Có lỗi khi nộp bài!');
    }
  };

  // Hàm kiểm tra bài học có được mở không
  const canAccessLesson = (lessonId: string) => unlockedLessons.includes(lessonId);

  // Khi xem hết video
  const handleVideoEnded = () => {
    setVideoWatched(true);
  };

  // Khi quiz đạt 100%
  useEffect(() => {
    if (quizResult && quizResult.success) {
      setQuizPassed(true);
    }
  }, [quizResult]);

  // Khi cả hai điều kiện đều đúng và bài học chưa hoàn thành, mới lưu tiến độ
  useEffect(() => {
    if (
      videoWatched && quizPassed && currentLessonId && courseId &&
      !unlockedLessons.includes(currentLessonId)
    ) {
      (async () => {
        if (videoRef.current) {
          await config.post('/users/me/enrollments/progress', { lessonId: currentLessonId });
          // Sau khi lưu, reload lại progress
          const enrollRes = await config.get('/users/me/enrollments');
          const enrollment = (enrollRes.data.data || []).find((enroll: unknown) => {
            if (typeof enroll === 'object' && enroll !== null && 'course' in enroll) {
              const course = (enroll as { course?: { _id?: string; id?: string } }).course;
              return (course?._id || course?.id) === courseId;
            }
            return false;
          });
          setProgress(enrollment?.progress || { completedLessons: [] });
        }
      })().catch(() => {});
    }
  }, [videoWatched, quizPassed, currentLessonId, courseId]);

  // Khi progress.completedLessons thay đổi, chỉ thêm mới vào unlockedLessons, không reset lại mảng
  useEffect(() => {
    if (!courseSections.length) return;
    const completed: string[] = [];
    for (const section of courseSections) {
      for (let l = 0; l < section.lessons.length; l++) {
        const lesson = section.lessons[l];
        if (progress.completedLessons?.includes(lesson._id)) {
          completed.push(lesson._id);
        }
      }
    }
    // Luôn merge unlockedLessons với completed để không mất lịch sử
    setUnlockedLessons(prev => Array.from(new Set([...prev, ...completed])));
  }, [progress.completedLessons, courseSections]);

  // Khi quiz đạt, lưu trạng thái ĐẠT vào localStorage
  useEffect(() => {
    if (quizResult && quizResult.success && currentLessonId) {
      localStorage.setItem(`quiz-passed-${currentLessonId}`, '1');
    }
  }, [quizResult, currentLessonId]);

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

  // Khi videoProgress đạt >= 90% thì mở khóa bài tiếp theo nếu chưa mở
  useEffect(() => {
    if (!courseSections.length || !currentLessonId) return;
    if (videoProgress >= 0.9) {
      // Tìm bài học tiếp theo
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
      if (nextLessonId && !unlockedLessons.includes(nextLessonId)) {
        setUnlockedLessons(prev => Array.from(new Set([...prev, nextLessonId])));
      }
    }
  }, [videoProgress, courseSections, currentLessonId, unlockedLessons]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;

  return (
    <Row gutter={32}>
      <Col flex="250px">
        <SectionSidebar
          sections={courseSections}
          unlockedLessons={unlockedLessons}
          currentLessonId={currentLessonId}
          progress={progress}
          onSelectLesson={lessonId => navigate(`/lessons/${lessonId}/video`)}
        />
      </Col>
      <Col flex="auto">
        <div className="max-w-3xl mx-auto p-4">
          <Card bordered={false} className="shadow-lg rounded-xl bg-gradient-to-br from-white via-cyan-50 to-purple-50 p-0 overflow-hidden">
            <div className="relative">
              {videoUrl ? (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full rounded-t-xl mb-0 shadow-lg"
                    style={{ maxHeight: 480, background: '#000' }}
                    onEnded={handleVideoEnded}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                  />
                  {videoWatched && quizPassed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 right-4 z-10">
                      <span className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <CheckCircleOutlined className="text-xl" /> Đã hoàn thành bài học
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <Alert message="Không tìm thấy video cho bài học này." type="warning" showIcon />
              )}
            </div>
            <Divider className="my-4" />
            {videoProgress < 0.9 ? null : quiz && quiz.questions?.length > 0 ? (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
                <Card bordered={false} className="rounded-xl shadow-md bg-gradient-to-br from-cyan-50 to-purple-50">
                  <Title level={4} className="mb-4 text-cyan-700">Quiz</Title>
                  {quizLoading ? (
                    <Spin size="large" />
                  ) : quizError ? (
                    <Alert message="Lỗi" description={quizError} type="error" showIcon />
                  ) : quiz ? (
                    <div>
                      {quiz.questions.map((q, idx) => (
                        <motion.div key={idx} className="mb-6" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                          <div className="font-semibold mb-2">Câu {idx + 1}: {q.question}</div>
                          <Radio.Group
                            onChange={e => handleQuizChange(idx, e.target.value)}
                            value={answers[idx]}
                            disabled={!!quizResult}
                            className="flex flex-col gap-1"
                          >
                            {q.options.map((opt, oIdx) => (
                              <Radio key={oIdx} value={oIdx} className={`block mb-1 ${quizResult && quizResult.wrongQuestions?.includes(idx) && oIdx === q.correctIndex ? 'text-green-700 font-bold' : ''}`}>{opt}</Radio>
                            ))}
                          </Radio.Group>
                          {quizResult && quizResult.wrongQuestions?.includes(idx) && (
                            <div className="text-red-600 mt-1">
                              Đáp án đúng: <span className="font-bold text-green-700">{q.options[q.correctIndex ?? 0]}</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      <div className="flex gap-4 mt-4">
                        <Button type="primary" size="large" onClick={handleQuizSubmit} disabled={!!quizResult} className="bg-gradient-to-r from-cyan-500 to-purple-500 border-0 shadow-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300">
                          Nộp bài
                        </Button>
                        {quizResult && !quizResult.success && (
                          <Button onClick={handleQuizRetry} type="default" size="large" className="border-cyan-300">
                            Làm lại
                          </Button>
                        )}
                      </div>
                      {quizResult && (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-6 flex flex-col gap-3">
                          <Alert
                            message={quizResult.success ? 'ĐẠT' : 'CHƯA ĐẠT'}
                            type={quizResult.success ? 'success' : 'error'}
                            showIcon
                            className="text-lg font-bold"
                          />
                          {quizResult.success && videoWatched && (
                            <Button
                              type="primary"
                              size="large"
                              className="bg-gradient-to-r from-green-400 to-cyan-500 border-0 shadow-lg"
                              onClick={() => {
                                // Tìm bài học tiếp theo
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
                                  navigate(`/lessons/${nextLessonId}/video`);
                                } else {
                                  message.success('Bạn đã hoàn thành tất cả các bài học!');
                                }
                              }}
                            >
                              Học bài tiếp theo
                            </Button>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ) : null}
                </Card>
              </motion.div>
            ) : (
              <Paragraph className="text-gray-500">Bài học này chưa có quiz.</Paragraph>
            )}
            <Divider className="my-4" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card bordered={false} className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-md mt-8 p-6">
                <Title level={4} className="mb-4 text-cyan-700">Bình luận</Title>
                <List
                  loading={commentLoading}
                  dataSource={comments}
                  locale={{ emptyText: 'Chưa có bình luận nào.' }}
                  renderItem={(item: Comment) => (
                    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                      <List.Item className="!items-start !border-0 !bg-transparent !py-4">
                        <div className="flex items-start gap-4 w-full">
                          <div className="relative">
                            <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 blur opacity-40"></span>
                            <Avatar src={item.user?.avatar} icon={<UserOutlined />} size={48} className="border-4 border-white shadow-lg relative z-10" />
                          </div>
                          <div className="flex-1">
                            <div className="bg-gradient-to-br from-cyan-50 to-white rounded-xl px-5 py-4 shadow-inner relative">
                              <Text className="block text-base font-medium bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                {item.user?.name || 'Người dùng'}
                              </Text>
                              <Text className="block text-gray-800 mb-2">{item.content}</Text>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">{item.createdAt ? dayjs(item.createdAt).fromNow() : ''}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    </motion.div>
                  )}
                  className="mb-4"
                />
                <div className="flex items-end gap-3 mt-4">
                  <Avatar
                    src={user?.avatar && user?.avatar !== 'default-avatar.jpg' && user?.avatar !== ''
                      ? user.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || user?.name || 'User')}&background=4f8cff&color=fff&size=256`}
                    icon={<UserOutlined />}
                    size={40}
                    className="border-2 border-cyan-400 shadow"
                  />
                  <div className="flex-1">
                    <TextArea
                      rows={2}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Nhập bình luận..."
                      maxLength={500}
                      className="rounded-xl shadow focus:shadow-lg focus:border-cyan-400 transition-all duration-200"
                    />
                  </div>
                  <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08 }}>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<SendOutlined />}
                      size="large"
                      onClick={handleComment}
                      disabled={!newComment.trim()}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 border-0 shadow-lg flex items-center justify-center"
                      style={{ height: 48, width: 48 }}
                    />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default LessonVideoPage; 