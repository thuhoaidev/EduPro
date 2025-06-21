import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Rate, Tag, Image, Space, Divider, Statistic, Tabs, Spin, message } from "antd";
import {
  PlayCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ReadOutlined,
  TrophyOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import "../styles/courseCard.css";
import { courseService, type Course } from '../services/apiService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

const Homepage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState({
    courses: true,
    testimonials: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
        
        // Fetch testimonials (using the blog comments endpoint)
        const response = await fetch('http://localhost:5000/api/blogs/68547db672358427a53d9ece/comments');
        const commentsData = await response.json();
        
        const mappedTestimonials = commentsData.data.map((comment: any) => ({
          name: comment.user?.name || 'Ẩn danh',
          role: `Học viên khóa ${comment.course?.title || 'EduPro'}`,
          content: comment.content,
          rating: comment.rating || 5
        }));
        
        setTestimonials(mappedTestimonials);
      } catch (err) {
        message.error('Có lỗi xảy ra khi tải dữ liệu');
        console.error('Fetch error:', err);
      } finally {
        setLoading({ courses: false, testimonials: false });
      }
    };

    fetchData();
  }, []);

  // Filter courses
  const freeCourses = courses.filter((course) => course.price === "Miễn phí");
  const paidCourses = courses.filter((course) => course.price !== "Miễn phí");
  const popularCourses = [...courses].sort(() => Math.random() - 0.5).slice(0, 4);

  if (loading.courses || loading.testimonials) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div
        className="hero-section"
        style={{
          background: "linear-gradient(135deg, #1a73e8 0%, #34a853 100%)",
          borderRadius: "16px",
          padding: "48px 32px",
          marginBottom: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            zIndex: 1,
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "15%",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            zIndex: 1,
          }}
        ></div>

        <Row>
          <Col xs={24} md={14} lg={12}>
            <Title level={1} style={{ color: "white", fontSize: "42px", marginBottom: "16px" }}>
              Học trực tuyến với EduPro
            </Title>
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "18px", marginBottom: "32px" }}>
              Khám phá hàng ngàn khóa học chất lượng cao từ các giảng viên hàng đầu. Nâng cao kỹ năng và mở rộng cơ hội
              nghề nghiệp của bạn.
            </Paragraph>
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                style={{
                  background: "white",
                  borderColor: "white",
                  color: "#1a73e8",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: 500,
                  padding: "0 24px",
                }}
              >
                Bắt đầu học ngay
              </Button>
              <Button
                ghost
                size="large"
                style={{
                  borderColor: "white",
                  color: "white",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: 500,
                  padding: "0 24px",
                }}
              >
                <PlayCircleOutlined /> Xem giới thiệu
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Stats Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: "48px" }}>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ textAlign: "center", borderRadius: "12px", background: "#f5f7fa" }}>
            <Statistic
              title="Học viên"
              value={1200}
              prefix={<UserOutlined />}
              suffix="+"
              valueStyle={{ color: "#1a73e8", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ textAlign: "center", borderRadius: "12px", background: "#f5f7fa" }}>
            <Statistic
              title="Khóa học"
              value={50}
              prefix={<ReadOutlined />}
              suffix="+"
              valueStyle={{ color: "#1a73e8", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ textAlign: "center", borderRadius: "12px", background: "#f5f7fa" }}>
            <Statistic
              title="Giảng viên"
              value={12}
              prefix={<TrophyOutlined />}
              suffix="+"
              valueStyle={{ color: "#1a73e8", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ textAlign: "center", borderRadius: "12px", background: "#f5f7fa" }}>
            <Statistic
              title="Đánh giá tích cực"
              value={98}
              prefix={<LikeOutlined />}
              suffix="%"
              valueStyle={{ color: "#1a73e8", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Courses Section with Tabs */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ fontSize: "32px", marginBottom: "8px" }}>
            Khóa học
          </Title>
          <Text type="secondary">Khám phá các khóa học phù hợp với bạn</Text>
        </div>

        <Tabs defaultActiveKey="free" size="large" style={{ marginBottom: "24px" }}>
          <TabPane tab="Miễn phí" key="free">
            <Row gutter={[24, 24]}>
              {freeCourses.map((course, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <CourseCard course={course} />
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Button type="default" size="large">
                Xem tất cả khóa học miễn phí
              </Button>
            </div>
          </TabPane>
          <TabPane tab="Phổ biến" key="popular">
            <Row gutter={[24, 24]}>
              {popularCourses.map((course, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <CourseCard course={course} />
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Button type="default" size="large">
                Xem tất cả khóa học phổ biến
              </Button>
            </div>
          </TabPane>
          <TabPane tab="Có phí" key="paid">
            <Row gutter={[24, 24]}>
              {paidCourses.map((course, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <CourseCard course={course} />
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Button type="default" size="large">
                Xem tất cả khóa học có phí
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* Testimonials Section */}
      <div
        style={{
          marginBottom: "48px",
          background: "#f5f7fa",
          padding: "48px 32px",
          borderRadius: "16px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={2} style={{ fontSize: "32px", marginBottom: "16px" }}>
            Học viên nói gì về chúng tôi
          </Title>
          <Text type="secondary" style={{ fontSize: "16px", maxWidth: "700px", display: "block", margin: "0 auto" }}>
            Khám phá trải nghiệm học tập từ các học viên đã tham gia khóa học của EduPro
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {testimonials.map((testimonial, index) => (
            <Col xs={24} md={8} key={index}>
              <Card bordered={false} style={{ height: "100%", borderRadius: "12px" }}>
                <Space direction="vertical" size="middle">
                  <Rate value={testimonial.rating} disabled />
                  <Paragraph style={{ fontSize: "16px" }}>"{testimonial.content}"</Paragraph>
                  <Space align="center">
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "#1a73e8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <Text strong>{testimonial.name}</Text>
                      <br />
                      <Text type="secondary">{testimonial.role}</Text>
                    </div>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a73e8 0%, #34a853 100%)",
          borderRadius: "16px",
          padding: "48px 32px",
          marginBottom: "48px",
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ color: "white", fontSize: "32px", marginBottom: "16px" }}>
          Sẵn sàng bắt đầu hành trình học tập?
        </Title>
        <Paragraph
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "16px",
            marginBottom: "32px",
            maxWidth: "700px",
            margin: "0 auto 32px",
          }}
        >
          Tìm hiểu ngay hôm nay để truy cập vào kho tàng kiến thức và kỹ năng công nghệ mới nhất
        </Paragraph>
        <Space size="middle">
          <Button
            ghost
            size="large"
            style={{
              borderColor: "white",
              color: "white",
              height: "48px",
              fontSize: "16px",
              fontWeight: 500,
              padding: "0 24px",
            }}
          >
            Tìm hiểu thêm
          </Button>
        </Space>
      </div>
    </div>
  );
};

// Enhanced Course Card Component
const CourseCard = ({ course }: { course: Course }) => {
  return (
    <Card
      className="course-card"
      hoverable
      cover={
        <div style={{ position: "relative" }}>
          <Image
            src={course.Image || "/placeholder.svg"}
            alt={course.title}
            preview={false}
            style={{ height: "180px", objectFit: "cover" }}
          />
          {course.price === "Miễn phí" ? (
            <Tag
              color="success"
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                fontSize: "12px",
                padding: "0 8px",
                borderRadius: "4px",
              }}
            >
              Miễn phí
            </Tag>
          ) : course.oldPrice ? (
            <Tag
              color="processing"
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                fontSize: "12px",
                padding: "0 8px",
                borderRadius: "4px",
              }}
            >
              Giảm giá
            </Tag>
          ) : null}
        </div>
      }
      bodyStyle={{ padding: "16px" }}
    >
      <div className="course-info">
        <div className="course-meta">
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Typography.Title
              level={4}
              className="course-title"
              style={{
                fontSize: "18px",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {course.title}
            </Typography.Title>
            <Typography.Text
              className="course-subtitle"
              type="secondary"
              style={{
                display: "block",
                marginBottom: "8px",
              }}
            >
              {course.subtitle}
            </Typography.Text>
            <Space size="small" align="center" style={{ marginBottom: "8px" }}>
              <Rate value={course.rating} disabled allowHalf style={{ fontSize: "14px", color: "#ff9900" }} />
              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                ({course.reviews} đánh giá)
              </Typography.Text>
            </Space>
            <Space size="middle" align="center" style={{ fontSize: "13px", color: "#666" }}>
              <Typography.Text>
                <ClockCircleOutlined style={{ marginRight: "4px" }} /> {course.duration || "15 giờ học"}
              </Typography.Text>
              <Typography.Text>
                <BookOutlined style={{ marginRight: "4px" }} /> {course.lessons || 30} bài học
              </Typography.Text>
            </Space>
          </Space>
        </div>
        <Divider style={{ margin: "12px 0" }} />
        <div
          className="course-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space size="small" align="center">
            <Typography.Text strong style={{ fontSize: "16px" }}>
              {course.price}
            </Typography.Text>
            {course.oldPrice && (
              <Typography.Text type="secondary" delete style={{ fontSize: "12px" }}>
                {course.oldPrice}
              </Typography.Text>
            )}
          </Space>
          <Button type="link" style={{ padding: "0", fontSize: "14px" }}>
            Chi tiết
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Homepage;