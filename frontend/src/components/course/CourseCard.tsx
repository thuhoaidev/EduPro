import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rate, message } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import type { Course } from '../../services/apiService';
import { motion } from 'framer-motion';
import styles from './CourseCard.module.css';
import { config } from '../../api/axios';
import { useCart } from '../../contexts/CartContext';

const formatCurrency = (value: number) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const isMongoId = (str: string) => /^[a-f\d]{24}$/i.test(str);

const CourseCard: React.FC<{ course: Course; isEnrolled?: boolean }> = ({ course, isEnrolled }) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const { addToCart, isInCart, updateCartCount } = useCart();
    const courseInCart = isInCart(course._id || course.id);
    const navigate = useNavigate();

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
            } else {
                message.error('Có lỗi xảy ra khi thêm vào giỏ hàng!');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi thêm vào giỏ hàng!');
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
                        <BookOutlined style={{ marginRight: 4 }} /> {course.lessons || 30} bài
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Rate value={course.rating} disabled allowHalf style={{ fontSize: 15, color: '#f59e0b' }} />
                        <span style={{ fontWeight: 600, color: '#f59e0b', fontSize: 14 }}>{course.rating.toFixed(1)}</span>
                        <span style={{ color: '#64748b', fontSize: 13 }}>({course.reviews})</span>
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
                            {isEnrolled ? (
                                <button 
                                    className={styles.buyBtnFree} 
                                    type="button" 
                                    onClick={e => { 
                                        e.preventDefault(); 
                                        window.location.href = isMongoId(course.slug) ? `/courses/${course.slug}` : `/courses/slug/${course.slug}`; 
                                    }}
                                >
                                    <span className={styles.buttonText}>Học ngay</span>
                                </button>
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