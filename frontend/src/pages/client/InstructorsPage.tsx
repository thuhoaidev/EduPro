import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Input, Select, Card, Tag, Typography, Badge, Rate, Avatar, Button, Pagination, Spin } from 'antd';
import { SearchOutlined, FilterOutlined, UserOutlined, StarFilled, BookOutlined, TeamOutlined, TrophyOutlined, GlobalOutlined } from '@ant-design/icons';
import { config } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import './InstructorsPage.css';
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../interfaces/Category.interface';

const { Title, Text } = Typography;
const { Option } = Select;
const { Sider, Content } = Layout;

interface Instructor {
    id: string;
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

interface ApiInstructor {
    id: string;
    fullname: string;
    avatar?: string;
    bio?: string;
    rating?: number;
    totalStudents?: number;
    totalCourses?: number;
    totalReviews?: number;
    experienceYears?: number;
    expertise?: string[];
    isFeatured?: boolean;
    isOnline?: boolean;
    location?: string;
    education?: Array<{
        degree: string;
        institution: string;
        year: number;
        major: string;
        _id: string;
    }>;
    slug: string;
}

const instructorCategories = ['Tất cả', 'Full-Stack Development', 'UI/UX Design', 'Data Science', 'Mobile Development', 'DevOps', 'Digital Marketing'];

const InstructorBanner = () => (
  <div className="rounded-3xl bg-gradient-to-r from-blue-100 via-blue-50 to-white p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
    <div>
      <Title level={2} className="!mb-2 !text-blue-700 font-extrabold">Đội ngũ Giảng viên Chất lượng</Title>
      <Text className="text-lg text-gray-700">Khám phá và kết nối với các chuyên gia hàng đầu trong nhiều lĩnh vực. Tất cả giảng viên đều được kiểm duyệt kỹ lưỡng về chuyên môn và kinh nghiệm thực tiễn.</Text>
    </div>
    <img src="/vite.svg" alt="Instructors" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
  </div>
);

const FilterSidebar = ({ setFilters }: { setFilters: (filters: {
    searchTerm: string;
    category: string;
    rating: number;
    experience: number;
    priceRange: [number, number];
}) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Tất cả');
    const [rating, setRating] = useState(0);
    const [experience, setExperience] = useState(0);
    const [priceRange] = useState<[number, number]>([0, 1000000]);
    // State cho danh mục
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    useEffect(() => {
        setLoadingCategories(true);
        getAllCategories()
            .then(res => {
                if (res.success) setCategories(res.data.filter(cat => cat.status === 'active'));
            })
            .finally(() => setLoadingCategories(false));
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters({ searchTerm, category, rating, experience, priceRange });
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, category, rating, experience, priceRange, setFilters]);

    return (
        <Sider width={300} className="bg-white p-0 shadow-lg rounded-3xl border border-blue-100 mr-4" theme="light" style={{
            position: 'sticky',
            top: 68,
            height: 'calc(100vh - 68px)',
            overflowY: 'auto',
            minWidth: 260,
            maxWidth: 340,
        }}>
            <div className="p-6 pb-3 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-white rounded-t-3xl flex items-center gap-2">
                <FilterOutlined className="text-2xl text-blue-500 mr-2" />
                <Title level={4} className="!mb-0 !text-blue-700 font-bold tracking-wide">Bộ lọc giảng viên</Title>
            </div>
            <div className="space-y-5 p-6 pt-4">
                {/* Tìm kiếm */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <SearchOutlined className="text-blue-400" />
                        <Text strong className="text-blue-700">Tìm kiếm</Text>
                    </div>
                    <Input
                        size="large"
                        placeholder="Tên giảng viên..."
                        prefix={<SearchOutlined className="text-blue-400" />}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="rounded-full border-blue-200 focus:border-blue-500 focus:shadow !mt-0"
                    />
                </div>
                {/* Chuyên môn */}
                <div className="bg-white rounded-xl p-4 border border-blue-50 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <BookOutlined className="text-purple-400" />
                        <Text strong className="text-blue-700">Chuyên môn</Text>
                    </div>
                    <Select
                        size="large"
                        value={category}
                        className="w-full rounded-full border-blue-200 focus:border-blue-500"
                        onChange={value => setCategory(value)}
                        dropdownClassName="rounded-xl"
                        loading={loadingCategories}
                    >
                        <Option value="Tất cả">Tất cả</Option>
                        {categories.map(cat => (
                            <Option key={cat._id} value={cat.name}>{cat.name}</Option>
                        ))}
                    </Select>
                </div>
                {/* Đánh giá */}
                <div className="bg-white rounded-xl p-4 border border-blue-50 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <StarFilled className="text-yellow-400" />
                        <Text strong className="text-blue-700">Đánh giá</Text>
                    </div>
                    <Select
                        size="large"
                        defaultValue={0}
                        className="w-full rounded-full border-blue-200 focus:border-blue-500"
                        onChange={value => setRating(value)}
                        dropdownClassName="rounded-xl"
                    >
                        <Option value={0}>Tất cả</Option>
                        <Option value={4.5}><Rate disabled allowHalf defaultValue={4.5} style={{fontSize: 14}}/> & 4.5 sao trở lên</Option>
                        <Option value={4}><Rate disabled defaultValue={4} style={{fontSize: 14}}/> & 4 sao trở lên</Option>
                        <Option value={3.5}><Rate disabled defaultValue={3.5} style={{fontSize: 14}}/> & 3.5 sao trở lên</Option>
                    </Select>
                </div>
                {/* Kinh nghiệm */}
                <div className="bg-white rounded-xl p-4 border border-blue-50 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <TrophyOutlined className="text-green-400" />
                        <Text strong className="text-blue-700">Kinh nghiệm (năm)</Text>
                    </div>
                    <Select
                        size="large"
                        defaultValue={0}
                        className="w-full rounded-full border-blue-200 focus:border-blue-500"
                        onChange={value => setExperience(value)}
                        dropdownClassName="rounded-xl"
                    >
                        <Option value={0}>Tất cả</Option>
                        <Option value={5}>5+ năm</Option>
                        <Option value={3}>3+ năm</Option>
                        <Option value={1}>1+ năm</Option>
                    </Select>
                </div>
            </div>
        </Sider>
    );
};

const InstructorCard = ({ instructor }: { instructor: Instructor }) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    return (
        <motion.div
            className="h-full"
            whileHover={{ y: -8, scale: 1.04, boxShadow: '0 12px 32px rgba(24,144,255,0.18)' }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            style={{ cursor: 'pointer', transition: 'box-shadow 0.3s, transform 0.3s' }}
            onClick={() => navigate(`/users/${instructor.slug}`)}
        >
            <Card
                className="h-full instructor-card border-0 shadow-xl rounded-3xl transition-all duration-300"
                style={{
                    background: isHovered ? 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)' : '#fff',
                    boxShadow: isHovered ? '0 12px 32px rgba(24,144,255,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
                    borderRadius: 32,
                    border: 'none',
                }}
                bodyStyle={{ padding: 28 }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Avatar
                                size={88}
                                src={instructor.avatar}
                                icon={<UserOutlined />}
                                style={{
                                    border: isHovered ? '4px solid #1890ff' : '4px solid #e0e7ef',
                                    boxShadow: isHovered ? '0 0 0 6px #bae6fd' : 'none',
                                    transition: 'all 0.3s',
                                    background: '#fff',
                                }}
                            />
                            {instructor.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <Title level={4} className="!mb-1 !text-lg !font-bold text-blue-700">{instructor.fullname}</Title>
                                {instructor.isVerified && (
                                    <Badge count={<TrophyOutlined style={{ color: '#faad14' }} />} />
                                )}
                                {instructor.isFeatured && (
                                    <Badge count={<StarFilled style={{ color: '#ff4d4f' }} />} />
                                )}
                            </div>
                            <Text type="secondary" className="text-sm">{instructor.expertise?.join(', ') || 'Giảng viên'}</Text>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <Text className="text-sm text-gray-600 line-clamp-3">{instructor.bio || 'Chưa có thông tin giới thiệu'}</Text>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Rate disabled allowHalf defaultValue={instructor.rating || 0} style={{ fontSize: 16 }} />
                        <Text strong className="text-base text-blue-600">{instructor.rating || 0}</Text>
                        <Text type="secondary" className="text-xs">({instructor.totalReviews || 0} đánh giá)</Text>
                    </div>
                    <div className="flex items-center space-x-1">
                        <TeamOutlined className="text-blue-500" />
                        <Text className="text-sm">{instructor.totalStudents || 0}</Text>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded-xl">
                        <div className="text-lg font-bold text-blue-600">{instructor.totalCourses || 0}</div>
                        <Text className="text-xs">Khóa học</Text>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-xl">
                        <div className="text-lg font-bold text-green-600">{instructor.experienceYears || 0}</div>
                        <Text className="text-xs">Năm KN</Text>
                    </div>
                </div>
                <div className="mb-2">
                    <Text strong className="text-sm mb-2 block">Chuyên môn:</Text>
                    <div className="flex flex-wrap gap-1">
                        {instructor.expertise && instructor.expertise.length > 0 ? (
                            <>
                                {instructor.expertise.slice(0, 3).map((spec, index) => (
                                    <Tag key={index} color="blue" className="text-xs rounded-full px-2 py-1">{spec}</Tag>
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
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: '',
        category: 'Tất cả',
        rating: 0,
        experience: 0,
        priceRange: [0, 1000000] as [number, number],
    });
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
            
            if (filters.searchTerm) {
                params.search = filters.searchTerm;
            }

            const response = await config.get("/users/approved-instructors", { params });
            const data = response.data.data;
            
            // Map API response to our interface
            const mappedInstructors = data.instructors.map((instructor: ApiInstructor) => ({
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
                    ? instructor.education.map(edu => ({ degree: edu.degree }))
                    : [],
                approvalStatus: 'approved'
            }));

            setInstructors(mappedInstructors);
            setFilteredInstructors(mappedInstructors);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching instructors:', error);
            setInstructors([]);
            setFilteredInstructors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, [currentPage, filters.searchTerm]);

    useEffect(() => {
        let filtered = instructors;

        // Filter by category
        if (filters.category !== 'Tất cả') {
            const categoryMap: { [key: string]: string[] } = {
                'Full-Stack Development': ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Full-Stack'],
                'UI/UX Design': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research', 'Design'],
                'Data Science': ['Python', 'Machine Learning', 'Deep Learning', 'Data Science', 'AI'],
                'Mobile Development': ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile'],
                'DevOps': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'DevOps'],
                'Digital Marketing': ['SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Marketing']
            };
            const categorySpecs = categoryMap[filters.category];
            if (categorySpecs) {
                filtered = filtered.filter(instructor =>
                    instructor.expertise?.some(spec => 
                        categorySpecs.some(catSpec => 
                            spec.toLowerCase().includes(catSpec.toLowerCase())
                        )
                    )
                );
            }
        }

        // Filter by rating
        if (filters.rating > 0) {
            filtered = filtered.filter(instructor => instructor.rating >= filters.rating);
        }

        // Filter by experience
        if (filters.experience > 0) {
            filtered = filtered.filter(instructor => instructor.experienceYears >= filters.experience);
        }

        setFilteredInstructors(filtered);
    }, [filters, instructors]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5, staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
    };

    return (
        <Layout>
            <FilterSidebar setFilters={setFilters} />
            <Content className="p-4 md:p-8 bg-gray-50 min-h-screen">
                <InstructorBanner />
                <motion.div
                    className="w-full"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <Title level={2} className="!mb-0">Giảng viên ({pagination.total})</Title>
                    </motion.div>

                    {loading ? (
                        <div className="text-center py-16">
                            <Spin size="large" />
                            <div className="mt-4 text-blue-600 font-semibold animate-pulse">Đang tải danh sách giảng viên...</div>
                        </div>
                    ) : filteredInstructors.length > 0 ? (
                        <motion.div variants={containerVariants}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredInstructors.map(instructor => (
                                    <InstructorCard key={instructor.id} instructor={instructor} />
                                ))}
                            </div>
                            <motion.div variants={itemVariants} className="text-center mt-10">
                                <div className="inline-block px-6 py-4 bg-white rounded-2xl shadow-lg border border-blue-200">
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
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserOutlined className="text-4xl text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Không tìm thấy giảng viên
                                </h3>
                                <p className="text-gray-600">
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