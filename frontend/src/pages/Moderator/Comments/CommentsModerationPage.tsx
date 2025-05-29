import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Button,
  Popconfirm,
  message,
  Space,
} from "antd";
import { SearchOutlined, EyeInvisibleOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";

const { Option } = Select;

const CommentStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  HIDDEN: "hidden",
} as const;

type CommentStatus = typeof CommentStatus[keyof typeof CommentStatus];


interface Comment {
  id: string;
  content: string;
  userName: string;
  postTitle: string;
  status: CommentStatus;
  createdAt: string;
}

// Mock API data (replace with real API call)
const mockComments: Comment[] = [
  {
    id: "1",
    content: "Khóa học rất bổ ích!",
    userName: "Nguyễn Văn A",
    postTitle: "React Cơ bản",
    status: CommentStatus.PENDING,
    createdAt: "2025-05-29T10:00:00",
  },
  {
    id: "2",
    content: "Không hiểu lắm phần Redux.",
    userName: "Trần Thị B",
    postTitle: "State Management",
    status: CommentStatus.APPROVED,
    createdAt: "2025-05-28T08:30:00",
  },
];

const statusColors = {
  [CommentStatus.PENDING]: "orange",
  [CommentStatus.APPROVED]: "green",
  [CommentStatus.HIDDEN]: "red",
};

const CommentsModerationPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filtered, setFiltered] = useState<Comment[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    setComments(mockComments); // Replace with fetch API
    setFiltered(mockComments);
  }, []);

  useEffect(() => {
    let result = [...comments];
    if (searchText) {
      result = result.filter((c) =>
        c.content.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    setFiltered(result);
  }, [searchText, statusFilter, comments]);

  const handleApprove = (id: string) => {
    updateStatus(id, CommentStatus.APPROVED);
  };

  const handleHide = (id: string) => {
    updateStatus(id, CommentStatus.HIDDEN);
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    message.success("Đã xóa bình luận.");
  };

  const updateStatus = (id: string, status: CommentStatus) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    message.success(`Đã cập nhật trạng thái: ${status}`);
  };

  const columns = [
    {
      title: "Người bình luận",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      render: (text: string) => (
        <div className="max-w-[250px] truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: "Bài viết",
      dataIndex: "postTitle",
      key: "postTitle",
      render: (text: string) => (
        <a className="text-blue-600 hover:underline">{text}</a>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: CommentStatus) => (
        <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleString("vi-VN", {
          hour12: false,
        }),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Comment) => (
        <Space>
          {record.status !== CommentStatus.APPROVED && (
            <Button
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
              size="small"
            />
          )}
          {record.status !== CommentStatus.HIDDEN && (
            <Button
              icon={<EyeInvisibleOutlined />}
              onClick={() => handleHide(record.id)}
              size="small"
              danger
            />
          )}
          <Popconfirm
            title="Xác nhận xóa bình luận này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Quản lý bình luận</h2>

      <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
        <Input
          placeholder="Tìm kiếm nội dung..."
          prefix={<SearchOutlined />}
          className="w-full md:w-1/2"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          className="w-full md:w-1/4"
          placeholder="Lọc theo trạng thái"
          allowClear
          value={statusFilter || undefined}
          onChange={(val) => setStatusFilter(val)}
        >
          <Option value={CommentStatus.PENDING}>Chờ duyệt</Option>
          <Option value={CommentStatus.APPROVED}>Đã duyệt</Option>
          <Option value={CommentStatus.HIDDEN}>Đã ẩn</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default CommentsModerationPage;
