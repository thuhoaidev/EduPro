import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, Avatar, Tag, Button, Descriptions, Spin, Divider, message, Form, Upload } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  type User,
  UserRole,
  UserStatus,
  type Role
} from "../../../interfaces/Admin.interface";
import { getUserById } from "../../../services/userService";
import dayjs from 'dayjs';

// Dữ liệu mẫu nâng cao
const mockUsers: User[] = [
  {
    id: 1,
    fullname: "Nguyễn Văn A",
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
    fullname: "Trần Thị B",
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
    fullname: "Lê Văn C",
    email: "c@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: UserRole.STUDENT,
    status: UserStatus.BANNED,
    createdAt: "2024-03-10",
    updatedAt: "2024-03-10",
    phone: "0345 678 910",
    address: "Thanh Hóa, Việt Nam",
  },
];

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        console.log('Fetching user detail for ID:', id); // Debug log
        
        if (!id) {
          message.error('Không có ID người dùng');
          return;
        }

        const response = await getUserById(id);
        console.log('Raw API Response:', response); // Debug log

        if (response.success && response.data) {
          const userData = response.data;
          console.log('User data from API:', userData); // Debug log
          
          // Map dữ liệu từ API sang định dạng User
          const mappedUser: User = {
            id: userData._id,
            fullname: userData.fullname || userData.name || 'Chưa có tên',
            email: userData.email,
            avatar: userData.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            role: typeof userData.role_id === 'string' ? userData.role_id : userData.role_id,
            status: userData.status,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
            phone: userData.phone || '',
            address: userData.address || '',
            dob: userData.dob || null,
            gender: userData.gender || 'Khác',
            approval_status: userData.approval_status || 'approved',
            description: userData.description || '',
            coursesCount: userData.coursesCount || 0
          };
          console.log('Mapped user data:', mappedUser); // Debug log
          setUser(mappedUser);
        } else {
          console.error('API Error:', response); // Debug log
          message.error(response.message || 'Không thể lấy thông tin người dùng');
        }
      } catch (error) {
        console.error('Error fetching user detail:', error);
        message.error('Lỗi khi tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserDetail();
    }
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

  const getRoleColor = (role: UserRole | Role) => {
    const roleName = typeof role === 'object' ? role.name : role;
    const colorMap: Record<UserRole, string> = {
      [UserRole.ADMIN]: "geekblue",
      [UserRole.INSTRUCTOR]: "purple",
      [UserRole.STUDENT]: "default",
      [UserRole.MODERATOR]: "orange"
    };
    return colorMap[roleName as UserRole] || "default";
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "green";
      case UserStatus.BANNED:
        return "red";
      default:
        return "orange";
    }
  };

  const getRoleName = (role: UserRole | Role) => {
    const roleName = typeof role === 'object' ? role.name : role;
    const roleMap: Record<UserRole, string> = {
      [UserRole.ADMIN]: "Quản trị viên",
      [UserRole.INSTRUCTOR]: "Giảng viên",
      [UserRole.STUDENT]: "Học viên",
      [UserRole.MODERATOR]: "Kiểm duyệt viên"
    };
    return roleMap[roleName as UserRole] || roleName;
  };

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
          <Form form={form} layout="vertical">
            <Form.Item
              name="avatar"
              label="Ảnh đại diện"
              valuePropName="fileList"
              getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
            >
              <Upload
                name="avatar"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => false}
                accept="image/*"
                onChange={info => {
                  if (info.file.status === 'removed') {
                    form.setFieldsValue({ avatar: undefined });
                  } else if (info.file.originFileObj) {
                    const reader = new FileReader();
                    reader.onload = e => {
                      form.setFieldsValue({
                        avatar: [{
                          uid: info.file.uid,
                          name: info.file.name,
                          status: 'done',
                          url: e.target?.result,
                          thumbUrl: e.target?.result,
                          originFileObj: info.file.originFileObj
                        }]
                      });
                    };
                    reader.readAsDataURL(info.file.originFileObj);
                  }
                }}
              >
                {form.getFieldValue('avatar') && form.getFieldValue('avatar').length > 0 ? (
                  <img
                    src={form.getFieldValue('avatar')[0].thumbUrl || form.getFieldValue('avatar')[0].url}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                    alt="avatar-default"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </Upload>
            </Form.Item>
            <Button type="primary" onClick={async () => {
              try {
                const values = await form.validateFields();
                const formData = new FormData();
                if (values.avatar && values.avatar[0] && values.avatar[0].originFileObj) {
                  formData.append('avatar', values.avatar[0].originFileObj);
                  await updateUser(user.id, formData); // Đảm bảo import updateUser từ service
                  message.success('Cập nhật avatar thành công!');
                } else {
                  message.warning('Bạn chưa chọn ảnh mới!');
                }
              } catch (err) {
                message.error('Lỗi khi cập nhật avatar');
              }
            }}>Cập nhật avatar</Button>
          </Form>
          <div>
            <h2 className="text-2xl font-semibold">{user.fullname}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <Descriptions title="Thông tin cơ bản" column={1} bordered>
          <Descriptions.Item label="Vai trò">
            <Tag color={getRoleColor(user.role)}>{getRoleName(user.role)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(user.status)}>
              {user.status === UserStatus.ACTIVE ? "Đang hoạt động" :
               user.status === UserStatus.INACTIVE ? "Không hoạt động" :
               user.status === UserStatus.BANNED ? "Bị cấm" : user.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{user.phone || "Chưa cập nhật"}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{user.address || "Chưa cập nhật"}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {user.dob ? dayjs(user.dob).format('DD/MM/YYYY') : "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">{user.gender || "Chưa cập nhật"}</Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions title="Thời gian hoạt động" column={1} bordered>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật gần nhất">
            {user.updatedAt ? dayjs(user.updatedAt).format('DD/MM/YYYY HH:mm') : "Chưa cập nhật"}
          </Descriptions.Item>
        </Descriptions>

        {typeof user.role === 'object' && user.role.name === UserRole.INSTRUCTOR && (
          <>
            <Divider />
            <Descriptions title="Thông tin giảng viên" column={1} bordered>
              <Descriptions.Item label="Số khóa học đang dạy">
                {user.coursesCount || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {user.description || "Chưa có mô tả"}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    </div>
  );
};

export default UserDetail;
