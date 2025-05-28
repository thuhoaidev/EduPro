// components/admin/courses/CourseListPage.jsx
import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Row, Col, Card, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import { EllipsisOutlined } from '@ant-design/icons'; // Bỏ PlusOutlined nếu không dùng ở đây

const { Option } = Select;

// Định nghĩa Interface cho Course
interface Course {
    key: string;
    name: string;
    category: string;
    type: string;
    totalTime: string;
    chapters: number;
    materials: number;
    image: string;
    imageOverlayText?: string;
    imageOverlaySubText?: string;
    isNew: boolean;
}

// Dữ liệu khóa học mẫu (đã thêm đủ để phân trang hoạt động tốt hơn)
const initialCoursesData: Course[] = [
    {
        key: 'javascript-pro',
        name: 'JavaScript Pro',
        category: 'Lập trình',
        type: 'Miễn phí',
        totalTime: '00:00:12',
        chapters: 1,
        materials: 1,
        image: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582748_1280.png',
        imageOverlayText: 'JavaScript Pro',
        imageOverlaySubText: 'Cho người mới bắt đầu',
        isNew: true
    },
    {
        key: 'html-css1',
        name: 'HTML CSS1',
        category: 'Lập trình Web',
        type: 'Tính phí',
        totalTime: '00:03:41',
        chapters: 2,
        materials: 4,
        image: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582747_1280.png',
        imageOverlayText: 'HTML, CSS Pro',
        imageOverlaySubText: 'Cho người mới bắt đầu',
        isNew: false
    },
    {
        key: 'html-css-pro',
        name: 'HTML CSS Pro',
        category: 'Lập trình Web',
        type: 'Miễn phí',
        totalTime: '00:00:00',
        chapters: 1,
        materials: 1,
        image: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582747_1280.png',
        imageOverlayText: 'HTML, CSS Pro',
        imageOverlaySubText: 'Cho người mới bắt đầu',
        isNew: false
    },
    {
        key: 'terminal-ubuntu',
        name: 'Làm việc với Terminal & Ubuntu',
        category: 'Hệ điều hành',
        type: 'Miễn phí',
        totalTime: '00:01:25',
        chapters: 4,
        materials: 4,
        image: 'https://cdn.pixabay.com/photo/2017/03/03/17/03/terminal-2115164_1280.png',
        imageOverlayText: 'WSL Ubuntu',
        imageOverlaySubText: 'Windows Terminal',
        isNew: false
    },
    // Thêm các khóa học mẫu để có 9 khóa học cho phân trang như ảnh
    {
        key: 'python-basics',
        name: 'Python Cơ bản',
        category: 'Lập trình',
        type: 'Tính phí',
        totalTime: '00:01:30',
        chapters: 2,
        materials: 3,
        image: 'https://via.placeholder.com/300x180/3776AB/FFFFFF?text=Python',
        imageOverlayText: 'Python',
        imageOverlaySubText: 'Cho người mới bắt đầu',
        isNew: false
    },
    {
        key: 'database-design',
        name: 'Thiết kế Cơ sở dữ liệu',
        category: 'Cơ sở dữ liệu',
        type: 'Miễn phí',
        totalTime: '00:04:00',
        chapters: 3,
        materials: 6,
        image: 'https://via.placeholder.com/300x180/4479A1/FFFFFF?text=Database',
        imageOverlayText: 'Cơ sở dữ liệu',
        imageOverlaySubText: 'Nâng cao',
        isNew: false
    },
    {
        key: 'data-structures-algorithms',
        name: 'Cấu trúc dữ liệu & Giải thuật',
        category: 'Lập trình',
        type: 'Tính phí',
        totalTime: '00:06:00',
        chapters: 5,
        materials: 7,
        image: 'https://via.placeholder.com/300x180/E54C3C/FFFFFF?text=DSA',
        imageOverlayText: 'DSA',
        imageOverlaySubText: 'Lập trình cạnh tranh',
        isNew: false
    },
    {
        key: 'web-security',
        name: 'Bảo mật Web',
        category: 'Bảo mật',
        type: 'Miễn phí',
        totalTime: '00:03:30',
        chapters: 3,
        materials: 4,
        image: 'https://via.placeholder.com/300x180/2C3E50/FFFFFF?text=Security',
        imageOverlayText: 'Bảo mật',
        imageOverlaySubText: 'Web Apps',
        isNew: false
    },
    {
        key: 'devops-intro',
        name: 'Giới thiệu DevOps',
        category: 'DevOps',
        type: 'Tính phí',
        totalTime: '00:02:00',
        chapters: 2,
        materials: 3,
        image: 'https://via.placeholder.com/300x180/F39C12/FFFFFF?text=DevOps',
        imageOverlayText: 'DevOps',
        imageOverlaySubText: 'Triển khai',
        isNew: false
    },
];

