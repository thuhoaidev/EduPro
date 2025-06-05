import React from 'react';
import { Rate, Row, Col, Button } from 'antd';
import { PlayCircleOutlined, BookOutlined, ClockCircleOutlined } from '@ant-design/icons';
// Assuming you still need some antd components or will replace them

// Import the new PromoBanner component

// Đảm bảo đường dẫn tới các file ảnh này là chính xác
import javascriptBg from '../assets/images/course/javascript.png';
import htmlCssBg from '../assets/images/course/htmlcsspro.png';
import wslUbuntuBg from '../assets/images/course/nhapmonit.png';
import nodeExpressBg from '../assets/images/course/nodejs.png';
import basicItBg from '../assets/images/course/react.png';

const courses = [
  {
    title: 'JavaScript Pro',
    subtitle: 'Nâng cao',
    author: 'Dương Đức Phương',
    rating: 5,
    reviews: 1,
    price: 'Miễn phí',
    Image: javascriptBg,
    type: 'Javascript',
  },
  {
    title: 'HTML/CSS Chuyên Sâu',
    subtitle: 'Cơ bản đến nâng cao',
    author: 'Dương Đức Phương',
    rating: 0,
    reviews: 0,
    price: '10.000 VND',
    oldPrice: '20.000 VND',
    Image: htmlCssBg,
    type: 'HTML/CSS',
  },
  {
    title: 'HTML/CSS Cơ Bản',
    subtitle: 'Nhập môn',
    author: 'Dương Đức Phương',
    rating: 0,
    reviews: 0,
    price: 'Miễn phí',
    Image: htmlCssBg,
    type: 'HTML/CSS',
  },
  {
    title: 'Nhập Môn IT',
    subtitle: 'WSL Ubuntu',
    author: 'Dương Đức Phương',
    rating: 5,
    reviews: 1,
    price: 'Miễn phí',
    Image: wslUbuntuBg,
    type: 'DevOps',
  },
  {
    title: 'React Cơ Bản',
    subtitle: 'Frontend',
    author: 'Dương Đức Phương',
    rating: 5,
    reviews: 1,
    price: 'Miễn phí',
    Image: javascriptBg,
    type: 'Javascript',
  },
  {
    title: 'Node.js & Express',
    subtitle: 'Xây dựng Backend',
    author: 'Dương Đức Phương',
    rating: 0,
    reviews: 0,
    price: '438.999 VND',
    oldPrice: '999.000 VND',
    Image: nodeExpressBg,
    type: 'Backend',
  },
  {
    title: 'Kiến Thức Cơ Bản IT',
    subtitle: 'Cho người mới bắt đầu',
    author: 'Dương Đức Phương',
    rating: 0,
    reviews: 0,
    price: '8.888 VND',
    oldPrice: '9.999 VND',
    Image: basicItBg,
    type: 'Basic IT',
  },
  {
    title: 'CSS Nâng Cao',
    subtitle: 'Kỹ thuật Styling',
    author: 'Dương Đức Phương',
    rating: 0,
    reviews: 0,
    price: '2.000 VND',
    Image: htmlCssBg,
    type: 'HTML/CSS',
  },
];

// Assuming you might have separate data for free courses, articles, and videos
// For now, we might reuse the 'courses' data or use placeholders

const freeCourses = courses; // Using existing courses data for free courses for now
// Assuming placeholder data for articles and videos for now
const articles = [1, 2, 3, 4, 5]; // Placeholder data
const videos = [1, 2, 3, 4, 5]; // Placeholder data

const Homepage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1a73e8] to-[#34a853] rounded-2xl p-8 mb-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Học trực tuyến với EduPro</h1>
          <p className="text-lg mb-6">Khám phá hàng ngàn khóa học chất lượng cao từ các giảng viên hàng đầu</p>
          <Button type="primary" size="large" className="bg-white text-[#1a73e8] hover:bg-gray-100">
            Bắt đầu học ngay
          </Button>
        </div>
      </div>

    

      {/* Khóa học miễn phí Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Khóa học miễn phí</h3>
            <p className="text-gray-600 mt-1">Học thử các khóa học chất lượng cao</p>
          </div>
          <a href="#" className="text-[#1a73e8] hover:text-[#1557b0] font-medium">Xem tất cả ›</a>
        </div>
        <Row gutter={[24, 24]}>
          {freeCourses.map((course, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col
                           transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative">
                  <img src={course.Image} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircleOutlined className="text-white text-4xl" />
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{course.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{course.author}</p>
                    <div className="flex items-center mb-2">
                      <Rate disabled defaultValue={course.rating} allowHalf className="text-yellow-500 text-sm" />
                      <span className="ml-2 text-sm text-gray-600">({course.reviews})</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <BookOutlined className="mr-1" />
                      <span>12 bài học</span>
                      <ClockCircleOutlined className="ml-4 mr-1" />
                      <span>2.5 giờ</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-lg font-bold text-[#1a73e8]">Miễn phí</span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Featured Categories */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Danh mục nổi bật</h3>
        <Row gutter={[24, 24]}>
          {['Lập trình', 'Thiết kế', 'Marketing', 'Kinh doanh', 'Ngoại ngữ', 'Âm nhạc'].map((category, index) => (
            <Col xs={12} sm={8} md={6} lg={4} key={index}>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1a73e8] bg-opacity-10 flex items-center justify-center">
                  <BookOutlined className="text-[#1a73e8] text-xl" />
                </div>
                <h4 className="font-medium text-gray-800">{category}</h4>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Homepage;