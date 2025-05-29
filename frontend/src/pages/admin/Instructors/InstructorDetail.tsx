import { Card, Descriptions, Avatar, Badge, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import type { InstructorDetail } from "../../../interfaces/Admin.interface";

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

  if (!instructor) return <div className="text-center text-red-500 mt-10">Không tìm thấy giảng viên</div>;

  const statusColor =
    instructor.status === "active"
      ? "green"
      : instructor.status === "inactive"
      ? "orange"
      : "red";

  return (
    <div className="p-6">
      <Button
        type="default"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        Quay lại danh sách
      </Button>

      <Card
        className="max-w-4xl mx-auto shadow-md hover:shadow-lg transition-all duration-300"
        bodyStyle={{ padding: "32px" }}
      >
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar
            size={100}
            src={instructor.avatar}
            icon={<UserOutlined />}
            className="shadow-md"
          />
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-semibold">{instructor.fullName}</h2>
            <Badge
              color={statusColor}
              text={
                <span className="uppercase font-medium">
                  {instructor.status}
                </span>
              }
            />
            <p className="text-gray-600">{instructor.bio}</p>
          </div>
        </div>

        <div className="mt-8">
          <Descriptions
            bordered
            column={1}
            labelStyle={{ width: 200, fontWeight: 600 }}
            contentStyle={{ background: "#f9fafb" }}
          >
            <Descriptions.Item label="Email">
              {instructor.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {instructor.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {instructor.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {instructor.createdAt}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>
    </div>
  );
};

export default InstructorDetailPage;
