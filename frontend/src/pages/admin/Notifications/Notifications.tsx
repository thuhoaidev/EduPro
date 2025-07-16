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
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { Notification } from "../../../interfaces/Admin.interface";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

// Mock API: fetch notifications theo page, limit, searchText
const fetchNotifications = async (
  page: number,
  limit: number,
  search: string
): Promise<{ data: Notification[]; total: number }> => {
  const token = localStorage.getItem('token');
  const res = await axios.get('/api/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Map dữ liệu từ backend sang frontend
  const data = res.data.data.map((n: any) => ({
    id: n._id,
    title: n.title,
    content: n.content,
    status: n.status,
    createdAt: n.created_at,
    type: n.type,
    icon: n.icon,
    meta: n.meta,
    userId: n.receiver,
    notifyTime: n.created_at,
  }));
  // Có thể filter/search phía client nếu cần
  let filtered = data;
  if (search) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );
  }
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);
  return { data: paged, total };
};

// Mock API: mark notification đã đọc
const markAsRead = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.patch(`/api/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Hàm lấy icon theo type hoặc icon backend
const getIcon = (type: string, icon?: string) => {
  if (icon) {
    // Có thể dùng icon backend nếu dùng thư viện icon động
    return <span className="text-xl mr-2">{icon}</span>;
  }
  switch (type) {
    case 'success': return <CheckCircleOutlined className="text-green-500 text-xl mr-2" />;
    case 'warning': return <ExclamationCircleOutlined className="text-yellow-500 text-xl mr-2" />;
    case 'info': return <InfoCircleOutlined className="text-blue-500 text-xl mr-2" />;
    default: return <InfoCircleOutlined className="text-gray-400 text-xl mr-2" />;
  }
};
// Hàm lấy màu tag theo type
const getTagColor = (type: string) => {
  switch (type) {
    case 'success': return 'green';
    case 'warning': return 'orange';
    case 'info': return 'blue';
    default: return 'default';
  }
};
// Hàm lấy nhãn type
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'success': return 'Thành công';
    case 'warning': return 'Cảnh báo';
    case 'info': return 'Thông tin';
    default: return 'Khác';
  }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8); // Increased limit
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch('/api/notifications', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => res.json())
      .then(data => setNotifications(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications(page, limit, searchText);
      setNotifications(res.data); // Update notifications state
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

  const handleMarkAsRead = async (id: string) => {
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

  // Thay vào đó, tính toán số lượng từ data thật:
  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const readCount = notifications.filter(n => n.status === 'read').length;
  const totalNotifications = notifications.length;

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
        <Space direction="vertical" size={0} className="py-2 cursor-pointer" onClick={() => {
          if (record.meta?.link) navigate(record.meta.link);
        }}>
          <span className="font-medium text-gray-800 flex items-center">
            {getIcon(record.type, record.icon)}{text}
            <Tag color={getTagColor(record.type)} className="ml-2">{getTypeLabel(record.type)}</Tag>
          </span>
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
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            Quản lý Thông báo
            {/* Badge số chưa đọc */}
            {unreadCount > 0 && (
              <span className="ml-3 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-gray-500 mt-1">Xem và quản lý các thông báo hệ thống</p>
        </div>
      </div>

       {/* Stats Cards */}
       <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng số thông báo"
              value={totalNotifications}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Chưa đọc"
              value={unreadCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã đọc"
              value={readCount}
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
          dataSource={notifications}
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
