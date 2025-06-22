import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Tag, 
  Collapse, 
  List, 
  Typography, 
  Spin, 
  Badge, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Space,
  Divider 
} from "antd";
import { 
  PlayCircleOutlined, 
  VideoCameraOutlined, 
  EditOutlined, 
  BookOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  DollarOutlined 
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

interface CourseDetailData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  language: string;
  price: number;
  discount: number;
  category: {
    name: string;
  };
  requirements: string[];
  sections: {
    id: number;
    title: string;
    lessons: {
      id: number;
      title: string;
      is_preview: boolean;
      video: {
        url: string;
        duration: number;
      } | null;
    }[];
  }[];
}

const mockFetchCourseDetail = async (id: string): Promise<CourseDetailData> => {
  return {
    id: parseInt(id),
    title: "React Cơ Bản",
    description: "Khóa học giúp bạn bắt đầu với React từ con số 0.",
    thumbnail: "https://i.imgur.com/xsKJ4Eh.png",
    level: "beginner",
    language: "Tiếng Việt",
    price: 990000,
    discount: 490000,
    category: { name: "Frontend" },
    requirements: [
      "Biết HTML, CSS cơ bản",
      "Có máy tính kết nối Internet",
    ],
    sections: [
      {
        id: 1,
        title: "Giới thiệu",
        lessons: [
          {
            id: 1,
            title: "Giới thiệu khóa học",
            is_preview: true,
            video: {
              url: "https://example.com/video1.mp4",
              duration: 300,
            },
          },
          {
            id: 2,
            title: "Cài đặt môi trường",
            is_preview: false,
            video: {
              url: "https://example.com/video2.mp4",
              duration: 480,
            },
          },
        ],
      },
      {
        id: 2,
        title: "React Cơ Bản",
        lessons: [
          {
            id: 3,
            title: "Component là gì?",
            is_preview: false,
            video: {
              url: "https://example.com/video3.mp4",
              duration: 600,
            },
          },
        ],
      },
    ],
  };
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}p ${secs}s`;
};

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      mockFetchCourseDetail(id).then((data) => {
        setCourse(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading || !course) return (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <Spin size="large">
        <div style={{ padding: '50px 0' }}>
          <div>Đang tải khóa học...</div>
        </div>
      </Spin>
    </div>
  );

  const totalDuration = course.sections.reduce((sum, section) => {
    return (
      sum +
      section.lessons.reduce((sec, lesson) => sec + (lesson.video?.duration || 0), 0)
    );
  }, 0);

  const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
  const previewLessons = course.sections.reduce(
    (sum, section) => sum + section.lessons.filter(lesson => lesson.is_preview).length,
    0
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết khóa học</h2>
          <p className="text-gray-500 mt-1">Xem và quản lý thông tin chi tiết khóa học</p>
        </div>
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => navigate(`/instructor/courses/${id}/edit`)}
          size="large"
        >
          Chỉnh sửa khóa học
        </Button>
      </div>

      {/* Course Overview */}
      <Card 
        className="shadow-sm mb-6"
        cover={
          <div className="relative h-64">
            <img
              alt={course.title}
              src={course.thumbnail}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <Typography.Title level={2} className="text-white mb-2">
                {course.title}
              </Typography.Title>
              <Space size="middle">
                <Tag color="blue" className="text-base px-3 py-1">
                  {course.category.name}
                </Tag>
                <Tag color="gold" className="text-base px-3 py-1">
                  Trình độ: {course.level}
                </Tag>
                <Tag color="purple" className="text-base px-3 py-1">
                  Ngôn ngữ: {course.language}
                </Tag>
              </Space>
            </div>
          </div>
        }
      >
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Tổng số bài học"
                value={totalLessons}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Bài học xem trước"
                value={previewLessons}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Tổng thời lượng"
                value={formatDuration(totalDuration)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Giá khóa học"
                value={course.discount.toLocaleString()}
                prefix={<DollarOutlined />}
                suffix="VNĐ"
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        <Typography.Paragraph className="text-base text-gray-600">
          {course.description}
        </Typography.Paragraph>

        <div className="flex items-center gap-3 text-lg mt-4">
          <span className="line-through text-gray-400">
            {course.price.toLocaleString()}đ
          </span>
          <span className="text-red-500 font-semibold text-xl">
            {course.discount.toLocaleString()}đ
          </span>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Requirements */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>Yêu cầu trước khi học</span>
              </Space>
            }
            className="shadow-sm h-full"
          >
            <List
              dataSource={course.requirements}
              renderItem={(item) => (
                <List.Item className="hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Course Content */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BookOutlined />
                <span>Chương trình học ({formatDuration(totalDuration)})</span>
              </Space>
            }
            className="shadow-sm h-full"
          >
            <Collapse 
              accordion 
              className="course-content"
              expandIconPosition="end"
            >
              {course.sections.map((section) => (
                <Collapse.Panel 
                  header={
                    <div className="font-medium text-gray-800">
                      {section.title}
                    </div>
                  } 
                  key={section.id}
                >
                  <List
                    dataSource={section.lessons}
                    renderItem={(lesson) => (
                      <List.Item className="hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <VideoCameraOutlined className="text-blue-500" />
                            <span className="text-gray-600">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.is_preview && (
                              <Badge color="green" text="Xem trước" />
                            )}
                            {lesson.video?.duration && (
                              <Tag color="default" className="text-xs">
                                {formatDuration(lesson.video.duration)}
                              </Tag>
                            )}
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Collapse.Panel>
              ))}
            </Collapse>
          </Card>
        </Col>
      </Row>

      {/* Custom styles */}
      <style>
        {`
          .course-content .ant-collapse-item {
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            margin-bottom: 8px;
            overflow: hidden;
          }
          .course-content .ant-collapse-header {
            padding: 12px 16px !important;
            background: #fafafa;
          }
          .course-content .ant-collapse-content {
            border-top: 1px solid #f0f0f0;
          }
          .course-content .ant-list-item {
            padding: 8px 16px;
            border-bottom: 1px solid #f0f0f0;
          }
          .course-content .ant-list-item:last-child {
            border-bottom: none;
          }
        `}
      </style>
    </div>
  );
};

export default CourseDetail;
