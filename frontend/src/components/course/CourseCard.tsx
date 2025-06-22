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
            whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
            transition={{ duration: 0.3 }}
        >
            <Link to={`/courses/${course.slug}`} className={styles.cardLink}>
                <div className={styles.imageContainer}>
                    <img alt={course.title} src={course.Image} className={styles.cardImage} />
                    <div className={styles.imageOverlay}></div>
                    <Tag className={styles.categoryTag}>{course.type}</Tag>
                </div>

                <div className={styles.contentContainer}>
                    <div className={styles.authorContainer}>
                        <Avatar src={course.author.avatar} size="small" icon={<UserOutlined />} />
                        <span className={styles.authorName}>{course.author.name}</span>
                    </div>

                    <h3 className={styles.courseTitle}>{course.title}</h3>

                    <div className={styles.statsContainer}>
                        <div className={styles.ratingContainer}>
                            <span className={styles.ratingText}>{course.rating.toFixed(1)}</span>
                            <Rate disabled allowHalf value={course.rating} className={styles.ratingStars} />
                            <span className={styles.reviewsText}>({course.reviews})</span>
                        </div>
                    </div>
                    
                    <div className={styles.separator}></div>

                    <div className={styles.footerContainer}>
                         <p className={styles.price}>{course.price}</p>
                         {course.hasDiscount && course.oldPrice && (
                             <p className={styles.oldPrice}>{course.oldPrice}</p>
                         )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default CourseCard; 