import { Table, Tag, Avatar, Space, Input, Button, Card, Row, Col, Select, Statistic } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { 
  UserOutlined, 
  SearchOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { InstructorProfile } from "../../../interfaces/Admin.interface";

// Giả lập data có thêm fullName
const fakeInstructors: (InstructorProfile & { fullName: string; avatar?: string })[] = [
  {
    id: 1,
    user_id: 101,
    fullName: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=11",
    bio: "Giảng viên chuyên về lập trình web",
    expertise: "Web Development",
    rating: 4.8,
    status: "approved",
    created_at: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    user_id: 102,
    fullName: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=12",
    bio: "Giảng viên về thiết kế đồ họa",
    expertise: "Graphic Design",
    rating: 4.5,
    status: "pending",
    created_at: "2024-03-15T12:30:00Z",
  },
  {
    id: 3,
    user_id: 103,
    fullName: "Lê Văn C",
    avatar: "https://i.pravatar.cc/150?img=13",
    bio: "Chuyên gia an ninh mạng",
    expertise: "Cybersecurity",
    rating: 4.2,
    status: "rejected",
    created_at: "2024-04-20T15:45:00Z",
  },
];

const InstructorList = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const filteredData = fakeInstructors.filter(
    (ins) =>
      (statusFilter === "all" || ins.status === statusFilter) &&
      (ins.expertise.toLowerCase().includes(searchText.toLowerCase()) ||
      ins.bio.toLowerCase().includes(searchText.toLowerCase()) ||
      ins.fullName.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Calculate statistics
  const stats = {
    total: fakeInstructors.length,
    approved: fakeInstructors.filter(ins => ins.status === "approved").length,
    pending: fakeInstructors.filter(ins => ins.status === "pending").length,
    rejected: fakeInstructors.filter(ins => ins.status === "rejected").length,
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      approved: { color: "success", label: "Đã duyệt", icon: <CheckCircleOutlined /> },
      pending: { color: "warning", label: "Chờ duyệt", icon: <ClockCircleOutlined /> },
      rejected: { color: "error", label: "Từ chối", icon: <CloseCircleOutlined /> },
    };

    const tag = statusMap[status] || { color: "default", label: status, icon: null };
    return (
      <Tag 
        color={tag.color} 
        icon={tag.icon}
        className="px-2 py-1 rounded-full text-sm font-medium"
      >
        {tag.label}
      </Tag>
    );
  };

  const columns: ColumnsType<typeof fakeInstructors[0]> = [
    {
      title: "#",
      dataIndex: "id",
      width: 60,
      align: "center",
    },
    {
      title: "Giảng viên",
      dataIndex: "fullName",
      render: (_, record) => (
        <Space direction="horizontal" size="middle" className="py-2">
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />} 
            size={48}
            className="border-2 border-gray-100 shadow-sm"
          />
          <div>
            <div className="font-semibold text-base hover:text-blue-600 cursor-pointer">
              {record.fullName}
            </div>
            <div className="text-sm text-gray-600 font-medium">{record.expertise}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{record.bio}</div>
            <Space className="mt-2" size="small">
              <Button type="text" size="small" icon={<MailOutlined />} />
              <Button type="text" size="small" icon={<PhoneOutlined />} />
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      align: "center",
      render: (rating) => (
        <div className="flex flex-col items-center">
          <span className="font-semibold text-lg text-yellow-500">{rating.toFixed(1)}</span>
          <div className="text-yellow-500">{"⭐".repeat(Math.floor(rating))}</div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      align: "center",
      render: (date) => (
        <div className="text-sm">
          <div className="font-medium">{new Date(date).toLocaleDateString()}</div>
          <div className="text-gray-500 text-xs">
            {new Date(date).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: getStatusTag,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/users/instructor/${record.id}`)}
            className="flex items-center"
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý giảng viên</h2>
          <p className="text-gray-500 mt-1">Quản lý và theo dõi thông tin giảng viên</p>
        </div>
        <Button type="primary" size="large" icon={<TeamOutlined />}>
          Thêm giảng viên
        </Button>
      </div>

<<<<<<< Updated upstream
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 4 }}
        className="shadow-md rounded-lg"
      />
=======
      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng số giảng viên"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên, lĩnh vực hoặc tiểu sử..."
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "approved", label: "Đã duyệt" },
              { value: "pending", label: "Chờ duyệt" },
              { value: "rejected", label: "Từ chối" },
            ]}
            suffixIcon={<FilterOutlined />}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          pagination={{ 
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} giảng viên`,
            className: "px-4"
          }}
          className="instructor-table"
        />
      </Card>

      {/* Custom styles */}
      <style>
        {`
          .instructor-table .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
            color: #1f2937;
          }
          .instructor-table .ant-table-tbody > tr:hover > td {
            background: #f5f7fa;
          }
          .instructor-table .ant-table-tbody > tr > td {
            padding: 16px 8px;
          }
          .ant-tag {
            margin: 0;
          }
        `}
      </style>
>>>>>>> Stashed changes
    </div>
  );
};

export default InstructorList;
