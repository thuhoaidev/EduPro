import React from "react";
import { Table, Input, Button, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";

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
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h1 className="text-xl font-semibold mb-4">Danh sách giảng viên chờ duyệt</h1>
      <Input
        placeholder="Tìm theo lĩnh vực hoặc tiêu sử..."
        prefix={<SearchOutlined />}
        className="max-w-md mb-4"
      />
      <Table columns={columns} dataSource={mockData} rowKey="key" pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default InstructorPendingList;
