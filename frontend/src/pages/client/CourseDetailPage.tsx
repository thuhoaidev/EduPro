import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout, Row, Col, Typography, Tag, Button, Rate, Avatar, Spin, Alert, Empty, Card, List, Breadcrumb } from 'antd';
import { BookOutlined, UserOutlined, GlobalOutlined, StarFilled, CheckCircleOutlined, ShoppingCartOutlined, HeartOutlined, LockOutlined, PlayCircleOutlined, TeamOutlined, SafetyCertificateOutlined, RiseOutlined, DownOutlined } from '@ant-design/icons';
import { courseService } from '../../services/apiService';
import type { Course, Section } from '../../services/apiService';
import { motion, AnimatePresence } from 'framer-motion';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Mock data for reviews
const mockReviews = [
    { name: 'Hoàng An', rating: 5, comment: 'Khóa học rất chi tiết và dễ hiểu, giảng viên nhiệt tình. Rất đáng tiền!', avatar: 'https://i.pravatar.cc/150?u=a' },
    { name: 'Minh Thư', rating: 4.5, comment: 'Nội dung hay, nhưng một vài video âm thanh hơi nhỏ. Nhìn chung là ổn.', avatar: 'https://i.pravatar.cc/150?u=b' },
    { name: 'Trần Dũng', rating: 5, comment: 'Tuyệt vời! Tôi đã học được rất nhiều kỹ năng mới.', avatar: 'https://i.pravatar.cc/150?u=c' },
];

