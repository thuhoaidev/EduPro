import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Card, Tag, Typography, Badge, Rate, Avatar, Pagination, Spin } from 'antd';
import { UserOutlined, StarFilled, BookOutlined, TeamOutlined, TrophyOutlined, GlobalOutlined } from '@ant-design/icons';
import { config } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import './InstructorsPage.css';

const { Text } = Typography;
const { Content } = Layout;

interface Instructor {
    id: string;
    slug: string;
    fullname: string;
    avatar: string;
    bio: string;
    rating: number;
    totalStudents: number;
    totalCourses: number;
    totalReviews: number;
    experienceYears: number;
    expertise: string[];
    isVerified: boolean;
    isFeatured: boolean;
    isOnline: boolean;
    location: string;
    education: Array<{ degree: string }>;
    approvalStatus: string;
}

// Banner
const InstructorBanner = () => (
    <motion.div
        className="instructor-banner-gradient rounded-3xl p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
    >
        <div className="z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 drop-shadow-lg mb-2 tracking-tight instructor-banner-title">
                Đội ngũ Giảng viên Chất lượng
            </h2>
            <Text className="text-lg md:text-2xl text-gray-700 font-medium instructor-banner-desc">
                Khám phá và kết nối với các chuyên gia hàng đầu trong nhiều lĩnh vực. Tất cả giảng viên đều được kiểm duyệt kỹ lưỡng về chuyên môn và kinh nghiệm thực tiễn.
            </Text>
        </div>
        <motion.img
            src="/vite.svg"
            alt="Instructors"
            className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-xl z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
        />
        <div className="absolute inset-0 pointer-events-none select-none opacity-60 z-0">
            <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="banner-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
                <circle cx="1200" cy="80" r="180" fill="url(#banner-gradient)" fillOpacity="0.18" />
                <circle cx="300" cy="200" r="120" fill="url(#banner-gradient)" fillOpacity="0.12" />
                <circle cx="900" cy="300" r="100" fill="url(#banner-gradient)" fillOpacity="0.10" />
            </svg>
        </div>
    </motion.div>
);

