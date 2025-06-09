import { Card, Descriptions, Avatar, Badge, Button, Space, Divider, Row, Col, Tag, Tooltip } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  LinkedinOutlined,
  GithubOutlined,
  BookOutlined
} from "@ant-design/icons";
import type { InstructorDetail } from "../../../interfaces/Admin.interface";

const fakeInstructors: InstructorDetail[] = [
  {
    id: 1,
    fullname: "Nguyễn Văn A",
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
    fullname: "Trần Thị B",
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

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold text-red-500 mb-4">
          Không tìm thấy giảng viên
        </div>
        <Button type="primary" onClick={() => navigate(-1)}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const config = {
      active: { color: 'success' as const, icon: <CheckCircleOutlined />, text: 'Đang hoạt động' },
      inactive: { color: 'warning' as const, icon: <ClockCircleOutlined />, text: 'Ngừng hoạt động' },
      rejected: { color: 'error' as const, icon: <CloseCircleOutlined />, text: 'Đã từ chối' }
      // Assuming 'rejected' status might appear here too, though less likely
    };
    return config[status as keyof typeof config] || { color: 'default' as const, icon: <UserOutlined />, text: status };
  };

  const statusConfig = getStatusConfig(instructor.status);

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          Quay lại danh sách
        </Button>
        <Badge 
          status={statusConfig.color}
          text={
            <span className="text-base font-medium flex items-center gap-2">
              {statusConfig.icon}
              {statusConfig.text}
            </span>
          }
        />
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Profile Card */}
        <Col xs={24} lg={16}>
          <Card className="shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Avatar
                  size={120}
                  src={instructor.avatar}
                  icon={<UserOutlined />}
                  className="border-4 border-gray-100 shadow-lg"
                />
                <div className="mt-4 flex gap-2">
                  <Tooltip title="Gửi email">
                    <Button type="text" icon={<MailOutlined />} />
                  </Tooltip>
                  <Tooltip title="Gọi điện thoại">
                    <Button type="text" icon={<PhoneOutlined />} />
                  </Tooltip>
                  {/* Add LinkedIn/GitHub buttons if data exists */}
                  <Tooltip title="LinkedIn">
                    <Button type="text" icon={<LinkedinOutlined />} disabled />{/* Placeholder */}
                  </Tooltip>
                  <Tooltip title="GitHub">
                    <Button type="text" icon={<GithubOutlined />} disabled />{/* Placeholder */}
                  </Tooltip>
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {instructor.fullname}
                </h1>
                {/* Assuming a location field might be added later */}
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <EnvironmentOutlined />
                  <span>Địa điểm không xác định</span> {/* Placeholder */}
                </div>
                <p className="text-gray-600 text-base leading-relaxed">
                  {instructor.bio}
                </p>
                {/* Assuming a list of skills/subjects might be added */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag color="blue" icon={<BookOutlined />}>Kỹ năng 1</Tag>{/* Placeholder */}
                  <Tag color="green" icon={<BookOutlined />}>Kỹ năng 2</Tag>{/* Placeholder */}
                </div>
              </div>
            </div>

            <Divider />

            <Descriptions
              column={{ xs: 1, sm: 2 }}
              bordered
              size="small"
              className="bg-white"
            >
              <Descriptions.Item 
                label={
                  <span className="flex items-center gap-2">
                    <MailOutlined /> Email
                  </span>
                }
              >
                <a href={`mailto:${instructor.email}`} className="text-blue-600 hover:text-blue-800">
                  {instructor.email}
                </a>
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span className="flex items-center gap-2">
                    <PhoneOutlined /> Số điện thoại
                  </span>
                }
              >
                <a href={`tel:${instructor.phone}`} className="text-blue-600 hover:text-blue-800">
                  {instructor.phone}
                </a>
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span className="flex items-center gap-2">
                    <UserOutlined /> Giới tính
                  </span>
                }
              >
                {instructor.gender}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span className="flex items-center gap-2">
                    <CalendarOutlined /> Ngày tham gia
                  </span>
                }
              >
                 {new Date(instructor.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Descriptions.Item>
            </Descriptions>

            {/* Placeholder for courses taught list */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Khóa học đã dạy (Placeholder)</h3>
                <Card className="bg-gray-50 p-4 text-gray-500 italic text-center">
                  Danh sách các khóa học giảng viên đã tạo sẽ hiển thị tại đây.
                </Card>
            </div>

          </Card>
        </Col>

        {/* Side Info/Stats - Placeholder */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={24} className="w-full">
             <Card title="Thống kê (Placeholder)" className="shadow-sm">
                <p className="text-gray-500 italic">Các thống kê về khóa học, học viên sẽ hiển thị tại đây.</p>
            </Card>
            {/* Add other relevant side cards if needed */}
          </Space>
        </Col>
      </Row>

      {/* Custom styles */}
      <style>
        {`
          .ant-descriptions-item-label {
            background: #fafafa !important;
            font-weight: 500;
          }
          .ant-timeline-item-content {
            color: #666;
          }
        `}
      </style>
    </div>
  );
};

export default InstructorDetailPage;
