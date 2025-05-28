import React from 'react';
import { Layout, Card, Button, Row, Col, Space, Rate } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';

// Đảm bảo đường dẫn tới các file ảnh này là chính xác
import javascriptBg from '../assets/images/course/javascript.png';
import htmlCssBg from '../assets/images/course/htmlcsspro.png';
import wslUbuntuBg from '../assets/images/course/nhapmonit.png';
import nodeExpressBg from '../assets/images/course/nodejs.png';
import basicItBg from '../assets/images/course/react.png';

const { Content } = Layout;

const courses = [
  {
    title: 'JavaScript Pro', // Thêm Title
    subtitle: 'Nâng cao',   // Thêm Subtitle
    author: 'Dương Đức Phương',
    rating: 5,
    reviews: 1,
    price: 'Miễn phí',
    Image: javascriptBg, // Đã sửa thành "Image"
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
    Image: htmlCssBg, // Đã sửa thành "Image"
    type: 'HTML/CSS',
  },
  {
    title: 'HTML/CSS Cơ Bản',
    subtitle: 'Nhập môn',
    author: 'Dương Đức Phương',
    rating: 0,
    reviews: 0,
    price: 'Miễn phí',
    Image: htmlCssBg, // Đã sửa thành "Image"
    type: 'HTML/CSS',
  },
  {
    title: 'Nhập Môn IT',
    subtitle: 'WSL Ubuntu',
    author: 'Dương Đức Phương',
    rating: 5,
    reviews: 1,
    price: 'Miễn phí',
    Image: wslUbuntuBg, // Đã sửa thành "Image"
    type: 'DevOps',
  },
  {
    title: 'React Cơ Bản',
    subtitle: 'Frontend',
    author: 'Dương Đức Phương',
    rating: 5,
    reviews: 1,
    price: 'Miễn phí',
    Image: javascriptBg, // Đã sửa thành "Image"
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
    Image: nodeExpressBg, // Đã sửa thành "Image"
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
    Image: basicItBg, // Đã sửa thành "Image"
    type: 'Basic IT',
  },
  {
    title: 'CSS Nâng Cao',
    subtitle: 'Kỹ thuật Styling',
    author: 'Dương Đức Phương',
    rating: 0,
    reviews: 0,
    price: '2.000 VND',
    Image: htmlCssBg, // Đã sửa thành "Image"
    type: 'HTML/CSS',
  },
];

