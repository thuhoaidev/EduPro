import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Input, Select, Card, Tag, Typography, Badge, Rate, Avatar, Button, Pagination, Spin } from 'antd';
import { SearchOutlined, FilterOutlined, UserOutlined, StarFilled, BookOutlined, TeamOutlined, TrophyOutlined, GlobalOutlined } from '@ant-design/icons';
import { config } from '../../api/axios';

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
    education: string;
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
    education?: string;
}

const instructorCategories = ['Tất cả', 'Full-Stack Development', 'UI/UX Design', 'Data Science', 'Mobile Development', 'DevOps', 'Digital Marketing'];

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

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters({ searchTerm, category, rating, experience, priceRange });
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, category, rating, experience, priceRange, setFilters]);

    return (
        <Sider width={280} className="bg-white p-6" theme="light" style={{
            position: 'sticky',
            top: 68,
            height: 'calc(100vh - 68px)',
            overflowY: 'auto'
        }}>
            <Title level={4} className="!mb-6"><FilterOutlined className="mr-2" />Bộ lọc giảng viên</Title>
            
            <div className="space-y-6">
                <div>
                    <Text strong>Tìm kiếm</Text>
                    <Input
                        size="large"
                        placeholder="Tên giảng viên..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="!mt-2"
                    />
                </div>
                <div>
                    <Text strong>Chuyên môn</Text>
                    <Select
                        size="large"
                        defaultValue="Tất cả"
                        className="w-full !mt-2"
                        onChange={value => setCategory(value)}
                    >
                        {instructorCategories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                    </Select>
                </div>
                <div>
                    <Text strong>Đánh giá</Text>
                    <Select
                        size="large"
                        defaultValue={0}
                        className="w-full !mt-2"
                        onChange={value => setRating(value)}
                    >
                        <Option value={0}>Tất cả</Option>
                        <Option value={4.5}><Rate disabled allowHalf defaultValue={4.5} style={{fontSize: 14}}/> & 4.5 sao trở lên</Option>
                        <Option value={4}><Rate disabled defaultValue={4} style={{fontSize: 14}}/> & 4 sao trở lên</Option>
                        <Option value={3.5}><Rate disabled defaultValue={3.5} style={{fontSize: 14}}/> & 3.5 sao trở lên</Option>
                    </Select>
                </div>
                <div>
                    <Text strong>Kinh nghiệm (năm)</Text>
                    <Select
                        size="large"
                        defaultValue={0}
                        className="w-full !mt-2"
                        onChange={value => setExperience(value)}
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

    return (
        <motion.div
            className="h-full"
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Card
                className="h-full cursor-pointer transition-all duration-300"
                style={{
                    border: isHovered ? '2px solid #1890ff' : '1px solid #f0f0f0',
                    boxShadow: isHovered ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Avatar 
                                size={64} 
                                src={instructor.avatar}
                                icon={<UserOutlined />}
                            />
                            {instructor.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <Title level={4} className="!mb-1">{instructor.fullname}</Title>
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

                {/* Bio */}
                <div className="mb-4">
                    <Text className="text-sm text-gray-600 line-clamp-3">{instructor.bio || 'Chưa có thông tin giới thiệu'}</Text>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Rate disabled allowHalf defaultValue={instructor.rating || 0} style={{fontSize: 14}} />
                        <Text strong className="text-sm">{instructor.rating || 0}</Text>
                        <Text type="secondary" className="text-xs">({instructor.totalReviews || 0} đánh giá)</Text>
                    </div>
                    <div className="flex items-center space-x-1">
                        <TeamOutlined className="text-blue-500" />
                        <Text className="text-sm">{instructor.totalStudents || 0}</Text>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{instructor.totalCourses || 0}</div>
                        <Text className="text-xs">Khóa học</Text>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">{instructor.experienceYears || 0}</div>
                        <Text className="text-xs">Năm KN</Text>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-lg font-bold text-purple-600">Đã duyệt</div>
                        <Text className="text-xs">{instructor.approvalStatus === 'approved' ? 'Có' : 'Chưa'}</Text>
                    </div>
                </div>

                {/* Specializations */}
                <div className="mb-4">
                    <Text strong className="text-sm mb-2 block">Chuyên môn:</Text>
                    <div className="flex flex-wrap gap-1">
                        {instructor.expertise && instructor.expertise.length > 0 ? (
                            <>
                                {instructor.expertise.slice(0, 3).map((spec, index) => (
                                    <Tag key={index} color="blue" className="text-xs">{spec}</Tag>
                                ))}
                                {instructor.expertise.length > 3 && (
                                    <Tag color="default" className="text-xs">+{instructor.expertise.length - 3}</Tag>
                                )}
                            </>
                        ) : (
                            <Text type="secondary" className="text-xs">Chưa cập nhật</Text>
                        )}
                    </div>
                </div>

                {/* Location and Languages */}
                <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center space-x-1">
                        <GlobalOutlined className="text-gray-400" />
                        <Text type="secondary">{instructor.location || 'Chưa cập nhật'}</Text>
                    </div>
                    <div className="flex items-center space-x-1">
                        <BookOutlined className="text-gray-400" />
                        <Text type="secondary">{instructor.education || 'Chưa cập nhật'}</Text>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <Button type="primary" className="flex-1">
                        Xem hồ sơ
                    </Button>
                    <Button className="flex-1">
                        Liên hệ
                    </Button>
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
        priceRange: [0, 1000000] as [number, number]
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
                education: instructor.education || 'Chưa cập nhật',
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
            <Content className="p-8 bg-gray-50 min-h-screen">
                <motion.div
                    className="w-full"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
                        <Title level={2} className="!mb-0">Giảng viên ({pagination.total})</Title>
                    </motion.div>

                    {loading ? (
                        <div className="text-center py-16">
                            <Spin size="large" />
                            <div className="mt-4">Đang tải danh sách giảng viên...</div>
                        </div>
                    ) : filteredInstructors.length > 0 ? (
                        <motion.div variants={containerVariants}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredInstructors.map(instructor => (
                                    <InstructorCard key={instructor.id} instructor={instructor} />
                                ))}
                            </div>
                            <motion.div variants={itemVariants} className="text-center mt-8">
                                <Pagination
                                    current={currentPage}
                                    total={pagination.total}
                                    pageSize={instructorsPerPage}
                                    onChange={page => setCurrentPage(page)}
                                    showSizeChanger={false}
                                    showTotal={(total, range) => 
                                        `${range[0]}-${range[1]} của ${total} giảng viên`
                                    }
                                />
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