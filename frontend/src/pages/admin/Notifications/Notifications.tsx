import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Input,
  Button,
  Space,
  message,
  Card,
  Row,
  Col,
  Statistic
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { Notification } from "../../../interfaces/Admin.interface";

const { Search } = Input;

// Dữ liệu giả lập cục bộ (mock data) - Adjusted mock data
let notifications: Notification[] = [
  {
    id: 1,
    title: "Thông báo khóa học mới",
    content: "Một khóa học mới về React vừa được đăng tải.",
    status: "unread",
    createdAt: "2025-05-22T10:00:00Z",
    userId: 1,
  },
  {
    id: 2,
    title: "Có phản hồi về bài viết của bạn",
    content: "Bài viết 'Hướng dẫn TypeScript' của bạn vừa nhận được một bình luận mới.",
    status: "read",
    createdAt: "2025-05-21T09:00:00Z",
    userId: 1,
  },
   {
    id: 3,
    title: "Khóa học đã được duyệt",
    content: "Khóa học 'Node.js cơ bản' của bạn đã được phê duyệt và đăng tải.",
    status: "read",
    createdAt: "2025-05-20T14:30:00Z",
    userId: 1,
  },
   {
    id: 4,
    title: "Báo cáo vi phạm mới",
    content: "Có một báo cáo mới về nội dung vi phạm.",
    status: "unread",
    createdAt: "2025-05-22T11:15:00Z",
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

const NotificationsPage = () => {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8); // Increased limit
  const [searchText, setSearchText] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications(page, limit, searchText);
      setData(res.data);
      setTotal(res.total);
    } catch (error: any) { // Use error: any to satisfy linter
      console.error(error); // Log error if needed
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
      loadData(); // Reload data to reflect status change
    } catch (error: any) { // Use error: any to satisfy linter
      console.error(error); // Log error if needed
      message.error("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

   // Calculate statistics
   const stats = {
    totalNotifications: notifications.length,
    read: notifications.filter(n => n.status === 'read').length,
    unread: notifications.filter(n => n.status === 'unread').length,
  };

  const columns: ColumnsType<Notification> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      className: "text-gray-600 text-sm",
    },
    {
      title: "Thông báo",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <Space direction="vertical" size={0} className="py-2">
          <span className="font-medium text-gray-800">{text}</span>
          <small className="text-gray-600">{record.content}</small>
        </Space>
      ),
       className: "w-auto",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "unread" ? "orange" : "green"} className="px-2 py-1 rounded-full text-sm font-medium">
          {status === "unread" ? "Chưa đọc" : "Đã đọc"}
        </Tag>
      ),
      width: 100,
      align: "center",
       className: "text-gray-600 text-sm"
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
      width: 180,
      className: "text-gray-600 text-sm"
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: void, record) =>
        record.status === "unread" ? (
          <Button size="small" onClick={() => handleMarkAsRead(record.id)} type="primary" icon={<CheckCircleOutlined />} className="flex items-center">
            Đã đọc
          </Button>
        ) : (
          <Button size="small" disabled icon={<EyeOutlined />} className="flex items-center">
            Xem
          </Button>
        ),
      width: 120,
      align: "center"
    },
  ];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Thông báo</h2>
          <p className="text-gray-500 mt-1">Xem và quản lý các thông báo hệ thống</p>
        </div>
      </div>

       {/* Stats Cards */}
       <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng số thông báo"
              value={stats.totalNotifications}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Chưa đọc"
              value={stats.unread}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã đọc"
              value={stats.read}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Table */}
       <Card className="shadow-sm">
        <div className="mb-4 flex justify-end">
            <Search
              placeholder="Tìm kiếm thông báo..."
              allowClear
              onSearch={(value) => {
                setPage(1);
                setSearchText(value);
              }}
              style={{ maxWidth: 400 }}
              className="w-full sm:w-auto"
            />
        </div>

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
             showTotal: (total) => `Tổng số ${total} thông báo`,
             className: "px-4"
          }}
          className="notifications-table"
        />
      </Card>

       {/* Custom styles */}
       <style>
        {`
          .notifications-table .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
            color: #1f2937;
          }
          .notifications-table .ant-table-tbody > tr:hover > td {
            background: #f5f7fa;
          }
           .notifications-table .ant-table-tbody > tr > td {
            padding: 12px 8px;
          }
          .ant-tag {
            margin: 0;
          }
        `}
      </style>

    </div>
  );
};

export default NotificationsPage;
