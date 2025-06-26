import React, { useEffect, useState } from "react";
import { Table, Tag, Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

interface Student {
  id: number;
  name: string;
  email: string;
  course: {
    id: number;
    title: string;
  };
  progress: number;
  registered_at: string;
}

const MyStudentStats: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const mockData: Student[] = [
      {
        id: 1,
        name: "Nguyễn Văn A",
        email: "a@gmail.com",
        course: { id: 101, title: "React từ A-Z" },
        progress: 80,
        registered_at: "2025-04-01",
      },
      {
        id: 2,
        name: "Trần Thị B",
        email: "b@gmail.com",
        course: { id: 102, title: "NodeJS Pro" },
        progress: 45,
        registered_at: "2025-05-15",
      },
    ];
    setStudents(mockData);
  }, []);

  const columns = [
    { title: "Học viên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Khóa học", dataIndex: ["course", "title"], key: "course" },
    { title: "Tiến độ", dataIndex: "progress", key: "progress", render: (progress: number) => (<Tag color={progress >= 80 ? "green" : progress >= 50 ? "orange" : "red"}>{progress}%</Tag>) },
    { title: "Ngày đăng ký", dataIndex: "registered_at", key: "registered_at" },
    { title: "Hành động", key: "action", render: (_: any, record: Student) => (<Button type="link" onClick={() => navigate(`/instructor/students/${record.id}`)}>Xem chi tiết</Button>) },
  ];

  return (
    <Card title="Danh sách học viên">
      <Table columns={columns} dataSource={students} rowKey="id" />
    </Card>
  );
};

export default MyStudentStats; 