const Homepage = () => {
  const currentBannerCourse = {
    title: 'JavaScript Pro',
    description:
      'JavaScript nâng cao tập trung vào các khái niệm như closure, hoisting, promises, async/await, prototype, inheritance, modules, event loop, và higher-order functions.',
    imageUrl: 'https://cdn.pixabay.com/photo/2023/12/03/17/37/girl-8427958_1280.jpg',
    bannerBg: 'linear-gradient(to right, #9370DB, #BF40BF)',
  };

  return (
    <Content className="m-6 overflow-initial">
      {/* Large Banner Section */}
      <div
        className="relative mb-10 flex min-h-[250px] items-center justify-between rounded-2xl p-8 shadow-xl"
        style={{
          background: currentBannerCourse.bannerBg,
        }}
      >
        <div className="relative z-10 max-w-[60%] text-white">
          <h1 className="mb-4 text-5xl font-bold leading-tight">
            {currentBannerCourse.title}
          </h1>
          <p className="mb-6 text-lg leading-relaxed">
            {currentBannerCourse.description}
          </p>
          <Button
            type="primary"
            className="rounded-full bg-[#00D1C1] px-8 py-3 text-lg font-bold shadow-md hover:bg-[#00B2A3] border-[#00D1C1]"
            style={{ height: 48 }}
          >
            Học Ngay Nào
          </Button>
        </div>
        <div className="absolute right-10 top-1/2 z-0 -translate-y-1/2">
          <img
            src={currentBannerCourse.imageUrl}
            alt="Course Illustration"
            className="h-52 w-52 rounded-full object-cover shadow-md"
          />
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-white opacity-70" />
          <div className="h-2.5 w-2.5 rounded-full bg-white opacity-30" />
          <div className="h-2.5 w-2.5 rounded-full bg-white opacity-30" />
        </div>
      </div>

      {/* Course Listing Section */}
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-gray-800">
          Các khóa học để bạn bắt đầu
        </h3>
        <p className="mb-6 text-base text-gray-600">
          Khám phá các khóa học do các chuyên gia giàu kinh nghiệm trong ngành giảng dạy.
        </p>
        <Space size={[8, 16]} wrap className="mb-6">
          <Button type="primary" className="rounded-full px-5 py-2 font-bold" style={{ height: 36 }}>
            Tất cả
          </Button>
          <Button className="rounded-full px-5 py-2 font-bold" style={{ height: 36 }}>
            Frontend
          </Button>
          <Button className="rounded-full px-5 py-2 font-bold" style={{ height: 36 }}>
            Dành cho người mới
          </Button>
          <Button className="rounded-full px-5 py-2 font-bold" style={{ height: 36 }}>
            Fullstack
          </Button>
          <Button className="rounded-full px-5 py-2 font-bold" style={{ height: 36 }}>
            Backend
          </Button>
        </Space>

        <Row gutter={[24, 24]}>
          {courses.map((course, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                hoverable
                // Đổi lại h-[280px] để có đủ không gian cho cả ảnh và nội dung
                className="h-[280px] overflow-hidden rounded-xl p-0 shadow-lg"
                bodyStyle={{ padding: 0 }}
              >
                {/* PHẦN TRÊN CỦA CARD - CHỈ HIỂN THỊ ẢNH */}
                <div className="relative h-1/2 w-full overflow-hidden"> {/* Đảm bảo div này có chiều cao */}
                  <img
                    src={course.Image} // Sử dụng course.Image
                    alt={course.title}
                    className="absolute inset-0 h-full w-full object-cover" // Ảnh phủ toàn bộ div cha
                  />
                  {/* Lớp phủ gradient để chữ dễ đọc hơn nếu có */}
                  <div
                    className="absolute inset-0 z-0"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 223, 0, 0.2) 0%, rgba(255, 140, 0, 0.4) 100%)',
                    }}
                  />
                  {/* Bạn có thể đặt title/subtitle ngay trên ảnh nếu muốn, nhưng yêu cầu là "ảnh rồi thông tin bên dưới" */}
                  {/* Nếu muốn hiển thị text trên ảnh, hãy thêm các p/h4 ở đây với z-index cao hơn lớp phủ và có thuộc tính text-white */}
                  {/*
                  <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-base font-bold text-yellow-300">
                      {course.subtitle}
                  </p>
                  <h4 className="absolute top-[calc(50%+20px)] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-3xl font-bold leading-tight text-white">
                      {course.title}
                  </h4>
                  */}
                </div>

                {/* PHẦN DƯỚI CỦA CARD - THÔNG TIN CHI TIẾT */}
                <div
                  className="flex h-1/2 flex-col justify-between bg-white p-6 text-gray-800"
                >
                  <div>
                    {/* Title và Subtitle hiển thị ở đây, không còn trên ảnh */}
                    <p className="mb-1 text-sm font-bold text-gray-800">
                      {course.title} {/* Hiển thị title ở đây */}
                    </p>
                    <p className="mb-1 text-xs text-gray-600">
                      {course.subtitle} {/* Hiển thị subtitle ở đây */}
                    </p>
                    <p className="mb-2 text-xs text-gray-600">
                      Đặng bởi {course.author}
                    </p>
                    <div className="mb-2 flex items-center">
                      <Rate disabled defaultValue={course.rating} allowHalf count={5} className="text-yellow-500 text-sm" />
                      <span className="ml-2 text-sm text-gray-600">
                        ({course.reviews} đánh giá)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-orange-600">
                      {course.price}
                    </span>
                    {course.oldPrice && (
                      <span className="ml-2 text-gray-400 line-through">
                        {course.oldPrice}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>


        {/* Phân trang */}
        <div className="mt-8 flex items-center justify-end text-right">
          <span className="mr-4 text-gray-600">Số khóa học mỗi trang: 8</span>
          <Button.Group>
            <Button icon={<LeftOutlined />} />
            <Button>1-8 of 9</Button>
            <Button icon={<RightOutlined />} />
          </Button.Group>
        </div>
      </div>
    </Content>
  );
};

export default Homepage;