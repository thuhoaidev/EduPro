import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Input, Select, Card, Tag, Typography, Badge, Avatar, Button, message, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined, UserOutlined, EyeOutlined, LikeOutlined, CommentOutlined, BookOutlined, CalendarOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Sider, Content } = Layout;

interface Blog {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: {
        name: string;
        avatar: string;
        title: string;
    };
    category: string;
    tags: string[];
    publishDate: string;
    readTime: number;
    views: number;
    likes: number;
    comments: number;
    isFeatured: boolean;
    isHot: boolean;
    isNew: boolean;
    coverImage: string;
    status: 'published' | 'draft' | 'archived';
}

const mockBlogs: Blog[] = [
    {
        id: '1',
        title: 'Hướng dẫn React Hooks từ cơ bản đến nâng cao',
        excerpt: 'Khám phá cách sử dụng React Hooks một cách hiệu quả để xây dựng các ứng dụng React hiện đại và tối ưu.',
        content: 'React Hooks đã thay đổi cách chúng ta viết React components...',
        author: {
            name: 'Nguyễn Văn An',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanAn',
            title: 'Senior React Developer'
        },
        category: 'React Development',
        tags: ['React', 'Hooks', 'JavaScript', 'Frontend'],
        publishDate: '2024-01-15',
        readTime: 8,
        views: 15420,
        likes: 892,
        comments: 156,
        isFeatured: true,
        isHot: true,
        isNew: false,
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
        status: 'published'
    },
    {
        id: '2',
        title: 'TypeScript vs JavaScript: Khi nào nên sử dụng?',
        excerpt: 'So sánh chi tiết giữa TypeScript và JavaScript, giúp bạn đưa ra quyết định phù hợp cho dự án.',
        content: 'TypeScript và JavaScript đều là những ngôn ngữ lập trình quan trọng...',
        author: {
            name: 'Trần Thị Bình',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiBinh',
            title: 'Full-Stack Developer'
        },
        category: 'Programming',
        tags: ['TypeScript', 'JavaScript', 'Programming', 'Web Development'],
        publishDate: '2024-01-12',
        readTime: 12,
        views: 8920,
        likes: 445,
        comments: 89,
        isFeatured: false,
        isHot: true,
        isNew: true,
        coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop',
        status: 'published'
    },
    {
        id: '3',
        title: 'UI/UX Design Principles cho Web Developers',
        excerpt: 'Những nguyên tắc thiết kế UI/UX cơ bản mà mọi web developer nên biết để tạo ra sản phẩm tốt hơn.',
        content: 'Thiết kế UI/UX không chỉ dành cho designers...',
        author: {
            name: 'Lê Minh Cường',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeMinhCuong',
            title: 'UI/UX Designer'
        },
        category: 'Design',
        tags: ['UI/UX', 'Design', 'Web Design', 'User Experience'],
        publishDate: '2024-01-10',
        readTime: 15,
        views: 12340,
        likes: 678,
        comments: 134,
        isFeatured: true,
        isHot: false,
        isNew: false,
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
        status: 'published'
    },
    {
        id: '4',
        title: 'Node.js Performance Optimization Techniques',
        excerpt: 'Các kỹ thuật tối ưu hóa hiệu suất cho ứng dụng Node.js từ cơ bản đến nâng cao.',
        content: 'Hiệu suất là yếu tố quan trọng trong phát triển ứng dụng...',
        author: {
            name: 'Phạm Thị Dung',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamThiDung',
            title: 'Backend Developer'
        },
        category: 'Backend Development',
        tags: ['Node.js', 'Performance', 'Backend', 'Optimization'],
        publishDate: '2024-01-08',
        readTime: 10,
        views: 7650,
        likes: 334,
        comments: 67,
        isFeatured: false,
        isHot: false,
        isNew: true,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
        status: 'published'
    },
    {
        id: '5',
        title: 'Machine Learning cho Beginners: Bắt đầu từ đâu?',
        excerpt: 'Hướng dẫn chi tiết cho người mới bắt đầu học Machine Learning với các bước thực hành cụ thể.',
        content: 'Machine Learning đang trở thành một kỹ năng quan trọng...',
        author: {
            name: 'Hoàng Văn Em',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HoangVanEm',
            title: 'Data Scientist'
        },
        category: 'Data Science',
        tags: ['Machine Learning', 'AI', 'Python', 'Data Science'],
        publishDate: '2024-01-05',
        readTime: 20,
        views: 18920,
        likes: 1023,
        comments: 234,
        isFeatured: true,
        isHot: true,
        isNew: false,
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
        status: 'published'
    },
    {
        id: '6',
        title: 'Docker và Kubernetes: Containerization cho Developers',
        excerpt: 'Tìm hiểu về Docker và Kubernetes để triển khai ứng dụng một cách hiệu quả và scalable.',
        content: 'Containerization đã thay đổi cách chúng ta triển khai ứng dụng...',
        author: {
            name: 'Vũ Thị Phương',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VuThiPhuong',
            title: 'DevOps Engineer'
        },
        category: 'DevOps',
        tags: ['Docker', 'Kubernetes', 'DevOps', 'Containerization'],
        publishDate: '2024-01-03',
        readTime: 18,
        views: 9870,
        likes: 556,
        comments: 123,
        isFeatured: false,
        isHot: true,
        isNew: false,
        coverImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=200&fit=crop',
        status: 'published'
    }
];

