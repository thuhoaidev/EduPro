import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Tag, Collapse, List, Typography, Spin, Badge } from "antd";
import { PlayCircleOutlined, VideoCameraOutlined } from "@ant-design/icons";

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

  if (loading || !course) return <Spin tip="Đang tải khóa học..." />;

  const totalDuration = course.sections.reduce((sum, section) => {
    return (
      sum +
      section.lessons.reduce((sec, lesson) => sec + (lesson.video?.duration || 0), 0)
    );
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Card
        cover={
          <img
            alt={course.title}
            src={course.thumbnail}
            className="object-cover h-64 w-full"
          />
        }
      >
        <Title level={2}>{course.title}</Title>
        <Paragraph>{course.description}</Paragraph>
        <div className="flex flex-wrap gap-2 mb-2">
          <Tag color="blue">{course.category.name}</Tag>
          <Tag color="gold">Trình độ: {course.level}</Tag>
          <Tag color="purple">Ngôn ngữ: {course.language}</Tag>
        </div>
        <div className="flex items-center gap-3 text-lg">
          <span className="line-through text-gray-400">{course.price.toLocaleString()}đ</span>
          <span className="text-red-500 font-semibold text-xl">{course.discount.toLocaleString()}đ</span>
        </div>
      </Card>

      {/* Yêu cầu */}
      <Card title="Yêu cầu trước khi học">
        <List
          dataSource={course.requirements}
          renderItem={(item) => <List.Item>- {item}</List.Item>}
        />
      </Card>

      {/* Chương trình học */}
      <Card title={`Chương trình học (${formatDuration(totalDuration)})`}>
        <Collapse accordion>
          {course.sections.map((section) => (
            <Panel header={section.title} key={section.id}>
              <List
                dataSource={section.lessons}
                renderItem={(lesson) => (
                  <List.Item>
                    <VideoCameraOutlined className="mr-2" />
                    {lesson.title}
                    {lesson.is_preview && (
                      <Badge className="ml-auto" color="green" text="Xem trước" />
                    )}
                    {lesson.video?.duration && (
                      <span className="ml-4 text-gray-500">
                        ({formatDuration(lesson.video.duration)})
                      </span>
                    )}
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      </Card>
    </div>
  );
};

export default CourseDetail;
