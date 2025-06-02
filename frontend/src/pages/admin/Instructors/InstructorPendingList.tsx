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
  PhoneOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { InstructorProfile } from "../../../interfaces/Admin.interface";

const mockInstructors: InstructorProfile[] = [
  {
    id: '1',
    name: "Nguyễn Văn A",
    email: "a@example.com",
    degree: "Thạc sĩ CNTT",
    status: "pending",
  },
  {
    id: '2',
    name: "Trần Thị B",
    email: "b@example.com",
    degree: "Tiến sĩ Toán",
    status: "pending",
  },
  {
    id: '3',
    name: "Lê Văn C",
    email: "c@example.com",
    degree: "Cử nhân Kinh tế",
    status: "pending",
  },
  {
    id: '4',
    name: "Phạm Thị D",
    email: "d@example.com",
    degree: "Thạc sĩ Quản trị kinh doanh",
    status: "pending",
  },
  {
    id: '5',
    name: "Hoàng Văn E",
    email: "e@example.com",
    degree: "Tiến sĩ Vật lý",
    status: "pending",
  },
  {
    id: '6',
    name: "Ngô Thị F",
    email: "f@example.com",
    degree: "Cử nhân Luật",
    status: "pending",
  },
  {
    id: '7',
    name: "Đặng Văn G",
    email: "g@example.com",
    degree: "Thạc sĩ Xây dựng",
    status: "pending",
  },
];

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

export default function InstructorPendingListPage() {
  const [data, setData] = useState<InstructorProfile[]>(mockInstructors.filter(t => t.status === 'pending'));
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [degreeFilter, setDegreeFilter] = useState<string>("all");

  // Calculate statistics
  const stats = {
    total: mockInstructors.filter(t => t.status === 'pending').length,
    approved: mockInstructors.filter(t => t.status === 'approved').length,
    rejected: mockInstructors.filter(t => t.status === 'rejected').length,
  };

  useEffect(() => {
    let filtered = mockInstructors.filter(t => t.status === 'pending');
    
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
      const idx = mockInstructors.findIndex(t => t.id === id);
      if (idx >= 0) mockInstructors[idx].status = status;
      message.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} hồ sơ`);
    } catch (error) {
      console.error(error);
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const columns: ColumnsType<InstructorProfile> = [
    {
      title: 'Giảng viên',
      dataIndex: 'name',
      render: (_, record: InstructorProfile) => (
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
      render: (email: string) => (
        <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800">
          {email}
        </a>
      ),
    },
    {
      title: 'Trình độ',
      dataIndex: 'degree',
      render: (degree: string) => (
        <Tag color="blue" className="px-2 py-1 rounded-full">
          {degree}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: void, record: InstructorProfile) => (
        <Space size="small">
          <Popconfirm
            title="Duyệt giảng viên"
            description="Bạn có chắc chắn muốn duyệt giảng viên này?"
            onConfirm={() => handleUpdateStatus(record.id, 'approved')}
            okText="Duyệt"
            cancelText="Hủy"
            okButtonProps={{ type: 'primary' }}
          >
            <Button type="primary" icon={<CheckOutlined />} size="small" className="flex items-center">
              Duyệt
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Từ chối giảng viên"
            description="Bạn có chắc chắn muốn từ chối giảng viên này?"
            onConfirm={() => handleUpdateStatus(record.id, 'rejected')}
            okText="Từ chối"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<CloseOutlined />} size="small" className="flex items-center">
              Từ chối
            </Button>
          </Popconfirm>
          <Button 
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/admin/instructors/${record.id}`)}
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Duyệt giảng viên</h2>
        <p className="text-gray-500 mt-1">Xem xét và phê duyệt hồ sơ giảng viên mới</p>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng chờ duyệt"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
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
            className="max-w-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
           <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={(value) => setDegreeFilter(value)}
            options={[
              { value: "all", label: "Tất cả trình độ" },
              { value: "Thạc sĩ CNTT", label: "Thạc sĩ CNTT" },
              { value: "Tiến sĩ Toán", label: "Tiến sĩ Toán" },
              { value: "Cử nhân Kinh tế", label: "Cử nhân Kinh tế" },
              { value: "Thạc sĩ Quản trị kinh doanh", label: "Thạc sĩ QTKD" },
              { value: "Tiến sĩ Vật lý", label: "Tiến sĩ Vật lý" },
              { value: "Cử nhân Luật", label: "Cử nhân Luật" },
              { value: "Thạc sĩ Xây dựng", label: "Thạc sĩ Xây dựng" },
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
          pagination={{ pageSize: 8 }}
          className="instructor-pending-table"
        />
      </Card>

      {/* Custom styles */}
      <style>
        {`
          .instructor-pending-table .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
            color: #1f2937;
          }
          .instructor-pending-table .ant-table-tbody > tr:hover > td {
            background: #f5f7fa;
          }
           .instructor-pending-table .ant-table-tbody > tr > td {
            padding: 12px 8px;
          }
          .ant-tag {
            margin: 0;
          }
        `}
      </style>
    </div>
  );
}