// Card
const InstructorCard = ({ instructor }: { instructor: Instructor }) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    return (
        <motion.div
            className="h-full instructor-card-glass"
            whileHover={{ y: -10, scale: 1.055, boxShadow: '0 16px 40px rgba(80,80,180,0.13)' }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            style={{ cursor: 'pointer', transition: 'box-shadow 0.3s, transform 0.3s' }}
            onClick={() => navigate(`/users/${instructor.slug}`)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
            <Card
                className="h-full border-0 shadow-xl rounded-3xl instructor-card-modern bg-white/80 backdrop-blur-md"
                style={{
                    background: isHovered ? 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)' : 'rgba(255,255,255,0.85)',
                    boxShadow: isHovered ? '0 16px 40px rgba(80,80,180,0.13)' : '0 2px 8px rgba(0,0,0,0.08)',
                    borderRadius: 32,
                    border: 'none',
                }}
                styles={{ body: { padding: 32 } }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-purple-400">
                                <Avatar
                                    size={92}
                                    src={instructor.avatar}
                                    icon={<UserOutlined />}
                                    style={{
                                        border: '4px solid #fff',
                                        boxShadow: isHovered ? '0 0 0 6px #bae6fd' : 'none',
                                        transition: 'all 0.3s',
                                        background: '#fff',
                                    }}
                                />
                            </div>
                            {instructor.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-blue-700 instructor-name-title">{instructor.fullname}</span>
                                {instructor.isVerified && (
                                    <Badge count={<TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />} />
                                )}
                                {instructor.isFeatured && (
                                    <Badge count={<StarFilled style={{ color: '#ff4d4f', fontSize: 18 }} />} />
                                )}
                            </div>
                            <Text type="secondary" className="text-sm">{instructor.expertise?.join(', ') || 'Giảng viên'}</Text>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <Text className="text-base text-gray-700 line-clamp-3 font-medium">{instructor.bio || 'Chưa có thông tin giới thiệu'}</Text>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Rate disabled allowHalf defaultValue={instructor.rating || 0} style={{ fontSize: 18 }} />
                        <Text strong className="text-lg text-blue-600">{instructor.rating || 0}</Text>
                        <Text type="secondary" className="text-xs">({instructor.totalReviews || 0} đánh giá)</Text>
                    </div>
                    <div className="flex items-center space-x-1">
                        <TeamOutlined className="text-blue-500" />
                        <Text className="text-base">{instructor.totalStudents || 0}</Text>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-xl font-bold text-blue-600">{instructor.totalCourses || 0}</div>
                        <Text className="text-xs">Khóa học</Text>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-xl font-bold text-green-600">{instructor.experienceYears || 0}</div>
                        <Text className="text-xs">Năm KN</Text>
                    </div>
                </div>
                <div className="mb-2">
                    <Text strong className="text-sm mb-2 block">Chuyên môn:</Text>
                    <div className="flex flex-wrap gap-1">
                        {instructor.expertise && instructor.expertise.length > 0 ? (
                            <>
                                {instructor.expertise.slice(0, 3).map((spec, index) => (
                                    <Tag key={index} className="text-xs rounded-full px-2 py-1 bg-gradient-to-r from-cyan-400 to-purple-400 text-white border-0 instructor-tag-gradient">{spec}</Tag>
                                ))}
                                {instructor.expertise.length > 3 && (
                                    <Tag color="default" className="text-xs rounded-full px-2 py-1">+{instructor.expertise.length - 3}</Tag>
                                )}
                            </>
                        ) : (
                            <Text type="secondary" className="text-xs">Chưa cập nhật</Text>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center space-x-1">
                        <GlobalOutlined className="text-gray-400" />
                        <Text type="secondary">{instructor.location || 'Chưa cập nhật'}</Text>
                    </div>
                    <div className="flex items-center space-x-1">
                        <BookOutlined className="text-gray-400" />
                        <Text type="secondary">
                            {Array.isArray(instructor.education) && instructor.education.length > 0
                                ? instructor.education
                                    .map(edu => edu.degree)
                                    .sort((a, b) => {
                                        const order = ['Tiến sĩ', 'Thạc sĩ', 'Cử nhân', 'Kỹ sư', 'Khác'];
                                        return order.indexOf(a) - order.indexOf(b);
                                    })[0]
                                : 'Chưa cập nhật'}
                        </Text>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

const InstructorsPage = () => {
    const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 6,
        totalPages: 0
    });
    const instructorsPerPage = 6;

    // Fetch instructors from API
    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {
                page: currentPage,
                limit: instructorsPerPage
            };
            const response = await config.get("/users/approved-instructors", { params });
            const data = response.data.data;
            // Map API response to our interface
            const mappedInstructors: Instructor[] = data.instructors.map((instructor: Instructor & Record<string, unknown>) => ({
                id: instructor.id,
                slug: instructor.slug,
                fullname: instructor.fullname,
                avatar: instructor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.fullname}`,
                bio: instructor.bio || 'Chưa có thông tin giới thiệu',
                rating: instructor.rating || 0,
                totalStudents: instructor.totalStudents || 0,
                totalCourses: instructor.totalCourses || 0,
                totalReviews: instructor.totalReviews || 0,
                experienceYears: instructor.experienceYears || 0,
                expertise: instructor.expertise || [],
                isVerified: true, // Tất cả đều đã được duyệt
                isFeatured: instructor.isFeatured || false,
                isOnline: instructor.isOnline || false,
                location: instructor.location || 'Chưa cập nhật',
                education: Array.isArray(instructor.education)
                    ? instructor.education.map((edu: { degree: string }) => ({ degree: edu.degree }))
                    : [],
                approvalStatus: 'approved'
            }));
            setFilteredInstructors(mappedInstructors);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching instructors:', error);
            setFilteredInstructors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, [currentPage]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5, staggerChildren: 0.07 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
    };

    return (
        <Layout>
            <Content className="p-4 md:p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
                <InstructorBanner />
                <motion.div
                    className="w-full"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                   

                    {loading ? (
                        <div className="text-center py-24">
                            <Spin size="large" />
                            <div className="mt-6 text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 font-bold animate-pulse">
                                Đang tải danh sách giảng viên...
                            </div>
                        </div>
                    ) : filteredInstructors.length > 0 ? (
                        <motion.div variants={containerVariants}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredInstructors.map(instructor => (
                                    <InstructorCard key={instructor.id} instructor={instructor} />
                                ))}
                            </div>
                            <motion.div variants={itemVariants} className="text-center mt-14">
                                <div className="inline-block px-8 py-5 bg-white/80 rounded-2xl shadow-xl border border-blue-200">
                                    <Pagination
                                        current={currentPage}
                                        total={pagination.total}
                                        pageSize={instructorsPerPage}
                                        onChange={page => setCurrentPage(page)}
                                        showSizeChanger={false}
                                        className="custom-pagination"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div variants={itemVariants}>
                            <div className="text-center py-24">
                                <div className="w-28 h-28 bg-gradient-to-tr from-cyan-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <UserOutlined className="text-5xl text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Không tìm thấy giảng viên
                                </h3>
                                <p className="text-gray-600 text-lg">
                                    Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc khác
                                </p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </Content>
        </Layout>
    );
};

export default InstructorsPage; 