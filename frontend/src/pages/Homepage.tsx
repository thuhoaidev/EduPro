import React from 'react';
import { Rate, Row, Col } from 'antd';
// Assuming you still need some antd components or will replace them

// Import the new PromoBanner component
import PromoBanner from '../components/PromoBanner';

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
      {/* Promo Banner */}
      <PromoBanner />

      {/* Khóa học miễn phí Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Khóa học miễn phí</h3>
          {/* "Xem tất cả" link */}
          <a href="#" className="text-blue-600 hover:underline">Xem tất cả ›</a>
        </div>
        {/* Grid container for free courses - reusing Ant Design Row/Col for now, or could use CSS Grid/Flex */}
        <Row gutter={[24, 24]}>
          {freeCourses.map((course, index) => (
            <Col xs={24} sm={12} md={8} lg={4} key={index}> {/* Adjust Col sizes for grid layout */}
              {/* Added hover effect to the inner div */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col
                         transition-transform duration-300 ease-in-out hover:-translate-y-2">
                {/* Course Image */}
                <img src={course.Image} alt={course.title} className="w-full h-32 object-cover" />
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Course Title */}
                    <h5 className="text-md font-bold text-gray-800 mb-1">{course.title}</h5>
                    {/* Author */}
                    <p className="text-xs text-gray-600 mb-2">{course.author}</p>
                    {/* Rating and Reviews (simplified) */}
                    <div className="flex items-center mb-2">
                      <Rate disabled defaultValue={course.rating} allowHalf count={5} className="text-yellow-500 text-xs" />
                      <span className="ml-1 text-sm text-gray-600">({course.reviews})</span>
                    </div>
                  </div>
                  {/* Price */}
                  <span className="text-lg font-bold text-orange-600">Miễn phí</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>


    </div >
  );
};

export default Homepage;