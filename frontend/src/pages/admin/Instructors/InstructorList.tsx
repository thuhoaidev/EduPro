import { Table, Tag, Avatar, Space, Input, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
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
  const navigate = useNavigate();

  const filteredData = fakeInstructors.filter(
    (ins) =>
      ins.expertise.toLowerCase().includes(searchText.toLowerCase()) ||
      ins.bio.toLowerCase().includes(searchText.toLowerCase()) ||
      ins.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      approved: { color: "green", label: "Đã duyệt" },
      pending: { color: "orange", label: "Chờ duyệt" },
      rejected: { color: "red", label: "Từ chối" },
    };

    const tag = statusMap[status] || { color: "default", label: status };
    return <Tag color={tag.color}>{tag.label}</Tag>;
  };

  const columns: ColumnsType<typeof fakeInstructors[0]> = [
    {
      title: "#",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Giảng viên",
      dataIndex: "fullName",
      render: (_, record) => (
        <Space direction="horizontal" size="middle">
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div className="font-semibold">{record.fullName}</div>
            <div className="text-sm text-gray-500">{record.expertise}</div>
            <div className="text-xs text-gray-400">{record.bio}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      render: (rating) => <span className="font-medium">{rating.toFixed(1)} ⭐</span>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: getStatusTag,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/admin/users/instructor/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Danh sách giảng viên</h2>

      <div className="mb-4 flex items-center gap-2">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên, lĩnh vực hoặc tiểu sử..."
          style={{ maxWidth: 320 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 8 }}
        className="shadow-md rounded-lg"
      />
    </div>
  );
};

export default InstructorList;
