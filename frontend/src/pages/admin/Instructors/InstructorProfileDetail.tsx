import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  message, 
  Avatar, 
  Badge, 
  Descriptions, 
  Space, 
  Popconfirm,
  Row,
  Col,
  Divider,
  Tag,
  Tooltip
} from 'antd';
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
} from '@ant-design/icons';

interface TeacherProfile {
      id: string;
      fullName: string;
      email: string;
      avatar: string;
      status: 'pending' | 'approved' | 'rejected';
      createdAt: string; // ISO date string
      bio: string;
      phone: string;
      gender: 'Nam' | 'Nữ'; // hoặc string nếu có thêm giới tính khác
}


// Giả lập danh sách dữ liệu (nên fetch thực tế từ API)
const mockTeachers: TeacherProfile[] = [
      {
            id: "1",
            fullName: "Nguyễn Văn A",
            email: "nva@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=11",
            status: "pending",
            createdAt: "2024-01-01",
            bio: "Giảng viên dạy lập trình Web với hơn 5 năm kinh nghiệm.",
            phone: "0912345678",
            gender: "Nam",
      },
      {
            id: "2",
            fullName: "Trần Thị B",
            email: "ttb@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=12",
            status: "pending",
            createdAt: "2024-02-01",
            bio: "Chuyên gia lĩnh vực Trí tuệ nhân tạo và Học máy.",
            phone: "0912345679",
            gender: "Nữ",
      },
      {
            id: "3",
            fullName: "Lê Văn C",
            email: "lvc@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=13",
            status: "pending",
            createdAt: "2024-03-01",
            bio: "Có 10 năm giảng dạy Cơ sở dữ liệu và SQL.",
            phone: "0912345680",
            gender: "Nam",
      },
      {
            id: "4",
            fullName: "Phạm Thị D",
            email: "ptd@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=14",
            status: "pending",
            createdAt: "2024-03-12",
            bio: "Giảng viên ngành Hệ thống thông tin.",
            phone: "0912345681",
            gender: "Nữ",
      },
      {
            id: "5",
            fullName: "Hoàng Văn E",
            email: "hve@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=15",
            status: "pending",
            createdAt: "2024-03-20",
            bio: "Chuyên môn về An ninh mạng và bảo mật hệ thống.",
            phone: "0912345682",
            gender: "Nam",
      },
      {
            id: "6",
            fullName: "Đặng Thị F",
            email: "dtf@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=16",
            status: "pending",
            createdAt: "2024-04-01",
            bio: "Giảng dạy Python cơ bản và nâng cao.",
            phone: "0912345683",
            gender: "Nữ",
      },
      {
            id: "7",
            fullName: "Ngô Văn G",
            email: "nvg@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=17",
            status: "pending",
            createdAt: "2024-04-05",
            bio: "Giảng viên phát triển phần mềm di động.",
            phone: "0912345684",
            gender: "Nam",
      },
      {
            id: "8",
            fullName: "Bùi Thị H",
            email: "bth@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=18",
            status: "pending",
            createdAt: "2024-04-10",
            bio: "Thành thạo lập trình Frontend với ReactJS.",
            phone: "0912345685",
            gender: "Nữ",
      },
      {
            id: "9",
            fullName: "Trịnh Văn I",
            email: "tvi@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=19",
            status: "pending",
            createdAt: "2024-04-15",
            bio: "Hướng dẫn xây dựng hệ thống phân tán.",
            phone: "0912345686",
            gender: "Nam",
      },
      {
            id: "10",
            fullName: "Dương Thị K",
            email: "dtk@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=20",
            status: "pending",
            createdAt: "2024-04-20",
            bio: "Giảng viên ngành Khoa học dữ liệu.",
            phone: "0912345687",
            gender: "Nữ",
      },
      {
            id: "11",
            fullName: "Mai Văn L",
            email: "mvl@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=21",
            status: "pending",
            createdAt: "2024-04-25",
            bio: "Kinh nghiệm đào tạo Java backend hơn 6 năm.",
            phone: "0912345688",
            gender: "Nam",
      },
      {
            id: "12",
            fullName: "Vũ Thị M",
            email: "vtm@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=22",
            status: "pending",
            createdAt: "2024-04-28",
            bio: "Chuyên ngành Thiết kế trải nghiệm người dùng (UX).",
            phone: "0912345689",
            gender: "Nữ",
      },
      {
            id: "13",
            fullName: "Phan Văn N",
            email: "pvn@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=23",
            status: "pending",
            createdAt: "2024-05-01",
            bio: "Giảng viên Kỹ thuật phần mềm với kinh nghiệm thực tế.",
            phone: "0912345690",
            gender: "Nam",
      },
      {
            id: "14",
            fullName: "Trần Thị O",
            email: "tto@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=24",
            status: "pending",
            createdAt: "2024-05-03",
            bio: "Giảng viên các môn Công nghệ mới như Blockchain.",
            phone: "0912345691",
            gender: "Nữ",
      },
      {
            id: "15",
            fullName: "Lý Văn P",
            email: "lvp@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=25",
            status: "pending",
            createdAt: "2024-05-05",
            bio: "Chuyên giảng dạy các công cụ DevOps và CI/CD.",
            phone: "0912345692",
            gender: "Nam",
      },
      {
            id: "16",
            fullName: "Đỗ Thị Q",
            email: "dtq@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=26",
            status: "pending",
            createdAt: "2024-05-06",
            bio: "Có bằng Tiến sĩ chuyên ngành Dữ liệu lớn.",
            phone: "0912345693",
            gender: "Nữ",
      },
      {
            id: "17",
            fullName: "Trịnh Văn R",
            email: "tvr@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=27",
            status: "pending",
            createdAt: "2024-05-07",
            bio: "Kinh nghiệm hướng dẫn đề tài và khóa luận tốt nghiệp.",
            phone: "0912345694",
            gender: "Nam",
      },
      {
            id: "18",
            fullName: "Nguyễn Thị S",
            email: "nts@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=28",
            status: "pending",
            createdAt: "2024-05-08",
            bio: "Giảng viên ngành Công nghệ phần mềm ứng dụng.",
            phone: "0912345695",
            gender: "Nữ",
      },
      {
            id: "19",
            fullName: "Lê Văn T",
            email: "lvt@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=29",
            status: "pending",
            createdAt: "2024-05-10",
            bio: "Chuyên dạy Node.js và hệ thống backend hiệu năng cao.",
            phone: "0912345696",
            gender: "Nam",
      },
      {
            id: "20",
            fullName: "Hoàng Thị U",
            email: "htu@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=30",
            status: "pending",
            createdAt: "2024-05-12",
            bio: "Giảng viên trẻ, đam mê công nghệ giáo dục.",
            phone: "0912345697",
            gender: "Nữ",
      },
      {
            id: "21",
            fullName: "Phạm Văn V",
            email: "pvv@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=31",
            status: "pending",
            createdAt: "2024-05-13",
            bio: "Đào tạo chuyên sâu về kiểm thử phần mềm (QA/QC).",
            phone: "0912345698",
            gender: "Nam",
      },
      {
            id: "22",
            fullName: "Bùi Thị X",
            email: "btx@gmail.com",
            avatar: "https://i.pravatar.cc/150?img=32",
            status: "pending",
            createdAt: "2024-05-14",
            bio: "Hướng dẫn lập trình cho học sinh THPT.",
            phone: "0912345699",
            gender: "Nữ",
      }
];



