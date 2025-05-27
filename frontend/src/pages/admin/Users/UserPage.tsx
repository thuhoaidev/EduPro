import { useState } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Avatar,
  Space,
  Pagination,
  Button,
  message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  UserRole,
  UserStatus,
  type User,
} from "../../../interfaces/Admin.interface";

const mockUsers: User[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "a@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "b@example.com",
    avatar: "https://i.pravatar.cc/150?img=2",
    role: UserRole.INSTRUCTOR,
    status: UserStatus.INACTIVE,
    createdAt: "2024-02-15",
  },
  {
    id: 3,
    fullName: "Lê Văn C",
    email: "c@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: UserRole.STUDENT,
    status: UserStatus.BANNED,
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    fullName: "Phạm Thị D",
    email: "d@example.com",
    avatar: "https://i.pravatar.cc/150?img=4",
    role: UserRole.MODERATOR,
    status: UserStatus.ACTIVE,
    createdAt: "2024-04-05",
  },
];

const UserPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const navigate = useNavigate();

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const updateRole = (id: number, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
    message.success("Cập nhật quyền thành công");
  };

  const updateStatus = (id: number, newStatus: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );
    message.success("Cập nhật trạng thái thành công");
  };

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "fullName",
      render: (_: any, user: User) => (
        <Space>
          <Avatar src={user.avatar} />
          <div>
            <div className="font-medium">{user.fullName}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Quyền hạn",
      dataIndex: "role",
      render: (_: any, user: User) => (
        <Select
          value={user.role}
          onChange={(val) => updateRole(user.id, val)}
          style={{ width: 120 }}
        >
          {Object.values(UserRole).map((r) => (
            <Select.Option key={r} value={r}>
              {r.toUpperCase()}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_: any, user: User) => (
        <Select
          value={user.status}
          onChange={(val) => updateStatus(user.id, val)}
          style={{ width: 120 }}
        >
          {Object.values(UserStatus).map((s) => (
            <Select.Option key={s} value={s}>
              <Tag
                color={
                  s === UserStatus.ACTIVE
                    ? "green"
                    : s === UserStatus.BANNED
                    ? "red"
                    : "default"
                }
              >
                {s.toUpperCase()}
              </Tag>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      render: (_: any, user: User) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/admin/users/${user.id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Tìm kiếm tên hoặc email"
          allowClear
          prefix={<SearchOutlined />}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ width: 300 }}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={paginatedUsers}
        pagination={false}
      />

      <div className="flex justify-end mt-4">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filteredUsers.length}
          onChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
};

export default UserPage;
