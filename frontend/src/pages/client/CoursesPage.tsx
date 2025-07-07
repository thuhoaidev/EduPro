import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Typography, Spin, Alert, Empty } from 'antd';
import { courseService } from '../../services/apiService';
import type { Course } from '../../services/apiService';
import CategoryNav from '../../components/common/CategoryNav';
import SearchBar from '../../components/common/SearchBar';
import CourseCard from '../../components/course/CourseCard';
import { motion } from 'framer-motion';
import { config } from '../../api/axios';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const CoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const categoryId = searchParams.get('category');
    const searchTerm = searchParams.get('search') || '';
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

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
            try {
                const response = await config.get('/users/me/enrollments');
                const ids = (response.data.data || []).map((enroll: any) => enroll.course?._id || enroll.course?.id);
                setEnrolledCourseIds(ids);
            } catch (err) {
                // Không cần xử lý lỗi ở đây
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
        <Content>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900 shadow-inner">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Tất cả khóa học</h1>
                        <Paragraph className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto mt-4">
                            Khám phá, học hỏi và phát triển kỹ năng của bạn với hàng trăm khóa học chất lượng cao.
                        </Paragraph>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mt-8">
                            <SearchBar
                                placeholder="Tìm kiếm khóa học..."
                                defaultValue={searchTerm}
                                onSearch={handleSearch}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Show search results info */}
                {searchTerm && (
                    <div className="mb-6 text-center">
                        <Text className="text-lg">
                            Kết quả tìm kiếm cho: <span className="font-semibold text-purple-600">"{searchTerm}"</span>
                        </Text>
                        <Text className="block text-slate-500 mt-1">
                            Tìm thấy {courses.length} khóa học
                        </Text>
                    </div>
                )}
                
                <div className="mb-8">
                    <Title level={3} className="!mb-4 text-center sm:text-left">Tìm kiếm khóa học theo danh mục</Title>
                    <CategoryNav />
                </div>
                
                {loading && <div className="text-center p-12"><Spin size="large" /></div>}
                {error && <Alert message="Lỗi" description={error} type="error" showIcon />}
                {!loading && !error && courses.length === 0 && (
                    <Empty 
                        description={
                            searchTerm 
                                ? `Không tìm thấy khóa học nào cho "${searchTerm}"` 
                                : "Không có khóa học nào trong danh mục này."
                        } 
                    />
                )}

                <Row gutter={[24, 24]}>
                    {courses.map(course => (
                        <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                            <CourseCard course={course} isEnrolled={enrolledCourseIds.includes(course._id || course.id)} />
                        </Col>
                    ))}
                </Row>
            </div>
        </Content>
    );
};

export default CoursesPage; 