const blogCategories = ['Tất cả', 'React Development', 'Programming', 'Design', 'Backend Development', 'Data Science', 'DevOps'];

const FilterSidebar = ({ setFilters }: { setFilters: (filters: {
    searchTerm: string;
    category: string;
    sortBy: string;
    readTime: number;
}) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Tất cả');
    const [sortBy, setSortBy] = useState('latest');
    const [readTime, setReadTime] = useState(0);

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters({ searchTerm, category, sortBy, readTime });
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, category, sortBy, readTime, setFilters]);

    return (
        <Sider width={280} className="bg-white p-6" theme="light" style={{
            position: 'sticky',
            top: 68,
            height: 'calc(100vh - 68px)',
            overflowY: 'auto'
        }}>
            <Title level={4} className="!mb-6"><FilterOutlined className="mr-2" />Bộ lọc bài viết</Title>
            
            <div className="space-y-6">
                <div>
                    <Text strong>Tìm kiếm</Text>
                    <Input
                        size="large"
                        placeholder="Tiêu đề bài viết..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="!mt-2"
                    />
                </div>
                <div>
                    <Text strong>Danh mục</Text>
                    <Select
                        size="large"
                        defaultValue="Tất cả"
                        className="w-full !mt-2"
                        onChange={value => setCategory(value)}
                    >
                        {blogCategories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                    </Select>
                </div>
                <div>
                    <Text strong>Sắp xếp theo</Text>
                    <Select
                        size="large"
                        defaultValue="latest"
                        className="w-full !mt-2"
                        onChange={value => setSortBy(value)}
                    >
                        <Option value="latest">Mới nhất</Option>
                        <Option value="popular">Phổ biến nhất</Option>
                        <Option value="views">Lượt xem cao nhất</Option>
                        <Option value="likes">Lượt thích cao nhất</Option>
                    </Select>
                </div>
                <div>
                    <Text strong>Thời gian đọc</Text>
                    <Select
                        size="large"
                        defaultValue={0}
                        className="w-full !mt-2"
                        onChange={value => setReadTime(value)}
                    >
                        <Option value={0}>Tất cả</Option>
                        <Option value={5}>Dưới 5 phút</Option>
                        <Option value={10}>5-10 phút</Option>
                        <Option value={15}>10-15 phút</Option>
                        <Option value={20}>Trên 15 phút</Option>
                    </Select>
                </div>
            </div>
        </Sider>
    );
};