const TeacherProfileDetail = () => {
      const { id } = useParams<{ id: string }>();
      const navigate = useNavigate();
      const teacher = mockTeachers.find(t => t.id === id);

      if (!teacher) {
            return (
                  <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="text-2xl font-semibold text-red-500 mb-4">
                              Không tìm thấy hồ sơ giảng viên
                        </div>
                        <Button type="primary" onClick={() => navigate(-1)}>
                              Quay lại danh sách
                        </Button>
                  </div>
            );
      }

      const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
            try {
                  // await config.patch(`/api/teachers/${id}/status`, { status });
                  message.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} hồ sơ`);
                  teacher.status = status;
                  navigate('/admin/instructor-approval');
            } catch (error) {
                  console.error(error);
                  message.error('Cập nhật trạng thái thất bại');
            }
      };

      const getStatusConfig = (status: string) => {
            const config = {
                  approved: { color: 'success' as const, icon: <CheckCircleOutlined />, text: 'Đã duyệt' },
                  rejected: { color: 'error' as const, icon: <CloseCircleOutlined />, text: 'Đã từ chối' },
                  pending: { color: 'warning' as const, icon: <ClockCircleOutlined />, text: 'Chờ duyệt' }
            };
            return config[status as keyof typeof config] || config.pending;
      };

      const statusConfig = getStatusConfig(teacher.status);

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
                        <Col xs={24}>
                              <Card className="shadow-sm">
                                    <div className="flex flex-col md:flex-row gap-6">
                                          <div className="flex flex-col items-center">
                                                <Avatar
                                                      size={120}
                                                      src={teacher.avatar}
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
                                                      <Tooltip title="LinkedIn">
                                                            <Button type="text" icon={<LinkedinOutlined />} />
                                                      </Tooltip>
                                                      <Tooltip title="GitHub">
                                                            <Button type="text" icon={<GithubOutlined />} />
                                                      </Tooltip>
                                                </div>
                                          </div>

                                          <div className="flex-1">
                                                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                                      {teacher.fullName}
                                                </h1>
                                                <div className="flex items-center gap-2 text-gray-600 mb-4">
                                                      <EnvironmentOutlined />
                                                      <span>Hà Nội, Việt Nam</span>
                                                </div>
                                                <p className="text-gray-600 text-base leading-relaxed">
                                                      {teacher.bio}
                                                </p>
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                      <Tag color="blue" icon={<BookOutlined />}>Lập trình Web</Tag>
                                                      <Tag color="green" icon={<BookOutlined />}>ReactJS</Tag>
                                                      <Tag color="purple" icon={<BookOutlined />}>Node.js</Tag>
                                                      <Tag color="orange" icon={<BookOutlined />}>JavaScript</Tag>
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
                                                <a href={`mailto:${teacher.email}`} className="text-blue-600 hover:text-blue-800">
                                                      {teacher.email}
                                                </a>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                                label={
                                                      <span className="flex items-center gap-2">
                                                            <PhoneOutlined /> Số điện thoại
                                                      </span>
                                                }
                                          >
                                                <a href={`tel:${teacher.phone}`} className="text-blue-600 hover:text-blue-800">
                                                      {teacher.phone}
                                                </a>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                                label={
                                                      <span className="flex items-center gap-2">
                                                            <UserOutlined /> Giới tính
                                                      </span>
                                                }
                                          >
                                                {teacher.gender}
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                                label={
                                                      <span className="flex items-center gap-2">
                                                            <CalendarOutlined /> Ngày tạo
                                                      </span>
                                                }
                                          >
                                                {new Date(teacher.createdAt).toLocaleDateString('vi-VN', {
                                                      year: 'numeric',
                                                      month: 'long',
                                                      day: 'numeric'
                                                })}
                                          </Descriptions.Item>
                                    </Descriptions>

                                    {teacher.status === 'pending' && (
                                          <div className="mt-6 flex justify-end gap-4">
                                                <Space>
                                                      <Popconfirm
                                                            title="Duyệt hồ sơ"
                                                            description="Bạn có chắc chắn muốn duyệt hồ sơ này?"
                                                            onConfirm={() => handleUpdateStatus('approved')}
                                                            okText="Duyệt"
                                                            cancelText="Hủy"
                                                            okButtonProps={{ type: 'primary' }}
                                                      >
                                                            <Button 
                                                                  type="primary"
                                                                  icon={<CheckCircleOutlined />}
                                                                  className="flex items-center"
                                                            >
                                                                  Duyệt hồ sơ
                                                            </Button>
                                                      </Popconfirm>

                                                      <Popconfirm
                                                            title="Từ chối hồ sơ"
                                                            description="Bạn có chắc chắn muốn từ chối hồ sơ này?"
                                                            onConfirm={() => handleUpdateStatus('rejected')}
                                                            okText="Từ chối"
                                                            cancelText="Hủy"
                                                            okButtonProps={{ danger: true }}
                                                      >
                                                            <Button 
                                                                  danger
                                                                  icon={<CloseCircleOutlined />}
                                                                  className="flex items-center"
                                                            >
                                                                  Từ chối
                                                            </Button>
                                                      </Popconfirm>
                                                </Space>
                                          </div>
                                    )}
                              </Card>
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

export default TeacherProfileDetail;
