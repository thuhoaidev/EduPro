import { Table, Tag, Avatar, Space, Input, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { InstructorProfile } from "../../../interfaces/Admin.interface";


// Fake data demo, giả lập data
const fakeInstructors: InstructorProfile[] = [
  {
    id: 1,
    user_id: 101,
    bio: "Giảng viên chuyên về lập trình web",
    expertise: "Web Development",
    rating: 4.8,
    status: "approved",
    created_at: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    user_id: 102,
    bio: "Giảng viên về thiết kế đồ họa",
    expertise: "Graphic Design",
    rating: 4.5,
    status: "pending",
    created_at: "2024-03-15T12:30:00Z",
  },
  {
    id: 3,
    user_id: 103,
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

  // Lọc theo expertise hoặc bio (ví dụ)
  const filteredData = fakeInstructors.filter(
    (ins) =>
      ins.expertise.toLowerCase().includes(searchText.toLowerCase()) ||
      ins.bio.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<InstructorProfile> = [
    {
      title: "#",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Lĩnh vực chuyên môn",
      dataIndex: "expertise",
      render: (expertise, record) => (
        <Space direction="vertical">
          <div className="font-semibold">{expertise}</div>
          <div className="text-xs text-gray-500">{record.bio}</div>
        </Space>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      render: (rating) => <span>{rating.toFixed(1)} ⭐</span>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        let color = "default";
        if (status === "approved") color = "green";
        else if (status === "pending") color = "orange";
        else if (status === "rejected") color = "red";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Danh sách giảng viên</h2>
      <div className="mb-4 flex items-center gap-2">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo lĩnh vực hoặc tiểu sử..."
          style={{ maxWidth: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 4 }}
      />
    </div>
  );
};

export default InstructorList;
