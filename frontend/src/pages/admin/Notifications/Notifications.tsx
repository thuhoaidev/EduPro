import React, { useEffect, useState } from "react";
import { Table, Tag, Input, Button, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Notification } from "../../../interfaces/Admin.interface";

const { Search } = Input;

// Dữ liệu giả lập cục bộ (mock data)
let notifications: Notification[] = [
  {
    id: 1,
    title: "Thông báo 1",
    content: "Nội dung thông báo 1",
    status: "unread",
    createdAt: "2025-05-20T10:00:00Z",
    userId: 1,
  },
  {
    id: 2,
    title: "Thông báo 2",
    content: "Nội dung thông báo 2",
    status: "read",
    createdAt: "2025-05-18T09:00:00Z",
    userId: 1,
  },
];

// Mock API: fetch notifications theo page, limit, searchText
const fetchNotifications = async (
  page: number,
  limit: number,
  search: string
): Promise<{ data: Notification[]; total: number }> => {
  let filtered = notifications;

  if (search) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  // Giả lập độ trễ mạng
  return new Promise((resolve) =>
    setTimeout(() => resolve({ data, total }), 300)
  );
};

// Mock API: mark notification đã đọc
const markAsRead = async (id: number): Promise<void> => {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, status: "read" } : n
  );
  return new Promise((resolve) => setTimeout(resolve, 200));
};

const Notifications = () => {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [searchText, setSearchText] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications(page, limit, searchText);
      setData(res.data);
      setTotal(res.total);
    } catch (error) {
      message.error("Lấy dữ liệu thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, searchText]);

  const handleMarkAsRead = async (id: number) => {
    setLoading(true);
    try {
      await markAsRead(id);
      message.success("Đánh dấu đã đọc thành công");
      loadData();
    } catch (error) {
      message.error("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Notification> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      render: (text, record) => (
        <Space direction="vertical">
          <span>{text}</span>
          <small className="text-gray-500">{record.content}</small>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "unread" ? "red" : "green"}>
          {status.toUpperCase()}
        </Tag>
      ),
      width: 100,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
      width: 180,
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      render: (_, record) =>
        record.status === "unread" ? (
          <Button size="small" onClick={() => handleMarkAsRead(record.id)}>
            Đánh dấu đã đọc
          </Button>
        ) : null,
      width: 120,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quản lý Thông báo</h2>

      <Search
        placeholder="Tìm kiếm thông báo..."
        allowClear
        onSearch={(value) => {
          setPage(1);
          setSearchText(value);
        }}
        style={{ maxWidth: 400, marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default Notifications;
