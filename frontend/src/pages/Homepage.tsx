import React from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Button, 
  Rate, 
  Tag, 
  Image
} from 'antd';
import { 
  PlayCircleOutlined, 
  BookOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import javascriptBg from '../assets/images/course/javascript.png';
import htmlCssBg from '../assets/images/course/htmlcsspro.png';
import wslUbuntuBg from '../assets/images/course/nhapmonit.png';
import nodeExpressBg from '../assets/images/course/nodejs.png';
import basicItBg from '../assets/images/course/react.png';
import '../styles/courseCard.css';

const { Title, Text } = Typography;

export const courses = [
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

const freeCourses = courses; 
const articles = [1, 2, 3, 4, 5]; 
const videos = [1, 2, 3, 4, 5]; 

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
              <Card
                className="course-card"
                hoverable
                cover={<Image src={course.Image} alt={course.title} />}
                actions={[
                  <Rate value={course.rating} disabled allowHalf style={{ color: '#ff9900' }} />,
                  <Text type="secondary">{course.reviews} đánh giá</Text>
                ]}
              >
                <Card.Meta
                  title={course.title}
                  description={course.subtitle}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{course.price}</Text>
                  {course.price === 'Miễn phí' ? (
                    <Tag color="green">Miễn phí</Tag>
                  ) : course.oldPrice ? (
                    <Text type="secondary" delete>
                      {course.oldPrice}
                    </Text>
                  ) : null}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
     
    </div>
  );
};

export default Homepage;