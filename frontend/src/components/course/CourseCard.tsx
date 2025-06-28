import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rate, Tag, Avatar, Button, message } from 'antd';
import { UserOutlined, BookOutlined, StarFilled, ShoppingCartOutlined, CheckOutlined } from '@ant-design/icons';
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

    const handleEnroll = async (e: React.MouseEvent, course: Course) => {
        e.preventDefault();
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
                    
                    {courseInCart && (
                        <div style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            background: '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                        }}>
                            <CheckOutlined style={{ fontSize: 10 }} />
                            Added
                        </div>
                    )}
                    
                    {course.isFree ? (
                        <Tag color="green" style={{ position: 'absolute', top: 12, right: 12, fontWeight: 600, fontSize: 13, borderRadius: 999, padding: '4px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>Miễn phí</Tag>
                    ) : course.oldPrice && course.oldPrice > course.price ? (
                        <Tag color="red" style={{ position: 'absolute', top: courseInCart ? 40 : 12, right: 12, fontWeight: 700, fontSize: 15, borderRadius: 999, padding: '4px 18px', letterSpacing: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                            -{Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)}%
                        </Tag>
                    ) : null}
                </div>
                <div className={styles.contentContainer}>
                    <div className={styles.authorContainer}>
                        <Avatar src={course.author.avatar || undefined} size={32} icon={<UserOutlined />} />
                        <span className={styles.authorName} style={{ fontSize: 15 }}>{course.author.name || 'Giảng viên EduPro'}</span>
                    </div>
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
                                    <span className={styles.priceSubtitle}>Học ngay không cần thanh toán</span>
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
                            {course.isFree ? (
                                isEnrolled ? (
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
                                ) : (
                                    <button 
                                        className={styles.buyBtnFree} 
                                        type="button" 
                                        onClick={e => handleEnroll(e, course)}
                                    >
                                        <span className={styles.buttonText}>Đăng ký học</span>
                                    </button>
                                )
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