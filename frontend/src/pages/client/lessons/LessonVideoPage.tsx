import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Card, Typography, Button, Divider, List, Input, message, Row, Col, Radio, Avatar, Tabs, Rate, Select, Modal } from 'antd';
import { config } from '../../../api/axios';
import {
  LockOutlined, CheckCircleOutlined, UserOutlined, SendOutlined, PauseCircleOutlined,
  EditOutlined, DeleteOutlined, PlayCircleOutlined, SaveOutlined, CloseOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { getProgress, updateProgress, getUnlockedLessons, getVideoProgress, updateVideoProgress, markCourseCompleted } from '../../../services/progressService';
import { getComments, addComment, replyComment } from '../../../services/lessonCommentService';
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
import { issueCertificate, getCertificate } from '../../../services/certificateService';
import { CustomVideoPlayer } from '../../../components/CustomVideoPlayer';
import AIChatBox from '../../../components/AIChatBox';
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
  likes?: string[];
};

// Utility functions for localStorage cache
function getQuizCacheKey(courseId: string | null, lessonId: string | null) {
  return courseId && lessonId ? `quizAnswers_${courseId}_${lessonId}` : '';
}
function saveQuizAnswersToCache(courseId: string | null, lessonId: string | null, answers: number[]) {
  const key = getQuizCacheKey(courseId, lessonId);
  if (key) localStorage.setItem(key, JSON.stringify(answers));
}
function getQuizAnswersFromCache(courseId: string | null, lessonId: string | null): number[] | null {
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
function clearQuizAnswersCache(courseId: string | null, lessonId: string | null) {
  const key = getQuizCacheKey(courseId, lessonId);
  if (key) localStorage.removeItem(key);
}

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
  const [progress, setProgress] = useState<{ completedLessons: string[]; lastWatched?: string;[lessonId: string]: any }>({ completedLessons: [] });
  const [quiz, setQuiz] = useState<{ _id: string; questions: { question: string; options: string[]; correctIndex?: number }[] } | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  // Removed unused answers state - using quizAnswers instead
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
  // Thêm loading cho like comment
  const [likeLoading, setLikeLoading] = useState<{ [commentId: string]: boolean }>({});

  // Certificate states
  const [certificate, setCertificate] = useState<any>(null);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false);

  // Debounce function để tránh gọi API liên tục
  const debouncedUpdateProgress = useCallback((courseId: string, lessonId: string, time: number, duration: number) => {
    if (updateProgressTimeout.current) {
      clearTimeout(updateProgressTimeout.current);
    }
    updateProgressTimeout.current = setTimeout(() => {
      console.log('Updating video progress:', { courseId, lessonId, time, duration });
      updateVideoProgress(courseId, lessonId, time, duration).catch(e => console.error("Failed to update progress", e));
    }, 2000); // Cập nhật 2 giây một lần để giảm tải server
  }, []);

  // Helper function để cập nhật progress UI ngay lập tức
  const updateProgressUI = useCallback(() => {
    const video = document.querySelector('video');
    if (video && courseId && currentLessonId && video.duration > 0) {
      const progressRatio = video.currentTime / video.duration;
      setVideoProgress(progressRatio);
    }
  }, [courseId, currentLessonId]);

  // Hàm chuyển sang bài tiếp theo
  const goToNextLesson = async () => {
    if (hasNavigated) return;

    // Force reload unlocked lessons trước khi kiểm tra
    try {
      const updatedUnlocked = await getUnlockedLessons(courseId);
      setUnlockedLessons(updatedUnlocked || []);
      console.log('🔄 Reloaded unlocked lessons:', updatedUnlocked);
    } catch (error) {
      console.error('Failed to reload unlocked lessons:', error);
    }

    let found = false;
    let nextLessonId = null;
    console.log('🔍 Finding next lesson for:', currentLessonId);
    console.log('📚 Course sections:', courseSections.length);

    for (let s = 0; s < courseSections.length; s++) {
      const lessons = courseSections[s].lessons;
      console.log(`📖 Section ${s}:`, lessons.length, 'lessons');

      for (let l = 0; l < lessons.length; l++) {
        if (lessons[l]._id === currentLessonId) {
          console.log(`✅ Found current lesson at section ${s}, lesson ${l}`);

          if (l + 1 < lessons.length) {
            nextLessonId = lessons[l + 1]._id;
            console.log(`➡️ Next lesson in same section:`, nextLessonId);
          } else if (s + 1 < courseSections.length && courseSections[s + 1].lessons.length > 0) {
            nextLessonId = courseSections[s + 1].lessons[0]._id;
            console.log(`➡️ Next lesson in next section:`, nextLessonId);
          } else {
            console.log(`🎉 No next lesson found - completed all lessons`);
          }
          found = true;
          break;
        }
      }
      if (found) break;
    }

    console.log('goToNextLesson check:', {
      nextLessonId,
      canAccess: nextLessonId ? canAccessLesson(nextLessonId) : false,
      unlockedLessons,
      courseSections: courseSections.length,
      currentLessonId
    });

    // Kiểm tra xem bài học tiếp theo có được mở khóa không
    if (nextLessonId) {
      console.log('✅ Navigating to next lesson:', nextLessonId);
      setHasNavigated(true);

      // Reset các state trước khi chuyển bài
      setVideoProgress(0);
      setVideoWatched(false);
      setSavedVideoTime(0);
      setQuizCompleted(false);
      setQuizResult(null);
      // Không reset quizAnswers ở đây - để logic khôi phục từ progress xử lý
      // setQuizAnswers([]);
      // Không reset quiz và activeTab nếu video đã được xem hết
      // Quiz sẽ được mở vĩnh viễn sau khi xem hết video
      setQuizPassed(false); // Reset quiz passed
      setQuizUnlocked(false); // Reset quiz unlocked
      setShowQuiz(false); // Reset show quiz

      navigate(`/lessons/${nextLessonId}/video`);
      setHasNavigated(false);
    } else {
      console.log('🎉 All lessons completed!');
      message.success('Bạn đã hoàn thành tất cả các bài học!');
    }
  };

  // Cập nhật tiến độ xem video
  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (courseId && currentLessonId && video.duration > 0) {
      // Cập nhật tiến độ video (debounced để tránh gọi API liên tục)
      debouncedUpdateProgress(courseId, currentLessonId, video.currentTime, video.duration);

      // Cập nhật local state
      setSavedVideoTime(video.currentTime);

      // Cập nhật progress ratio cho UI (real-time) - ưu tiên cập nhật UI trước
      const progressRatio = video.currentTime / video.duration;
      setVideoProgress(progressRatio);

      // Đánh dấu đã xem hết video khi đạt 90%
      if (progressRatio >= 0.9 && !videoWatched) {
        // Cập nhật videoCompleted: true vào progress
        updateProgress(courseId, currentLessonId, {
          watchedSeconds: video.currentTime,
          videoDuration: video.duration,
          videoCompleted: true
        } as any).catch(e => console.error("Failed to set videoCompleted", e));
        setVideoWatched(true);
      }
    }
  };


  // Reset state khi component mount hoặc lesson thay đổi
  useEffect(() => {
    console.log('🔄 Component mounted or lesson changed:', lessonId);

    // Reset tất cả state liên quan đến video và quiz
    setVideoProgress(0);
    setVideoWatched(false);
    setSavedVideoTime(0);
    setQuizCompleted(false);
    setQuizResult(null);
    setQuizAnswers([]);
    // Không reset quiz và activeTab nếu video đã được xem hết
    // Quiz sẽ được mở vĩnh viễn sau khi xem hết video
    setQuizPassed(false); // Reset quiz passed
    setQuizUnlocked(false); // Reset quiz unlocked
    setShowQuiz(false); // Reset show quiz

    // Reset video element nếu có
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.pause();
    }
  }, [lessonId]);

  // Khi vào lại bài học, lấy tiến độ đã lưu từ backend
  useEffect(() => {
    if (courseId && lessonId) {
      console.log('🔄 Loading progress for lesson:', lessonId);

      // Đợi một chút để đảm bảo video element đã được reset
      setTimeout(() => {
        getVideoProgress(courseId, lessonId)
          .then(progress => {
            console.log('Loaded progress from backend:', progress);
            if (progress && progress.watchedSeconds && progress.watchedSeconds > 0) {
              setSavedVideoTime(progress.watchedSeconds);
              // Cũng cập nhật videoProgress UI nếu có
              const progressData = progress as any;
              if (progressData.videoDuration && progressData.videoDuration > 0) {
                const progressRatio = progress.watchedSeconds / progressData.videoDuration;
                console.log('Setting videoProgress from backend:', progressRatio);
                setVideoProgress(progressRatio);
              } else {
                // Nếu không có videoDuration, set progress dựa trên thời gian đã xem
                const fallbackProgress = progress.watchedSeconds > 0 ? 0.1 : 0;
                console.log('Setting fallback videoProgress:', fallbackProgress);
                setVideoProgress(fallbackProgress);
              }
            } else {
              console.log('No progress found, setting to 0');
              setSavedVideoTime(0);
              setVideoProgress(0);
            }

            // Kiểm tra xem video đã được xem hết chưa để tự động chuyển tab
            const progressData = progress as any;
            if (progressData && progressData.videoCompleted === true) {
              console.log('Video đã được xem hết, tự động chuyển về tab quiz');
              setActiveTab('quiz');
            }
          })
          .catch(err => {
            console.error("Lỗi lấy tiến độ video", err);
            setSavedVideoTime(0);
            setVideoProgress(0);
          });
      }, 100);
    }
  }, [courseId, lessonId]);

  // Lưu tiến trình khi component unmount
  useEffect(() => {
    return () => {
      if (courseId && currentLessonId) {
        const video = document.querySelector('video');
        if (video && video.currentTime > 0) {
          updateVideoProgress(courseId, currentLessonId, video.currentTime, video.duration)
            .catch(e => console.error("Failed to save progress on unmount", e));
        }
      }
    };
  }, [courseId, currentLessonId]);

  // Cập nhật progress UI thường xuyên khi video đang phát
  useEffect(() => {
    if (!isVideoPlaying) return;

    const interval = setInterval(() => {
      updateProgressUI();
    }, 500); // Cập nhật UI mỗi 500ms khi video đang phát

    return () => clearInterval(interval);
  }, [isVideoPlaying, updateProgressUI]);

  // Cập nhật progress UI ngay lập tức khi savedVideoTime thay đổi
  useEffect(() => {
    if (savedVideoTime > 0) {
      // Delay một chút để đảm bảo video đã load
      const timer = setTimeout(() => {
        const videoElement = document.querySelector('video');
        if (videoElement && videoElement.duration > 0) {
          const currentProgress = savedVideoTime / videoElement.duration;
          console.log('Setting videoProgress from savedVideoTime:', currentProgress);
          setVideoProgress(currentProgress);

          // Force update video element để đảm bảo UI cập nhật
          videoElement.dispatchEvent(new Event('timeupdate'));
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [savedVideoTime]);

  // Khi video load xong, tua đến vị trí đã lưu
  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    console.log('Video loaded metadata:', { duration: video.duration, savedVideoTime });

    if (video && savedVideoTime > 0) {
      video.currentTime = savedVideoTime;
    }

    // Cập nhật progress UI sau khi video load xong
    if (video && video.duration > 0) {
      const currentProgress = savedVideoTime > 0 ? savedVideoTime / video.duration : 0;
      console.log('Setting videoProgress from metadata:', currentProgress);
      setVideoProgress(currentProgress);

      // Force update video element để đảm bảo UI cập nhật
      const videoElement = document.querySelector('video');
      if (videoElement) {
        videoElement.dispatchEvent(new Event('timeupdate'));
      }
    }
  };

  // Đảm bảo video được tua đến đúng vị trí khi savedVideoTime thay đổi
  useEffect(() => {
    if (savedVideoTime > 0) {
      // Delay một chút để đảm bảo video đã load
      const timer = setTimeout(() => {
        const videoElement = document.querySelector('video');
        if (videoElement && videoElement.readyState >= 1) {
          videoElement.currentTime = savedVideoTime;

          // Cập nhật progress UI sau khi seek
          if (videoElement.duration > 0) {
            const currentProgress = savedVideoTime / videoElement.duration;
            setVideoProgress(currentProgress);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [savedVideoTime]);

  // Khi xem hết video
  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;

    // Nếu đã hoàn thành bài học thì không hiện thông báo nữa
    const isLessonCompleted = !!progress && !!currentLessonId &&
      (progress[currentLessonId]?.completed === true || progress[currentLessonId]?.videoCompleted === true);

    setVideoWatched(true);

    if (!isLessonCompleted) {
      message.info('Bạn đã xem hết video, hãy hoàn thành quiz để mở khóa bài tiếp theo.');
    }

    if (courseId && currentLessonId && video) {
      // Lưu tiến trình cuối cùng ngay lập tức
      updateVideoProgress(courseId, currentLessonId, video.duration, video.duration)
        .catch(e => console.error("Failed to update final progress", e));
      // Đảm bảo cập nhật videoCompleted: true vào progress
      updateProgress(courseId, currentLessonId, {
        watchedSeconds: video.duration,
        videoDuration: video.duration,
        videoCompleted: true
      } as any).then(async () => {
        // Reload progress và unlocked lessons sau khi cập nhật
        try {
          const [progressData, unlocked] = await Promise.all([
            getProgress(courseId),
            getUnlockedLessons(courseId)
          ]);
          setProgress(progressData || {});
          setUnlockedLessons(unlocked || []);
        } catch (e) {
          console.error("Failed to reload progress", e);
        }
      }).catch(e => console.error("Failed to set videoCompleted", e));
    }

    // Chỉ chuyển sang tab quiz nếu có quiz VÀ đã xem hết video (90% trở lên)
    if (quiz && videoProgress >= 0.9) {
      setActiveTab('quiz');
    }
    // Loại bỏ goToNextLesson() - chỉ chuyển bài khi hoàn thành cả video và quiz
  };

  useEffect(() => {
    const fetchLessonVideo = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state

        if (!lessonId) {
          setError('ID bài học không hợp lệ.');
        } else {
          // Lấy video
          const videoRes = await config.get(`/videos/lesson/${lessonId}`);
          if (videoRes.data && videoRes.data.data) {
            setVideoUrl(videoRes.data.data.url);
            setVideoId(videoRes.data.data._id || videoRes.data.data.id || null);

            // Lấy tên bài học từ lesson
            const lessonRes = await config.get(`/lessons/${lessonId}`);
            if (lessonRes.data && lessonRes.data.data) {
              setLessonTitle(lessonRes.data.data.title || 'Bài học');
            }
          } else {
            setError('Không tìm thấy video cho bài học này.');
          }
        }

        // Lấy tên bài học từ lesson
        const lessonRes = await config.get(`/lessons/${lessonId}`);
        if (lessonRes.data && lessonRes.data.data) {
          setLessonTitle(lessonRes.data.data.title || 'Bài học');
        }
      } catch (e: any) {
        console.error('Error fetching lesson video:', e);
        const errorMessage = e?.response?.data?.message || e?.message || 'Không tìm thấy video cho bài học này.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonVideo();
    } else {
      setError('ID bài học không hợp lệ.');
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (!lessonId) {
      setComments([]);
      setCommentLoading(false);
      return;
    }

    (async () => {
      try {
        setCommentLoading(true);
        const commentsData = await getComments(lessonId);
        setComments(commentsData || []);
      } catch (e) {
        console.error('Error loading comments:', e);
        setComments([]);
      } finally {
        setCommentLoading(false);
      }
    })();
  }, [lessonId]);

  useEffect(() => {
    setVideoWatched(false);
    setQuizPassed(false);
    setQuizCompleted(false);
    setQuizResult(null);
    // Không reset quizAnswers ở đây - để logic khôi phục từ progress xử lý
    // setQuizAnswers([]);
    setShowQuiz(false);
    setQuizUnlocked(false);
    setVideoProgress(0); // Reset progress UI, nhưng không reset savedVideoTime
  }, [currentLessonId]);

  useEffect(() => {
    setCurrentLessonId(lessonId || null);
  }, [lessonId]);

  // Reload progress khi chuyển bài học
  useEffect(() => {
    if (courseId && lessonId) {
      reloadProgress();
    }
  }, [courseId, lessonId]);

  // Force reload progress sau khi hoàn thành quiz hoặc video
  useEffect(() => {
    if (quizCompleted || videoWatched) {
      setTimeout(() => {
        reloadProgress();
      }, 1000); // Delay 1 giây để đảm bảo backend đã cập nhật
    }
  }, [quizCompleted, videoWatched]);

  // Reload progress khi component mount
  useEffect(() => {
    if (courseId) {
      reloadProgress();
    }
  }, [courseId]);


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
    if (!courseId) {
      setProgress({ completedLessons: [] });
      setUnlockedLessons([]);
      setIsFree(false);
      return;
    }

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
        console.error('Error loading course data:', e);
        setProgress({ completedLessons: [] });
        setUnlockedLessons([]);
        setIsFree(false);
      }
    })();
  }, [courseId, lessonId]);

  // Thêm useEffect để reload progress khi có thay đổi
  useEffect(() => {
    if (!courseId) return;

    // Reload progress sau khi hoàn thành quiz hoặc video
    if (quizCompleted || videoWatched) {
      reloadProgress();
    }
  }, [courseId, quizCompleted, videoWatched]);

  useEffect(() => {
    if (!videoId) {
      setQuiz(null);
      setQuizLoading(false);
      setQuizError(null);
      return;
    }

    const fetchQuiz = async () => {
      try {
        setQuizLoading(true);
        setQuizError(null);

        // Đảm bảo progress đã được load trước khi fetch quiz
        if (courseId && currentLessonId && (!progress || Object.keys(progress).length === 0)) {
          console.log('⏳ Waiting for progress to load before fetching quiz...');
          await reloadProgress();
        }

        const res = await config.get(`/quizzes/video/${videoId}`);
        setQuiz(res.data.data);
        console.log('📝 Quiz loaded for video:', videoId);
      } catch (e) {
        console.error('Error loading quiz:', e);
        setQuiz(null);
        setQuizError(e instanceof Error ? e.message : 'Không tìm thấy quiz cho video này.');
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuiz();
  }, [videoId, courseId, currentLessonId, progress]);

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
      // Ưu tiên kiểm tra backend progress trước
      const lessonKey = String(currentLessonId);
      const backendQuizPassed = progress && progress[lessonKey] && progress[lessonKey].quizPassed;

      if (backendQuizPassed === true) {
        console.log('✅ Quiz passed from backend progress');
        setQuizResult({ success: true, message: 'Tất cả đáp án đều đúng!' });
      } else {
        // Fallback to localStorage only if no backend data
        const passed = localStorage.getItem(`quiz-passed-${currentLessonId}`);
        if (passed === '1') {
          console.log('✅ Quiz passed from localStorage (fallback)');
          setQuizResult({ success: true, message: 'Tất cả đáp án đều đúng!' });
        }
      }
    }
  }, [quiz, currentLessonId, progress]);

  // Bỏ logic unlock quiz theo videoProgress

  // Quiz hiển thị ngay từ đầu nếu có quiz
  useEffect(() => {
    setShowQuiz(!!quiz);
  }, [quiz]);

  // Khi load quiz mới, reset quizAnswers đúng số lượng câu hỏi
  useEffect(() => {
    if (quiz && progress && currentLessonId) {
      const lessonKey = String(currentLessonId);
      const prevAnswers = progress[lessonKey] && progress[lessonKey].quizAnswers;
      const quizPassed = progress[lessonKey] && progress[lessonKey].quizPassed;

      console.log('🔄 Loading quiz answers for lesson:', lessonKey, {
        hasProgress: !!progress[lessonKey],
        prevAnswers,
        quizPassed,
        quizQuestionsLength: quiz.questions.length,
        progressKeys: Object.keys(progress),
        progressType: typeof progress,
        lessonKeyType: typeof lessonKey
      });

      // Check if we have valid saved answers from backend
      if (Array.isArray(prevAnswers) && prevAnswers.length === quiz.questions.length) {
        // Validate that all answers are valid indices
        const validAnswers = prevAnswers.every((answer, idx) =>
          typeof answer === 'number' && answer >= 0 && answer < quiz.questions[idx]?.options?.length
        );

        if (validAnswers) {
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
          console.log('✅ Quiz answers restored from backend progress');
        } else {
          console.log('❌ Saved answers are invalid, checking cache');
          // Try to restore from cache
          const cached = getQuizAnswersFromCache(courseId, currentLessonId);
          if (cached && Array.isArray(cached) && cached.length === quiz.questions.length) {
            console.log('💾 Restoring answers from cache:', cached);
            setQuizAnswers(cached);
          } else {
            console.log('🆕 No cached answers - starting fresh');
            setQuizAnswers(new Array(quiz.questions.length).fill(-1));
          }
          setQuizResult(null);
        }
      } else {
        // No backend progress - try to restore from cache
        console.log('🔍 No backend progress - checking cache');
        const cached = getQuizAnswersFromCache(courseId, currentLessonId);
        if (cached && Array.isArray(cached) && cached.length === quiz.questions.length) {
          console.log('💾 Restoring answers from cache:', cached);
          setQuizAnswers(cached);
        } else {
          console.log('🆕 No cached answers - starting fresh');
          setQuizAnswers(new Array(quiz.questions.length).fill(-1));
        }
        setQuizResult(null);
      }
      setQuizCompleted(false);
    }
  }, [quiz, progress, currentLessonId]);

  // Save answers to cache on every change (if not submitted)
  useEffect(() => {
    if (
      quiz &&
      quizAnswers.length === quiz.questions.length &&
      !quizResult // Only cache if not submitted
    ) {
      console.log('💾 Saving quiz answers to cache:', quizAnswers);
      saveQuizAnswersToCache(courseId, currentLessonId, quizAnswers);
    }
  }, [quizAnswers, quiz, courseId, currentLessonId, quizResult]);

  // Clear cache when quiz is completed
  useEffect(() => {
    if (quizResult && quizResult.success && courseId && currentLessonId) {
      console.log('🗑️ Clearing cache - quiz completed');
      clearQuizAnswersCache(courseId, currentLessonId);
    }
  }, [quizResult, courseId, currentLessonId]);

  // Fallback: Reload quiz answers when progress is loaded after quiz
  useEffect(() => {
    if (quiz && progress && currentLessonId && quizAnswers.length === 0) {
      const lessonKey = String(currentLessonId);
      const prevAnswers = progress[lessonKey] && progress[lessonKey].quizAnswers;

      console.log('🔄 Fallback: Checking for quiz answers after progress load:', {
        lessonKey,
        hasProgress: !!progress[lessonKey],
        prevAnswers,
        currentQuizAnswersLength: quizAnswers.length,
        progressKeys: Object.keys(progress)
      });

      if (Array.isArray(prevAnswers) && prevAnswers.length === quiz.questions.length) {
        // Validate that all answers are valid indices
        const validAnswers = prevAnswers.every((answer, idx) =>
          typeof answer === 'number' && answer >= 0 && answer < quiz.questions[idx]?.options?.length
        );

        if (validAnswers) {
          setQuizAnswers(prevAnswers);
          const quizPassed = progress[lessonKey] && progress[lessonKey].quizPassed;

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
          console.log('✅ Quiz answers restored from progress (fallback)');
        } else {
          console.log('❌ Saved answers are invalid in fallback, checking cache');
          // Try to restore from cache
          const cached = getQuizAnswersFromCache(courseId, currentLessonId);
          if (cached && Array.isArray(cached) && cached.length === quiz.questions.length) {
            console.log('💾 Restoring answers from cache (fallback):', cached);
            setQuizAnswers(cached);
          }
        }
      } else {
        // No backend progress - try to restore from cache
        console.log('🔍 No backend progress in fallback - checking cache');
        const cached = getQuizAnswersFromCache(courseId, currentLessonId);
        if (cached && Array.isArray(cached) && cached.length === quiz.questions.length) {
          console.log('💾 Restoring answers from cache (fallback):', cached);
          setQuizAnswers(cached);
        }
      }
    }
  }, [progress, quiz, currentLessonId, quizAnswers.length]);

  // Additional fallback: Force reload progress if quiz is loaded but answers are not restored
  useEffect(() => {
    if (quiz && currentLessonId && quizAnswers.length === 0 && (!progress || Object.keys(progress).length === 0)) {
      console.log('🔄 Additional fallback: Progress is empty, forcing reload...');
      reloadProgress();
    }
  }, [quiz, currentLessonId, quizAnswers.length, progress]);

  // Debug useEffect to track state changes
  useEffect(() => {
    console.log('🔍 State Debug:', {
      currentLessonId,
      quizLoaded: !!quiz,
      quizQuestionsCount: quiz?.questions?.length || 0,
      quizAnswersLength: quizAnswers.length,
      progressKeys: Object.keys(progress || {}),
      hasProgressForLesson: progress && currentLessonId ? !!progress[currentLessonId] : false,
      lessonProgress: progress && currentLessonId ? progress[currentLessonId] : null
    });
  }, [currentLessonId, quiz, quizAnswers.length, progress]);

  // Handle lesson change - ensure quiz answers are properly reset and reloaded
  useEffect(() => {
    if (currentLessonId) {
      console.log('📝 Lesson changed to:', currentLessonId);
      // Reset quiz-related states when lesson changes
      // Không reset quizAnswers ở đây - để logic khôi phục từ progress xử lý
      // setQuizAnswers([]);
      setQuizResult(null);
      setQuizCompleted(false);
      setShowQuiz(false);
      setQuizUnlocked(false);
    }
  }, [currentLessonId]);

  // Hàm kiểm tra bài học có được mở không
  const canAccessLesson = (lessonId: string) => {
    const canAccess = unlockedLessons.map(String).includes(String(lessonId));
    console.log('🔍 canAccessLesson check:', {
      lessonId,
      unlockedLessons,
      canAccess
    });
    return canAccess;
  };

  // Hàm reload progress
  const reloadProgress = async () => {
    if (!courseId) return;
    try {
      console.log('🔄 Reloading progress for course:', courseId);
      const [progressData, unlocked] = await Promise.all([
        getProgress(courseId),
        getUnlockedLessons(courseId)
      ]);
      setProgress(progressData || {});
      setUnlockedLessons(unlocked || []);
      console.log('✅ Progress reloaded:', {
        progressKeys: Object.keys(progressData || {}),
        unlockedLessons: unlocked || [],
        currentLessonId
      });
    } catch (e) {
      console.error('Error reloading progress:', e);
    }
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
          // Đảm bảo videoCompleted được set đúng nếu video đã xem hết
          if (videoRef.current && videoRef.current.currentTime >= videoRef.current.duration * 0.9) {
            console.log('Force updating videoCompleted to true');
            await updateProgress(courseId, currentLessonId, {
              watchedSeconds: videoRef.current.currentTime,
              videoDuration: videoRef.current.duration,
              quizPassed: res.data.success,
              quizAnswers: quizAnswers,
              videoCompleted: true
            } as any);
          }

          // Clear cache on successful submit
          console.log('🗑️ Clearing cache after successful submit');
          clearQuizAnswersCache(courseId, currentLessonId);

          // Reload progress và unlocked lessons
          const [progressData, unlocked] = await Promise.all([
            getProgress(courseId),
            getUnlockedLessons(courseId)
          ]);
          setProgress(progressData || {});
          setUnlockedLessons(unlocked || []);

          console.log('Quiz submit successful, proceeding to next lesson');

          // Nếu đã mở được quiz thì có nghĩa là đã xem hết video, chỉ cần quiz đạt là chuyển bài
          message.success('Bạn đã hoàn thành bài học! Đang chuyển sang bài tiếp theo...');

          // Chuyển bài
          await goToNextLesson(); // Chuyển bài khi quiz đạt
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

  // Định nghĩa điều kiện hiển thị quiz: hiển thị khi đã xem hết video (90% trở lên) hoặc đã được lưu trong progress
  const shouldShowQuiz = !!quiz && (videoProgress >= 0.9 || (progress && currentLessonId && progress[currentLessonId]?.videoCompleted === true));

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

        // Tính tổng số bài học từ courseContent
        const totalLessons = courseSections.reduce((total, section) => total + section.lessons.length, 0);

        // Đếm số bài học đã hoàn thành
        const completedLessons = Object.values(progress || {}).filter((p: any) =>
          p.completed === true && p.videoCompleted === true && p.quizPassed === true
        ).length;

        // Kiểm tra hoàn thành
        const allCompleted = totalLessons > 0 && completedLessons === totalLessons;

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

  // Kiểm tra điều kiện enroll sau khi tất cả hooks đã được gọi
  const shouldShowEnrollmentAlert = isEnrolled === false && !isFree;

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
    allComments.forEach(c => {
      const likesArr = Array.isArray(c.likes) ? c.likes : [];
      states[c._id] = {
        liked: user && likesArr.some((id: any) => id === user._id || id?._id === user._id),
        count: likesArr.length
      };
    });
    setLikeStates(states);
  };

  // Khi load comments, load luôn like state
  useEffect(() => {
    if (comments && comments.length) loadLikeStates(comments);
  }, [comments]);

  // Hàm xử lý like comment
  const handleLikeComment = async (commentId: string) => {
    setLikeLoading(prev => ({ ...prev, [commentId]: true }));
    try {
      await fetch(`/api/lesson-comments/comment/${commentId}/toggle-like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // reload comments để cập nhật số like và trạng thái like
      const commentsData = await getComments(lessonId!);
      setComments(commentsData || []);
    } finally {
      setLikeLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Hàm xử lý reply
  const handleReply = async (parentId: string) => {
    if (!replyInput[parentId]?.trim()) return;
    setReplyLoading(prev => ({ ...prev, [parentId]: true }));
    try {
      const res = await replyComment(parentId, replyInput[parentId]);
      if (!res || res.success === false) {
        message.error(res?.message || 'Không thể gửi phản hồi');
        return;
      }
      setReplyInput(prev => ({ ...prev, [parentId]: '' }));
      setShowReplyBox(prev => ({ ...prev, [parentId]: false }));
      // reload comments
      const commentsData = await getComments(lessonId!);
      setComments(commentsData || []);
      message.success('Đã gửi phản hồi!');
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Không gửi được phản hồi.');
    } finally {
      setReplyLoading(prev => ({ ...prev, [parentId]: false }));
    }
  };

  // State để quản lý số lượng reply hiển thị cho từng comment/reply
  const [visibleReplies, setVisibleReplies] = useState<{ [commentId: string]: number }>({});

  // Hàm xử lý xem thêm reply
  const handleShowMoreReplies = (parentId: string, total: number) => {
    setVisibleReplies(prev => ({
      ...prev,
      [parentId]: Math.min((prev[parentId] || 1) + 2, total)
    }));
  };

  // Hàm xử lý ẩn bớt reply
  const handleHideReplies = (parentId: string) => {
    setVisibleReplies(prev => ({
      ...prev,
      [parentId]: 1
    }));
  };

  // Hàm render replies lồng nhau (thụt lề tối giản cho reply, chỉ hiện 1 reply đầu, có nút xem thêm)
  const renderReplies = (replies: any[] = [], parentId?: string, level = 1) => (
    (() => {
      if (!replies || replies.length === 0) return null;
      const visibleCount = visibleReplies[parentId || 'root'] || 1;
      const showReplies = replies.slice(0, visibleCount);
      return (
        <div style={{
          marginLeft: 8,
          marginTop: 8,
          borderLeft: level === 1 ? '2px solid #a5b4fc' : undefined,
          paddingLeft: 12,
          background: level === 1 ? '#f8faff' : 'transparent',
          borderRadius: level === 1 ? 8 : undefined
        }}>
          {showReplies.map(reply => (
            <div key={reply._id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: 10,
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
              background: 'transparent'
            }}>
              <Avatar
                src={reply.user?.avatar && reply.user.avatar !== 'default-avatar.jpg' && reply.user.avatar !== '' && (reply.user.avatar.includes('googleusercontent.com') || reply.user.avatar.startsWith('http')) ? reply.user.avatar : undefined}
                size={24}
                style={{ marginRight: 8, marginTop: 2, background: '#e6f7ff', color: '#1890ff' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{reply.user?.fullname || reply.user?.name || 'Anonymous'}</div>
                <div style={{ fontSize: 14, color: '#444', margin: '2px 0 4px 0' }}>{reply.content}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                  <Button
                    type={likeStates[reply._id]?.liked ? 'primary' : 'default'}
                    size="small"
                    icon={<span style={{ color: likeStates[reply._id]?.liked ? '#f5222d' : '#888', fontSize: 13 }}>♥</span>}
                    style={{ border: 'none', background: 'none', boxShadow: 'none', padding: 0, fontSize: 13, display: 'flex', alignItems: 'center' }}
                    onClick={() => handleLikeComment(reply._id)}
                    loading={likeLoading[reply._id]}
                  >
                    <span style={{ color: '#888', fontSize: 13, fontWeight: 600, minWidth: 14, textAlign: 'left', marginLeft: 4 }}>
                      {typeof likeStates[reply._id]?.count === 'number' ? likeStates[reply._id]?.count : (Array.isArray(reply.likes) ? reply.likes.length : 0)}
                    </span>
                  </Button>
                  <Button type="link" size="small" style={{ fontSize: 13, color: '#6366f1', padding: 0 }} onClick={() => setShowReplyBox(prev => ({ ...prev, [reply._id]: !prev[reply._id] }))}>Trả lời</Button>
                </div>
                {showReplyBox[reply._id] && (
                  <div style={{ marginTop: 6 }}>
                    <Input.TextArea
                      rows={2}
                      value={replyInput[reply._id] || ''}
                      onChange={e => setReplyInput(prev => ({ ...prev, [reply._id]: e.target.value }))}
                      placeholder="Nhập phản hồi..."
                      style={{ borderRadius: 8, fontSize: 14, marginBottom: 4 }}
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
                {/* Reply lồng nhau */}
                {reply.replies && reply.replies.length > 0 && renderReplies(reply.replies, reply._id, level + 1)}
              </div>
            </div>
          ))}
          {replies.length > visibleCount && (
            <Button type="link" size="small" style={{ color: '#6366f1', fontWeight: 500, marginLeft: 8 }} onClick={() => handleShowMoreReplies(parentId || 'root', replies.length)}>
              Xem thêm {Math.min(2, replies.length - visibleCount)} phản hồi...
            </Button>
          )}
          {visibleCount > 1 && replies.length > 1 && (
            <Button type="link" size="small" style={{ color: '#888', fontWeight: 500, marginLeft: 8 }} onClick={() => handleHideReplies(parentId || 'root')}>
              Ẩn bớt phản hồi
            </Button>
          )}
        </div>
      );
    })()
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

  // AI Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

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

  // Khi hoàn thành khóa học, tự động lấy certificate nếu có
  useEffect(() => {
    if (isCompleted && courseId) {
      setIsLoadingCertificate(true);
      getCertificate(courseId)
        .then(cert => setCertificate(cert))
        .catch(() => setCertificate(null))
        .finally(() => setIsLoadingCertificate(false));
    }
  }, [isCompleted, courseId]);

  // Hàm nhận chứng chỉ
  const handleIssueCertificate = async () => {
    if (!courseId) return;
    setIsLoadingCertificate(true);
    try {
      const cert = await issueCertificate(courseId);
      setCertificate(cert);
      message.success('Đã nhận chứng chỉ!');
    } catch (e: any) {
      // Nếu có danh sách bài học chưa hoàn thành, hiển thị chi tiết
      if (e?.response?.data?.incompleteLessons && Array.isArray(e.response.data.incompleteLessons)) {
        const ids = e.response.data.incompleteLessons;
        message.error(
          <span>
            Không thể nhận chứng chỉ. Bạn còn <b>{ids.length}</b> bài học chưa hoàn thành.<br />
            Mã bài học: <span style={{ color: '#1890ff' }}>{ids.join(', ')}</span>
          </span>
        );
      } else {
        message.error('Không thể nhận chứng chỉ. Hãy đảm bảo bạn đã hoàn thành tất cả bài học!');
      }
    }
    setIsLoadingCertificate(false);
  };



  // Render danh sách bình luận chuyên nghiệp hơn
  const renderCommentItem = (item: any) => (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: '20px 0',
      borderBottom: '1px solid #f0f0f0',
      marginBottom: 4,
      background: '#fff',
      borderRadius: 12
    }}>
      <Avatar
        src={item.user?.avatar && item.user.avatar !== 'default-avatar.jpg' && item.user.avatar !== '' && (item.user.avatar.includes('googleusercontent.com') || item.user.avatar.startsWith('http')) ? item.user.avatar : undefined}
        icon={<UserOutlined />}
        size={44}
        style={{ background: '#e6f7ff', color: '#1890ff', marginRight: 18, marginTop: 2 }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#222' }}>{item.user?.fullname || item.user?.name || 'Anonymous'}</span>
          <span style={{ color: '#888', fontSize: 13, fontWeight: 400 }}>{dayjs(item.createdAt).fromNow()}</span>
        </div>
        <div style={{ fontSize: 16, color: '#444', marginBottom: 8 }}>{item.content}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 2 }}>
          <Button
            type={likeStates[item._id]?.liked ? 'primary' : 'default'}
            size="small"
            icon={<span style={{ color: likeStates[item._id]?.liked ? '#f5222d' : '#888', fontSize: 16 }}>♥</span>}
            style={{ border: 'none', background: 'none', boxShadow: 'none', padding: 0, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center' }}
            onClick={() => handleLikeComment(item._id)}
            loading={likeLoading[item._id]}
            onMouseOver={e => (e.currentTarget.style.color = '#f5222d')}
            onMouseOut={e => (e.currentTarget.style.color = '')}
          >
            <span style={{ color: '#888', fontSize: 15, fontWeight: 600, minWidth: 18, textAlign: 'left', marginLeft: 4 }}>
              {typeof likeStates[item._id]?.count === 'number' ? likeStates[item._id]?.count : (Array.isArray(item.likes) ? item.likes.length : 0)}
            </span>
          </Button>
          <Button
            type="link"
            size="small"
            style={{ fontSize: 15, color: '#6366f1', padding: 0, fontWeight: 600 }}
            onClick={() => setShowReplyBox(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
          >Trả lời</Button>
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
        {renderReplies(item.replies || [], item._id, 1)}
      </div>
    </div>
  );

  const cloudName = 'dxsilzscb';
  const publicId = 'edupor/videos/ovyuqhtkjutcgcdrfage';

  // Hiển thị thông báo enroll nếu cần
  if (shouldShowEnrollmentAlert) {
    return <Alert message="Bạn cần đăng ký khóa học để học bài này." type="warning" showIcon style={{ margin: 32 }} />;
  }

  // Kiểm tra trạng thái hoàn thành bài học hiện tại
  const getLessonCompletionStatus = () => {
    if (!currentLessonId || !progress[currentLessonId]) {
      return { videoCompleted: false, quizCompleted: false, fullyCompleted: false };
    }

    const lessonProgress = progress[currentLessonId];
    const videoCompleted = lessonProgress.videoCompleted === true || videoProgress >= 0.9;
    const quizCompleted = lessonProgress.quizPassed === true;
    const fullyCompleted = videoCompleted && quizCompleted;

    return { videoCompleted, quizCompleted, fullyCompleted };
  };

  const lessonStatus = getLessonCompletionStatus();

  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', height: '100vh', background: '#f4f6fa', overflow: 'hidden' }}>
      <div style={{
        width: '30%',
        minWidth: 280,
        maxWidth: 400,
        background: '#fff',
        boxShadow: '0 2px 16px #e6e6e6',
        borderRadius: 16,
        margin: 16,
        height: 'calc(100vh - 32px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
      }}
        className="hide-scrollbar"
      >
        <SectionSidebar
          sections={courseSections}
          unlockedLessons={unlockedLessons}
          currentLessonId={currentLessonId}
          progress={progress}
          currentVideoProgress={Math.round(videoProgress * 100)}
          isVideoPlaying={isVideoPlaying}
          onSelectLesson={(lessonId) => {
            console.log('Navigating to lesson:', lessonId);
            // Lưu tiến trình hiện tại trước khi chuyển bài
            if (courseId && currentLessonId) {
              const video = document.querySelector('video');
              if (video && video.currentTime > 0) {
                updateVideoProgress(courseId, currentLessonId, video.currentTime, video.duration)
                  .catch(e => console.error("Failed to save progress before navigation", e));
              }
            }

            // Reset progress UI trước khi chuyển bài
            setVideoProgress(0);
            setVideoWatched(false);
            setSavedVideoTime(0);

            navigate(`/lessons/${lessonId}/video`);
          }}
          isCompleted={isCompleted}
          onIssueCertificate={handleIssueCertificate}
          certificate={certificate}
          isLoadingCertificate={isLoadingCertificate}
        />
      </div>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{
          flex: '0 0 70%',
          padding: '32px 40px',
          overflowY: 'auto', // Chỉ cuộn nội dung chính nếu cần
          height: '100vh',
          background: 'transparent',
          overflowX: 'hidden'
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>
        ) : error ? (
          <Alert message="Lỗi" description={error} type="error" showIcon style={{ margin: 32 }} />
        ) : isEnrolled === false && !isFree ? (
          <Alert message="Bạn cần đăng ký khóa học để học bài này." type="warning" showIcon style={{ margin: 32 }} />
        ) : (
          <>
            <Divider style={{ margin: '12px 0 24px 0' }} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', marginBottom: 32, width: '100%', maxWidth: 'none', background: 'linear-gradient(135deg, #f0f7ff 0%, #f8f5ff 100%)', border: 'none', padding: 0 }} styles={{ body: { padding: 0 } }}>
                {videoUrl ? (
                  <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden' }}>
                    {/* <video
                      ref={videoRef}
                      key={videoUrl}
                      src={videoUrl}
                      controls
                      controlsList="nodownload noplaybackrate"
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ width: '100%', borderRadius: 0, background: '#000', display: 'block', maxHeight: 480 }}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleVideoEnded}
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onPlay={() => setIsVideoPlaying(true)}
                                                  onPause={() => {
                              setIsVideoPlaying(false);
                              // Lưu tiến trình khi pause
                              if (courseId && currentLessonId) {
                                const video = document.querySelector('video');
                                if (video && video.currentTime > 0) {
                                  updateVideoProgress(courseId, currentLessonId, video.currentTime, video.duration)
                                    .catch(e => console.error("Failed to save progress on pause", e));
                                }
                              }
                            }}
                    >
                      Trình duyệt không hỗ trợ video tag.
                    </video> */}
                    {(() => {
                      // Extract cloudName and publicId from videoUrl
                      let cloudName = '';
                      let publicId = '';

                      if (videoUrl) {
                        try {
                          const url = new URL(videoUrl);
                          const pathParts = url.pathname.split('/');

                          // For Cloudinary URLs: https://res.cloudinary.com/[cloudName]/video/upload/...
                          if (url.hostname === 'res.cloudinary.com' && pathParts.length >= 3) {
                            cloudName = pathParts[1];
                            // Find the public_id (usually after 'upload/')
                            const uploadIndex = pathParts.indexOf('upload');
                            if (uploadIndex !== -1 && uploadIndex + 1 < pathParts.length) {
                              publicId = pathParts.slice(uploadIndex + 1).join('/').replace(/\.[^/.]+$/, ''); // Remove extension
                            }
                          }
                        } catch (e) {
                          console.error('Error parsing video URL:', e);
                        }
                      }

                      // If we have cloudName and publicId, use CustomVideoPlayer with multiple qualities
                      if (cloudName && publicId) {
                        return (
                          <CustomVideoPlayer
                            ref={videoRef}
                            sources={{
                              '360p': `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto,w_640,h_360,c_limit/${publicId}.mp4`,
                              '720p': `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto,w_1280,h_720,c_limit/${publicId}.mp4`,
                              '1080p': `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto,w_1920,h_1080,c_limit/${publicId}.mp4`,
                            }}
                            onTimeUpdate={handleVideoTimeUpdate}
                            onEnded={handleVideoEnded}
                            onLoadedMetadata={handleVideoLoadedMetadata}
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => {
                              setIsVideoPlaying(false);
                              // Lưu tiến trình khi pause
                              if (courseId && currentLessonId) {
                                const video = document.querySelector('video');
                                if (video && video.currentTime > 0) {
                                  updateVideoProgress(courseId, currentLessonId, video.currentTime, video.duration)
                                    .catch(e => console.error("Failed to save progress on pause", e));
                                }
                              }
                            }}
                            initialTime={savedVideoTime}
                            isLessonCompleted={!!progress && !!currentLessonId && (progress[currentLessonId]?.completed === true || progress[currentLessonId]?.videoCompleted === true)}
                          />
                        );
                      } else {
                        // Fallback to regular video element if not Cloudinary or parsing failed
                        return (
                          <video
                            ref={videoRef}
                            key={videoUrl}
                            src={videoUrl}
                            controls
                            controlsList="nodownload noplaybackrate"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ width: '100%', borderRadius: 0, background: '#000', display: 'block', maxHeight: 480 }}
                            onTimeUpdate={handleVideoTimeUpdate}
                            onEnded={handleVideoEnded}
                            onLoadedMetadata={handleVideoLoadedMetadata}
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => {
                              setIsVideoPlaying(false);
                              // Lưu tiến trình khi pause
                              if (courseId && currentLessonId) {
                                const video = document.querySelector('video');
                                if (video && video.currentTime > 0) {
                                  updateVideoProgress(courseId, currentLessonId, video.currentTime, video.duration)
                                    .catch(e => console.error("Failed to save progress on pause", e));
                                }
                              }
                            }}
                          >
                            Trình duyệt không hỗ trợ video tag.
                          </video>
                        );
                      }
                    })()}


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
                onChange={key => {
                  // Ngăn chặn chuyển sang tab quiz nếu chưa xem hết video
                  if (key === 'quiz' && !shouldShowQuiz) {
                    message.warning('Bạn cần xem hết video (90% trở lên) để làm quiz!');
                    return;
                  }
                  setActiveTab(key as 'overview' | 'quiz' | 'comment' | 'note' | 'review');
                }}
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
                  ...(quiz ? [
                    {
                      key: 'quiz',
                      label: shouldShowQuiz ? 'Quiz' : 'Quiz (Cần xem hết video)',
                      disabled: !shouldShowQuiz,
                      children: (
                        <Card style={{ borderRadius: 18, boxShadow: '0 4px 24px #e6e6e6', marginBottom: 32, width: '100%', maxWidth: 'none' }}>
                          {!shouldShowQuiz ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                              <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
                              <div style={{ fontSize: 20, fontWeight: 600, color: '#6366f1', marginBottom: 12 }}>
                                Cần xem hết video để làm quiz
                              </div>
                              <div style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>
                                Bạn cần xem hết video (90% trở lên) để có thể làm quiz này.
                              </div>
                              <div style={{ fontSize: 14, color: '#888' }}>
                                Tiến độ hiện tại: {Math.round(videoProgress * 100)}%
                              </div>
                            </div>
                          ) : (
                            <>
                              <div
                                style={{
                                  fontWeight: 800,
                                  fontSize: 26,
                                  background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  borderRadius: 12,
                                  boxShadow: '0 2px 12px #e0e7ef',
                                  padding: '18px 0 10px 0',
                                  marginBottom: 18,
                                  textAlign: 'center',
                                  letterSpacing: 0.5,
                                  lineHeight: 1.2
                                }}
                              >
                                {lessonTitle}
                              </div>
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
                                <Button
                                  type="primary"
                                  size="large"
                                  onClick={handleQuizSubmit}
                                  disabled={!!quizResult && quizResult.success}
                                  style={{
                                    minWidth: 160,
                                    fontWeight: 700,
                                    fontSize: 18,
                                    borderRadius: 24,
                                    padding: '12px 32px',
                                    background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
                                  }}
                                >
                                  {quizResult && quizResult.success ? 'Đã hoàn thành' : 'Nộp bài'}
                                </Button>
                                {quizResult && !quizResult.success && (
                                  <Button
                                    size="large"
                                    onClick={handleQuizRetry}
                                    style={{
                                      minWidth: 160,
                                      fontWeight: 700,
                                      fontSize: 18,
                                      borderRadius: 24,
                                      padding: '12px 32px',
                                      border: '2px solid #6366f1',
                                      color: '#6366f1',
                                      background: '#fff'
                                    }}
                                  >
                                    Làm lại
                                  </Button>
                                )}
                              </div>
                              {quizResult && (
                                <div style={{
                                  marginTop: 24,
                                  padding: 16,
                                  borderRadius: 12,
                                  background: quizResult.success ? '#f6ffed' : '#fff2e8',
                                  border: `1px solid ${quizResult.success ? '#b7eb8f' : '#ffd591'}`,
                                  textAlign: 'center'
                                }}>
                                  <div style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: quizResult.success ? '#52c41a' : '#fa8c16',
                                    marginBottom: 8
                                  }}>
                                    {quizResult.success ? 'Chúc mừng! Bạn đã hoàn thành quiz.' : 'Quiz chưa đạt, hãy thử lại.'}
                                  </div>
                                  <div style={{ color: '#666', fontSize: 14 }}>
                                    {quizResult.message}
                                  </div>
                                </div>
                              )}
                            </>
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
                          renderItem={renderCommentItem}
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
                                minWidth: 140,
                                borderRadius: 24,
                                fontSize: 18,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 16px #bae6fd',
                                border: 'none',
                                marginLeft: 8,
                                transition: 'background 0.2s, box-shadow 0.2s',
                                gap: 8,
                              }}
                              onMouseOver={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px #a5b4fc';
                              }}
                              onMouseOut={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px #bae6fd';
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
                          <Button type="primary" onClick={handleAddNote} disabled={!newNoteContent.trim()}
                            style={{
                              minWidth: 160,
                              fontWeight: 700,
                              fontSize: 17,
                              borderRadius: 24,
                              padding: '10px 28px',
                              background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)',
                              color: '#fff',
                              boxShadow: '0 4px 16px #bae6fd',
                              border: 'none',
                              transition: 'background 0.2s, box-shadow 0.2s',
                              marginTop: 6
                            }}
                            onMouseOver={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)';
                              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px #a5b4fc';
                            }}
                            onMouseOut={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)';
                              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px #bae6fd';
                            }}
                          >
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
                                          styles={{ body: { padding: '16px' } }}
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
                              <div key={5 - idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                <span style={{ fontWeight: 600, color: '#06b6d4', minWidth: 24 }}>{5 - idx}</span>
                                <Rate disabled value={5 - idx} style={{ fontSize: 16, color: '#06b6d4' }} />
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

      {/* AI Chat Box Component */}
      <AIChatBox
        lessonTitle={lessonTitle}
        courseTitle={courseOverview.title}
        isOpen={isChatOpen}
        onToggle={toggleChat}
      />
    </div>
  );
};

export default LessonVideoPage;

<style>{`
  .hide-scrollbar::-webkit-scrollbar {
    display: none !important;
  }
  .hide-scrollbar {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
`}</style>
