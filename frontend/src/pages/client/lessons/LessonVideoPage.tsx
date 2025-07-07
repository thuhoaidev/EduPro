import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Card, Typography, Button, Divider, List, Input, message, Row, Col, Radio } from 'antd';
import { config } from '../../../api/axios';
import { LockOutlined } from '@ant-design/icons';

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
      } catch {
        setError('Không tìm thấy video cho bài học này.');
      } finally {
        setLoading(false);
      }
    };
    fetchLessonVideo();
  }, [lessonId]);

  useEffect(() => {
    // Lấy bình luận
    const fetchComments = async () => {
      try {
        setCommentLoading(true);
        const res = await config.get(`/lessons/${lessonId}/comments`);
        setComments(res.data.data || []);
      } catch {
        // ignore
      }
      setCommentLoading(false);
    };
    fetchComments();
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
      } catch (err: unknown) {
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
    // Lấy progress học của user cho khóa học này
    const fetchProgress = async () => {
      try {
        // Lấy lesson để lấy section_id
        const lessonRes = await config.get(`/lessons/${lessonId}`);
        const sectionId = lessonRes.data.data.section_id;
        // Lấy section để lấy course_id
        const sectionRes = await config.get(`/sections/${sectionId}`);
        const courseId = sectionRes.data.data.course_id;
        // Lấy progress từ enrollments
        const enrollRes = await config.get('/users/me/enrollments');
        const enrollment = (enrollRes.data.data || []).find((enroll: unknown) => {
          if (typeof enroll === 'object' && enroll !== null && 'course' in enroll) {
            const course = (enroll as { course?: { _id?: string; id?: string } }).course;
            return (course?._id || course?.id) === courseId;
          }
          return false;
        });
        setProgress(enrollment?.progress || { completedLessons: [] });
      } catch {
        // ignore
      }
    };
    if (lessonId) fetchProgress();
  }, [lessonId]);

  useEffect(() => {
    if (!videoId) return;
    const fetchQuiz = async () => {
      try {
        setQuizLoading(true);
        setQuizError(null);
        const res = await config.get(`/quizzes/video/${videoId}`);
        setQuiz(res.data.data);
        setAnswers(new Array(res.data.data.questions.length).fill(-1));
      } catch (err: unknown) {
        setQuizError(err instanceof Error ? err.message : 'Không tìm thấy quiz cho video này.');
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
        } catch {}
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
    if (!newComment.trim()) return;
    try {
      await config.post(`/lessons/${lessonId}/comments`, { content: newComment });
      setNewComment('');
      // Reload comments
      const res = await config.get(`/lessons/${lessonId}/comments`);
      setComments(res.data.data || []);
      message.success('Đã gửi bình luận!');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Không gửi được bình luận.');
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
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Có lỗi khi nộp bài!');
    }
  };

  // Hàm kiểm tra bài học có được mở không
  const canAccessLesson = (lessonId: string, idx: number, lessons: Lesson[]) => {
    if (idx === 0) return true;
    if (progress.completedLessons?.includes(lessonId)) return true;
    if (lessonId === progress.lastWatched) return true;
    // Nếu bài trước đã hoàn thành thì mở bài này
    const prevLesson = lessons[idx - 1];
    return progress.completedLessons?.includes(prevLesson._id);
  };

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
      videoWatched && quizPassed && currentLessonId &&
      !progress.completedLessons?.includes(currentLessonId)
    ) {
      (async () => {
        try {
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
        } catch {}
      })();
    }
  }, [videoWatched, quizPassed, currentLessonId, courseId]);

  // Khi progress.completedLessons thay đổi, chỉ thêm mới vào unlockedLessons, không reset lại mảng
  useEffect(() => {
    if (!courseSections.length) return;
    let completed: string[] = [];
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
      <Col flex="auto">
        <div className="max-w-3xl mx-auto p-4">
          <Card bordered={false} className="shadow-lg rounded-xl">
            <Title level={3}>{lessonTitle || 'Bài học'}</Title>
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-lg mb-4"
                style={{ maxHeight: 480 }}
                onEnded={handleVideoEnded}
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
              />
            ) : (
              <Alert message="Không tìm thấy video cho bài học này." type="warning" showIcon />
            )}
            <Divider />
            {quiz && quiz.questions?.length > 0 ? (
              <div className="mb-8">
                <Title level={4} className="mb-4">Quiz</Title>
                {quizLoading ? (
                  <Spin size="large" />
                ) : quizError ? (
                  <Alert message="Lỗi" description={quizError} type="error" showIcon />
                ) : quiz ? (
                  <div>
                    {quiz.questions.map((q, idx) => (
                      <div key={idx} className="mb-6">
                        <div className="font-semibold mb-2">Câu {idx + 1}: {q.question}</div>
                        <Radio.Group
                          onChange={e => handleQuizChange(idx, e.target.value)}
                          value={answers[idx]}
                          disabled={!!quizResult}
                        >
                          {q.options.map((opt, oIdx) => (
                            <Radio key={oIdx} value={oIdx} className="block mb-1">{opt}</Radio>
                          ))}
                        </Radio.Group>
                        {quizResult && quizResult.wrongQuestions?.includes(idx) && (
                          <div className="text-red-600 mt-1">
                            Đáp án đúng: <span className="font-bold text-green-700">{q.options[q.correctIndex ?? 0]}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button type="primary" size="large" onClick={handleQuizSubmit} disabled={!!quizResult}>Nộp bài</Button>
                    {quizResult && (
                      <div className="mt-6 flex flex-col gap-3">
                        <Alert
                          message={quizResult.success ? 'ĐẠT' : 'CHƯA ĐẠT'}
                          type={quizResult.success ? 'success' : 'error'}
                          showIcon
                        />
                        {quizResult.success && videoWatched ? (
                          <Button
                            type="primary"
                            size="large"
                            onClick={() => {
                              // Tìm bài học tiếp theo
                              let found = false;
                              let nextLessonId = null;
                              for (let s = 0; s < courseSections.length; s++) {
                                const lessons = courseSections[s].lessons;
                                for (let l = 0; l < lessons.length; l++) {
                                  if (lessons[l]._id === currentLessonId) {
                                    // Nếu còn bài tiếp theo trong section này
                                    if (l + 1 < lessons.length) {
                                      nextLessonId = lessons[l + 1]._id;
                                    } else if (s + 1 < courseSections.length && courseSections[s + 1].lessons.length > 0) {
                                      // Nếu hết section, chuyển sang bài đầu tiên của section tiếp theo
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
                                // Không còn bài tiếp theo
                                message.success('Bạn đã hoàn thành tất cả các bài học!');
                              }
                            }}
                          >
                            Học bài tiếp theo
                          </Button>
                        ) : !quizResult.success ? (
                          <Button onClick={handleQuizRetry} type="default" size="large">
                            Làm lại
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <Paragraph className="text-gray-500">Bài học này chưa có quiz.</Paragraph>
            )}
            <Divider />
            <Title level={4} className="mt-8 mb-2">Bình luận</Title>
            <List
              loading={commentLoading}
              dataSource={comments}
              locale={{ emptyText: 'Chưa có bình luận nào.' }}
              renderItem={(item: Comment) => (
                <List.Item>
                  <div>
                    <Text strong>{item.user?.name || 'Người dùng'}</Text>
                    <div className="text-gray-700">{item.content}</div>
                    <div className="text-gray-400 text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</div>
                  </div>
                </List.Item>
              )}
              className="mb-4"
            />
            <TextArea
              rows={3}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Nhập bình luận..."
              maxLength={500}
              className="mb-2"
            />
            <Button type="primary" onClick={handleComment} disabled={!newComment.trim()}>
              Gửi bình luận
            </Button>
          </Card>
        </div>
      </Col>
      <Col flex="350px">
        <div className="sticky top-4">
          <Card bordered={false} className="shadow-md rounded-xl">
            <Title level={4} className="mb-4">Nội dung khóa học</Title>
            {sidebarLoading ? (
              <div className="text-center py-8"><Spin size="large" /></div>
            ) : courseSections.length === 0 ? (
              <Paragraph type="secondary">Không tìm thấy nội dung khóa học. Hãy vào lại trang chi tiết khóa học trước khi học video.</Paragraph>
            ) : (
              <div className="overflow-y-auto max-h-[80vh] pr-2">
                {courseSections.map((section: any, sIdx: number) => (
                  <div key={section._id} className="mb-4">
                    <div className="font-semibold text-cyan-700 mb-2">Chương {sIdx + 1}: {section.title}</div>
                    <ul className="pl-2">
                      {section.lessons.map((lesson: Lesson, lIdx: number) => {
                        const unlocked = unlockedLessons.includes(lesson._id) || progress.completedLessons?.includes(lesson._id);
                        let progressValue = 0;
                        let progressColor = '#d9d9d9';
                        let showProgress = false;
                        if (progress.completedLessons?.includes(lesson._id)) {
                          progressValue = 100;
                          progressColor = '#52c41a';
                          showProgress = true;
                        } else if (lesson._id === currentLessonId) {
                          progressValue = Math.floor(videoProgress * 100);
                          if (progressValue > 100) progressValue = 100;
                          if (progressValue > 0) progressColor = progressValue === 100 ? '#52c41a' : '#faad14';
                          showProgress = true;
                        } else if (progress.lastWatched && lesson._id === progress.lastWatched) {
                          progressValue = 50;
                          progressColor = '#faad14';
                          showProgress = true;
                        } else if (unlockedLessons.includes(lesson._id) && localStorage.getItem(`video-progress-${lesson._id}`)) {
                          // Nếu là bài đã từng học dở (có lưu thời gian xem), hiển thị tiến độ tương ứng
                          const saved = localStorage.getItem(`video-progress-${lesson._id}`);
                          const duration = 1; // Không có duration thực, chỉ hiển thị 50%
                          progressValue = 50;
                          progressColor = '#faad14';
                          showProgress = true;
                        }
                        return (
                          <li key={lesson._id}
                            className={`mb-1 ${lesson._id === currentLessonId ? 'bg-cyan-100 font-bold rounded px-2' : ''}`}
                            style={{ cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.5 }}
                            onClick={() => unlocked && navigate(`/lessons/${lesson._id}/video`)}
                          >
                            <span className="mr-2">{lIdx + 1}.</span> {lesson.title}
                            {!unlocked ? <LockOutlined className="ml-2 text-gray-400" /> : null}
                            {progress.completedLessons?.includes(lesson._id) && <span className="ml-2 text-blue-600">✓ Đã học</span>}
                            {lesson._id === progress.lastWatched && !progress.completedLessons?.includes(lesson._id) && <span className="ml-2 text-orange-600">(Đang xem dở)</span>}
                            {unlocked && showProgress && (
                              <div style={{ height: 6, background: '#f0f0f0', borderRadius: 4, marginTop: 2 }}>
                                <div style={{ width: `${progressValue}%`, height: '100%', background: progressColor, borderRadius: 4, transition: 'width 0.3s' }} />
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default LessonVideoPage; 