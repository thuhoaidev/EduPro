<<<<<<< Updated upstream
import React from "react";
import { Table, Input, Button, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
=======
import React, { useEffect, useState } from "react";
import { 
  Table, 
  Input, 
  Button, 
  Tag, 
  Space, 
  message, 
  Popconfirm, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Select,
  Avatar,
  Tooltip
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  SearchOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
>>>>>>> Stashed changes

interface Instructor {
  key: number;
  name: string;
  email: string;
  degree: string;
  status: "Pending";
}

const mockData: Instructor[] = [
  {
    key: 1,
    name: "Nguyễn Văn A",
    email: "a@example.com",
    degree: "Thạc sĩ CNTT",
    status: "Pending",
  },
  {
    key: 2,
    name: "Trần Thị B",
    email: "b@example.com",
    degree: "Tiến sĩ Toán",
    status: "Pending",
  },
  {
    key: 3,
    name: "Lê Văn C",
    email: "c@example.com",
    degree: "Cử nhân Kinh tế",
    status: "Pending",
  },
  {
    key: 4,
    name: "Phạm Thị D",
    email: "d@example.com",
    degree: "Thạc sĩ Quản trị kinh doanh",
    status: "Pending",
  },
  {
    key: 5,
    name: "Hoàng Văn E",
    email: "e@example.com",
    degree: "Tiến sĩ Vật lý",
    status: "Pending",
  },
  {
    key: 6,
    name: "Ngô Thị F",
    email: "f@example.com",
    degree: "Cử nhân Luật",
    status: "Pending",
  },
  {
    key: 7,
    name: "Đặng Văn G",
    email: "g@example.com",
    degree: "Thạc sĩ Xây dựng",
    status: "Pending",
  },
];

<<<<<<< Updated upstream
const InstructorPendingList = () => {
  const columns: ColumnsType<Instructor> = [
    {
      title: "STT",
      dataIndex: "key",
      key: "stt",
      width: 60,
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trình độ",
      dataIndex: "degree",
      key: "degree",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="orange">Pending</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary">Duyệt</Button>
          <Button danger> Từ chối </Button>
          <Button>Xem chi tiết</Button>
=======
export default function TeachersReviewPage() {
  const [data, setData] = useState<TeacherProfile[]>(mockTeachers);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [degreeFilter, setDegreeFilter] = useState<string>("all");

  // Calculate statistics
  const stats = {
    total: mockTeachers.filter(t => t.status === 'pending').length,
    approved: mockTeachers.filter(t => t.status === 'approved').length,
    rejected: mockTeachers.filter(t => t.status === 'rejected').length,
  };

  useEffect(() => {
    let filtered = mockTeachers.filter(t => t.status === 'pending');
    
    if (searchText) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.email.toLowerCase().includes(searchText.toLowerCase()) ||
        t.degree.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (degreeFilter !== 'all') {
      filtered = filtered.filter(t => t.degree === degreeFilter);
    }

    setData(filtered);
  }, [searchText, degreeFilter]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      // await config.patch(`/api/instructors/${id}/status`, { status });
      setData(prev => {
        const updated = prev.map(t =>
          t.id === id ? { ...t, status } : t
        );
        return updated.filter(t => t.status === 'pending');
      });
      const idx = mockTeachers.findIndex(t => t.id === id);
      if (idx >= 0) mockTeachers[idx].status = status;
      message.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} hồ sơ`);
    } catch (error) {
      console.error(error);
      message.error('Cập nhật trạng thái thất bại');
    }
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

  const columns: ColumnsType<TeacherProfile> = [
    {
      title: 'Giảng viên',
      dataIndex: 'name',
      render: (_, record) => (
        <Space direction="horizontal" size="middle" className="py-2">
          <Avatar 
            icon={<UserOutlined />} 
            size={48}
            className="bg-blue-100 text-blue-600 border-2 border-gray-100 shadow-sm"
          />
          <div>
            <div className="font-semibold text-base hover:text-blue-600 cursor-pointer">
              {record.name}
            </div>
            <div className="text-sm text-gray-600">{record.degree}</div>
            <Space className="mt-2" size="small">
              <Tooltip title="Gửi email">
                <Button type="text" size="small" icon={<MailOutlined />} />
              </Tooltip>
              <Tooltip title="Gọi điện thoại">
                <Button type="text" size="small" icon={<PhoneOutlined />} />
              </Tooltip>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email) => (
        <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800">
          {email}
        </a>
      ),
    },
    {
      title: 'Trình độ',
      dataIndex: 'degree',
      render: (degree) => (
        <Tag color="blue" className="px-2 py-1 rounded-full">
          {degree}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: getStatusTag,
    },
    {
      title: 'Hành động',
      render: (_, record: TeacherProfile) => (
        <Space size="small">
          <Popconfirm
            title="Duyệt hồ sơ"
            description="Bạn có chắc chắn muốn duyệt hồ sơ này?"
            onConfirm={() => handleUpdateStatus(record.id, 'approved')}
            okText="Duyệt"
            cancelText="Hủy"
            okButtonProps={{ type: 'primary' }}
          >
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />}
              disabled={record.status !== 'pending'}
              className="flex items-center"
            >
              Duyệt
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Từ chối hồ sơ"
            description="Bạn có chắc chắn muốn từ chối hồ sơ này?"
            onConfirm={() => handleUpdateStatus(record.id, 'rejected')}
            okText="Từ chối"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger
              icon={<CloseCircleOutlined />}
              disabled={record.status !== 'pending'}
              className="flex items-center"
            >
              Từ chối
            </Button>
          </Popconfirm>
          <Button 
            type="default"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/users/instructor-approval/${record.id}`)}
            className="flex items-center"
          >
            Chi tiết
          </Button>
>>>>>>> Stashed changes
        </Space>
      ),
    },
  ];

  // Get unique degrees for filter
  const uniqueDegrees = Array.from(new Set(mockTeachers.map(t => t.degree)));

  return (
<<<<<<< Updated upstream
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h1 className="text-xl font-semibold mb-4">Danh sách giảng viên chờ duyệt</h1>
      <Input
        placeholder="Tìm theo lĩnh vực hoặc tiêu sử..."
        prefix={<SearchOutlined />}
        className="max-w-md mb-4"
      />
      <Table columns={columns} dataSource={mockData} rowKey="key" pagination={{ pageSize: 5 }} />
=======
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Duyệt hồ sơ giảng viên</h2>
          <p className="text-gray-500 mt-1">Xem xét và phê duyệt hồ sơ giảng viên mới</p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Hồ sơ chờ duyệt"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã từ chối"
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
            placeholder="Tìm theo tên, email hoặc trình độ..."
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={setDegreeFilter}
            options={[
              { value: "all", label: "Tất cả trình độ" },
              ...uniqueDegrees.map(degree => ({
                value: degree,
                label: degree
              }))
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
          dataSource={data}
          pagination={{ 
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} hồ sơ chờ duyệt`,
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

export default InstructorPendingList;
