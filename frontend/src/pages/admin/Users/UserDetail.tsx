import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, Avatar, Tag, Button, Descriptions, Spin, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  type User,
  UserRole,
  UserStatus,
} from "../../../interfaces/Admin.interface";

// Dữ liệu mẫu nâng cao
const mockUsers: User[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "a@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: "2024-01-01",
    updatedAt: "2024-05-01",
    phone: "0123 456 789",
    address: "Hà Nội, Việt Nam",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "b@example.com",
    avatar: "https://i.pravatar.cc/150?img=2",
    role: UserRole.INSTRUCTOR,
    status: UserStatus.INACTIVE,
    createdAt: "2024-02-15",
    updatedAt: "2024-05-12",
    phone: "0987 654 321",
    address: "TP.HCM, Việt Nam",
    description: "Giảng viên có 10 năm kinh nghiệm trong lĩnh vực Web",
    coursesCount: 5,
  },
  {
    id: 3,
    fullName: "Lê Văn C",
    email: "c@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: UserRole.STUDENT,
    status: UserStatus.BANNED,
    createdAt: "2024-03-10",
    phone: "0345 678 910",
    address: "Thanh Hóa, Việt Nam",
  },
];

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = mockUsers.find((u) => u.id === Number(id));
    setTimeout(() => {
      setUser(found || null);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-red-500 mt-10">Không tìm thấy người dùng!</div>
    );
  }


const roleColor = {
  admin: "geekblue",
  instructor: "purple",
  student: "default",
  moderator: "orange", 
}[user.role];


  const statusColor =
    user.status === UserStatus.ACTIVE
      ? "green"
      : user.status === UserStatus.BANNED
      ? "red"
      : "orange";

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        Quay lại
      </Button>

      <Card bordered className="shadow-lg rounded-xl">
        <div className="flex items-center gap-6 mb-6">
          <Avatar size={100} src={user.avatar} />
          <div>
            <h2 className="text-2xl font-semibold">{user.fullName}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <Descriptions title="Thông tin cơ bản" column={1} bordered>
          <Descriptions.Item label="Vai trò">
            <Tag color={roleColor}>{user.role.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusColor}>{user.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{user.phone || "Không có"}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{user.address || "Không có"}</Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions title="Thời gian hoạt động" column={1} bordered>
          <Descriptions.Item label="Ngày tạo">
            {new Date(user.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật gần nhất">
            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Không có"}
          </Descriptions.Item>
        </Descriptions>

        {user.role === UserRole.INSTRUCTOR && (
          <>
            <Divider />
            <Descriptions title="Thông tin giảng viên" column={1} bordered>
              <Descriptions.Item label="Số khóa học đang dạy">
                {user.coursesCount || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {user.description || "Không có mô tả"}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    </div>
  );
};

export default UserDetail;