// Đổi tên component trở lại là CourseListPage
const CourseListPage = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [courseType, setCourseType] = useState<string | undefined>(undefined);
    // Khởi tạo rõ kiểu là Course[] để tránh lỗi never[]
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [coursesPerPage, setCoursesPerPage] = useState<number>(4); // 4 khóa học mỗi trang như ảnh

    // Hàm lọc và phân trang dữ liệu
    const applyFiltersAndPagination = () => {
        let tempCourses = [...initialCoursesData];

        // Lọc theo tìm kiếm
        if (searchTerm) {
            tempCourses = tempCourses.filter(course =>
                course.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Lọc theo danh mục
        if (category) {
            tempCourses = tempCourses.filter(course => course.category === category);
        }

        // Lọc theo loại khóa học
        if (courseType) {
            tempCourses = tempCourses.filter(course => course.type === courseType);
        }

        // Áp dụng phân trang sau khi lọc
        const indexOfLastCourse = currentPage * coursesPerPage;
        const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
        const currentCourses = tempCourses.slice(indexOfFirstCourse, indexOfLastCourse);

        setFilteredCourses(currentCourses);
        
        // Cập nhật lại số trang hiện tại nếu các filter làm thay đổi tổng số khóa học
        // Đảm bảo không vượt quá tổng số trang sau khi lọc
        if (currentPage > Math.ceil(tempCourses.length / coursesPerPage) && tempCourses.length > 0) {
            setCurrentPage(1); // Reset về trang 1 nếu trang hiện tại không còn tồn tại
        } else if (tempCourses.length === 0) {
            setCurrentPage(1); // Nếu không có khóa học nào khớp, về trang 1
        }
    };

    // Gọi hàm lọc và phân trang khi component mount hoặc khi filter/pagination thay đổi
    useEffect(() => {
        applyFiltersAndPagination();
    }, [searchTerm, category, courseType, currentPage, coursesPerPage]); // dependencies

    const handleSearchClick = () => {
        setCurrentPage(1); // Reset về trang đầu tiên khi áp dụng bộ lọc mới
        // applyFiltersAndPagination() sẽ được gọi qua useEffect sau khi currentPage thay đổi
    };

    const handlePageChange = (page: number) => { // Thêm kiểu number cho 'page'
        setCurrentPage(page);
    };

    return (
        <div className="admin-courses-page p-6 bg-gray-100 min-h-screen font-sans">
            {/* Breadcrumb */}
            <div className="mb-6 text-sm text-gray-600">
                <span>Home</span> / <span>Admin</span> / <span className="font-semibold text-gray-800">Courses</span>
            </div>

            {/* Header section (sửa lại theo ảnh danh sách) */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0 sm:pr-4">
                    <h2 className="text-xl font-bold text-gray-800">Chức năng "Danh sách khóa học"</h2>
                    <p className="text-gray-600 mt-1 text-sm">Giúp cho quản trị có cái nhìn tổng quan về các khóa học trong hệ thống, và có thể thao tác với những nguồn tài nguyên đó.</p>
                </div>
                <div>
                    <Link to="/admin/courses/create">
                        {/* Nút "Tạo Khóa Học" màu xanh primary như ảnh */}
                        <Button type="primary" size="large" className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 rounded-md">
                            Tạo Khóa Học
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filter section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} sm={12} md={8} lg={8}>
                        <Input
                            placeholder="Tìm kiếm khóa học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-md"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                            placeholder="Chọn danh mục"
                            style={{ width: '100%' }}
                            value={category}
                            onChange={setCategory}
                            allowClear
                            className="rounded-md"
                        >
                            <Option value="Lập trình">Lập trình</Option>
                            <Option value="Lập trình Web">Lập trình Web</Option>
                            <Option value="Thiết kế">Thiết kế</Option>
                            <Option value="Hệ điều hành">Hệ điều hành</Option>
                            <Option value="Cơ sở dữ liệu">Cơ sở dữ liệu</Option>
                            <Option value="Bảo mật">Bảo mật</Option>
                            <Option value="DevOps">DevOps</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                            placeholder="Chọn loại khóa học"
                            style={{ width: '100%' }}
                            value={courseType}
                            onChange={setCourseType}
                            allowClear
                            className="rounded-md"
                        >
                            <Option value="Miễn phí">Miễn phí</Option>
                            <Option value="Tính phí">Tính phí</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Button type="primary" onClick={handleSearchClick} className="w-full h-auto py-2 bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 rounded-md">
                            Áp Dụng
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Course List Section */}
            <Row gutter={[24, 24]}> {/* Tăng khoảng cách gutter */}
                {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => (
                        <Col xs={24} sm={12} md={8} lg={6} key={course.key}>
                            <Card
                                hoverable
                                actions={[
                                    <Link to={`/admin/courses/edit/${course.key}`} className="block text-center w-full">
                                        <Button
                                            type="link"
                                            className="font-medium text-blue-500 hover:text-blue-700 active:text-blue-800"
                                            style={{ fontSize: '15px' }}
                                        >
                                            Xem Và Sửa Khóa Học
                                        </Button>
                                    </Link>
                                ]}
                                className="course-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden border border-gray-200"
                                bodyStyle={{ padding: '16px' }}
                            >
                                {/* Custom Cover Section */}
                                <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                                    <img
                                        alt={course.name}
                                        src={course.image}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay text on image */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                                        {course.imageOverlayText && <h4 className="text-xl font-bold">{course.imageOverlayText}</h4>}
                                        {course.imageOverlaySubText && <p className="text-sm">{course.imageOverlaySubText}</p>}
                                    </div>

                                    {/* Type Badge on image (Miễn phí / Tính phí) */}
                                    <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${course.type === 'Miễn phí' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
                                        {course.type}
                                    </div>

                                    {/* "Khóa học mới" tag */}
                                    {course.isNew && (
                                        <div className="absolute top-0 left-0 bg-yellow-500 text-white text-xs px-3 py-1 rounded-br-lg font-bold">
                                            Khóa học mới
                                        </div>
                                    )}
                                </div>

                                <Card.Meta
                                    description={
                                        <div className="text-gray-700 text-sm mt-3">
                                            <p className="mb-1"><span className="font-medium text-gray-800">Tổng thời gian:</span> {course.totalTime}</p>
                                            <p className="mb-1"><span className="font-medium text-gray-800">Số lượng chương:</span> {course.chapters}</p>
                                            <p className="mb-1"><span className="font-medium text-gray-800">Số lượng tài liệu:</span> {course.materials}</p>
                                        </div>
                                    }
                                />
                                {/* Nút ba chấm */}
                                <div className="absolute top-4 right-4">
                                    <Button
                                        type="text"
                                        icon={<EllipsisOutlined className="text-gray-500 hover:text-gray-800 text-lg" />}
                                        onClick={() => console.log('More options for:', course.name)}
                                        className="p-1 rounded-full hover:bg-gray-100"
                                    />
                                </div>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col span={24}>
                        <div className="text-center text-gray-600 text-lg py-10 bg-white rounded-lg shadow-md">
                            Không tìm thấy khóa học nào phù hợp.
                        </div>
                    </Col>
                )}
            </Row>

            {/* Pagination Section */}
            <div className="mt-8 bg-white p-4 rounded-lg shadow-md flex justify-end items-center">
                <span className="text-gray-600 mr-4 text-sm">Rows per page: {coursesPerPage}</span>
                <Pagination
                    current={currentPage}
                    pageSize={coursesPerPage}
                    total={initialCoursesData.length} // Tổng số khóa học gốc để tính pagination
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    className="custom-pagination"
                    itemRender={(current, type, originalElement) => {
                        if (type === 'prev') {
                            return <Button type="text" className="px-2 py-1 h-auto min-w-0" icon={<span className="text-xl">&lt;</span>} />;
                        }
                        if (type === 'next') {
                            return <Button type="text" className="px-2 py-1 h-auto min-w-0" icon={<span className="text-xl">&gt;</span>} />;
                        }
                        return originalElement as React.ReactNode; // Ép kiểu React.ReactNode
                    }}
                />
            </div>
        </div>
    );
};

export default CourseListPage;