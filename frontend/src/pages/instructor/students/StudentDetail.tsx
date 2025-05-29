import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, List, Progress, Tag } from "antd";

const StudentDetail = () => {
  const { id } = useParams();
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch từ API
    setProgress({
      student: { name: "Nguyễn Văn A", email: "a@gmail.com" },
      course: { title: "React từ A-Z" },
      sections: [
        {
          title: "Giới thiệu",
          lessons: [
            { title: "Cài đặt môi trường", is_completed: true },
            { title: "Tạo project", is_completed: true },
          ],
        },
        {
          title: "Component cơ bản",
          lessons: [
            { title: "Functional component", is_completed: false },
            { title: "Props & State", is_completed: false },
          ],
        },
      ],
    });
  }, [id]);

  if (!progress) return null;

  const totalLessons = progress.sections.flatMap((s: { lessons: any; }) => s.lessons).length;
  const completedLessons = progress.sections.flatMap((s: { lessons: any[]; }) =>
    s.lessons.filter((l) => l.is_completed)
  ).length;

  const percent = Math.round((completedLessons / totalLessons) * 100);

  return (
    <Card
      title={`Học viên: ${progress.student.name}`}
      extra={<Tag color="blue">{progress.course.title}</Tag>}
    >
      <p>Email: {progress.student.email}</p>
      <p>Tiến độ tổng thể: <Progress percent={percent} /></p>

      <h3>Chi tiết bài học:</h3>
      {progress.sections.map((section: any, i: number) => (
        <Card key={i} title={section.title} className="mb-4">
          <List
            dataSource={section.lessons}
            renderItem={(lesson: any) => (
              <List.Item>
                <List.Item.Meta
                  title={lesson.title}
                  description={
                    lesson.is_completed ? (
                      <Tag color="green">Đã hoàn thành</Tag>
                    ) : (
                      <Tag color="red">Chưa học</Tag>
                    )
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}
    </Card>
  );
};

export default StudentDetail;