const BlogCard = ({ blog }: { blog: Blog }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleLike = () => {
        message.success('Đã thích bài viết!');
    };

    const handleSave = () => {
        message.success('Đã lưu bài viết!');
    };

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
                cover={
                    <div className="relative h-48 overflow-hidden">
                        <img
                            alt={blog.title}
                            src={blog.coverImage}
                            className="w-full h-full object-cover transition-transform duration-300"
                            style={{
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                            }}
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                            {blog.isFeatured && (
                                <Badge count={<StarOutlined style={{ color: '#faad14' }} />} />
                            )}
                            {blog.isHot && (
                                <Badge count={<FireOutlined style={{ color: '#ff4d4f' }} />} />
                            )}
                            {blog.isNew && (
                                <Tag color="green">Mới</Tag>
                            )}
                        </div>
                    </div>
                }
            >
                <div className="flex flex-col h-full">
                    {/* Category and Tags */}
                    <div className="mb-3">
                        <Tag color="blue" className="mb-2">{blog.category}</Tag>
                        <div className="flex flex-wrap gap-1">
                            {blog.tags.slice(0, 2).map((tag, index) => (
                                <Tag key={index} color="default" className="text-xs">{tag}</Tag>
                            ))}
                            {blog.tags.length > 2 && (
                                <Tag color="default" className="text-xs">+{blog.tags.length - 2}</Tag>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <Title level={4} className="!mb-2 line-clamp-2" style={{ minHeight: '56px' }}>{blog.title}</Title>

                    {/* Excerpt */}
                    <Paragraph className="text-gray-600 text-sm mb-4 line-clamp-3" style={{ minHeight: '63px' }}>
                        {blog.excerpt}
                    </Paragraph>

                    {/* Author Info */}
                    <div className="flex items-center space-x-2 mb-4">
                        <Avatar size={32} src={blog.author.avatar} icon={<UserOutlined />} />
                        <div className="flex-1">
                            <Text strong className="text-sm">{blog.author.name}</Text>
                            <div className="text-xs text-gray-500">{blog.author.title}</div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <CalendarOutlined />
                                <span>{new Date(blog.publishDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <BookOutlined />
                                <span>{blog.readTime} phút</span>
                            </div>
                        </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <EyeOutlined />
                                <span>{blog.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <LikeOutlined />
                                <span>{blog.likes.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <CommentOutlined />
                                <span>{blog.comments.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-auto">
                        <Button type="primary" className="flex-1">
                            Đọc bài viết
                        </Button>
                        <Button 
                            icon={<LikeOutlined />} 
                            onClick={handleLike}
                            className="flex-shrink-0"
                        />
                        <Button 
                            icon={<BookOutlined />} 
                            onClick={handleSave}
                            className="flex-shrink-0"
                        />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

const BlogPage = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
    const [filters, setFilters] = useState({
        searchTerm: '',
        category: 'Tất cả',
        sortBy: 'latest',
        readTime: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 6;

    useEffect(() => {
        setBlogs(mockBlogs);
    }, []);

    useEffect(() => {
        let filtered = blogs;

        // Filter by search term
        if (filters.searchTerm) {
            filtered = filtered.filter(blog =>
                blog.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                blog.excerpt.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                blog.author.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (filters.category !== 'Tất cả') {
            filtered = filtered.filter(blog => blog.category === filters.category);
        }

        // Filter by read time
        if (filters.readTime > 0) {
            if (filters.readTime === 5) {
                filtered = filtered.filter(blog => blog.readTime < 5);
            } else if (filters.readTime === 10) {
                filtered = filtered.filter(blog => blog.readTime >= 5 && blog.readTime <= 10);
            } else if (filters.readTime === 15) {
                filtered = filtered.filter(blog => blog.readTime >= 10 && blog.readTime <= 15);
            } else if (filters.readTime === 20) {
                filtered = filtered.filter(blog => blog.readTime > 15);
            }
        }

        // Sort blogs
        switch (filters.sortBy) {
            case 'latest':
                filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
                break;
            case 'popular':
                filtered.sort((a, b) => b.views - a.views);
                break;
            case 'views':
                filtered.sort((a, b) => b.views - a.views);
                break;
            case 'likes':
                filtered.sort((a, b) => b.likes - a.likes);
                break;
        }

        setFilteredBlogs(filtered);
        setCurrentPage(1);
    }, [filters, blogs]);

    const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage);

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
                    {filteredBlogs.length > 0 ? (
                        <motion.div variants={containerVariants}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedBlogs.map(blog => (
                                    <BlogCard key={blog.id} blog={blog} />
                                ))}
                            </div>
                            <motion.div variants={itemVariants} className="text-center mt-8">
                                <Pagination
                                    current={currentPage}
                                    total={filteredBlogs.length}
                                    pageSize={blogsPerPage}
                                    onChange={page => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div variants={itemVariants}>
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOutlined className="text-4xl text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Không tìm thấy bài viết
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

export default BlogPage; 