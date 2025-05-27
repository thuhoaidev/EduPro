import { Card, Descriptions, Avatar, Badge, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import type { InstructorDetail,  } from "../../../interfaces/Admin.interface";

const fakeInstructors: InstructorDetail[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "nva@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    status: "active",
    createdAt: "2024-01-01",
    bio: "Giảng viên dạy lập trình Web với hơn 5 năm kinh nghiệm.",
    phone: "0912345678",
    gender: "Nam",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "ttb@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: "inactive",
    createdAt: "2024-03-15",
    bio: "Chuyên gia UI/UX, từng làm tại Google.",
    phone: "0987654321",
    gender: "Nữ",
  },
];

const InstructorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const instructor = fakeInstructors.find((i) => i.id === Number(id));

  if (!instructor) return <div>Không tìm thấy giảng viên</div>;

  const statusColor =
    instructor.status === "active"
      ? "green"
      : instructor.status === "inactive"
      ? "orange"
      : "red";

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        Quay lại
      </Button>

      <Card className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Avatar size={80} src={instructor.avatar} icon={<UserOutlined />} />
          <div>
            <h2 className="text-xl font-bold">{instructor.fullName}</h2>
            <Badge color={statusColor} text={instructor.status.toUpperCase()} />
          </div>
        </div>

        <Descriptions
          bordered
          column={1}
          labelStyle={{ width: 150, fontWeight: 600 }}
        >
          <Descriptions.Item label="Email">{instructor.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{instructor.phone}</Descriptions.Item>
          <Descriptions.Item label="Giới tính">{instructor.gender}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{instructor.createdAt}</Descriptions.Item>
          <Descriptions.Item label="Giới thiệu bản thân">{instructor.bio}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default InstructorDetailPage;
