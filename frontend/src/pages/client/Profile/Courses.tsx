import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { config } from "../../../api/axios";
import { useNavigate } from 'react-router-dom';
import { Progress } from 'antd';
import { ArrowRightOutlined, EyeOutlined } from '@ant-design/icons';
import { courseService, getCourseById } from '../../../services/courseService';
import { getProgress } from '../../../services/progressService';

const Courses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [courseLessonsMap, setCourseLessonsMap] = useState<Record<string, number>>({});
  const [courseSectionsMap, setCourseSectionsMap] = useState<Record<string, any[]>>({});
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, any>>({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const navigate = useNavigate();

  // Sắp xếp khóa học theo thứ tự mới -> cũ (dựa trên enrollment date)
  const sortedCourses = [...enrolledCourses].sort((a, b) => {
    // Lấy ngày đăng ký từ nhiều trường khác nhau có thể có
    const getEnrollmentDate = (enrollment: any) => {
      // Ưu tiên theo thứ tự: createdAt > enrollmentDate > created_at > updatedAt > current time
      return new Date(
        enrollment.createdAt || 
        enrollment.enrollmentDate || 
        enrollment.created_at || 
        enrollment.updatedAt || 
        enrollment.updated_at ||
        Date.now()
      );
    };

    const dateA = getEnrollmentDate(a);
    const dateB = getEnrollmentDate(b);
    
    // Sắp xếp giảm dần: mới nhất lên đầu (dateB - dateA)
    const result = dateB.getTime() - dateA.getTime();
    
    // Debug log để kiểm tra
    console.log(`Sorting: ${a.course?.title || 'Unknown'} (${dateA.toISOString()}) vs ${b.course?.title || 'Unknown'} (${dateB.toISOString()}) = ${result}`);
    
    return result;
  });

  // Hiển thị 6 khóa học đầu tiên hoặc tất cả
  const displayedCourses = showAllCourses ? sortedCourses : sortedCourses.slice(0, 6);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const response = await config.get('/users/me/enrollments');
        setEnrolledCourses(response.data.data || []);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

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
      if (enrolledCourses.length === 0) return;
      
      setProgressLoading(true);
      const progressMap: Record<string, any> = {};
      try {
        await Promise.all(
          enrolledCourses.map(async (enroll) => {
            const course = enroll.course || {};
            const courseId = course._id || course.id;
            if (!courseId) return;
            try {
              const progress = await getProgress(courseId);
              console.log('Fetched progress for', courseId, JSON.stringify(progress));
              progressMap[courseId] = progress;
            } catch (error) {
              console.error('Error fetching progress for course', courseId, error);
              progressMap[courseId] = {};
            }
          })
        );
        setCourseProgressMap(progressMap);
      } finally {
        setProgressLoading(false);
      }
    };
    fetchAllProgress();
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
            Đang tải khóa học...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
        </motion.div>

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
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Khóa học đang học
              </h2>
              <span className="text-base text-gray-500 font-medium">
                {displayedCourses.length} / {enrolledCourses.length} khóa học
              </span>
            </div>
          </motion.div>

          {enrolledCourses.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <motion.div
                className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có khóa học nào</h3>
              <p className="text-gray-500 mb-6">Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học thú vị!</p>
              <motion.button
                onClick={() => navigate('/courses')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Khám phá khóa học
              </motion.button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {displayedCourses.map((enroll, index) => {
                  const course = enroll.course || {};
                  const courseId = course._id || course.id;
                  const progress = courseProgressMap[courseId] || {};
                  const sections = courseSectionsMap[courseId] || [];
                  let lessonIds: string[] = [];
                  sections.forEach(section => {
                    if (Array.isArray(section.lessons)) {
                      lessonIds = lessonIds.concat(section.lessons.map((lesson: any) => String(lesson._id)));
                    }
                  });
                  
                  // Tính toán tiến độ dựa trên completed (đã hoàn thành cả video và quiz)
                  const completedCount = lessonIds.filter(
                    id => {
                      const p = progress[id];
                      // Chỉ tính là hoàn thành khi completed = true (đã xem đủ video và qua quiz)
                      const isCompleted = p && p.completed === true;
                      return isCompleted;
                    }
                  ).length;
                  
                  // Tính số bài học đã xem video (videoCompleted = true)
                  const videoCompletedCount = lessonIds.filter(
                    id => {
                      const p = progress[id];
                      return p && p.videoCompleted === true;
                    }
                  ).length;
                  
                  const total = lessonIds.length;
                  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

                  // Lấy sections từ courseSectionsMap để xác định bài học tiếp tục
                  let continueLessonId = null;
                  if (progress.lastWatchedLessonId) {
                    continueLessonId = progress.lastWatchedLessonId;
                  } else if (Array.isArray(sections)) {
                    outer: for (const section of sections) {
                      if (Array.isArray(section.lessons)) {
                        for (const lesson of section.lessons) {
                          // Tìm bài học chưa hoàn thành (completed !== true)
                          if (!progress[lesson._id]?.completed) {
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
                      className="relative bg-white rounded-3xl shadow-xl overflow-hidden group border border-blue-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer hover:border-blue-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => {
                        if (course.slug) {
                          navigate(`/courses/slug/${course.slug}`);
                        }
                      }}
                      title="Click để xem chi tiết khóa học"
                    >
                      {/* Course Image */}
                      <div className="relative group-hover:brightness-110 transition-all duration-300">
                        <img
                          src={course.thumbnail || '/default-course.jpg'}
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-3xl pointer-events-none" />
                        
                        {percent < 100 && continueLessonId && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/lessons/${continueLessonId}/video`);
                            }}
                            className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white !text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 hover:shadow-xl flex items-center gap-2 transition text-lg z-10"
                          >
                            Tiếp tục học <ArrowRightOutlined />
                          </button>
                        )}
                        {percent < 100 && !continueLessonId && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (course.slug) {
                                navigate(`/courses/slug/${course.slug}`);
                              }
                            }}
                            className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white !text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 hover:shadow-xl flex items-center gap-2 transition text-lg z-10"
                          >
                            Xem khóa học <ArrowRightOutlined />
                          </button>
                        )}
                        
                        {percent === 100 && (
                          <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-lg z-10">Hoàn thành</span>
                        )}
                        
                        {/* Click indicator */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black/50 text-white p-2 rounded-full">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 17l9.2-9.2M17 17V7H7"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="p-6 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-xl mb-1 text-gray-900 truncate" title={`${course.title} - Click để xem chi tiết`}>
                          {course.title}
                        </h3>
                        <div className="text-gray-500 text-base mb-2">
                          {total > 0 ? `${total} bài học` : 'Đang cập nhật'}
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          {progressLoading ? (
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                          ) : (
                            <Progress
                              percent={percent}
                              size="small"
                              strokeColor={{ '0%': '#4f8cff', '100%': '#16a34a' }}
                              showInfo={false}
                              className="flex-1"
                            />
                          )}
                          <span className={`font-bold text-lg ${percent === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                            {progressLoading ? '...' : `${percent}%`}
                          </span>
                        </div>

                        <div className="text-gray-500 text-sm">
                          {completedCount}/{total} bài học đã hoàn thành
                        </div>
                        {total > 0 && videoCompletedCount > completedCount && (
                          <div className="text-xs text-blue-500 mt-1">
                            {videoCompletedCount - completedCount} bài học đã xem video, chưa làm quiz
                          </div>
                        )}
                        {total > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {total - completedCount} bài học còn lại
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Show All/Show Less Button - Centered below courses */}
              {enrolledCourses.length > 6 && (
                <motion.div
                  className="flex justify-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <motion.button
                    onClick={() => setShowAllCourses(!showAllCourses)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 shadow-md"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <EyeOutlined />
                    {showAllCourses ? 'Thu gọn' : 'Xem tất cả'}
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Courses; 