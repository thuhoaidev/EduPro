import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, message, Avatar, Badge, Descriptions, Space, Popconfirm } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';

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
      const { id } = useParams<{ id: string }>(); // lấy id từ URL
      const navigate = useNavigate();

      const teacher = mockTeachers.find(t => t.id === id);

      if (!teacher) {
            return (
                  <div className="text-center text-red-500 mt-10">
                        Không tìm thấy hồ sơ giảng viên.
                  </div>
            );
      }

      // Hàm xử lý cập nhật trạng thái (duyệt / từ chối)
      const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
            try {
                  // Giả lập cập nhật trạng thái API
                  // await config.patch(`/api/teachers/${id}/status`, { status });

                  message.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} hồ sơ`);
                  // Cập nhật trạng thái trong mock (chỉ giả lập)
                  teacher.status = status;

                  // Quay về trang danh sách duyệt giảng viên
                  navigate('/admin/instructor-approval');
            } catch (error) {
                  console.error(error);
                  message.error('Cập nhật trạng thái thất bại');
            }
      };

      const statusColor = teacher.status === 'approved' ? 'green' : teacher.status === 'rejected' ? 'red' : 'orange';

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
                                    src={teacher.avatar}
                                    icon={<UserOutlined />}
                                    className="shadow-md"
                              />
                              <div className="flex-1 space-y-2">
                                    <h2 className="text-2xl font-semibold">{teacher.fullName}</h2>
                                    <Badge color={statusColor} text={<span className="uppercase font-medium">{teacher.status}</span>} />
                                    <p className="text-gray-600">{teacher.bio}</p>
                              </div>
                        </div>

                        <div className="mt-8">
                              <Descriptions
                                    bordered
                                    column={1}
                                    labelStyle={{ width: 200, fontWeight: 600 }}
                                    contentStyle={{ background: "#f9fafb" }}
                              >
                                    <Descriptions.Item label="Email">{teacher.email}</Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">{teacher.phone}</Descriptions.Item>
                                    <Descriptions.Item label="Giới tính">{teacher.gender}</Descriptions.Item>
                                    <Descriptions.Item label="Ngày tạo">{teacher.createdAt}</Descriptions.Item>
                              </Descriptions>

                              <div className="mt-6 flex justify-end gap-4">
                                    <Space>
                                          <Popconfirm
                                                title="Bạn có chắc muốn duyệt?"
                                                onConfirm={() => handleUpdateStatus('approved')}
                                                okText="Duyệt"
                                                cancelText="Hủy"
                                                disabled={teacher.status !== 'pending'}
                                          >
                                                <Button type="primary" disabled={teacher.status !== 'pending'}>
                                                      Duyệt
                                                </Button>
                                          </Popconfirm>

                                          <Popconfirm
                                                title="Bạn có chắc muốn từ chối?"
                                                onConfirm={() => handleUpdateStatus('rejected')}
                                                okText="Từ chối"
                                                cancelText="Hủy"
                                                disabled={teacher.status !== 'pending'}
                                          >
                                                <Button danger disabled={teacher.status !== 'pending'}>
                                                      Từ chối
                                                </Button>
                                          </Popconfirm>
                                    </Space>
                              </div>
                        </div>
                  </Card>
            </div>
      );
};

export default TeacherProfileDetail;