// Animation Variants
const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const CourseDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [courseContent, setCourseContent] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!slug) {
                setError('Không tìm thấy slug của khóa học.');
                setLoading(false); return;
            }
            try {
                setLoading(true);
                const courseData = await courseService.getCourseBySlug(slug);
                if (courseData) {
                    setCourse(courseData);
                    setContentLoading(true);
                    const contentData = await courseService.getCourseContent(courseData.id);
                    setCourseContent(contentData);
                    setContentLoading(false);
                } else { setError('Không tìm thấy khóa học.'); }
            } catch (err) {
                setError('Đã có lỗi xảy ra khi tải dữ liệu khóa học.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [slug]);

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
                            <Card bordered={false} className="border border-gray-200 shadow-sm rounded-xl bg-white/80 backdrop-blur-md">
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
                            <Card bordered={false} className="border border-gray-200 shadow-sm rounded-xl mt-20 bg-white/80 backdrop-blur-md">
                                <Title level={3} className="!m-0 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Nội dung khóa học</Title>
                                <div className="flex justify-between items-center mt-6 mb-8 text-gray-600 border-t border-b border-gray-200 py-4">
                                    <Text><span className="font-bold text-cyan-600">{courseContent.length}</span> chương</Text>
                                    <Text className='font-bold'>•</Text>
                                    <Text><span className="font-bold text-cyan-600">{totalLessons}</span> bài học</Text>
                                    <Text className='font-bold'>•</Text>
                                    <Text>Thời lượng <span className="font-bold text-cyan-600">{course.duration}</span></Text>
                                </div>
                                <AnimatePresence>
                                    {contentLoading ? <div className="text-center p-8"><Spin tip="Đang tải nội dung..."/></div> : courseContent.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {courseContent.map((section, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 30 }}
                                                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                                                    className="py-6"
                                                >
                                                    <div 
                                                        className="flex items-center gap-4 cursor-pointer group"
                                                        onClick={() => toggleSection(idx)}
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-white text-lg font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <Text strong className="text-lg group-hover:text-cyan-700 transition-colors duration-300">{section.title}</Text>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <span className="text-gray-400 text-sm">({section.lessons.length} bài học)</span>
                                                                <span className="text-gray-400 text-sm">•</span>
                                                                <span className="text-gray-400 text-sm">~{Math.ceil(section.lessons.length * 15)} phút</span>
                                                            </div>
                                                        </div>
                                                        <motion.div
                                                            animate={{ rotate: expandedSections.has(idx) ? 90 : 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="text-cyan-500 group-hover:text-cyan-600 transition-colors duration-300"
                                                        >
                                                            <DownOutlined className="text-lg" />
                                                        </motion.div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedSections.has(idx) && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="pl-14 mt-6 space-y-3">
                                                                    {section.lessons.map((lesson, lessonIdx) => (
                                                                        <motion.div
                                                                            key={lessonIdx}
                                                                            initial={{ opacity: 0, x: -20 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ duration: 0.3, delay: lessonIdx * 0.05 }}
                                                                            className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                                                        >
                                                                            <div className="flex items-center">
                                                                                <PlayCircleOutlined className="mr-3 text-cyan-400 text-lg" />
                                                                                <span className="text-gray-700">{lesson.title}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <LockOutlined className="text-gray-400" />
                                                                                <span className="text-gray-400 text-sm">~15 phút</span>
                                                                            </div>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : <Empty description="Nội dung khóa học đang được cập nhật." />}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                        
                        <motion.div custom={3} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
                            <Card bordered={false} className="border border-gray-200 shadow-sm rounded-xl mt-20 bg-white/80 backdrop-blur-md">
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
                            <Card bordered={false} className="border border-gray-200 shadow-sm rounded-xl mt-20 bg-white/80 backdrop-blur-md">
                                <Title level={3} className="mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Đánh giá từ học viên</Title>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={mockReviews}
                                    renderItem={item => (
                                        <motion.div
                                            initial={{ opacity: 0, x: 40 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <List.Item className="!items-start !border-0 !bg-transparent !py-6">
                                                <div className="flex items-start gap-5 w-full">
                                                    <Avatar src={item.avatar} icon={<UserOutlined />} size={56} className="shadow-lg" />
                                                    <div className="flex-1">
                                                        <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl px-6 py-5 shadow-inner relative">
                                                            <span className="absolute -left-4 top-4 text-4xl text-cyan-300 opacity-30 select-none">"</span>
                                                            <Text className="block text-lg font-medium text-gray-800 mb-3">{item.comment}</Text>
                                                            <div className="flex items-center gap-2">
                                                                <Text strong>{item.name}</Text>
                                                                <Rate disabled value={item.rating} className="!text-base ml-2" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </List.Item>
                                        </motion.div>
                                    )}
                                />
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
                                    <div className="absolute top-3 right-3">
                                        <Tag 
                                            color={course.isFree ? "green" : "cyan"} 
                                            className="font-semibold px-3 py-1"
                                        >
                                            {course.isFree ? "Miễn phí" : "Bestseller"}
                                        </Tag>
                                    </div>
                                </div>

                                {/* Price Section */}
                                {!course.isFree && (
                                    <div className="mb-6">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <Text className="text-gray-500 text-sm font-medium">Giá khóa học</Text>
                                            {course.hasDiscount && course.oldPrice && (
                                                <Text delete type="secondary" className="!text-lg font-medium">{course.oldPrice}</Text>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <Title level={1} className="!font-extrabold !m-0 !text-cyan-600">
                                                {course.price}
                                            </Title>
                                            {course.hasDiscount && (
                                                <Tag color="red" className="font-bold text-xs">-{Math.round(((parseFloat(course.oldPrice?.replace(/[^\d]/g, '') || '0') - parseFloat(course.price.replace(/[^\d]/g, ''))) / parseFloat(course.oldPrice?.replace(/[^\d]/g, '') || '1')) * 100)}%</Tag>
                                            )}
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
                                    {course.isFree ? (
                                        <Button 
                                            type="primary" 
                                            size="large" 
                                            block 
                                            className="!h-14 !text-lg !font-semibold !bg-gradient-to-r !from-cyan-500 !to-purple-500 hover:!from-cyan-600 hover:!to-purple-600 !border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
                                            icon={<PlayCircleOutlined />}
                                        >
                                            Bắt đầu học
                                        </Button>
                                    ) : (
                                        <Button 
                                            type="primary" 
                                            size="large" 
                                            block 
                                            className="!h-14 !text-lg !font-semibold !bg-gradient-to-r !from-cyan-500 !to-purple-500 hover:!from-cyan-600 hover:!to-purple-600 !border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
                                            icon={<ShoppingCartOutlined />}
                                        >
                                            Thêm vào giỏ hàng
                                        </Button>
                                    )}
                                    <div className="pt-2">
                                        <Button 
                                            size="large" 
                                            block 
                                            className="!h-12 !border-2 !border-cyan-200 !text-cyan-700 hover:!border-cyan-400 hover:!text-cyan-800 hover:!bg-cyan-50 transition-all duration-300 !font-medium" 
                                            icon={<HeartOutlined />}
                                        >
                                            Lưu vào yêu thích
                                        </Button>
                                    </div>
                                </div>

                                {/* Guarantee Section */}
                                {!course.isFree && (
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                                <SafetyCertificateOutlined className="text-white text-lg" />
                                            </div>
                                            <Text className="font-semibold text-emerald-800">Đảm bảo hoàn tiền 100%</Text>
                                        </div>
                                        <Text className="text-emerald-700 text-sm leading-relaxed">
                                            Trong vòng 30 ngày nếu bạn không hài lòng với khóa học. Không cần lý do, không cần câu hỏi.
                                        </Text>
                                    </div>
                                )}

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
                                                <Text className="text-gray-500 text-xs">Tiếng Việt</Text>
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
        </Content>
    );
};

export default CourseDetailPage; 