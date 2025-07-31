import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Typography, Tag, Button, Rate, Avatar, Spin, Alert, Empty, Card, List, Breadcrumb, message, Modal, Input } from 'antd';
import { BookOutlined, UserOutlined, GlobalOutlined, StarFilled, CheckCircleOutlined, ShoppingCartOutlined, LockOutlined, PlayCircleOutlined, TeamOutlined, RiseOutlined, DownOutlined, ClockCircleOutlined, LikeOutlined, DislikeOutlined, SaveOutlined } from '@ant-design/icons';
import { courseService } from '../../services/apiService';
import type { Course, Section, Lesson } from '../../services/apiService';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { config } from '../../api/axios';
import { getCourseReviews, getMyReview, addOrUpdateReview, 
  toggleLikeReview, toggleDislikeReview, reportReview } from '../../services/courseReviewService';
import TextArea from 'antd/lib/input/TextArea';
import { useCart } from '../../contexts/CartContext';
import { getProgress } from '../../services/progressService';
import { useAuth } from '../../hooks/Auths/useAuth';
import { Select } from 'antd';
import { SearchOutlined, FlagOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import orderService from '../../services/orderService';
import Fireworks from '../../components/common/Fireworks';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Animation Variants
const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const CourseDetailPage: React.FC = () => {
    const { slug, id } = useParams<{ slug?: string; id?: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [courseContent, setCourseContent] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [reviews, setReviews] = useState<{
        _id: string;
        user: { fullname?: string; avatar?: string };
        rating: number;
        comment: string;
        createdAt?: string;
        likes?: any[];
        dislikes?: any[];
    }[]>([]);
    const [reviewFilter, setReviewFilter] = useState<number | 'all'>('all');
    const [reviewSearch, setReviewSearch] = useState('');
    const [myReview, setMyReview] = useState<{ rating: number; comment: string } | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [reviewValue, setReviewValue] = useState<number>(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isInstructor, setIsInstructor] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [continueLessonId, setContinueLessonId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { addToCart, isInCart, updateCartCount } = useCart();
    const { user } = useAuth();
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
    const [canRefund, setCanRefund] = useState(false);
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
    
    // State cho pháo hoa khi hoàn thành khóa học
    const [showFireworks, setShowFireworks] = useState(false);
    const [hasShownFireworks, setHasShownFireworks] = useState(false);

    // Function to calculate total duration from course content
    const calculateTotalDuration = (sections: Section[]): string => {
        let totalSeconds = 0;
        let hasVideoDuration = false;
        
        sections.forEach(section => {
            section.lessons.forEach(lesson => {
                // Check if lesson has video with duration
                if (lesson.video && lesson.video.duration && lesson.video.duration > 0) {
                    totalSeconds += lesson.video.duration;
                    hasVideoDuration = true;
                }
            });
        });
        
        // If no video duration available, fall back to course.duration or estimate
        if (!hasVideoDuration) {
            return course?.duration || '0 giờ';
        }
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours} giờ ${minutes} phút`;
        } else {
            return `${minutes} phút`;
        }
    };

    // Function to format individual lesson duration
    const formatLessonDuration = (lesson: Lesson): string => {
        if (lesson.video && lesson.video.duration && lesson.video.duration > 0) {
            const minutes = Math.floor(lesson.video.duration / 60);
            const seconds = lesson.video.duration % 60;
            if (minutes > 0) {
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                return `${seconds}s`;
            }
        }
        return '~15 phút'; // Fallback for lessons without video duration
    };

    // Function to calculate section duration
    const calculateSectionDuration = (section: Section): string => {
        let totalSeconds = 0;
        let hasVideoDuration = false;
        
        section.lessons.forEach(lesson => {
            if (lesson.video && lesson.video.duration && lesson.video.duration > 0) {
                totalSeconds += lesson.video.duration;
                hasVideoDuration = true;
            }
        });
        
        if (!hasVideoDuration) {
            return `~${Math.ceil(section.lessons.length * 15)} phút`;
        }
        
        const minutes = Math.floor(totalSeconds / 60);
        return `${minutes} phút`;
    };

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!slug && !id) {
                setError('Không tìm thấy thông tin khóa học.');
                setLoading(false); return;
            }
            try {
                setLoading(true);
                let courseObj: Course | null = null;
                let contentData: Section[] = [];
                if (id) {
                    // Lấy chi tiết bằng id
                    const apiRes = await courseService.getCourseById(id);
                    if (apiRes) {
                        // Map sang type Course
                        courseObj = courseService.mapApiCourseToAppCourse(apiRes);
                        // Nếu backend trả về sections kèm theo
                        if (apiRes.sections) {
                            contentData = apiRes.sections;
                        } else {
                            contentData = await courseService.getCourseContent(apiRes._id || id);
                        }
                    }
                } else if (slug) {
                    courseObj = await courseService.getCourseBySlug(slug);
                    if (courseObj) {
                        contentData = await courseService.getCourseContent(courseObj.id);
                    }
                }
                if (courseObj) {
                    setCourse(courseObj);
                    setCourseContent(contentData);
                    console.log('📚 Course content loaded:', contentData);
                    console.log('📚 Number of sections:', contentData.length);
                    console.log('📚 Total lessons:', contentData.reduce((acc, section) => acc + section.lessons.length, 0));
                    // Lưu nội dung khóa học vào localStorage để trang video có thể lấy lại
                    try {
                        localStorage.setItem('lastCourseSections', JSON.stringify(contentData));
                    } catch {
                        // localStorage can fail in some private browsing modes, so we ignore the error
                    }
                } else {
                    setError('Không tìm thấy khóa học.');
                }
                setContentLoading(false);
            } catch (err) {
                setError('Đã có lỗi xảy ra khi tải dữ liệu khóa học.');
                console.error('❌ Error fetching course data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [slug, id]);

    useEffect(() => {
        const checkEnrolled = async () => {
            if (!course) return;
            try {
                const token = localStorage.getItem('token');
                let enrolled = false;
                if (token) {
                    const res = await config.get('/users/me/enrollments');
                    const enrolledIds = (res.data.data || []).map((enroll: { course: { _id?: string; id?: string } }) => String(enroll.course?._id || enroll.course?.id));
                    console.log('🔍 Course ID:', course.id);
                    console.log('🔍 Enrolled IDs:', enrolledIds);
                    console.log('🔍 Is enrolled:', enrolledIds.includes(String(course.id)));
                    enrolled = enrolledIds.includes(String(course.id));
                }
                setIsEnrolled(enrolled);
            } catch {
                setIsEnrolled(false);
            }
        };
        checkEnrolled();
    }, [course]);

    useEffect(() => {
        const checkInstructor = async () => {
            if (!course) return;
            const token = localStorage.getItem('token');
            if (!token) {
                setIsInstructor(false);
                return;
            }
            try {
                // Kiểm tra xem user có phải là instructor không
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const userRole = user.role?.name || user.role_id?.name;
                    
                    if (userRole === 'instructor') {
                        // Kiểm tra xem có phải là instructor của khóa học này không
                        const instructorCourses = await courseService.getInstructorCourses();
                        const isCourseInstructor = instructorCourses.some((c: Course) => c.id === course.id);
                        setIsInstructor(isCourseInstructor);
                    } else {
                        setIsInstructor(false);
                    }
                } else {
                    setIsInstructor(false);
                }
            } catch {
                setIsInstructor(false);
            }
        };
        checkInstructor();
    }, [course]);

    useEffect(() => {
        if (!course) return;
        (async () => {
            setReviewLoading(true);
            setReviewError(null);
            try {
                const reviewsData = await getCourseReviews(course.id);
                setReviews(reviewsData || []);
                if (isEnrolled) {
                    try {
                        const my = await getMyReview(course.id);
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
    }, [course, isEnrolled]);

    // Kiểm tra hoàn thành 100% khóa học
    useEffect(() => {
        const checkCompleted = async () => {
            if (!course || !isEnrolled || !courseContent.length) {
                setIsCompleted(false);
                setContinueLessonId(null);
                return;
            }
            try {
                const progress = await getProgress(course.id);
                const totalLessons = courseContent.reduce((acc, section) => acc + section.lessons.length, 0);
                const completedLessons = Object.values(progress || {}).filter((p: any) =>
                    p.completed === true && p.videoCompleted === true && p.quizPassed === true
                ).length;
                const allCompleted = totalLessons > 0 && completedLessons === totalLessons;
                setIsCompleted(allCompleted);

                // Kích hoạt pháo hoa nếu hoàn thành 100% và chưa hiển thị
                if (allCompleted && !hasShownFireworks) {
                    setShowFireworks(true);
                    setHasShownFireworks(true);
                }

                // Lấy bài học đang học dở gần nhất, đảm bảo tồn tại trong courseContent
                let lessonId = progress && progress.lastWatchedLessonId;
                let found = false;
                if (lessonId) {
                    console.log('lastWatchedLessonId:', lessonId);
                    for (const section of courseContent) {
                        for (const lesson of section.lessons) {
                            console.log('lesson._id:', lesson._id);
                            if (String(lesson._id) === String(lessonId)) {
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }
                }
                if (found) {
                    setContinueLessonId(lessonId);
                } else {
                    // fallback: bài đầu tiên
                    const firstLesson = courseContent[0]?.lessons[0];
                    setContinueLessonId(firstLesson?._id || null);
                }
            } catch (e) {
                setIsCompleted(false);
                setContinueLessonId(null);
            }
        };
        checkCompleted();
    }, [course, isEnrolled, courseContent]);

    // Force re-render when cart changes
    useEffect(() => {
        // This will trigger re-render when cart state changes
        const interval = setInterval(() => {
            // Force re-render by updating a state
            setReviewValue(prev => prev);
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

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

    useEffect(() => {
        // Kiểm tra điều kiện hoàn tiền
        const checkRefundable = async () => {
          if (!isEnrolled || !user || !course) return;
          try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await orderService.getUserOrders(token, 1, 20, 'paid');
            const now = new Date();
            let found = false;
            for (const order of res.orders) {
              const hasCourse = order.items.some(item => String(item.courseId._id) === String(course.id));
              if (hasCourse) {
                const created = new Date(order.createdAt);
                const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
                if (diffDays <= 7) {
                  setCanRefund(true);
                  setRefundOrderId(order.id);
                  found = true;
                  break;
                }
              }
            }
            if (!found) {
              setCanRefund(false);
              setRefundOrderId(null);
            }
          } catch {
            setCanRefund(false);
            setRefundOrderId(null);
          }
        };
        checkRefundable();
    }, [isEnrolled, user, course]);

    if (loading) return <div className="flex justify-center items-center min-h-screen bg-slate-50"><Spin size="large" /></div>;
    if (error) return <div className="p-8"><Alert message="Lỗi" description={error} type="error" showIcon /></div>;
    if (!course) return <div className="flex justify-center items-center min-h-screen bg-slate-50"><Empty description="Không tìm thấy dữ liệu khóa học." /></div>;

    const totalLessons = courseContent.reduce((acc, section) => acc + section.lessons.length, 0);

    const toggleSection = (sectionIndex: number) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionIndex)) {
            newExpanded.delete(sectionIndex);
        } else {
            newExpanded.add(sectionIndex);
        }
        setExpandedSections(newExpanded);
    };

    const handleSubmitReview = async () => {
        if (!course) return;
        setReviewLoading(true);
        setReviewError(null);
        try {
            await addOrUpdateReview(course.id, reviewValue, reviewComment);
            message.success('Đã gửi đánh giá!');
            // Reload reviews
            const reviewsData = await getCourseReviews(course.id);
            setReviews(reviewsData || []);
            setMyReview({ rating: reviewValue, comment: reviewComment });
        } catch {
            setReviewError('Không thể gửi đánh giá.');
        }
        setReviewLoading(false);
    };

    // Helper function để đồng bộ logic với CourseCard
    const getButtonText = () => {
        if (isInstructor) return 'Quản lý khóa học';
        if (isEnrolled && !isCompleted) return 'Tiếp tục học';
        if (isEnrolled && isCompleted) return 'Học ngay';
        if (course.isFree) return 'Đăng ký học';
        if (isInCart(course.id)) return 'Thanh toán ngay';
        return 'Thêm vào giỏ hàng';
    };

    const getButtonIcon = () => {
        if (isInstructor || isEnrolled || course.isFree) return <PlayCircleOutlined />;
        return <ShoppingCartOutlined />;
    };

    const handleLike = async (reviewId: string) => {
      setReviews(prev =>
        prev.map(r => {
          if (r._id !== reviewId || !user) return r;
          const liked = Array.isArray(r.likes) && r.likes.some((id: any) => id === user._id || id?._id === user._id);
          let newLikes = [...(r.likes || [])];
          let newDislikes = (r.dislikes || []).filter((id: any) => id !== user._id && id?._id !== user._id);
          if (liked) {
            newLikes = newLikes.filter((id: any) => id !== user._id && id?._id !== user._id);
          } else {
            newLikes.push(user._id);
          }
          return { ...r, likes: newLikes, dislikes: newDislikes };
        })
      );
      try {
        await toggleLikeReview(reviewId);
      } catch {
        message.error('Có lỗi xảy ra');
      }
    };

    const handleDislike = async (reviewId: string) => {
      setReviews(prev =>
        prev.map(r => {
          if (r._id !== reviewId || !user) return r;
          const disliked = Array.isArray(r.dislikes) && r.dislikes.some((id: any) => id === user._id || id?._id === user._id);
          let newDislikes = [...(r.dislikes || [])];
          let newLikes = (r.likes || []).filter((id: any) => id !== user._id && id?._id !== user._id);
          if (disliked) {
            newDislikes = newDislikes.filter((id: any) => id !== user._id && id?._id !== user._id);
          } else {
            newDislikes.push(user._id);
          }
          return { ...r, dislikes: newDislikes, likes: newLikes };
        })
      );
      try {
        await toggleDislikeReview(reviewId);
      } catch {
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

    const handleRefund = async () => {
      if (!refundOrderId) return;
      setRefundLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Chưa đăng nhập');
        await orderService.refundOrder(refundOrderId, course.id, token);
        message.success('Hoàn tiền thành công! 70% chi phí đã được cộng vào ví.');
        setCanRefund(false);
        setTimeout(() => window.location.reload(), 1000);
      } catch (err: any) {
        message.error(err?.message || 'Hoàn tiền thất bại!');
      } finally {
        setRefundLoading(false);
      }
    };


    return (
        <Content className="bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900 shadow-inner">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Breadcrumb separator={<span className="text-gray-400">/</span>} className="mb-4">
                            <Breadcrumb.Item><Link to="/" className="text-gray-500 hover:text-cyan-600 transition-colors">Trang chủ</Link></Breadcrumb.Item>
                            <Breadcrumb.Item><Link to="/courses" className="text-gray-500 hover:text-cyan-600 transition-colors">Khóa học</Link></Breadcrumb.Item>
                            <Breadcrumb.Item className="text-gray-900 font-medium">{course.title}</Breadcrumb.Item>
                        </Breadcrumb>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">{course.title}</h1>
                        <Paragraph className="text-gray-700 text-lg md:text-xl max-w-4xl">{course.subtitle}</Paragraph>
                        <div className="flex items-center gap-x-6 gap-y-2 mt-6 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Avatar src={course.author.avatar} icon={<UserOutlined />} />
                                <Text className="!text-gray-800 font-semibold">{course.author.name}</Text>
                            </div>
                            <div className="flex items-center gap-2 text-amber-400">
                                <span className="font-bold text-gray-900">{course.rating}</span>
                                <Rate disabled allowHalf value={course.rating} className="!text-base" />
                                <span className="text-gray-500 ml-1">({course.reviews} đánh giá)</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <Row gutter={[48, 48]}>
                    {/* Left Column */}
                    <Col xs={24} lg={16}>
                        <motion.div custom={1} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                            <Card variant="outlined" className="border border-gray-200 shadow-sm rounded-xl bg-white/80 backdrop-blur-md">
                                <Title level={3} className="mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Những gì bạn sẽ học</Title>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {course.requirements.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(56,189,248,0.15)' }}
                                            className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-cyan-50 via-white to-purple-50 shadow group transition-all duration-300 border border-gray-100 hover:border-cyan-200"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                                <CheckCircleOutlined className="text-white text-2xl drop-shadow" />
                                            </div>
                                            <Text className="text-base font-medium text-gray-800 group-hover:text-cyan-700 transition-colors duration-300">{item}</Text>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div custom={2} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                            <Card variant="outlined" className="border border-gray-200 shadow-sm rounded-xl mt-20 bg-white/80 backdrop-blur-md">
                                <Title level={3} className="!m-0 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Nội dung khóa học</Title>
                                <div className="flex justify-between items-center mt-6 mb-8 text-gray-600 border-t border-b border-gray-200 py-4">
                                    <Text><span className="font-bold text-cyan-600">{courseContent.length || course.lessons}</span> chương</Text>
                                    <Text className='font-bold'>•</Text>
                                    <Text><span className="font-bold text-cyan-600">{totalLessons || course.lessons}</span> bài học</Text>
                                    <Text className='font-bold'>•</Text>
                                    <Text>Thời lượng <span className="font-bold text-cyan-600">{courseContent.length > 0 ? calculateTotalDuration(courseContent) : course.duration}</span></Text>
                                </div>
                                <AnimatePresence>
                                    {contentLoading ? (
                                        <div className="text-center p-8">
                                            <Spin tip="Đang tải nội dung..."/>
                                        </div>
                                    ) : courseContent.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {courseContent.map((section, idx) => {
                                                const isOpen = expandedSections.has(idx);
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 30 }}
                                                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                                                        className={`mb-4 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 ${isOpen ? 'bg-gradient-to-br from-cyan-50 via-white to-purple-50 border-cyan-200 shadow-lg' : 'bg-white hover:bg-gray-50'}`}
                                                    >
                                                        <div 
                                                            className={`flex items-center gap-4 cursor-pointer group px-6 py-5 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-gradient-to-br from-cyan-100/60 to-purple-100/60' : ''}`}
                                                            onClick={() => toggleSection(idx)}
                                                        >
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md transition-transform duration-300 ${isOpen ? 'bg-gradient-to-br from-cyan-500 to-purple-500 scale-110' : 'bg-gradient-to-br from-cyan-400 to-purple-400 group-hover:scale-110'}`}>
                                                                {idx + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <Text strong className={`text-lg transition-colors duration-300 ${isOpen ? 'text-cyan-700' : 'group-hover:text-cyan-700'}`}>{section.title}</Text>
                                                                <div className="flex items-center gap-4 mt-2">
                                                                    <span className="text-gray-400 text-sm">({section.lessons.length} bài học)</span>
                                                                    <span className="text-gray-400 text-sm">•</span>
                                                                    <span className="text-gray-400 text-sm">{calculateSectionDuration(section)}</span>
                                                                </div>
                                                            </div>
                                                            <motion.div
                                                                animate={{ rotate: isOpen ? 90 : 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className={`text-cyan-500 group-hover:text-cyan-600 transition-colors duration-300 ${isOpen ? 'font-bold' : ''}`}
                                                            >
                                                                <DownOutlined className="text-xl" />
                                                            </motion.div>
                                                        </div>
                                                        <AnimatePresence>
                                                            {isOpen && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="pl-16 pr-6 pb-6 pt-2 space-y-3">
                                                                        {section.lessons.map((lesson, lessonIdx) => (
                                                                            <motion.div
                                                                                key={lessonIdx}
                                                                                initial={{ opacity: 0, x: -20 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ duration: 0.3, delay: lessonIdx * 0.05 }}
                                                                                className="flex items-center gap-4 py-3 px-4 rounded-lg bg-white/80 border border-gray-100 hover:border-cyan-200 shadow-sm hover:bg-cyan-50 transition-all duration-200"
                                                                            >
                                                                                <div className="flex items-center gap-2 min-w-[40px]">
                                                                                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 text-white font-bold text-base shadow">{lessonIdx + 1}</span>
                                                                                    <PlayCircleOutlined className="text-cyan-400 text-lg ml-2" />
                                                                                </div>
                                                                                <span className="flex-1 text-gray-700 font-medium">{lesson.title}</span>
                                                                                <div className="flex items-center gap-2">
                                                                                    {isEnrolled ? (
                                                                                        <>
                                                                                            <Button type="link" size="small" href={`/lessons/${lesson._id}/video`} target="_blank">Xem video</Button>
                                                                                            <Button type="link" size="small" href={`/lessons/${lesson._id}/quiz`} target="_blank">Quiz</Button>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <LockOutlined className="text-gray-400" />
                                                                                            <span className="text-gray-400 text-sm">{formatLessonDuration(lesson)}</span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8">
                                            <Empty 
                                                description={
                                                    <div>
                                                        <div className="text-gray-600 mb-2">Nội dung khóa học đang được cập nhật</div>
                                                        <div className="text-gray-400 text-sm">Giảng viên đang chuẩn bị bài giảng cho khóa học này</div>
                                                    </div>
                                                } 
                                            />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                        
                        <motion.div custom={3} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
                            <Card variant="outlined" className="border border-gray-200 shadow-sm rounded-xl mt-20 bg-white/80 backdrop-blur-md">
                                <Title level={3} className="mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Giảng viên</Title>
                                <div className="flex items-center gap-6 mt-8">
                                    <div className="relative">
                                        <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 blur opacity-60"></div>
                                        <Avatar src={course.author.avatar} size={96} icon={<UserOutlined />} className="border-4 border-white shadow-lg relative z-10"/>
                                    </div>
                                    <div>
                                        <Title level={4} className="!text-transparent !bg-clip-text !bg-gradient-to-r !from-cyan-600 !to-purple-600 !m-0">{course.author.name}</Title>
                                        <div className="flex gap-2 mt-3">
                                            <Tag color="cyan">Chuyên gia</Tag>
                                            <Tag color="purple">5+ năm kinh nghiệm</Tag>
                                            <Tag color="blue">1.2k học viên</Tag>
                                        </div>
                                    </div>
                                </div>
                                <Paragraph className="mt-6 text-gray-700">{course.author.bio}</Paragraph>
                            </Card>
                        </motion.div>

                        <motion.div custom={4} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
                            <Card variant="outlined" className="border border-gray-200 shadow-sm rounded-xl mt-20 bg-white/80 backdrop-blur-md">
                                <Title level={3} className="mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Đánh giá từ học viên</Title>
                                
                                {/* Tổng quan đánh giá */}
                                <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #e8e8e8' }}>
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
                                
                                {reviewLoading ? <Spin /> : (
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={filteredReviews}
                                        locale={{ emptyText: 'Chưa có đánh giá nào.' }}
                                        renderItem={item => {
                                            const liked = Array.isArray(item.likes) && user && item.likes.some((id: any) => id === user._id || id?._id === user._id);
                                            const disliked = Array.isArray(item.dislikes) && user && item.dislikes.some((id: any) => id === user._id || id?._id === user._id);
                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 40 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <List.Item className="!items-start !border-0 !bg-transparent !py-6">
                                                        <div className="flex items-start gap-5 w-full">
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
                                                            <div className="flex-1">
                                                                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <Text strong style={{ fontSize: 16, marginRight: 8 }}>
                                                                        {item.user?.fullname || 'Người dùng'}
                                                                    </Text>
                                                                    <Rate disabled value={item.rating} style={{ fontSize: 14, color: '#f59e42' }} />
                                                                    <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{item.createdAt ? dayjs(item.createdAt).fromNow() : ''}</span>
                                                                </div>
                                                                <Text style={{ fontSize: 15, color: '#262626', display: 'block', marginBottom: 4 }}>
                                                                    {item.comment}
                                                                </Text>
                                                                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 4 }}>
                                                                    <Button type="text" icon={<LikeOutlined />} style={{ color: liked ? '#06b6d4' : '#bdbdbd', fontWeight: liked ? 700 : 400 }} onClick={() => handleLike(item._id)}>Hữu ích</Button>
                                                                    <Button type="text" icon={<DislikeOutlined />} style={{ color: disliked ? '#6366f1' : '#aaa', fontWeight: disliked ? 700 : 400 }} onClick={() => handleDislike(item._id)} />
                                                                    <Button type="link" icon={<FlagOutlined />} style={{ color: '#f87171', fontWeight: 600 }} onClick={() => { setSelectedReviewId(item._id); setReportModalVisible(true); }}>Báo xấu</Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </List.Item>
                                                </motion.div>
                                            )
                                        }}
                                    />
                                )}

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
                                    <div className="mt-8">
                                        <Alert message="Bạn cần hoàn thành khóa học để có thể đánh giá." type="info" showIcon />
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    </Col>
                    {/* Right Column - Sticky Card */}
                    <Col xs={24} lg={8}>
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                            <Card className="shadow-xl rounded-xl sticky top-8 border-2 border-cyan-400/20 overflow-hidden">
                                {/* Course Image */}
                                <div className="relative mb-6">
                                    <motion.img 
                                        src={course.Image} 
                                        alt={course.title} 
                                        className="w-full h-48 object-cover rounded-lg shadow-md" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                        {course.isFree ? (
                                            <Tag color="green" className="font-semibold px-3 py-1">Miễn phí</Tag>
                                        ) : (
                                            <>
                                                {course.hasDiscount && course.oldPrice && (
                                                    <Tag color="red" className="font-bold text-xs mt-1">
                                                        -{Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)}%
                                                    </Tag>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Price Section */}
                                {course.isFree ? (
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <Title level={1} className="!font-extrabold !m-0 !text-green-600">
                                                Miễn phí
                                            </Title>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <Text className="text-gray-500 text-sm font-medium">Giá khóa học</Text>
                                            {course.hasDiscount && course.oldPrice && (
                                                <Text delete type="secondary" className="!text-lg font-medium">{course.oldPrice.toLocaleString('vi-VN')} VND</Text>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <Title level={1} className="!font-extrabold !m-0 !text-cyan-600">
                                                {course.price.toLocaleString('vi-VN')} VND
                                            </Title>
                                        </div>
                                        {course.hasDiscount && (
                                            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                    <Text className="text-red-700 font-medium text-sm">Ưu đãi có thể kết thúc sớm!</Text>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-4 mb-8">
                                    {isInstructor ? (
                                        <Button 
                                            type="primary" 
                                            size="large" 
                                            block 
                                            className="!h-14 !text-lg !font-semibold !bg-gradient-to-r !from-green-500 !to-emerald-500 hover:!from-green-600 hover:!to-emerald-600 !border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
                                            icon={<PlayCircleOutlined />} 
                                            onClick={() => {
                                                navigate(`/instructor/courses/${course.id}`);
                                            }}
                                        >
                                            Quản lý khóa học
                                        </Button>
                                    ) : isEnrolled || course.isFree ? (
                                        <Button 
                                            type="primary" 
                                            size="large" 
                                            block 
                                            className={`!h-14 !text-lg !font-semibold !border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isEnrolled && isCompleted ? '!bg-gradient-to-r !from-green-500 !to-emerald-500 hover:!from-green-600 hover:!to-emerald-600' : '!bg-gradient-to-r !from-cyan-500 !to-purple-500 hover:!from-cyan-600 hover:!to-purple-600'}`}
                                            icon={getButtonIcon()} 
                                            onClick={() => {
                                                if (continueLessonId) {
                                                    navigate(`/lessons/${continueLessonId}/video`);
                                                } else {
                                                    const firstLesson = courseContent[0]?.lessons[0];
                                                    if (firstLesson?._id) {
                                                        navigate(`/lessons/${firstLesson._id}/video`);
                                                    } else {
                                                        message.info('Khóa học này chưa có bài giảng. Vui lòng quay lại sau!');
                                                    }
                                                }
                                            }}
                                        >
                                            {isEnrolled && isCompleted ? 'Hoàn thành' : getButtonText()}
                                        </Button>
                                    ) : (
                                        <Button 
                                            type="primary" 
                                            size="large" 
                                            block 
                                            className="!h-14 !text-lg !font-semibold !bg-gradient-to-r !from-cyan-500 !to-purple-500 hover:!from-cyan-600 hover:!to-purple-600 !border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
                                            icon={getButtonIcon()} 
                                            onClick={async () => {
                                                if (isInstructor) {
                                                    navigate(`/instructor/courses/${course.id}`);
                                                    return;
                                                }
                                                const token = localStorage.getItem('token');
                                                if (!token) {
                                                    localStorage.removeItem('token');
                                                    localStorage.removeItem('user');
                                                    localStorage.removeItem('refresh_token');
                                                    message.warning('Vui lòng đăng nhập!');
                                                    setTimeout(() => navigate('/login'), 800);
                                                    return;
                                                }
                                                const courseInCart = isInCart(course.id);
                                                if (courseInCart) {
                                                    navigate('/cart');
                                                    return;
                                                }
                                                setIsAddingToCart(true);
                                                try {
                                                    const success = await addToCart(course.id);
                                                    if (success) {
                                                        message.success('Đã thêm khóa học vào giỏ hàng!');
                                                        await updateCartCount();
                                                    }
                                                } catch (error: unknown) {
                                                    console.error('Error adding to cart:', error);
                                                    if (error && typeof error === 'object' && 'response' in error) {
                                                        const err = error as { response?: { data?: { error?: string } } };
                                                        if (err.response?.data?.error) {
                                                            message.error(err.response.data.error);
                                                        } else {
                                                            message.error('Có lỗi xảy ra khi thêm vào giỏ hàng!');
                                                        }
                                                    } else {
                                                        message.error('Có lỗi xảy ra khi thêm vào giỏ hàng!');
                                                    }
                                                } finally {
                                                    setIsAddingToCart(false);
                                                }
                                            }}
                                            loading={isAddingToCart}
                                        >
                                            {isAddingToCart ? 'Đang thêm...' : getButtonText()}
                                        </Button>
                                    )}
                                    {isEnrolled && canRefund && (
                                        <Button
                                            danger
                                            type="primary"
                                            size="large"
                                            block
                                            loading={refundLoading}
                                            onClick={handleRefund}
                                            className="!h-14 !text-lg !font-semibold !bg-gradient-to-r !from-red-500 !to-orange-500 hover:!from-red-600 hover:!to-orange-600 !border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            Hoàn tiền 70% (nếu mua dưới 7 ngày)
                                        </Button>
                                    )}
                                </div>

                                {/* Course Features */}
                                <div className="mb-6">
                                    <Title level={4} className="mb-4 text-gray-800">Thông tin khóa học</Title>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center">
                                                <RiseOutlined className="text-white text-sm" />
                                            </div>
                                            <div>
                                                <Text className="text-gray-500 text-xs">{course.title}</Text>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center">
                                                <GlobalOutlined className="text-white text-sm" />
                                            </div>
                                            <div>
                                                <Text className="text-gray-500 text-xs">
                                                    {course.language === 'en' ? 'Tiếng Anh' : course.language === 'vi' ? 'Tiếng Việt' : (course.language || 'Không rõ')}
                                                </Text>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center">
                                                <BookOutlined className="text-white text-sm" />
                                            </div>
                                            <div>
                                                <Text className="text-gray-500 text-xs">{totalLessons} bài giảng</Text>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center">
                                                <ClockCircleOutlined className="text-white text-sm" />
                                            </div>
                                            <div>
                                                <Text className="text-gray-500 text-xs">{calculateTotalDuration(courseContent)}</Text>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center">
                                                <StarFilled className="text-white text-sm" />
                                            </div>
                                            <div>
                                                <Text className="text-gray-500 text-xs">{course.rating}/5 ({course.reviews} đánh giá)</Text>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center">
                                                <TeamOutlined className="text-white text-sm" />
                                            </div>
                                            <div>
                                                <Text className="text-gray-500 text-xs">1,234 sinh viên đã tham gia</Text>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Stats */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Left Column */}
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-cyan-600">{course.rating}</div>
                                            <div className="flex justify-center my-1">
                                                <Rate disabled allowHalf value={course.rating} className="!text-sm" />
                                            </div>
                                            <Text className="text-gray-600 text-xs">Đánh giá trung bình</Text>
                                        </div>
                                        {/* Right Column */}
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{course.reviews}</div>
                                            {/* Invisible placeholder to match the Rate component's space */}
                                            <div className="flex justify-center my-1 invisible">
                                                <Rate disabled allowHalf value={0} className="!text-sm" />
                                            </div>
                                            <Text className="text-gray-600 text-xs">Học viên đã đánh giá</Text>
                                        </div>
                                    </div>
                                </div>

                                {/* Share Section */}
                                <div className="border-t border-gray-200 pt-4">
                                    <Text className="text-gray-600 text-sm mb-3 block">Chia sẻ khóa học này:</Text>
                                    <div className="flex gap-2">
                                        <Button size="small" className="!bg-blue-500 !border-blue-500 hover:!bg-blue-600" icon={<GlobalOutlined />}>
                                            Facebook
                                        </Button>
                                        <Button size="small" className="!bg-cyan-500 !border-cyan-500 hover:!bg-cyan-600" icon={<GlobalOutlined />}>
                                            Twitter
                                        </Button>
                                        <Button size="small" className="!bg-green-500 !border-green-500 hover:!bg-green-600" icon={<GlobalOutlined />}>
                                            WhatsApp
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </div>
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
            
            {/* Component pháo hoa khi hoàn thành khóa học */}
            <Fireworks 
              isVisible={showFireworks} 
              onComplete={() => setShowFireworks(false)}
            />
        </Content>
    );
};

export default CourseDetailPage; 