import React from 'react';
import { Layout, Card, Button, Row, Col, Space, Avatar, Rate } from 'antd';
import { RightOutlined, UserOutlined } from '@ant-design/icons';
import javascriptBg from '../../assets/images/course/javascript.png';

const { Content } = Layout;

const MainContent = () => {
  // Dữ liệu giả định cho các khóa học
  const courses = [
    {
      title: 'JavaScript Pro',
      subtitle: 'Cho người mới bắt đầu',
      author: 'Dương Đức Phương',
      rating: 5,
      reviews: 1,
      price: 'Miễn phí',
      backgroundImage: `url(${javascriptBg})`
    },
    {
      title: 'HTML, CSS Pro',
      subtitle: 'Cho người mới bắt đầu',
      author: 'Dương Đức Phương',
      rating: 0,
      reviews: 0,
      price: '10.000 VND',
      oldPrice: '20.000 VND',
      bgColor: 'linear-gradient(to right, #007bff, #0056b3)' // Gradient xanh dương
    },
    {
        title: 'HTML, CSS Pro',
        subtitle: 'Cho người mới bắt đầu',
        author: 'Dương Đức Phương',
        rating: 0,
        reviews: 0,
        price: 'Miễn phí',
        bgColor: 'linear-gradient(to right, #007bff, #0056b3)'
    },
    {
        title: 'WSL Ubuntu',
        subtitle: 'Windows Terminal',
        author: 'Dương Đức Phương',
        rating: 5,
        reviews: 1,
        price: 'Miễn phí',
        bgColor: 'linear-gradient(to right, #800080, #6a0dad)' // Gradient tím
    },
    {
        title: 'JavaScript Pro',
        subtitle: 'Cho người mới bắt đầu',
        author: 'Dương Đức Phương',
        rating: 5,
        reviews: 1,
        price: 'Miễn phí',
        bgColor: 'linear-gradient(to right, #ffc107, #fd7e14)'
    },
    {
        title: 'Node & ExpressJS',
        subtitle: 'nodedev',
        author: 'Dương Đức Phương',
        rating: 0,
        reviews: 0,
        price: '438.999 VND',
        oldPrice: '999.000 VND',
        bgColor: 'linear-gradient(to right, #28a745, #1e7e34)' // Gradient xanh lá
    },
    {
        title: 'Kiến Thức Nền Tảng',
        subtitle: 'Kiến thức nhập môn IT',
        author: 'Dương Đức Phương',
        rating: 0,
        reviews: 0,
        price: '8.888 VND',
        oldPrice: '9.999 VND',
        bgColor: 'linear-gradient(to right, #ff69b4, #c71585)' // Gradient hồng
    },
    {
        title: 'HTML, CSS',
        subtitle: 'từ zero đến hero',
        author: 'Dương Đức Phương',
        rating: 0,
        reviews: 0,
        price: '2.000 VND',
        bgColor: 'linear-gradient(to right, #4682b4, #366792)' // Gradient xanh thép
    },
  ];

  return (
    <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
      {/* Giới thiệu và bộ lọc */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.5em', marginBottom: 8 }}>Khám phá các khóa học do các chuyên gia giàu kinh nghiệm trong ngành giảng dạy.</h3>
        <Space size={[8, 16]} wrap style={{ marginBottom: 24 }}>
          <Button type="primary">Tất cả</Button>
          <Button>Frontend</Button>
          <Button>Dành cho người mới</Button>
          <Button>Fullstack</Button>
          <Button>Backend</Button>
        </Space>

        <Row gutter={[24, 24]}>
          {courses.map((course, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                hoverable
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: course.bgColor, 
                  color: '#fff',
                  padding: 0,
                  height: 270, 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                styles={{ body: { padding: 0 } }}
              >
                <div style={{ padding: '16px 24px', flexGrow: 1 }}>
                    <p style={{ color: '#eee', margin: '0 0 8px 0' }}>{course.subtitle}</p> {/* Đổi vị trí subtitle */}
                    <h4 style={{ color: '#fff', fontSize: '1.4em', margin: 0 }}>{course.title}</h4>
                </div>
                <div style={{ background: '#fff', padding: '16px 24px', color: '#333' }}>
                    <p style={{ fontSize: '0.9em', color: '#777', margin: '0 0 4px 0' }}>Khoá học mới</p>
                    <p style={{ fontSize: '0.8em', color: '#777', margin: '0 0 4px 0' }}>Đặng bởi {course.author}</p>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4, marginBottom: 8 }}>
                        <Rate disabled defaultValue={course.rating} allowHalf count={5} style={{ fontSize: 14 }} />
                        <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#777' }}>
                            ({course.reviews} đánh giá)
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#000' }}>
                            {course.price}
                        </span>
                        {course.oldPrice && (
                            <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: 8 }}>
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
        <div style={{ textAlign: 'right', marginTop: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <span style={{ marginRight: 16 }}>Số khóa học mỗi trang: 8</span>
            <Button.Group>
                <Button disabled icon={<RightOutlined rotate={180} />} />
                <Button>1-8 of 9</Button>
                <Button icon={<RightOutlined />} />
            </Button.Group>
        </div>
      </div>
    </Content>
  );
};

export default MainContent;