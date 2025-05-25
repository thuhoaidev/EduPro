import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Typography, Descriptions, Select, Space, Popconfirm, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Định nghĩa kiểu dữ liệu cho một quản trị viên (cần trùng khớp với AdminList)
interface AdminUser {
  key: string;
  avatarUrl: string;
  name: string;
  email: string;
  phoneNumber: string;
  adminRole: 'admin' | 'quản trị viên'; // Chỉ cho phép 2 giá trị này
  // Thêm các trường chi tiết khác nếu có
  lastLogin?: string; // Ví dụ: lần đăng nhập cuối
  createdAt?: string; // Ví dụ: ngày tạo tài khoản
}

// Mock dữ liệu quản trị viên (thường sẽ fetch từ API)
const mockAdminUsers: AdminUser[] = [
  {
    key: 'admin1',
    avatarUrl: 'https://via.placeholder.com/100/ADD8E6/00008B?text=DP',
    name: 'Dương Đức Phương',
    email: 'admin@gmail.com',
    phoneNumber: '?????????',
    adminRole: 'admin', // Vai trò 'admin'
    lastLogin: '2025-05-24 10:30 AM',
    createdAt: '2023-01-01',
  },
  {
    key: 'admin2',
    avatarUrl: 'https://via.placeholder.com/100/FFD700/8B0000?text=NA',
    name: 'Nguyễn Anh',
    email: 'nguyenanh@example.com',
    phoneNumber: '0987654321',
    adminRole: 'quản trị viên', // Vai trò 'quản trị viên'
    lastLogin: '2025-05-23 09:00 AM',
    createdAt: '2023-03-10',
  },
  {
    key: 'admin3',
    avatarUrl: 'https://via.placeholder.com/100/C0C0C0/4B0082?text=TV',
    name: 'Trần Văn',
    email: 'tranvan@example.com',
    phoneNumber: '0123456789',
    adminRole: 'quản trị viên', // Vai trò 'quản trị viên'
    lastLogin: '2025-05-25 08:00 AM',
    createdAt: '2022-06-15',
  },
];

