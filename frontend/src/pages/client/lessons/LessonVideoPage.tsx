import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Card, Typography, Button, Divider, List, Input, message, Row, Col, Radio, Avatar, Tabs, Rate, Select, Modal } from 'antd';
import { config } from '../../../api/axios';
import { LockOutlined, CheckCircleOutlined, UserOutlined, SendOutlined, PauseCircleOutlined, 
  EditOutlined, DeleteOutlined, PlayCircleOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { getProgress, updateProgress, getUnlockedLessons, getVideoProgress, updateVideoProgress, markCourseCompleted } from '../../../services/progressService';
import { getComments, addComment, replyComment, toggleLikeComment, getCommentLikeCount, checkCommentLiked } from '../../../services/lessonCommentService';
import { getNotesByLesson, createNote, deleteNote, updateNote, type Note } from '../../../services/noteService';
import SectionSidebar from './SectionSidebar';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useAuth from '../../../hooks/Auths/useAuth';
import leoProfanity from 'leo-profanity';
import { courseService } from '../../../services/apiService';
import { getCourseReviews, getMyReview, addOrUpdateReview, toggleLikeReview, toggleDislikeReview, reportReview } from '../../../services/courseReviewService';
import { SearchOutlined, LikeOutlined, DislikeOutlined, FlagOutlined } from '@ant-design/icons';
dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

type Lesson = { _id: string; title: string };
type Section = { _id: string; title: string; lessons: Lesson[] };
type Comment = {
  _id: string;
  content: string;
  createdAt?: string;
  user?: { name?: string; fullname?: string; avatar?: string };
  replies?: Comment[];
};

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
  const [courseOverview, setCourseOverview] = useState<{ title: string; subtitle: string; requirements: string[] }>({ title: '', subtitle: '', requirements: [] });

  // Thêm các state cho like/reply comment
  const [likeStates, setLikeStates] = useState<{ [commentId: string]: { liked: boolean; count: number } }>({});
  const [replyInput, setReplyInput] = useState<{ [commentId: string]: string }>({});
  const [showReplyBox, setShowReplyBox] = useState<{ [commentId: string]: boolean }>({});
  const [replyLoading, setReplyLoading] = useState<{ [commentId: string]: boolean }>({});

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

  // Bỏ logic unlock quiz theo videoProgress

  // Quiz hiển thị ngay từ đầu nếu có quiz
  useEffect(() => {
    setShowQuiz(!!quiz);
  }, [quiz]);

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

  // Kiểm tra hoàn thành 100% khóa học
  useEffect(() => {
    const checkCompleted = async () => {
      if (!courseId) {
        setIsCompleted(false);
        return;
      }

      try {
        const progress = await getProgress(courseId);
        console.log('Progress data:', progress);

        // Tính tổng số bài học từ courseContent
        const totalLessons = courseSections.reduce((total, section) => total + section.lessons.length, 0);
        console.log('Total lessons:', totalLessons);

        // Đếm số bài học đã hoàn thành
        const completedLessons = Object.values(progress || {}).filter((p: any) => 
          p.completed === true && p.videoCompleted === true && p.quizPassed === true
        ).length;
        console.log('Completed lessons:', completedLessons);

        // Kiểm tra hoàn thành
        const allCompleted = totalLessons > 0 && completedLessons === totalLessons;
        console.log('All completed:', allCompleted);

        setIsCompleted(allCompleted);

        // Tìm bài học tiếp theo chưa hoàn thành (nếu có)
        if (!allCompleted) {
          let nextLessonId = null;
          outer: for (const section of courseSections) {
            for (const lesson of section.lessons) {
              const lessonProgress = progress[lesson._id];
              if (!lessonProgress?.completed) {
                nextLessonId = lesson._id;
                break outer;
              }
            }
          }
          // setContinueLessonId(nextLessonId); // This state is not defined in the original file
        }

      } catch (error) {
        console.error('Error checking completion:', error);
        setIsCompleted(false);
        // setContinueLessonId(null); // This state is not defined in the original file
      }
    };

    checkCompleted();
  }, [courseSections, courseId]);

  // Nếu chưa enroll và không phải khóa học free
  if (isEnrolled === false && !isFree) {
    return <Alert message="Bạn cần đăng ký khóa học để học bài này." type="warning" showIcon style={{ margin: 32 }} />;
  }

  // Hàm load like state cho tất cả comment và reply
  const loadLikeStates = async (comments: any[]) => {
    const allComments: any[] = [];
    const collect = (arr: any[]) => {
      arr.forEach(c => {
        allComments.push(c);
        if (c.replies && c.replies.length) collect(c.replies);
      });
    };
    collect(comments);
    const states: { [id: string]: { liked: boolean; count: number } } = {};
    await Promise.all(
      allComments.map(async c => {
        try {
          const [liked, count] = await Promise.all([
            checkCommentLiked(c._id),
            getCommentLikeCount(c._id)
          ]);
          states[c._id] = { liked, count };
        } catch {
          states[c._id] = { liked: false, count: 0 };
        }
      })
    );
    setLikeStates(states);
  };

  // Khi load comments, load luôn like state
  useEffect(() => {
    if (comments && comments.length) loadLikeStates(comments);
  }, [comments]);

  // Hàm xử lý like comment
  const handleLikeComment = async (commentId: string) => {
    await toggleLikeComment(commentId);
    // reload trạng thái like
    const [liked, count] = await Promise.all([
      checkCommentLiked(commentId),
      getCommentLikeCount(commentId)
    ]);
    setLikeStates(prev => ({ ...prev, [commentId]: { liked, count } }));
  };

  // Hàm xử lý reply
  const handleReply = async (parentId: string) => {
    if (!replyInput[parentId]?.trim()) return;
    setReplyLoading(prev => ({ ...prev, [parentId]: true }));
    try {
      await replyComment(parentId, replyInput[parentId]);
      setReplyInput(prev => ({ ...prev, [parentId]: '' }));
      setShowReplyBox(prev => ({ ...prev, [parentId]: false }));
      // reload comments
      const commentsData = await getComments(lessonId!);
      setComments(commentsData || []);
    } finally {
      setReplyLoading(prev => ({ ...prev, [parentId]: false }));
    }
  };

  // Hàm render replies lồng nhau
  const renderReplies = (replies: any[] = [], parentId?: string) => (
    <div style={{ marginLeft: 40, marginTop: 8 }}>
      {replies.map(reply => (
        <div key={reply._id} style={{ borderBottom: '1px solid #f0f0f0', padding: '10px 0', display: 'flex', alignItems: 'flex-start' }}>
          <Avatar src={reply.user?.avatar} icon={<UserOutlined />} style={{ background: '#e6f7ff', color: '#1890ff', marginRight: 12 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{reply.user?.fullname || reply.user?.name || 'Anonymous'}</div>
            <div style={{ fontSize: 16 }}>{reply.content}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <span style={{ color: '#888', fontSize: 13 }}>{dayjs(reply.createdAt).fromNow()}</span>
              <Button
                type={likeStates[reply._id]?.liked ? 'primary' : 'default'}
                size="small"
                icon={<span style={{ color: likeStates[reply._id]?.liked ? '#f5222d' : '#888' }}>♥</span>}
                style={{ border: 'none', background: 'none', boxShadow: 'none', padding: 0 }}
                onClick={() => handleLikeComment(reply._id)}
              >{likeStates[reply._id]?.count || 0}</Button>
              <Button type="link" size="small" onClick={() => setShowReplyBox(prev => ({ ...prev, [reply._id]: !prev[reply._id] }))}>Trả lời</Button>
            </div>
            {showReplyBox[reply._id] && (
              <div style={{ marginTop: 8 }}>
                <Input.TextArea
                  rows={2}
                  value={replyInput[reply._id] || ''}
                  onChange={e => setReplyInput(prev => ({ ...prev, [reply._id]: e.target.value }))}
                  placeholder="Nhập phản hồi..."
                  style={{ borderRadius: 8, fontSize: 15, marginBottom: 4 }}
                />
                <Button
                  type="primary"
                  size="small"
                  loading={replyLoading[reply._id]}
                  onClick={() => handleReply(reply._id)}
                  disabled={!replyInput[reply._id]?.trim()}
                >Gửi</Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'quiz' | 'comment' | 'note' | 'review'>('overview');
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Lấy ghi chú của user cho bài học
  useEffect(() => {
    const fetchNotes = async () => {
      if (!lessonId) return;
      setNoteLoading(true);
      try {
        const userNotes = await getNotesByLesson(lessonId);
        setNotes(userNotes);
      } catch (error) {
        console.error('Lỗi lấy ghi chú:', error);
      }
      setNoteLoading(false);
    };
    fetchNotes();
  }, [lessonId]);

  // Hàm tạo ghi chú mới
  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !lessonId || !courseId || !videoRef.current) return;

    const timestamp = Math.floor(videoRef.current.currentTime);
    const newNote = await createNote({
      content: newNoteContent,
      timestamp,
      lessonId,
      courseId,
    });

    if (newNote) {
      setNotes(prev => [...prev, newNote].sort((a, b) => a.timestamp - b.timestamp));
      setNewNoteContent('');
      message.success('Đã thêm ghi chú!');
    } else {
      message.error('Không thể thêm ghi chú.');
    }
  };

  // Hàm xóa ghi chú
  const handleDeleteNote = async (noteId: string) => {
    const success = await deleteNote(noteId);
    if (success) {
      setNotes(prev => prev.filter(n => n._id !== noteId));
      message.success('Đã xóa ghi chú!');
    } else {
      message.error('Không thể xóa ghi chú.');
    }
  };

  // Hàm bắt đầu sửa ghi chú
  const startEditNote = (note: Note) => {
    setEditingNoteId(note._id);
    setEditingContent(note.content);
  };

  // Hàm hủy sửa ghi chú
  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  // Hàm lưu ghi chú đã sửa
  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) {
      message.warning('Nội dung không được để trống!');
      return;
    }
    const updated = await updateNote(noteId, editingContent);
    if (updated) {
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, content: updated.content } : n));
      setEditingNoteId(null);
      setEditingContent('');
      message.success('Đã cập nhật ghi chú!');
    } else {
      message.error('Không thể cập nhật ghi chú.');
    }
  };

  // Hàm tua video đến mốc thời gian
  const seekToTimestamp = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const formatTimestamp = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Đặt tab mặc định là Tổng quan
  useEffect(() => {
    setActiveTab('overview');
  }, [lessonId]);

  // Lấy thông tin mô tả và yêu cầu khóa học
  useEffect(() => {
    const fetchCourseOverview = async () => {
      if (!courseId) return;
      try {
        const apiRes = await courseService.getCourseById(courseId);
        if (apiRes) {
          const mapped = courseService.mapApiCourseToAppCourse(apiRes);
          setCourseOverview({ title: mapped.title, subtitle: mapped.subtitle, requirements: mapped.requirements || [] });
        }
      } catch {
        setCourseOverview({ title: '', subtitle: '', requirements: [] });
      }
    };
    fetchCourseOverview();
  }, [courseId]);

  const [reviews, setReviews] = useState<Array<{
    _id: string;
    user: { fullname?: string; avatar?: string };
    rating: number;
    comment: string;
    createdAt?: string;
    likes?: string[];
    dislikes?: string[];
  }>>([]);
  const [myReview, setMyReview] = useState<{ rating: number; comment: string } | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewValue, setReviewValue] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | 'all'>('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  // Tính toán dữ liệu tổng quan đánh giá
  const ratingStats = React.useMemo(() => {
    const stats = [0, 0, 0, 0, 0]; // 5 -> 1 sao
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) stats[5 - r.rating]++;
    });
    const total = reviews.length;
    return {
      stats,
      total,
      avg: total ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total) : 0,
      percent: stats.map(count => total ? Math.round((count / total) * 100) : 0)
    };
  }, [reviews]);

  // Lọc và tìm kiếm review
  const filteredReviews = React.useMemo(() => {
    let list = reviews;
    if (reviewFilter !== 'all') list = list.filter(r => r.rating === reviewFilter);
    if (reviewSearch.trim()) list = list.filter(r => r.comment.toLowerCase().includes(reviewSearch.trim().toLowerCase()));
    return list;
  }, [reviews, reviewFilter, reviewSearch]);

  // Lấy đánh giá của khóa học
  useEffect(() => {
    if (!courseId) return;
    (async () => {
      setReviewLoading(true);
      setReviewError(null);
      try {
        const reviewsData = await getCourseReviews(courseId);
        setReviews(reviewsData || []);
        if (isEnrolled) {
          try {
            const my = await getMyReview(courseId);
            setMyReview(my);
            setReviewValue(my?.rating || 0);
            setReviewComment(my?.comment || '');
          } catch {
            // ignore
          }
        }
      } catch {
        setReviewError('Không thể tải đánh giá.');
      }
      setReviewLoading(false);
    })();
  }, [courseId, isEnrolled]);

  // Hàm gửi đánh giá
  const handleSubmitReview = async () => {
    if (!courseId) return;
    setReviewLoading(true);
    setReviewError(null);
    try {
      await addOrUpdateReview(courseId, reviewValue, reviewComment);
      message.success('Đã gửi đánh giá!');
      // Reload reviews
      const reviewsData = await getCourseReviews(courseId);
      setReviews(reviewsData || []);
      setMyReview({ rating: reviewValue, comment: reviewComment });
    } catch {
      setReviewError('Không thể gửi đánh giá.');
    }
    setReviewLoading(false);
  };

  // Handler cho like/dislike/report
  const handleLike = async (reviewId: string) => {
    try {
      await toggleLikeReview(reviewId);
      // Reload reviews
      if (courseId) {
        const reviewsData = await getCourseReviews(courseId);
        setReviews(reviewsData || []);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDislike = async (reviewId: string) => {
    try {
      await toggleDislikeReview(reviewId);
      if (courseId) {
        const reviewsData = await getCourseReviews(courseId);
        setReviews(reviewsData || []);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleReport = async () => {
    if (!selectedReviewId || !reportReason.trim()) {
      message.warning('Vui lòng nhập lý do');
      return;
    }
    try {
      await reportReview(selectedReviewId, reportReason);
      message.success('Đã gửi báo cáo');
      setReportModalVisible(false);
      setReportReason('');
      setSelectedReviewId(null);
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  // Khi hoàn thành 100% khóa học, đánh dấu completed vào backend
  useEffect(() => {
    if (isCompleted && courseId) {
      markCourseCompleted(courseId)
        .then(res => {
          if (res.success) {
            message.success('Khóa học đã được đánh dấu hoàn thành!');
          }
        })
        .catch(() => {
          message.error('Không thể đánh dấu hoàn thành khóa học!');
        });
    }
  }, [isCompleted, courseId]);

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
            <Divider style={{ margin: '12px 0 24px 0' }} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', marginBottom: 32, width: '100%', maxWidth: 'none', background: 'linear-gradient(135deg, #f0f7ff 0%, #f8f5ff 100%)', border: 'none', padding: 0 }} styles={{ body: { padding: 0 } }}>
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
   
            {/* Comments Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Tabs
                activeKey={activeTab}
                onChange={key => setActiveTab(key as 'overview' | 'quiz' | 'comment' | 'note' | 'review')}
                items={[
                  {
                    key: 'overview',
                    label: 'Tổng quan',
                    children: (
                      <Card style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', marginBottom: 32, width: '100%', maxWidth: 'none', background: 'linear-gradient(135deg, #f0f7ff 0%, #f8f5ff 100%)', border: 'none', padding: 0 }}>
                        <div style={{ padding: '32px 28px 24px 28px' }}>
                          <Title level={2} style={{ marginBottom: 8, color: '#3b82f6', fontWeight: 800, letterSpacing: 0.5, background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{courseOverview.title || 'Khóa học'}</Title>
                          <Paragraph style={{ color: '#444', fontSize: 18, marginBottom: 24, lineHeight: 1.7, fontWeight: 500, background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 12px #e0e7ef' }}>{courseOverview.subtitle || 'Chưa có mô tả cho khóa học này.'}</Paragraph>
                          <Title level={4} style={{ marginTop: 24, marginBottom: 12, color: '#6366f1', fontWeight: 700, letterSpacing: 0.2 }}>Yêu cầu khóa học</Title>
                          {courseOverview.requirements && courseOverview.requirements.length > 0 ? (
                            <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 0 }}>
                              {courseOverview.requirements.map((req, idx) => (
                                <li key={idx} style={{ fontSize: 16, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #a5b4fc 0%, #67e8f9 100%)', color: '#fff', fontWeight: 700, fontSize: 16, marginRight: 8 }}>
                                    ✓
                                  </span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <Paragraph style={{ color: '#888', fontSize: 16, marginTop: 8 }}>Không có yêu cầu đặc biệt.</Paragraph>
                          )}
                        </div>
                      </Card>
                    )
                  },
                  ...((quiz && showQuiz) ? [
                    {
                      key: 'quiz',
                      label: 'Quiz',
                      children: (
                        <Card style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', marginBottom: 32, width: '100%', maxWidth: 'none' }}>
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
                      )
                    }
                  ] : []),
                  {
                    key: 'comment',
                    label: 'Bình luận',
                    children: (
                      <Card title={<span style={{ fontWeight: 700, fontSize: 20 }}>Bình luận</span>} style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', width: '100%', maxWidth: 'none', marginBottom: 32 }}>
                        <List
                          loading={commentLoading}
                          dataSource={comments}
                          locale={{ emptyText: 'Chưa có bình luận nào.' }}
                          renderItem={(item) => (
                            <List.Item style={{ alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                              <List.Item.Meta
                                avatar={<Avatar src={item.user?.avatar} icon={<UserOutlined />} style={{ background: '#e6f7ff', color: '#1890ff' }} />}
                                title={<span style={{ fontWeight: 600 }}>{item.user?.fullname || item.user?.name || 'Anonymous'}</span>}
                                description={<span style={{ fontSize: 16 }}>{item.content}</span>}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 120 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <span style={{ color: '#888', fontSize: 13 }}>{dayjs(item.createdAt).fromNow()}</span>
                                  <Button
                                    type={likeStates[item._id]?.liked ? 'primary' : 'default'}
                                    size="small"
                                    icon={<span style={{ color: likeStates[item._id]?.liked ? '#f5222d' : '#888' }}>♥</span>}
                                    style={{ border: 'none', background: 'none', boxShadow: 'none', padding: 0 }}
                                    onClick={() => handleLikeComment(item._id)}
                                  >{likeStates[item._id]?.count || 0}</Button>
                                  <Button type="link" size="small" onClick={() => setShowReplyBox(prev => ({ ...prev, [item._id]: !prev[item._id] }))}>Trả lời</Button>
                                </div>
                                {showReplyBox[item._id] && (
                                  <div style={{ marginTop: 8 }}>
                                    <Input.TextArea
                                      rows={2}
                                      value={replyInput[item._id] || ''}
                                      onChange={e => setReplyInput(prev => ({ ...prev, [item._id]: e.target.value }))}
                                      placeholder="Nhập phản hồi..."
                                      style={{ borderRadius: 8, fontSize: 15, marginBottom: 4 }}
                                    />
                                    <Button
                                      type="primary"
                                      size="small"
                                      loading={replyLoading[item._id]}
                                      onClick={() => handleReply(item._id)}
                                      disabled={!replyInput[item._id]?.trim()}
                                    >Gửi</Button>
                                  </div>
                                )}
                                {/* Render replies */}
                                {item.replies && item.replies.length > 0 && renderReplies(item.replies, item._id)}
                              </div>
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
                            <Button
                              type="primary"
                              onClick={handleComment}
                              disabled={!newComment.trim() || !!commentWarning}
                              style={{
                                height: 48,
                                minWidth: 100,
                                borderRadius: 12,
                                fontSize: 18,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
                                boxShadow: '0 2px 8px #e6f7ff',
                                border: 'none',
                                marginLeft: 8,
                                transition: 'background 0.2s, box-shadow 0.2s',
                                gap: 8,
                              }}
                              onMouseOver={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #40a9ff 0%, #1890ff 100%)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px #bae7ff';
                              }}
                              onMouseOut={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px #e6f7ff';
                              }}
                            >
                              <SendOutlined style={{ fontSize: 20 }} />
                              Gửi
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    )
                  },
                  {
                    key: 'note',
                    label: 'Ghi chú',
                    children: (
                      <Card title={<span style={{ fontWeight: 700, fontSize: 20 }}>Ghi chú theo video</span>} style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', width: '100%', maxWidth: 'none', marginBottom: 32 }}>
                        <div style={{ marginBottom: 24 }}>
                          <Input.TextArea
                            rows={3}
                            value={newNoteContent}
                            onChange={e => setNewNoteContent(e.target.value)}
                            placeholder="Nhập ghi chú của bạn..."
                            style={{ borderRadius: 8, fontSize: 15, marginBottom: 8 }}
                          />
                          <Button type="primary" onClick={handleAddNote} disabled={!newNoteContent.trim()}>
                            Thêm ghi chú tại {videoRef.current ? formatTimestamp(videoRef.current.currentTime) : '00:00'}
                          </Button>
                        </div>

                        <List
                          loading={noteLoading}
                          dataSource={notes}
                          locale={{ emptyText: 'Chưa có ghi chú nào.' }}
                          style={{ 
                            background: '#fff',
                            borderRadius: 12,
                            padding: '8px 0'
                          }}
                          renderItem={(note) => (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <List.Item
                                style={{
                                  padding: '16px 24px',
                                  borderBottom: '1px solid #f0f0f0',
                                  transition: 'all 0.3s ease',
                                  background: editingNoteId === note._id ? '#f8faff' : 'transparent',
                                  cursor: 'default'
                                }}
                                className="note-item-hover"
                                actions={[
                                  <Button
                                    type="link"
                                    icon={<PlayCircleOutlined />}
                                    onClick={() => seekToTimestamp(note.timestamp)}
                                    style={{ 
                                      color: '#1890ff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    Tua đến
                                  </Button>,
                                  editingNoteId === note._id ? null : (
                                    <Button
                                      type="link"
                                      icon={<EditOutlined />}
                                      onClick={() => startEditNote(note)}
                                      style={{ 
                                        color: '#52c41a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                      }}
                                    >
                                      Sửa
                                    </Button>
                                  ),
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteNote(note._id)}
                                    style={{ 
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    Xóa
                                  </Button>
                                ].filter(Boolean)}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <div
                                      style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #e6f7ff 0%, #e6fffb 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 16,
                                        fontWeight: 600,
                                        color: '#1890ff',
                                        border: '2px solid #91d5ff'
                                      }}
                                    >
                                      {formatTimestamp(note.timestamp)}
                                    </div>
                                  }
                                  title={
                                    <span style={{ 
                                      color: '#1890ff',
                                      fontWeight: 600,
                                      fontSize: 14,
                                      background: 'linear-gradient(90deg, #1890ff 0%, #69c0ff 100%)',
                                      WebkitBackgroundClip: 'text',
                                      WebkitTextFillColor: 'transparent'
                                    }}>
                                      Ghi chú tại {formatTimestamp(note.timestamp)}
                                    </span>
                                  }
                                  description={
                                    editingNoteId === note._id ? (
                                      <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ marginTop: 12 }}
                                      >
                                        <Card
                                          style={{
                                            background: 'linear-gradient(135deg, #f0f7ff 0%, #f8f5ff 100%)',
                                            border: '1px solid #d6e4ff',
                                            borderRadius: 12,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            marginBottom: 8
                                          }}
                                          bodyStyle={{ padding: '16px' }}
                                        >
                                          <div style={{ marginBottom: 12 }}>
                                            <Text style={{ 
                                              fontSize: 14, 
                                              fontWeight: 600, 
                                              color: '#1890ff',
                                              marginBottom: 8,
                                              display: 'block'
                                            }}>
                                              Chỉnh sửa ghi chú tại {formatTimestamp(note.timestamp)}
                                            </Text>
                                            <Input.TextArea
                                              rows={3}
                                              value={editingContent}
                                              onChange={e => setEditingContent(e.target.value)}
                                              placeholder="Nhập nội dung ghi chú..."
                                              style={{ 
                                                borderRadius: 8,
                                                fontSize: 15,
                                                border: '1px solid #d9d9d9',
                                                transition: 'all 0.3s ease',
                                                resize: 'vertical',
                                                minHeight: 80
                                              }}
                                              autoFocus
                                            />
                                          </div>
                                          <div style={{ 
                                            display: 'flex', 
                                            gap: 8, 
                                            justifyContent: 'flex-end',
                                            borderTop: '1px solid #e6f4ff',
                                            paddingTop: 12
                                          }}>
                                            <Button
                                              onClick={cancelEditNote}
                                              style={{
                                                borderRadius: 6,
                                                border: '1px solid #d9d9d9',
                                                color: '#666'
                                              }}
                                            >
                                              <CloseOutlined style={{ marginRight: 4 }} />
                                              Hủy
                                            </Button>
                                            <Button
                                              type="primary"
                                              onClick={() => handleUpdateNote(note._id)}
                                              disabled={!editingContent.trim()}
                                              style={{
                                                borderRadius: 6,
                                                background: 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
                                                border: 'none',
                                                boxShadow: '0 2px 4px rgba(24,144,255,0.3)'
                                              }}
                                            >
                                              <SaveOutlined style={{ marginRight: 4 }} />
                                              Lưu thay đổi
                                            </Button>
                                          </div>
                                        </Card>
                                      </motion.div>
                                    ) : (
                                      <p style={{ 
                                        fontSize: 15,
                                        margin: '8px 0 0 0',
                                        color: '#262626',
                                        lineHeight: 1.6,
                                        padding: '12px 16px',
                                        background: '#fafafa',
                                        borderRadius: 8,
                                        border: '1px solid #f0f0f0'
                                      }}>
                                        {note.content}
                                      </p>
                                    )
                                  }
                                />
                              </List.Item>
                            </motion.div>
                          )}
                        />
                      </Card>
                    )
                  },
                  {
                    key: 'review',
                    label: 'Đánh giá',
                    children: (
                      <Card title={<span style={{ fontWeight: 700, fontSize: 20 }}>Đánh giá khóa học</span>} style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', width: '100%', maxWidth: 'none', marginBottom: 32 }}>
                        {/* Tổng quan đánh giá */}
                        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 32 }}>
                          <div style={{ minWidth: 180, textAlign: 'center' }}>
                            <div style={{ fontSize: 54, fontWeight: 800, color: '#06b6d4', lineHeight: 1 }}>{ratingStats.avg.toFixed(1)}</div>
                            <Rate disabled allowHalf value={ratingStats.avg} style={{ fontSize: 28, color: '#06b6d4', margin: '8px 0' }} />
                            <div style={{ color: '#06b6d4', fontWeight: 600, fontSize: 18, marginTop: 4 }}>Điểm trung bình</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 220, marginTop: 8 }}>
                            {ratingStats.stats.map((count, idx) => (
                              <div key={5-idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                <span style={{ fontWeight: 600, color: '#06b6d4', minWidth: 24 }}>{5-idx}</span>
                                <Rate disabled value={5-idx} style={{ fontSize: 16, color: '#06b6d4' }} />
                                <div style={{ flex: 1, background: '#e0f2fe', borderRadius: 6, height: 10, margin: '0 8px', overflow: 'hidden' }}>
                                  <div style={{ width: ratingStats.percent[idx] + '%', background: '#8b5cf6', height: '100%', borderRadius: 6, transition: 'width 0.3s' }} />
                                </div>
                                <span style={{ color: '#8b5cf6', fontWeight: 600, minWidth: 36 }}>{ratingStats.percent[idx]}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Search & Filter */}
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', padding: '16px 20px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                          <Input
                            placeholder="Tìm kiếm theo nội dung..."
                            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                            value={reviewSearch}
                            onChange={e => setReviewSearch(e.target.value)}
                            style={{ width: 280, borderRadius: 8, height: 40 }}
                          />
                          <div style={{ flex: 1 }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: '#444' }}>Lọc theo số sao:</span>
                            <Select
                              value={reviewFilter}
                              onChange={value => setReviewFilter(value)}
                              style={{ width: 140, borderRadius: 8 }}
                            >
                              <Select.Option value="all">Tất cả</Select.Option>
                              <Select.Option value={5}>5 sao</Select.Option>
                              <Select.Option value={4}>4 sao</Select.Option>
                              <Select.Option value={3}>3 sao</Select.Option>
                              <Select.Option value={2}>2 sao</Select.Option>
                              <Select.Option value={1}>1 sao</Select.Option>
                            </Select>
                          </div>
                        </div>
                        {/* Danh sách review */}
                        <List
                          loading={reviewLoading}
                          dataSource={filteredReviews}
                          locale={{ emptyText: 'Chưa có đánh giá nào.' }}
                          renderItem={item => {
                            const liked = Array.isArray(item.likes) && user && item.likes.some((id: any) => id === user._id || id?._id === user._id);
                            const disliked = Array.isArray(item.dislikes) && user && item.dislikes.some((id: any) => id === user._id || id?._id === user._id);
                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <List.Item style={{ padding: '20px 0', borderBottom: '1px solid #f0f0f0', alignItems: 'flex-start' }}>
                                  <List.Item.Meta
                                    avatar={
                                      <Avatar 
                                        src={item.user?.avatar} 
                                        icon={<UserOutlined />} 
                                        size={48}
                                        style={{ 
                                          background: '#e0f2fe',
                                          color: '#8b5cf6',
                                          fontWeight: 700,
                                          fontSize: 20
                                        }}
                                      >
                                        {!item.user?.avatar && (item.user?.fullname ? item.user.fullname[0] : 'U')}
                                      </Avatar>
                                    }
                                    title={
                                      <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Text strong style={{ fontSize: 16, marginRight: 8 }}>
                                          {item.user?.fullname || 'Người dùng'}
                                        </Text>
                                        <Rate disabled value={item.rating} style={{ fontSize: 14, color: '#f59e42' }} />
                                        <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{item.createdAt ? dayjs(item.createdAt).fromNow() : ''}</span>
                                      </div>
                                    }
                                    description={
                                      <div style={{ marginBottom: 8 }}>
                                        <Text style={{ fontSize: 15, color: '#262626', display: 'block', marginBottom: 4 }}>
                                          {item.comment}
                                        </Text>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 4 }}>
                                          <Button type="text" icon={<LikeOutlined />} style={{ color: liked ? '#06b6d4' : '#bdbdbd', fontWeight: liked ? 700 : 400 }} onClick={() => handleLike(item._id)}>Hữu ích</Button>
                                          <Button type="text" icon={<DislikeOutlined />} style={{ color: disliked ? '#6366f1' : '#aaa', fontWeight: disliked ? 700 : 400 }} onClick={() => handleDislike(item._id)} />
                                          <Button type="link" icon={<FlagOutlined />} style={{ color: '#f87171', fontWeight: 600 }} onClick={() => { setSelectedReviewId(item._id); setReportModalVisible(true); }}>Báo xấu</Button>
                                        </div>
                                      </div>
                                    }
                                  />
                                </List.Item>
                              </motion.div>
                            );
                          }}
                        />
                        {/* Form đánh giá của bạn (đưa xuống dưới cùng) */}
                        {isEnrolled && isCompleted && (
                          <div style={{ marginTop: 32 }}>
                            <Card 
                              title={<Title level={4} style={{ color: '#06b6d4' }}>{myReview ? 'Cập nhật đánh giá của bạn' : 'Đánh giá của bạn'}</Title>}
                              style={{
                                background: 'linear-gradient(135deg, #f0f7ff 0%, #f8f5ff 100%)',
                                borderRadius: 12,
                                border: '1px solid #d6e4ff'
                              }}
                              headStyle={{ borderBottom: '1px solid #e6f4ff' }}
                            >
                              <Rate 
                                value={reviewValue} 
                                onChange={setReviewValue}
                                style={{ fontSize: 24, marginBottom: 16, color: '#f59e42' }}
                              />
                              <Input.TextArea
                                rows={4}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm học tập của bạn..."
                                style={{ 
                                  borderRadius: 8, 
                                  fontSize: 15,
                                  marginBottom: 16,
                                  resize: 'vertical'
                                }}
                              />
                              <div style={{ textAlign: 'right' }}>
                                <Button 
                                  type="primary" 
                                  onClick={handleSubmitReview} 
                                  loading={reviewLoading}
                                  style={{
                                    borderRadius: 6,
                                    background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)',
                                    border: 'none',
                                    height: 40,
                                    paddingInline: 24,
                                    fontSize: 16,
                                    fontWeight: 600
                                  }}
                                >
                                  <SaveOutlined style={{ marginRight: 4 }} />
                                  {myReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                                </Button>
                              </div>
                              {reviewError && (
                                <Alert message={reviewError} type="error" showIcon style={{ marginTop: 16 }} />
                              )}
                            </Card>
                          </div>
                        )}
                        {isEnrolled && !isCompleted && (
                          <Alert
                            message="Hoàn thành khóa học để đánh giá"
                            description="Bạn cần hoàn thành 100% khóa học để có thể đánh giá. Hãy cố gắng hoàn thành các bài học!"
                            type="info"
                            showIcon
                            style={{ marginBottom: 24 }}
                          />
                        )}
                      </Card>
                    )
                  }
                ]}
                style={{ marginTop: 32 }}
              />
            </motion.div>
          </>
        )}
      </motion.div>
      <Modal
        title="Báo cáo đánh giá"
        open={reportModalVisible}
        onOk={handleReport}
        onCancel={() => setReportModalVisible(false)}
        okText="Gửi"
        cancelText="Hủy"
      >
        <Input.TextArea 
          rows={4} 
          value={reportReason} 
          onChange={e => setReportReason(e.target.value)} 
          placeholder="Nhập lý do báo cáo..." 
        />
      </Modal>
    </div>
  );
};

export default LessonVideoPage; 
