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
import { SearchOutlined, EyeInvisibleOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { fetchComments, updateCommentStatus, deleteComment } from '../../../services/commentModerationService';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getComments = async () => {
      setLoading(true);
      try {
        const res = await fetchComments();
        console.log("API comments:", res.data.data);
        setComments(res.data.data.map((c: any) => ({
          id: c?._id || Math.random().toString(36).slice(2),
          content: c?.content || "",
          userName: c?.author?.fullname || c?.author?.nickname || 'Ẩn danh',
          postTitle: c?.blog?.title || 'Không rõ',
          status: c?.status || 'pending',
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
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    setFiltered(result);
  }, [searchText, statusFilter, comments]);

  const handleApprove = async (id: string) => {
    try {
      await updateCommentStatus(id, CommentStatus.APPROVED);
      setComments(prev => prev.map(c => c.id === id ? { ...c, status: CommentStatus.APPROVED } : c));
      message.success('Đã duyệt bình luận.');
    } catch {
      message.error('Lỗi duyệt bình luận.');
    }
  };

  const handleHide = async (id: string) => {
    try {
      await updateCommentStatus(id, CommentStatus.HIDDEN);
      setComments(prev => prev.map(c => c.id === id ? { ...c, status: CommentStatus.HIDDEN } : c));
      message.success('Đã ẩn bình luận.');
    } catch {
      message.error('Lỗi ẩn bình luận.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
      message.success('Đã xóa bình luận.');
    } catch {
      message.error('Lỗi xóa bình luận.');
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: CommentStatus) => (
        <Tag color={statusColors[status]} style={{ margin: 0 }}>{status.toUpperCase()}</Tag>
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
          {record.status !== CommentStatus.APPROVED && (
            <Popconfirm
              title="Xác nhận duyệt bình luận này?"
              onConfirm={() => handleApprove(record.id)}
              okText="Duyệt"
              cancelText="Hủy"
            >
              <Button
                icon={<CheckCircleOutlined />}
                size="small"
                type="primary"
              />
            </Popconfirm>
          )}
          {record.status !== CommentStatus.HIDDEN && (
            <Popconfirm
              title="Xác nhận ẩn bình luận này?"
              onConfirm={() => handleHide(record.id)}
              okText="Ẩn"
              cancelText="Hủy"
            >
              <Button
                icon={<EyeInvisibleOutlined />}
                size="small"
                danger
              />
            </Popconfirm>
          )}
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

  // Thống kê số lượng bình luận theo trạng thái
  const total = comments.length;
  const pending = comments.filter(c => c.status === CommentStatus.PENDING).length;
  const approved = comments.filter(c => c.status === CommentStatus.APPROVED).length;
  const hidden = comments.filter(c => c.status === CommentStatus.HIDDEN).length;

  return (
    <div className="p-4 bg-white ">
      <h2 className="text-xl font-semibold mb-4">Quản lý bình luận</h2>
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} sm={6}>
          <Card><Statistic title="Tổng số bình luận" value={total} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Chờ duyệt" value={pending} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Đã duyệt" value={approved} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Đã ẩn" value={hidden} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
      </Row>
      <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
        <Input
          placeholder="Tìm kiếm tiêu đề..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 240 }}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          value={statusFilter || undefined}
          onChange={val => setStatusFilter(val)}
          style={{ width: 180 }}
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