const AdminDetail: React.FC = () => {
  interface AdminDetailParams {
    id: string;
  }
  const { id } = useParams<keyof AdminDetailParams>() as AdminDetailParams;

  // Tìm người dùng admin
  const initialAdmin: AdminUser | undefined = mockAdminUsers.find((admin) => admin.key === id);

  const [admin, setAdmin] = useState<AdminUser | undefined>(initialAdmin);
  const [isEditingRole, setIsEditingRole] = useState<boolean>(false);
  // Khởi tạo selectedRole với một giá trị hợp lệ
  const [selectedRole, setSelectedRole] = useState<AdminUser['adminRole']>(
    initialAdmin ? initialAdmin.adminRole : 'quản trị viên' // Cung cấp giá trị mặc định hợp lệ
  );

  // Xử lý khi không tìm thấy admin
  if (!admin) {
    return (
      <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen tw-text-center">
        <Title level={4} type="danger">Không tìm thấy quản trị viên!</Title>
        <Link to="/admin/users/admin">
          <Button type="primary" icon={<ArrowLeftOutlined />}>Quay lại danh sách Admin</Button>
        </Link>
      </div>
    );
  }

  const handleSaveRole = () => {
    // Ngăn không cho cập nhật quyền của tài khoản 'admin'
    if (admin.adminRole === 'admin') {
      message.error('Không thể cập nhật quyền của tài khoản "admin".');
      setIsEditingRole(false);
      setSelectedRole(admin.adminRole); // Quay lại quyền ban đầu
      return;
    }
    // Logic lưu quyền quản trị (trong thực tế: gọi API cập nhật)
    // Cập nhật state cục bộ sau khi lưu thành công
    setAdmin({ ...admin, adminRole: selectedRole });
    setIsEditingRole(false);
    message.success(`Đã cập nhật quyền cho ${admin.name} thành "${selectedRole}"`);
  };

  const handleCancelEdit = () => {
    setIsEditingRole(false);
    setSelectedRole(admin.adminRole); // Quay lại quyền ban đầu
  };

  const handleDeleteAdmin = () => {
    // Ngăn không cho xóa tài khoản 'admin'
    if (admin.adminRole === 'admin') {
      message.error('Không thể xóa quản trị viên có quyền "admin".');
      return;
    }
    // Logic xóa admin (trong thực tế: gọi API xóa)
    message.success(`Đã xóa quản trị viên: ${admin.name}`);
    // Trong thực tế, sau khi xóa thành công, bạn có thể điều hướng về trang danh sách admin
    // navigate('/admin/users/admin'); // uncomment dòng này nếu bạn muốn tự động điều hướng
  };

  // Xác định xem vai trò có thể chỉnh sửa được không
  const canEditRole = admin.adminRole !== 'admin';

  return (
    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen">
      {/* Breadcrumb */}
      <div className="tw-mb-6 tw-text-gray-500 tw-text-sm">
        <Link to="/" className="tw-text-blue-600 hover:tw-text-blue-800">Home</Link> /
        <Link to="/admin" className="tw-text-blue-600 hover:tw-text-blue-800"> Admin</Link> /
        <Link to="/admin/users/admin" className="tw-text-blue-600 hover:tw-text-blue-800"> Hr</Link> /
        <span className="tw-font-medium tw-text-gray-700"> Chi tiết Admin: {admin.name}</span>
      </div>

      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <Title level={2} className="tw-font-bold tw-text-gray-800 tw-mb-0">Chi tiết Quản trị viên</Title>
        <Link to="/admin/users/admin">
          <Button type="default" icon={<ArrowLeftOutlined />} className="tw-rounded-md">
            Quay lại Danh sách Admin
          </Button>
        </Link>
      </div>

      <Card className="tw-shadow-md tw-mb-6">
        <div className="tw-flex tw-items-center tw-mb-6">
          <img
            src={admin.avatarUrl}
            alt={admin.name}
            className="tw-w-24 tw-h-24 tw-rounded-full tw-object-cover tw-mr-6 tw-border tw-border-gray-200"
          />
          <div>
            <Title level={3} className="tw-mb-1">{admin.name}</Title>
            <Text type="secondary">{admin.email}</Text>
          </div>
        </div>

        <Descriptions title="Thông tin cá nhân" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label="ID Admin">{admin.key}</Descriptions.Item>
          <Descriptions.Item label="Email">{admin.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{admin.phoneNumber}</Descriptions.Item>
          <Descriptions.Item label="Lần đăng nhập cuối">{admin.lastLogin || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo tài khoản">{admin.createdAt || 'N/A'}</Descriptions.Item>

          <Descriptions.Item label="Quyền Quản Trị" span={2}>
            <Space>
              {isEditingRole && canEditRole ? (
                <>
                  <Select
                    value={selectedRole}
                    onChange={(value: AdminUser['adminRole']) => setSelectedRole(value)} // Ép kiểu rõ ràng
                    style={{ width: 150 }}
                  >
                    <Option value="admin">Admin</Option>
                    <Option value="quản trị viên">Quản trị viên</Option>
                  </Select>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleSaveRole}
                    size="small"
                  />
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleCancelEdit}
                    size="small"
                    danger
                  />
                </>
              ) : (
                <>
                  <Text strong>{admin.adminRole}</Text>
                  <Button
                    icon={<EditOutlined />}
                    type="link"
                    onClick={() => setIsEditingRole(true)}
                    size="small"
                    className={`tw-ml-2 ${!canEditRole ? 'tw-text-gray-400 tw-cursor-not-allowed' : ''}`}
                    disabled={!canEditRole} // Vô hiệu hóa nút chỉnh sửa cho vai trò 'admin'
                  />
                </>
              )}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Nút hành động khác */}
      <div className="tw-flex tw-justify-end tw-mt-6">
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa quản trị viên này?"
          onConfirm={handleDeleteAdmin}
          okText="Xóa"
          cancelText="Hủy"
          disabled={admin.adminRole === 'admin'} // Vô hiệu hóa xóa cho vai trò 'admin'
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            disabled={admin.adminRole === 'admin'} // Vô hiệu hóa nút
            className={`${admin.adminRole === 'admin' ? 'tw-bg-red-300 hover:tw-bg-red-300 tw-cursor-not-allowed' : ''}`}
          >
            Xóa Quản Trị Viên
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default AdminDetail;