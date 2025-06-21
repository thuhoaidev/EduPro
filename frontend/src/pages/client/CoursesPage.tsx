import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Input, Select, Slider, Card, Pagination, Tag, Avatar, Rate, Row, Col, Typography, Empty, Button } from 'antd';
import { SearchOutlined, StarFilled, AppstoreOutlined, UnorderedListOutlined, UserOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Sider, Content } = Layout;

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: {
    name: string;
    avatar: string;
  };
  thumbnail: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  students: number;
  isBestseller?: boolean;
  isNew?: boolean;
}

const mockCourses: Course[] = Array.from({ length: 25 }, (_, i) => {
    const categories = ['Phát triển Web', 'Phát triển Mobile', 'Khoa học dữ liệu', 'Marketing', 'Thiết kế'];
    const titles = [
        'Khóa học ReactJS từ Zero đến Hero',
        'Lập trình iOS với Swift & SwiftUI',
        'Python cho Khoa học dữ liệu và Machine Learning',
        'Digital Marketing toàn tập 2024',
        'Thiết kế UI/UX cho người mới bắt đầu với Figma'
    ];
    const category = categories[i % categories.length];
    return {
        id: `course-${i + 1}`,
        title: `${titles[i % titles.length]} #${i + 1}`,
        category: category,
        instructor: { name: `Giảng viên ${i + 1}`, avatar: `https://i.pravatar.cc/150?u=instructor${i + 1}` },
        thumbnail: `https://picsum.photos/seed/${i + 1}/600/400`,
        price: 499000 + (i * 10000),
        originalPrice: (i % 3 === 0) ? (699000 + (i * 10000)) : undefined,
        rating: 3.5 + (i % 15) / 10,
        reviews: 50 + i * 15,
        students: 1200 + i * 50,
        isBestseller: i % 4 === 0,
        isNew: i % 7 === 0,
    }
});

const courseCategories = ['Tất cả', 'Phát triển Web', 'Phát triển Mobile', 'Khoa học dữ liệu', 'Marketing', 'Thiết kế'];

const FilterSidebar = ({ setFilters }: { setFilters: (filters: any) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Tất cả');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters({ searchTerm, category, priceRange, rating });
        }, 500); // Debounce filter changes
        return () => clearTimeout(handler);
    }, [searchTerm, category, priceRange, rating, setFilters]);

    return (
        <Sider width={280} className="bg-white p-6" theme="light" style={{
            position: 'sticky',
            top: 68, // height of header
            height: 'calc(100vh - 68px)',
            overflowY: 'auto'
        }}>
            <Title level={4} className="!mb-6"><FilterOutlined className="mr-2" />Bộ lọc tìm kiếm</Title>
            
            <div className="space-y-6">
                <div>
                    <Text strong>Tìm kiếm</Text>
                    <Input
                        size="large"
                        placeholder="Tên khóa học..."
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
                        {courseCategories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
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
                    <Text strong>Mức giá (đ)</Text>
                    <Slider
                        range
                        min={0}
                        max={1500000}
                        step={50000}
                        defaultValue={[0, 1500000]}
                        onChange={value => setPriceRange(value)}
                        tipFormatter={value => `${value?.toLocaleString()}`}
                        className="!mt-2"
                    />
                </div>
            </div>
        </Sider>
    );
};

const CoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [filters, setFilters] = useState({
        searchTerm: '',
        category: 'Tất cả',
        priceRange: [0, 1500000],
        rating: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 9;

    useEffect(() => {
        setCourses(mockCourses);
    }, []);

    useEffect(() => {
        let result = courses
            .filter(course => course.title.toLowerCase().includes(filters.searchTerm.toLowerCase()))
            .filter(course => filters.category === 'Tất cả' || course.category === filters.category)
            .filter(course => course.price >= filters.priceRange[0] && course.price <= filters.priceRange[1])
            .filter(course => course.rating >= filters.rating);

        setFilteredCourses(result);
        setCurrentPage(1);
    }, [filters, courses]);

    const paginatedCourses = filteredCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5, staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    const CourseCard = ({ course }: { course: Course }) => (
        <motion.div 
            variants={itemVariants} 
            className="h-full group"
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
            <Card
                hoverable
                className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
                cover={
                    <div className="overflow-hidden h-48">
                        <img 
                            alt={course.title} 
                            src={course.thumbnail} 
                            className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" 
                        />
                    </div>
                }
                styles={{ body: { padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' } }}
            >
                {(course.isBestseller || course.isNew) && (
                    <div className="absolute top-4 left-0">
                        {course.isBestseller && 
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                <Tag color="gold" className="!font-semibold">Bán chạy</Tag>
                            </motion.div>
                        }
                        {course.isNew && 
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                <Tag color="cyan" className="!font-semibold mt-1">Mới</Tag>
                            </motion.div>
                        }
                    </div>
                )}
                <div className="flex-grow">
                    <Tag color="blue" className="mb-2">{course.category}</Tag>
                    <Title level={5} className="!mb-2 !text-base h-12 overflow-hidden">{course.title}</Title>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Avatar src={course.instructor.avatar} size="small" icon={<UserOutlined />} />
                        <span>{course.instructor.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Rate allowHalf disabled defaultValue={course.rating} style={{ fontSize: 16 }} />
                        <span className="text-gray-600 font-semibold">({course.reviews})</span>
                    </div>
                </div>
                <div className="mt-auto pt-2">
                    <div className="flex justify-end items-baseline gap-2">
                        {course.originalPrice && (
                            <Text delete type="secondary" className="!text-sm">
                                {course.originalPrice.toLocaleString()}đ
                            </Text>
                        )}
                        <Title level={4} className="!text-lg !font-bold !text-blue-600">
                            {course.price.toLocaleString()}đ
                        </Title>
                    </div>
                </div>
            </Card>
        </motion.div>
    );

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

                    {filteredCourses.length > 0 ? (
                        <motion.div variants={containerVariants}>
                            <Row gutter={[24, 24]}>
                                {paginatedCourses.map(course => (
                                    <Col key={course.id} xs={24} sm={12} lg={8}>
                                        <CourseCard course={course} />
                                    </Col>
                                ))}
                            </Row>
                            <motion.div variants={itemVariants} className="text-center mt-8">
                                <Pagination
                                    current={currentPage}
                                    total={filteredCourses.length}
                                    pageSize={coursesPerPage}
                                    onChange={page => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div variants={itemVariants}>
                            <Empty
                                description="Không tìm thấy khóa học phù hợp. Vui lòng thử lại với bộ lọc khác."
                                className="py-16"
                            />
                        </motion.div>
                    )}
                </motion.div>
            </Content>
        </Layout>
    );
};

export default CoursesPage; 