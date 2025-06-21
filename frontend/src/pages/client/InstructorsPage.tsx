import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Input, Select, Card, Tag, Typography, Badge, Rate, Avatar, Button, message, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined, UserOutlined, StarFilled, BookOutlined, TeamOutlined, TrophyOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Sider, Content } = Layout;

interface Instructor {
    id: string;
    name: string;
    avatar: string;
    title: string;
    bio: string;
    rating: number;
    totalStudents: number;
    totalCourses: number;
    totalReviews: number;
    experience: number;
    specializations: string[];
    languages: string[];
    isVerified: boolean;
    isFeatured: boolean;
    isOnline: boolean;
    hourlyRate: number;
    location: string;
    education: string;
    achievements: string[];
}

const mockInstructors: Instructor[] = [
    {
        id: '1',
        name: 'Nguyễn Văn An',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanAn',
        title: 'Senior Full-Stack Developer',
        bio: 'Chuyên gia phát triển web với 8 năm kinh nghiệm, chuyên về React, Node.js và cloud computing. Đã đào tạo hơn 2000+ học viên.',
        rating: 4.8,
        totalStudents: 2340,
        totalCourses: 15,
        totalReviews: 892,
        experience: 8,
        specializations: ['React', 'Node.js', 'TypeScript', 'AWS'],
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        isVerified: true,
        isFeatured: true,
        isOnline: true,
        hourlyRate: 500000,
        location: 'Hà Nội, Việt Nam',
        education: 'Đại học Bách Khoa Hà Nội - Công nghệ thông tin',
        achievements: ['Microsoft MVP', 'Google Developer Expert', 'Top Instructor 2023']
    },
    {
        id: '2',
        name: 'Trần Thị Bình',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiBinh',
        title: 'UI/UX Design Expert',
        bio: 'Nhà thiết kế UX/UI với 6 năm kinh nghiệm trong lĩnh vực digital design. Chuyên về user research và design systems.',
        rating: 4.9,
        totalStudents: 1890,
        totalCourses: 12,
        totalReviews: 756,
        experience: 6,
        specializations: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research'],
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        isVerified: true,
        isFeatured: true,
        isOnline: false,
        hourlyRate: 450000,
        location: 'TP.HCM, Việt Nam',
        education: 'Đại học Kiến trúc TP.HCM - Thiết kế đồ họa',
        achievements: ['Adobe Certified Expert', 'Design Award 2022']
    },
    {
        id: '3',
        name: 'Lê Minh Cường',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeMinhCuong',
        title: 'Data Science Specialist',
        bio: 'Chuyên gia khoa học dữ liệu với 7 năm kinh nghiệm trong machine learning và AI. Từng làm việc tại các công ty công nghệ hàng đầu.',
        rating: 4.7,
        totalStudents: 1560,
        totalCourses: 18,
        totalReviews: 634,
        experience: 7,
        specializations: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow'],
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        isVerified: true,
        isFeatured: false,
        isOnline: true,
        hourlyRate: 600000,
        location: 'Hà Nội, Việt Nam',
        education: 'Đại học Quốc gia Hà Nội - Toán học ứng dụng',
        achievements: ['Kaggle Grandmaster', 'AI Research Paper Author']
    },
    {
        id: '4',
        name: 'Phạm Thị Dung',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamThiDung',
        title: 'Mobile Development Lead',
        bio: 'Chuyên gia phát triển ứng dụng di động với 5 năm kinh nghiệm. Chuyên về React Native và Flutter.',
        rating: 4.6,
        totalStudents: 980,
        totalCourses: 10,
        totalReviews: 445,
        experience: 5,
        specializations: ['React Native', 'Flutter', 'iOS', 'Android'],
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        isVerified: true,
        isFeatured: false,
        isOnline: false,
        hourlyRate: 400000,
        location: 'Đà Nẵng, Việt Nam',
        education: 'Đại học Bách Khoa Đà Nẵng - Công nghệ thông tin',
        achievements: ['Google Developer Expert', 'App Store Featured App']
    },
    {
        id: '5',
        name: 'Hoàng Văn Em',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HoangVanEm',
        title: 'DevOps Engineer',
        bio: 'Kỹ sư DevOps với 9 năm kinh nghiệm trong automation và cloud infrastructure. Chuyên về Docker, Kubernetes và AWS.',
        rating: 4.5,
        totalStudents: 720,
        totalCourses: 8,
        totalReviews: 298,
        experience: 9,
        specializations: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        isVerified: true,
        isFeatured: false,
        isOnline: true,
        hourlyRate: 550000,
        location: 'TP.HCM, Việt Nam',
        education: 'Đại học Công nghệ TP.HCM - Hệ thống thông tin',
        achievements: ['AWS Certified Solutions Architect', 'Kubernetes Administrator']
    },
    {
        id: '6',
        name: 'Vũ Thị Phương',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VuThiPhuong',
        title: 'Digital Marketing Expert',
        bio: 'Chuyên gia marketing số với 6 năm kinh nghiệm. Chuyên về SEO, Google Ads và social media marketing.',
        rating: 4.8,
        totalStudents: 1340,
        totalCourses: 14,
        totalReviews: 567,
        experience: 6,
        specializations: ['SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing'],
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        isVerified: true,
        isFeatured: true,
        isOnline: true,
        hourlyRate: 350000,
        location: 'Hà Nội, Việt Nam',
        education: 'Đại học Kinh tế Quốc dân - Marketing',
        achievements: ['Google Ads Certified', 'Facebook Blueprint Certified']
    }
];

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
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

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
                <div>
                    <Text strong>Mức phí (đ/giờ)</Text>
                    <Select
                        size="large"
                        defaultValue="all"
                        className="w-full !mt-2"
                        onChange={value => {
                            const ranges: { [key: string]: [number, number] } = {
                                'all': [0, 1000000],
                                'low': [0, 300000],
                                'medium': [300000, 600000],
                                'high': [600000, 1000000]
                            };
                            setPriceRange(ranges[value]);
                        }}
                    >
                        <Option value="all">Tất cả</Option>
                        <Option value="low">Dưới 300k</Option>
                        <Option value="medium">300k - 600k</Option>
                        <Option value="high">Trên 600k</Option>
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
                                <Title level={4} className="!mb-1">{instructor.name}</Title>
                                {instructor.isVerified && (
                                    <Badge count={<TrophyOutlined style={{ color: '#faad14' }} />} />
                                )}
                                {instructor.isFeatured && (
                                    <Badge count={<StarFilled style={{ color: '#ff4d4f' }} />} />
                                )}
                            </div>
                            <Text type="secondary" className="text-sm">{instructor.title}</Text>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="mb-4">
                    <Text className="text-sm text-gray-600 line-clamp-3">{instructor.bio}</Text>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Rate disabled allowHalf defaultValue={instructor.rating} style={{fontSize: 14}} />
                        <Text strong className="text-sm">{instructor.rating}</Text>
                        <Text type="secondary" className="text-xs">({instructor.totalReviews} đánh giá)</Text>
                    </div>
                    <div className="flex items-center space-x-1">
                        <TeamOutlined className="text-blue-500" />
                        <Text className="text-sm">{instructor.totalStudents.toLocaleString()}</Text>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{instructor.totalCourses}</div>
                        <Text className="text-xs">Khóa học</Text>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">{instructor.experience}</div>
                        <Text className="text-xs">Năm KN</Text>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-lg font-bold text-purple-600">{instructor.hourlyRate.toLocaleString()}</div>
                        <Text className="text-xs">đ/giờ</Text>
                    </div>
                </div>

                {/* Specializations */}
                <div className="mb-4">
                    <Text strong className="text-sm mb-2 block">Chuyên môn:</Text>
                    <div className="flex flex-wrap gap-1">
                        {instructor.specializations.slice(0, 3).map((spec, index) => (
                            <Tag key={index} color="blue" className="text-xs">{spec}</Tag>
                        ))}
                        {instructor.specializations.length > 3 && (
                            <Tag color="default" className="text-xs">+{instructor.specializations.length - 3}</Tag>
                        )}
                    </div>
                </div>

                {/* Location and Languages */}
                <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center space-x-1">
                        <GlobalOutlined className="text-gray-400" />
                        <Text type="secondary">{instructor.location}</Text>
                    </div>
                    <div className="flex items-center space-x-1">
                        <BookOutlined className="text-gray-400" />
                        <Text type="secondary">{instructor.languages.join(', ')}</Text>
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
    const [filters, setFilters] = useState({
        searchTerm: '',
        category: 'Tất cả',
        rating: 0,
        experience: 0,
        priceRange: [0, 1000000] as [number, number]
    });
    const [currentPage, setCurrentPage] = useState(1);
    const instructorsPerPage = 6;

    useEffect(() => {
        setInstructors(mockInstructors);
    }, []);

    useEffect(() => {
        let filtered = instructors;

        // Filter by search term
        if (filters.searchTerm) {
            filtered = filtered.filter(instructor =>
                instructor.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                instructor.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                instructor.bio.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (filters.category !== 'Tất cả') {
            const categoryMap: { [key: string]: string[] } = {
                'Full-Stack Development': ['React', 'Node.js', 'TypeScript'],
                'UI/UX Design': ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
                'Data Science': ['Python', 'Machine Learning', 'Deep Learning'],
                'Mobile Development': ['React Native', 'Flutter', 'iOS', 'Android'],
                'DevOps': ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
                'Digital Marketing': ['SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing']
            };
            const categorySpecs = categoryMap[filters.category];
            if (categorySpecs) {
                filtered = filtered.filter(instructor =>
                    instructor.specializations.some(spec => categorySpecs.includes(spec))
                );
            }
        }

        // Filter by rating
        if (filters.rating > 0) {
            filtered = filtered.filter(instructor => instructor.rating >= filters.rating);
        }

        // Filter by experience
        if (filters.experience > 0) {
            filtered = filtered.filter(instructor => instructor.experience >= filters.experience);
        }

        // Filter by price range
        filtered = filtered.filter(instructor =>
            instructor.hourlyRate >= filters.priceRange[0] && instructor.hourlyRate <= filters.priceRange[1]
        );

        setFilteredInstructors(filtered);
        setCurrentPage(1);
    }, [filters, instructors]);

    const paginatedInstructors = filteredInstructors.slice((currentPage - 1) * instructorsPerPage, currentPage * instructorsPerPage);

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
                        <Title level={2} className="!mb-0">Giảng viên ({filteredInstructors.length})</Title>
                    </motion.div>

                    {filteredInstructors.length > 0 ? (
                        <motion.div variants={containerVariants}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedInstructors.map(instructor => (
                                    <InstructorCard key={instructor.id} instructor={instructor} />
                                ))}
                            </div>
                            <motion.div variants={itemVariants} className="text-center mt-8">
                                <Pagination
                                    current={currentPage}
                                    total={filteredInstructors.length}
                                    pageSize={instructorsPerPage}
                                    onChange={page => setCurrentPage(page)}
                                    showSizeChanger={false}
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