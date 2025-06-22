import React from 'react';
import { Link } from 'react-router-dom';
import { Rate, Tag, Avatar } from 'antd';
import { UserOutlined, BookOutlined, StarFilled } from '@ant-design/icons';
import type { Course } from '../../services/apiService';
import { motion } from 'framer-motion';
import styles from './CourseCard.module.css';

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    return (
        <motion.div
            className={styles.cardWrapper}
            whileHover={{ y: -8, scale: 1.03, boxShadow: '0 12px 32px 0 rgba(56,189,248,0.12)' }}
            transition={{ duration: 0.3 }}
        >
            <Link to={`/courses/${course.slug}`} className={styles.cardLink}>
                <div className={styles.imageContainer} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', position: 'relative' }}>
                    <img alt={course.title} src={course.Image} className={styles.cardImage} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
                    <div className={styles.imageOverlay} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 60%)', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}></div>
                    {course.isFree ? (
                        <Tag color="green" style={{ position: 'absolute', top: 12, left: 12, fontWeight: 600, fontSize: 13, borderRadius: 999, padding: '4px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>Miễn phí</Tag>
                    ) : course.oldPrice && course.oldPrice > course.price ? (
                        <Tag color="red" style={{ position: 'absolute', top: 12, right: 12, fontWeight: 700, fontSize: 15, borderRadius: 999, padding: '4px 18px', letterSpacing: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                            -{Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)}%
                        </Tag>
                    ) : null}
                </div>
                <div className={styles.contentContainer}>
                    <div className={styles.authorContainer}>
                        <Avatar src={course.author.avatar} size={32} icon={<UserOutlined />} />
                        <span className={styles.authorName} style={{ fontSize: 15 }}>{course.author.name}</span>
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
                                <span className={styles.priceFree}>Miễn phí</span>
                            ) : course.oldPrice && course.oldPrice > course.price ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span className={styles.priceBig}>
                                        {course.price.toLocaleString('vi-VN')} <span className={styles.vnd}>VND</span>
                                    </span>
                                    <span className={styles.oldPrice}>{course.oldPrice.toLocaleString('vi-VN')} VND</span>
                                </div>
                            ) : (
                                <span className={styles.priceBig}>
                                    {course.price.toLocaleString('vi-VN')} <span className={styles.vnd}>VND</span>
                                </span>
                            )}
                        </div>
                        {course.isFree ? (
                            <button className={styles.buyBtnFree} onClick={() => window.location.href = `/courses/${course.slug}`}>Học ngay</button>
                        ) : (
                            <button className={styles.buyBtn} onClick={() => window.location.href = `/courses/${course.slug}`}>Mua ngay</button>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default CourseCard; 