import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Typography, Spin, Alert, Empty } from 'antd';
import { courseService } from '../../services/apiService';
import type { Course } from '../../services/apiService';
import SearchBar from '../../components/common/SearchBar';
import CourseCard from '../../components/course/CourseCard';
import { motion, AnimatePresence } from 'framer-motion';
import { config } from '../../api/axios';
import { getProgress } from '../../services/progressService';

const { Content } = Layout;
const { Text, Paragraph } = Typography;

/**
 * Trang hiển thị tất cả các khóa học có trạng thái "published" từ tất cả giảng viên
 */
const CoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const categoryId = searchParams.get('category');
    const searchTerm = searchParams.get('search') || '';
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
    const [courseProgress, setCourseProgress] = useState<{ [courseId: string]: boolean }>({});
    const [courseContinueLesson, setCourseContinueLesson] = useState<{ [courseId: string]: string | null }>({});

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                let fetchedCourses: Course[];
                if (searchTerm) {
                    fetchedCourses = await courseService.searchCourses(searchTerm);
                } else if (categoryId) {
                    fetchedCourses = await courseService.getCoursesByCategory(categoryId);
                } else {
                    fetchedCourses = await courseService.getAllCourses();
                }
                setCourses(fetchedCourses);
            } catch (err) {
                setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [categoryId, searchTerm]);

    useEffect(() => {
        // Lấy danh sách khóa học đã đăng ký
        const fetchEnrollments = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setEnrolledCourseIds([]);
                setCourseProgress({});
                setCourseContinueLesson({});
                return;
            }
            try {
                const response = await config.get('/users/me/enrollments');
                const ids = (response.data.data || []).map((enroll: { course: { _id?: string; id?: string } }) => enroll.course?._id || enroll.course?.id);
                setEnrolledCourseIds(ids);
                // Lấy progress từng khóa học và lesson tiếp tục học
                const progressObj: { [courseId: string]: boolean } = {};
                const continueLessonObj: { [courseId: string]: string | null } = {};
                await Promise.all(ids.map(async (courseId: string) => {
                    try {
                        const progress = await getProgress(courseId);
                        // Nếu không có bài học nào thì chưa hoàn thành
                        if (!progress || Object.keys(progress).length === 0) {
                            progressObj[courseId] = false;
                            continueLessonObj[courseId] = null;
                            return;
                        }
                        // Tất cả bài học đều completed = true
                        const allCompleted = Object.values(progress).every((p: any) => p.completed === true);
                        progressObj[courseId] = allCompleted;
                        // Xác định lesson tiếp tục học
                        let continueLessonId = null;
                        if (progress.lastWatchedLessonId) {
                            continueLessonId = progress.lastWatchedLessonId;
                        } else {
                            // Lấy content để xác định bài học tiếp theo
                            const sections = await courseService.getCourseContent(courseId);
                            outer: for (const section of sections) {
                                for (const lesson of section.lessons) {
                                    if (!progress[lesson._id]?.completed && !progress[lesson._id]?.videoCompleted) {
                                        continueLessonId = lesson._id;
                                        break outer;
                                    }
                                }
                            }
                            // Nếu đã hoàn thành hết thì lấy bài đầu tiên
                            if (!continueLessonId && sections[0]?.lessons?.[0]?._id) {
                                continueLessonId = sections[0].lessons[0]._id;
                            }
                        }
                        continueLessonObj[courseId] = continueLessonId;
                    } catch {
                        progressObj[courseId] = false;
                        continueLessonObj[courseId] = null;
                    }
                }));
                setCourseProgress(progressObj);
                setCourseContinueLesson(continueLessonObj);
            } catch {
                setCourseProgress({});
                setCourseContinueLesson({});
            }
        };
        fetchEnrollments();
    }, [categoryId, searchTerm]);

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value.trim()) {
            params.set('search', value.trim());
        } else {
            params.delete('search');
        }
        params.delete('category'); // Clear category when searching
        navigate(`/courses?${params.toString()}`);
    };

    return (
        <Content className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none select-none opacity-60">
                    <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="hero-gradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                        </defs>
                        <circle cx="1200" cy="80" r="180" fill="url(#hero-gradient)" fillOpacity="0.25" />
                        <circle cx="300" cy="200" r="120" fill="url(#hero-gradient)" fillOpacity="0.18" />
                        <circle cx="900" cy="300" r="100" fill="url(#hero-gradient)" fillOpacity="0.12" />
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 drop-shadow-lg tracking-tight">
                            Tất cả khóa học
                        </h1>
                        <Paragraph className="text-gray-700 text-lg md:text-2xl max-w-2xl mx-auto mt-4 font-medium">
                            Khám phá, học hỏi và phát triển kỹ năng của bạn với hàng trăm khóa học chất lượng cao.
                        </Paragraph>
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mt-10">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                                <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-md p-4 flex items-center gap-2 border border-slate-200 hover:shadow-2xl transition-all">
                                    <SearchBar
                                        placeholder="Tìm kiếm khóa học..."
                                        defaultValue={searchTerm}
                                        onSearch={handleSearch}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Show search results info */}
                {searchTerm && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 text-center">
                        <Text className="text-xl font-semibold">
                            Kết quả tìm kiếm cho: <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">"{searchTerm}"</span>
                        </Text>
                        <Text className="block text-slate-500 mt-1 text-base">
                            Tìm thấy <span className="font-bold text-indigo-600">{courses.length}</span> khóa học
                        </Text>
                    </motion.div>
                )}

                {loading && <div className="text-center p-20"><Spin size="large" /></div>}
                {error && <Alert message="Lỗi" description={error} type="error" showIcon className="mb-8" />}
                {!loading && !error && courses.length === 0 && (
                    <Empty 
                        description={
                            searchTerm 
                                ? `Không tìm thấy khóa học nào cho "${searchTerm}"` 
                                : "Không có khóa học nào trong danh mục này."
                        } 
                        className="my-16"
                    />
                )}

                <AnimatePresence>
                    <Row gutter={[32, 32]} className="mt-2 md:mt-8">
                        {courses.map((course, idx) => (
                            <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 30 }}
                                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                                    whileHover={{ scale: 1.035, boxShadow: '0 8px 32px 0 rgba(80,80,180,0.10)' }}
                                    className="h-full"
                                >
                                    <CourseCard 
                                        course={course} 
                                        isEnrolled={enrolledCourseIds.includes(course.id)}
                                        isInProgress={enrolledCourseIds.includes(course.id) && !courseProgress[course.id]}
                                        continueLessonId={courseContinueLesson[course.id] || undefined}
                                    />
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </AnimatePresence>
            </div>
        </Content>
    );
};

export default CoursesPage; 