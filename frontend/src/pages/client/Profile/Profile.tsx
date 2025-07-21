import { useEffect, useState } from "react";
import { User, Mail, BookOpen, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { config } from "../../../api/axios";
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { Progress } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { courseService, getCourseById } from '../../../services/courseService';
import { getProgress } from '../../../services/progressService';

interface User {
  id: number;
  avatar?: string;
  fullname: string;
  nickname?: string;
  email: string;
  bio?: string;
  created_at: string;
  approval_status?: string;
  role?: {
    name: string;
    description: string;
    permissions: string[];
  };
  instructorInfo?: {
    instructor_profile_status: string;
    rejection_reason?: string;
    specializations?: string[];
    experience_years?: number;
    teaching_experience?: {
      description: string;
    };
    education?: {
      degree: string;
      institution: string;
      year: number;
    }[];
    cv_file?: string;
    demo_video?: string;
    application_date?: string;
    approval_date?: string;
  };
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  followers_count?: number;
  following_count?: number;
  social_links?: {
    facebook?: string;
    github?: string;
    website?: string;
  };
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [courseLessonsMap, setCourseLessonsMap] = useState<Record<string, number>>({});
  const [courseSectionsMap, setCourseSectionsMap] = useState<Record<string, any[]>>({});
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await config.get('/users/me');
        setUser(response.data.data);
        setError(null);
      } catch (error: unknown) {
        console.error('Error fetching user profile:', error);
        let errorMessage = 'Không thể tải thông tin người dùng';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number, data?: { message?: string } } };
          errorMessage = axiosError.response?.data?.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const fetchEnrolledCourses = async () => {
      try {
        const response = await config.get('/users/me/enrollments');
        setEnrolledCourses(response.data.data || []);
      } catch (error) {
        // Có thể log lỗi nếu cần
      }
    };

    fetchUserProfile();
    fetchEnrolledCourses();
  }, []);

  // Fetch chi tiết từng khóa học để lấy số lượng bài học
  useEffect(() => {
    const fetchLessonsCount = async () => {
      const lessonsMap: Record<string, number> = {};
      const sectionsMap: Record<string, any[]> = {};
      await Promise.all(
        enrolledCourses.map(async (enroll) => {
          const course = enroll.course || {};
          const courseId = course._id || course.id;
          if (!courseId) return;
          try {
            const detail = await getCourseById(courseId);
            let total = 0;
            if (Array.isArray(detail.sections)) {
              total = detail.sections.reduce(
                (sum: number, sec: any) => sum + (Array.isArray(sec.lessons) ? sec.lessons.length : 0),
                0
              );
              sectionsMap[courseId] = detail.sections;
            } else if (Array.isArray(detail.lessons)) {
              total = detail.lessons.length;
              sectionsMap[courseId] = [{ lessons: detail.lessons }];
            } else if (typeof detail.totalLessons === 'number') {
              total = detail.totalLessons;
              sectionsMap[courseId] = [];
            } else {
              sectionsMap[courseId] = [];
            }
            lessonsMap[courseId] = total;
          } catch (e) {
            lessonsMap[courseId] = 0;
            sectionsMap[courseId] = [];
          }
        })
      );
      setCourseLessonsMap(lessonsMap);
      setCourseSectionsMap(sectionsMap);
    };
    if (enrolledCourses.length > 0) {
      fetchLessonsCount();
    }
  }, [enrolledCourses]);

  // Fetch progress cho từng course
  useEffect(() => {
    const fetchAllProgress = async () => {
      const progressMap: Record<string, any> = {};
      await Promise.all(
        enrolledCourses.map(async (enroll) => {
          const course = enroll.course || {};
          const courseId = course._id || course.id;
          if (!courseId) return;
          try {
            const progress = await getProgress(courseId);
            console.log('Fetched progress for', courseId, JSON.stringify(progress));
            progressMap[courseId] = progress;
          } catch {
            progressMap[courseId] = {};
          }
        })
      );
      setCourseProgressMap(progressMap);
    };
    if (enrolledCourses.length > 0) fetchAllProgress();
  }, [enrolledCourses]);

  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col items-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="mt-4 text-gray-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Đang tải thông tin...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <motion.div
              className="text-2xl text-red-500 mb-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ⚠️
            </motion.div>
            <div className="text-xl text-red-600 mb-4 font-semibold">{error}</div>
            <motion.button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Đăng nhập lại
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      fullDate: format(date, 'dd/MM/yyyy', { locale: vi }),
      timeAgo: formatDistanceToNow(date, { addSuffix: true, locale: vi }),
      year: date.getFullYear()
    };
  };

  const joinInfo = user?.created_at ? formatJoinDate(user.created_at) : null;

  const getTotalLessons = (course: any) => {
    if (typeof course.totalLessons === 'number' && course.totalLessons > 0) {
      return course.totalLessons;
    }
    if (Array.isArray(course.sections)) {
      return course.sections.reduce(
        (sum: number, sec: any) => sum + (Array.isArray(sec.lessons) ? sec.lessons.length : 0),
        0
      );
    }
    if (Array.isArray(course.lessons)) {
      return course.lessons.length;
    }
    return 0;
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 px-4 lg:px-12">
        {/* Left: User Info Card */}
        <motion.div
          className="w-full lg:w-1/3"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="bg-white/90 rounded-3xl shadow-2xl p-10 border border-blue-100"
            whileHover={{ y: -8, boxShadow: "0 24px 48px -8px rgba(80,80,180,0.13)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Avatar Section */}
            <div className="text-center mb-10">
              <motion.div
                className="relative inline-block"
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div className="w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 shadow-xl mx-auto">
                  <img
                    src={user?.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullname || '') + '&background=4f8cff&color=fff&size=256'}
                    alt="avatar"
                    className="w-full h-full rounded-full border-4 border-white object-cover"
                  />
                </motion.div>
                <motion.div
                  className="absolute -bottom-3 -right-3 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-6 mb-2 tracking-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {user?.fullname ?? 'Chưa có tên'}
              </motion.h1>

              {user?.nickname && (
                <motion.p
                  className="text-blue-400 text-lg font-mono mb-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  @{user?.nickname}
                </motion.p>
              )}

              <motion.div
                className="flex items-center justify-center gap-2 text-gray-500 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Mail size={18} />
                <span className="text-base">{user?.email ?? ''}</span>
              </motion.div>

              {/* Bio Section */}
              {user?.bio && user?.role?.name !== 'instructor' && (
                <motion.div
                  className="text-center mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                >
                  <p className="text-gray-600 text-base leading-relaxed max-w-xs mx-auto">
                    {user?.bio ?? ''}
                  </p>
                </motion.div>
              )}

              {/* Social links */}
              {user?.social_links && (user?.social_links?.facebook || user?.social_links?.github || user?.social_links?.website) && (
                <motion.div
                  className="flex items-center justify-center gap-4 mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                >
                  {user?.social_links?.facebook && (
                    <a href={user.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:scale-110 transition-transform text-2xl">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.326v-21.349c0-.734-.593-1.326-1.324-1.326z" /></svg>
                    </a>
                  )}
                  {user?.social_links?.github && (
                    <a href={user.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:scale-110 transition-transform text-2xl">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576 4.765-1.588 8.199-6.084 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    </a>
                  )}
                  {user?.social_links?.website && (
                    <a href={user.social_links.website} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:scale-110 transition-transform text-2xl">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm0-18c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zm0-10c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z" /></svg>
                    </a>
                  )}
                </motion.div>
              )}
            </div>

            {/* Thông tin giảng viên */}
            {user?.role?.name === 'instructor' && (
              <motion.div
                className="mt-10 border-t border-blue-100 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <h3 className="text-xl font-bold text-blue-700 mb-5 flex items-center gap-2">
                  <BookOpen className="inline-block w-6 h-6 text-blue-500" /> Thông tin giảng viên
                </h3>
                <div className="space-y-3 text-gray-700 text-lg">
                  <div><b>Chuyên môn:</b> {user?.instructorInfo?.specializations && user.instructorInfo.specializations.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.instructorInfo.specializations.map((spec, idx) => (
                        <span key={idx} className="inline-block bg-gradient-to-r from-cyan-400 to-purple-400 text-white px-4 py-2 rounded-full text-base font-semibold shadow-sm border-0">
                          {spec}
                        </span>
                      ))}
                    </div>
                  ) : 'Chưa cập nhật'}</div>
                  <div><b>Kinh nghiệm giảng dạy:</b> {typeof user?.instructorInfo?.experience_years === 'number' ? user.instructorInfo.experience_years : 'Chưa cập nhật'} năm</div>
                  <div><b>Giới thiệu:</b> {user?.instructorInfo?.teaching_experience?.description ? user.instructorInfo.teaching_experience.description : 'Không có mô tả'}</div>
                </div>
              </motion.div>
            )}

            {/* Stats Section: Người theo dõi/Đang theo dõi */}
            <motion.div
              className="border-t border-blue-100 pt-8 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  className="text-center p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors duration-200 shadow-md"
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="text-3xl font-extrabold text-blue-600">{user?.followers_count ?? 0}</div>
                  <div className="text-base text-gray-500">Người theo dõi</div>
                </motion.div>
                <motion.div
                  className="text-center p-6 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors duration-200 shadow-md"
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="text-3xl font-extrabold text-green-600">{user?.following_count ?? 0}</div>
                  <div className="text-base text-gray-500">Đang theo dõi</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Join Date Section */}
            {joinInfo ? (
              <motion.div
                className="border-t border-blue-100 pt-8 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Calendar size={18} />
                  <span className="text-base">Tham gia {joinInfo.timeAgo}</span>
                </div>
              </motion.div>
            ) : null}

          </motion.div>
        </motion.div>

        {/* Right: Activity & Courses */}
        <motion.div
          className="w-full lg:w-2/3 space-y-8"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Courses Section */}
          <motion.div
            className="bg-white/90 rounded-3xl shadow-2xl p-10 border border-blue-100"
            whileHover={{ y: -8, boxShadow: "0 24px 48px -8px rgba(56,189,248,0.12)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Users className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">
                Khóa học đang học
              </h2>
              <span className="ml-2 text-base text-gray-500 font-medium">
                ({enrolledCourses.length} khóa học)
              </span>
            </motion.div>

            {enrolledCourses.length === 0 ? (
              <p>Bạn chưa đăng ký khóa học nào.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
                {enrolledCourses.map((enroll) => {
                  const course = enroll.course || {};
                  const courseId = course._id || course.id;
                  const progress = courseProgressMap[courseId] || {};
                  console.log('Render progress:', courseId, JSON.stringify(progress));
                  const total = courseLessonsMap[courseId] ?? 0;
                  const sections = courseSectionsMap[courseId] || [];
                  let lessonIds: string[] = [];
                  sections.forEach(section => {
                    if (Array.isArray(section.lessons)) {
                      lessonIds = lessonIds.concat(section.lessons.map((lesson: any) => lesson._id));
                    }
                  });
                  const completedCount = lessonIds.filter(
                    id => progress[id]?.completed === true || progress[id]?.videoCompleted === true
                  ).length;
                  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

                  // Lấy sections từ courseSectionsMap để xác định bài học tiếp tục
                  let continueLessonId = null;
                  if (progress.lastWatchedLessonId) {
                    continueLessonId = progress.lastWatchedLessonId;
                  } else if (Array.isArray(sections)) {
                    outer: for (const section of sections) {
                      if (Array.isArray(section.lessons)) {
                        for (const lesson of section.lessons) {
                          if (!progress[lesson._id]?.completed && !progress[lesson._id]?.videoCompleted) {
                            continueLessonId = lesson._id;
                            break outer;
                          }
                        }
                      }
                    }
                  }
                  // Nếu đã hoàn thành hết thì lấy bài đầu tiên
                  if (!continueLessonId && Array.isArray(sections) && sections[0]?.lessons?.[0]?._id) {
                    continueLessonId = sections[0].lessons[0]._id;
                  }

                  return (
                    <motion.div
                      key={course._id || course.id}
                      className="relative bg-white rounded-3xl shadow-xl overflow-hidden group border border-blue-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Course Image */}
                      <div className="relative">
                        <img
                          src={course.thumbnail || '/default-course.jpg'}
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-3xl pointer-events-none" />
                        {percent < 100 && (
                          <Link
                            to="#"
                            onClick={e => {
                              e.preventDefault();
                              if (continueLessonId) {
                                navigate(`/lessons/${continueLessonId}/video`);
                              } else if (course.slug) {
                                navigate(`/courses/slug/${course.slug}`);
                              }
                            }}
                            className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white !text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 hover:shadow-xl flex items-center gap-2 transition text-lg z-10"
                          >
                            Tiếp tục học <ArrowRightOutlined />
                          </Link>
                        )}
                        {percent === 100 && (
                          <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-lg z-10">Hoàn thành</span>
                        )}
                      </div>
                      {/* Course Info */}
                      <div className="p-6 flex flex-col gap-2">
                        <h3 className="font-bold text-xl mb-1 text-gray-900 truncate" title={course.title}>{course.title}</h3>
                        <div className="text-gray-500 text-base mb-2">
                          {total > 0 ? `${total} bài học` : 'Đang cập nhật'}
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <Progress
                            percent={percent}
                            size="small"
                            strokeColor={{
                              '0%': '#4f8cff',
                              '100%': '#16a34a',
                            }}
                            showInfo={false}
                            className="flex-1"
                          />
                          <span className={`font-bold text-lg ${percent === 100 ? 'text-green-600' : 'text-blue-600'}`}>{percent}%</span>
                        </div>
                        <div className="text-gray-500 text-sm">
                          {completedCount}/{total} bài học
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;