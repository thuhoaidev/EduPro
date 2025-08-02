import { Table, Button, Tag, Space, message, Input, Card, Row, Col, Statistic, Popconfirm, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useEffect } from "react";
import { CheckCircleOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { fetchBlogs, updateBlogStatus } from "../../../services/blogModerationService";

export interface BlogPost {
  _id: string;
  title: string;
  author: { _id: string; fullname: string } | string;
  status: "pending" | "approved" | "hidden" | "rejected";
  createdAt: string;
}

const BlogModeration = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rejectModal, setRejectModal] = useState<{visible: boolean, blogId: string | null}>({visible: false, blogId: null});
  const [rejectReason, setRejectReason] = useState("");

  // Thống kê số lượng bài viết theo trạng thái
  const total = blogs.length;
  const pending = blogs.filter(b => b.status === "pending").length;
  const approved = blogs.filter(b => b.status === "approved").length;
  const hidden = blogs.filter(b => b.status === "hidden").length;
  const rejected = blogs.filter(b => b.status === "rejected").length;

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const getBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetchBlogs();
      console.log("API response:", res.data.data);
      setBlogs(res.data.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      message.error("Không thể tải danh sách bài viết!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBlogs();
  }, []);

  const updateStatus = async (_id: string, newStatus: "approved" | "rejected") => {
    try {
      if (newStatus === "rejected") {
        setRejectModal({visible: true, blogId: _id});
        return;
      }
      await updateBlogStatus(_id, newStatus);
      await getBlogs();
      message.success(
        `Bài viết đã được ${newStatus === "approved" ? "duyệt" : "từ chối"} thành công`
      );
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại!");
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
    if (rejectModal.blogId) {
      try {
        await updateBlogStatus(rejectModal.blogId, "rejected", rejectReason);
        setRejectModal({visible: false, blogId: null});
        setRejectReason("");
        await getBlogs();
        message.success("Bài viết đã bị từ chối thành công");
      } catch (err) {
        message.error("Cập nhật trạng thái thất bại!");
        console.error(err);
      }
    }
  };

  const columns: ColumnsType<BlogPost> = [
    {
      title: "#",
      dataIndex: "_id",
      width: 50,
      align: "center",
      render: (_: string, record, idx) => <div className="font-medium text-center">{idx + 1}</div>,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      render: (author) => author?.fullname || "Không rõ",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status) => {
        let color = "default";
        let text = status.toUpperCase();
        if (status === "approved") {
          color = "green";
          text = "ĐÃ DUYỆT";
        } else if (status === "pending") {
          color = "orange";
          text = "CHỜ DUYỆT";
        } else if (status === "hidden") {
          color = "red";
          text = "ĐÃ ẨN";
        } else if (status === "rejected") {
          color = "red";
          text = "TỪ CHỐI";
        }
        return <Tag color={color} style={{ margin: 0 }}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {record.status !== "approved" && (
            <Popconfirm
              title="Xác nhận duyệt bài viết này?"
              onConfirm={() => updateStatus(record._id, "approved")}
              okText="Duyệt"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
              >
                {record.status === "rejected" ? "Duyệt lại" : "Duyệt"}
              </Button>
            </Popconfirm>
          )}
          {record.status !== "rejected" && (
            <Button
              danger
              size="small"
              onClick={() => updateStatus(record._id, "rejected")}
            >
              Từ chối
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Duyệt bài viết Blog</h2>
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} sm={6} md={4}>
          <Card><Statistic title="Tổng số bài viết" value={total} /></Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card><Statistic title="Chờ duyệt" value={pending} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card><Statistic title="Đã duyệt" value={approved} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card><Statistic title="Từ chối" value={rejected} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
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
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredBlogs}
        pagination={{ pageSize: 10, showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài viết` }}
        loading={loading}
        className="users-table"
      />
      <Modal
        title="Lý do từ chối bài viết"
        open={rejectModal.visible}
        onOk={handleReject}
        onCancel={() => { setRejectModal({visible: false, blogId: null}); setRejectReason(""); }}
        okText="Từ chối"
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối bài viết..."
        />
      </Modal>
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

export default BlogModeration;
