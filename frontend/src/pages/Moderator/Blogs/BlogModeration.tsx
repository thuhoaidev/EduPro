import { Table, Button, Tag, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

export interface BlogPost {
  id: number;
  title: string;
  author: string;
  status: "pending" | "approved" | "hidden";
  createdAt: string;
}
// Fake blog data

const fakeBlogs: BlogPost[] = [
  {
    id: 1,
    title: "Học lập trình React từ cơ bản đến nâng cao",
    author: "Nguyễn Văn A",
    status: "pending",
    createdAt: "2024-05-01",
  },
  {
    id: 2,
    title: "Kinh nghiệm học Web hiệu quả",
    author: "Trần Thị B",
    status: "approved",
    createdAt: "2024-05-10",
  },
  {
    id: 3,
    title: "10 plugin VSCode giúp lập trình nhanh hơn",
    author: "Phạm Văn C",
    status: "hidden",
    createdAt: "2024-05-12",
  },
];

const BlogModeration = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>(fakeBlogs);

  const updateStatus = (id: number, newStatus: "approved" | "hidden") => {
    setBlogs((prev) =>
      prev.map((blog) =>
        blog.id === id ? { ...blog, status: newStatus } : blog
      )
    );
    message.success(
      `Bài viết đã được ${newStatus === "approved" ? "duyệt" : "ẩn"} thành công`
    );
  };

  const columns: ColumnsType<BlogPost> = [
    {
      title: "#",
      dataIndex: "id",
      width: 50,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        let color = "default";
        if (status === "approved") color = "green";
        else if (status === "pending") color = "orange";
        else if (status === "hidden") color = "red";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          {record.status !== "approved" && (
            <Button
              type="primary"
              size="small"
              onClick={() => updateStatus(record.id, "approved")}
            >
              Duyệt
            </Button>
          )}
          {record.status !== "hidden" && (
            <Button
              danger
              size="small"
              onClick={() => updateStatus(record.id, "hidden")}
            >
              Ẩn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Duyệt bài viết Blog</h2>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={blogs}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default BlogModeration;
