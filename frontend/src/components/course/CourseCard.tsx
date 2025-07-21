import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rate, message } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import type { Course } from '../../services/apiService';
import { motion } from 'framer-motion';
import styles from './CourseCard.module.css';
import { config } from '../../api/axios';
import { useCart } from '../../contexts/CartContext';
import { courseService } from '../../services/apiService';

const formatCurrency = (value: number) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const isMongoId = (str: string) => /^[a-f\d]{24}$/i.test(str);

interface CourseCardProps {
    course: Course;
    isEnrolled?: boolean;
    isInProgress?: boolean;
    continueLessonId?: string;
    isCompleted?: boolean;
    lessons?: number;
    rating?: number;
    reviews?: number;
}
const CourseCard: React.FC<CourseCardProps> = ({ course, isEnrolled, isInProgress, continueLessonId, isCompleted, lessons, rating, reviews }) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isInstructor, setIsInstructor] = useState(false);
    const { addToCart, isInCart, updateCartCount } = useCart();
    const courseInCart = isInCart(course._id || course.id);
    const navigate = useNavigate();

    useEffect(() => {
        const checkInstructor = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsInstructor(false);
                return;
            }
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const userRole = user.role?.name || user.role_id?.name;
                    
                    if (userRole === 'instructor') {
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
    }, [course.id]);

    const handleEnroll = async (e: React.MouseEvent, course: Course) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refresh_token');
            message.warning('Vui lòng đăng nhập!');
            setTimeout(() => navigate('/login'), 800);
            return;
        }
        try {
            await config.post(`/courses/${course._id || course.id}/enroll`);
            alert('Đăng ký học thành công!');
            window.location.href = isMongoId(course.slug) ? `/courses/${course.slug}` : `/courses/slug/${course.slug}`;
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký học!');
        }
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refresh_token');
            message.warning('Vui lòng đăng nhập!');
            setTimeout(() => navigate('/login'), 800);
            return;
        }
        if (courseInCart) {
            window.location.href = '/cart';
            return;
        }
        setIsAddingToCart(true);
        try {
            const success = await addToCart(course._id || course.id);
            if (success) {
                message.success('Đã thêm khóa học vào giỏ hàng!');
                await updateCartCount();
            }
            // Không cần else vì addToCart đã xử lý thông báo lỗi
        } catch (error: any) {
            // Hiển thị thông báo lỗi cụ thể nếu có
            if (error.response?.data?.error) {
                message.error(error.response.data.error);
            } else {
                message.error('Có lỗi xảy ra khi thêm vào giỏ hàng!');
            }
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <motion.div
            className={styles.cardWrapper}
            whileHover={{ y: -8, scale: 1.03, boxShadow: '0 12px 32px 0 rgba(56,189,248,0.12)' }}
            transition={{ duration: 0.3 }}
        >
            <Link to={isMongoId(course.slug) ? `/courses/${course.slug}` : `/courses/slug/${course.slug}`} className={styles.cardLink}>
                <div className={styles.imageContainer} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', position: 'relative' }}>
                    <img alt={course.title} src={course.Image} className={styles.cardImage} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
                    <div className={styles.imageOverlay} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 60%)', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}></div>
                </div>
                <div className={styles.contentContainer}>
                    
                    <h3 className={styles.courseTitle} style={{ fontSize: 20, fontWeight: 700, minHeight: 48, marginBottom: 8 }}>{course.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                        <BookOutlined style={{ marginRight: 4 }} /> {typeof lessons === 'number' ? lessons : 0} bài
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Rate value={typeof rating === 'number' ? rating : 0} disabled allowHalf style={{ fontSize: 15, color: '#f59e0b' }} />
                        <span style={{ fontWeight: 600, color: '#f59e0b', fontSize: 14 }}>{typeof rating === 'number' ? rating.toFixed(1) : '0.0'}</span>
                        <span style={{ color: '#64748b', fontSize: 13 }}>({typeof reviews === 'number' ? reviews : 0})</span>
                    </div>
                    <div className={styles.separator}></div>
                    <div className={styles.footerContainer}>
                        <div className={styles.priceBlock}>
                            {course.isFree ? (
                                <div className={styles.priceContainer}>
                                    <span className={styles.priceFree}>Miễn phí</span>
                                    <span className={styles.priceSubtitle}>Đăng ký học ngay</span>
                                </div>
                            ) : course.oldPrice && course.oldPrice > course.price ? (
                                <div className={styles.priceContainer}>
                                    <div className={styles.priceRow}>
                                        <span className={styles.priceBig}>
                                            {formatCurrency(course.price)}
                                        </span>
                                        <span className={styles.oldPrice}>
                                            {formatCurrency(course.oldPrice)}
                                        </span>
                                    </div>
                                    <span className={styles.discountTag}>
                                        Giảm {Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)}%
                                    </span>
                                </div>
                            ) : (
                                <div className={styles.priceContainer}>
                                    <span className={styles.priceBig}>
                                        {formatCurrency(course.price)}
                                    </span>
                                    <span className={styles.priceSubtitle}>Một lần thanh toán</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.buttonContainer}>
                            {isInstructor ? (
                                <button 
                                    className={styles.buyBtnFree} 
                                    type="button" 
                                    onClick={e => { 
                                        e.preventDefault(); 
                                        navigate(`/instructor/courses/${course.id}`); 
                                    }}
                                >
                                    <span className={styles.buttonText}>Quản lý</span>
                                </button>
                            ) : isEnrolled ? (
                                isCompleted ? (
                                    <button 
                                        className={styles.buyBtnFree} 
                                        type="button" 
                                        onClick={e => {
                                            e.preventDefault();
                                            window.location.href = isMongoId(course.slug) ? `/courses/${course.slug}` : `/courses/slug/${course.slug}`;
                                        }}
                                        style={{ background: '#22c55e', color: '#fff' }}
                                    >
                                        <span className={styles.buttonText}>Hoàn thành</span>
                                    </button>
                                ) : (
                                    <button 
                                        className={styles.buyBtnFree} 
                                        type="button" 
                                        onClick={e => { 
                                            e.preventDefault(); 
                                            if (continueLessonId) {
                                                navigate(`/lessons/${continueLessonId}/video`);
                                            } else {
                                                window.location.href = isMongoId(course.slug) ? `/courses/${course.slug}` : `/courses/slug/${course.slug}`; 
                                            }
                                        }}
                                    >
                                        <span className={styles.buttonText}>{isInProgress ? 'Tiếp tục học' : 'Học ngay'}</span>
                                    </button>
                                )
                            ) : course.isFree ? (
                                <button 
                                    className={styles.buyBtnFree} 
                                    type="button" 
                                    onClick={e => handleEnroll(e, course)}
                                >
                                    <span className={styles.buttonText}>Đăng ký học</span>
                                </button>
                            ) : (
                                <button 
                                    className={courseInCart ? styles.checkoutBtn : styles.buyBtn} 
                                    type="button" 
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart}
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <span className={styles.buttonText}>Đang thêm...</span>
                                            <span className={styles.buttonSubtext}>Vui lòng chờ</span>
                                        </>
                                    ) : courseInCart ? (
                                        <>
                                            <span className={styles.buttonText}>Thanh toán</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className={styles.buttonText}>Thêm vào giỏ</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default CourseCard; 