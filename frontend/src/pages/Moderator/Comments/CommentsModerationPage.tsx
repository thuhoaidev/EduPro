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
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import { SearchOutlined, EyeInvisibleOutlined, DeleteOutlined } from "@ant-design/icons";
import { fetchComments, updateCommentStatus, deleteComment } from '../../../services/commentModerationService';

const { Option } = Select;

interface Comment {
  id: string;
  content: string;
  userName: string;
  postTitle: string;
  createdAt: string;
}

const CommentsModerationPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filtered, setFiltered] = useState<Comment[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getComments = async () => {
      setLoading(true);
      try {
        const res = await fetchComments();
        setComments(res.data.data.map((c: any) => ({
          id: c?._id || Math.random().toString(36).slice(2),
          content: c?.content || "",
          userName: c?.author?.fullname || c?.author?.nickname || 'Ẩn danh',
          postTitle: c?.blog?.title || 'Không rõ',
          createdAt: c?.createdAt || '',
        })));
      } catch (err) {
        message.error('Lỗi tải danh sách bình luận');
      } finally {
        setLoading(false);
      }
    };
    getComments();
  }, []);

  useEffect(() => {
    let result = [...comments];
    if (searchText) {
      result = result.filter((c) =>
        c.content.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFiltered(result);
  }, [searchText, comments]);

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
      message.success('Đã xóa bình luận.');
    } catch {
      message.error('Lỗi xóa bình luận.');
    }
  };

  const updateStatus = async (id: string, status: "approved" | "hidden") => {
    try {
      await updateCommentStatus(id, status);
      setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      message.success(`Đã ${status === 'approved' ? 'duyệt' : 'ẩn/từ chối'} bình luận.`);
    } catch {
      message.error('Lỗi cập nhật trạng thái bình luận.');
    }
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
      align: "center" as const,
      render: (_: any, record: Comment) => (
        <Space size="small">
          <Button
            danger
            size="small"
            onClick={() => updateStatus(record.id, "hidden")}
            icon={<EyeInvisibleOutlined />}
          >
            Ẩn
          </Button>
          <Popconfirm
            title="Xác nhận xóa bình luận này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white ">
      <h2 className="text-xl font-semibold mb-4">Quản lý bình luận</h2>
      <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
        <Input
          placeholder="Tìm kiếm nội dung bình luận..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 240 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        pagination={{ pageSize: 10, showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bình luận` }}
        className="users-table"
        loading={loading}
      />
      <style>{`
        .users-table .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          color: #1f2937;
        }
        .users-table .ant-table-tbody > tr:hover > td {
          background: #f5f7fa;
        }
        .users-table .ant-table-tbody > tr > td {
          padding: 12px 8px;
        }
        .ant-tag {
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default CommentsModerationPage;
