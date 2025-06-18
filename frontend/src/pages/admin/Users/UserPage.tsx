import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Avatar,
  Space,
  Button,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Popconfirm,
  Spin,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  UserRole,
  UserStatus,
  type User,
} from "../../../interfaces/Admin.interface";
import type { ColumnsType } from "antd/es/table";
import { getAllUsers, createUser, updateUser, deleteUser } from "../../../services/userService";
import type { TablePaginationConfig } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs'; // Import dayjs
import 'dayjs/locale/vi'; // Import Vietnamese locale for dayjs if needed

dayjs.locale('vi'); // Set default locale to Vietnamese if needed

interface Role {
  _id: string;
  name: UserRole;
}

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | undefined>(undefined);
  const [roles, setRoles] = useState<Role[]>([]);

  // Get roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/roles');
        if (response.data.success) {
          setRoles(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  // Fetch users
  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      console.log('Calling getAllUsers with params:', {
        page,
        limit,
        search,
        role: selectedRole,
        status: selectedStatus
      });
      
      const response = await getAllUsers({
        page,
        limit,
        search,
        role: selectedRole,
        status: selectedStatus,
      });
      
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        console.log('Raw user data from API:', response.data.users);
        // Sắp xếp người dùng theo thứ tự mới nhất
        const sortedUsers = [...response.data.users].sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        // Map và thêm số thứ tự
        const mappedUsers = sortedUsers.map((user, index) => {
          console.log('Processing user:', user); // Debug log
          return {
            id: user._id,
            fullname: user.fullname || user.name || 'Chưa có tên', // Sử dụng fullname từ backend, fallback về name
            email: user.email,
            avatar: user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            role: user.role_id,
            status: user.status,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            phone: user.phone || '',
            address: user.address || '',
            dob: user.dob || null,
            gender: user.gender || 'Khác',
            approval_status: user.approval_status || 'approved',
            number: (page - 1) * pagination.pageSize + index + 1
          };
        });

        console.log('Mapped users:', mappedUsers); // Debug log
        setUsers(mappedUsers as User[]);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.pagination.total,
        });
      } else {
        console.error('API Error:', response.message);
        message.error(response.message || "Lỗi khi tải danh sách người dùng");
      }
    } catch (error) {
      console.error('Network Error:', error);
      if (error instanceof Error) {
        message.error(error.message || "Lỗi khi tải danh sách người dùng");
      } else {
        message.error("Lỗi không xác định khi tải danh sách người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, selectedRole, selectedStatus]);

  const userStats = {
    total: pagination.total,
    active: users.filter(user => user.status === UserStatus.ACTIVE).length,
    inactive: users.filter(user => user.status === UserStatus.INACTIVE).length,
    banned: users.filter(user => user.status === UserStatus.BANNED).length,
  };

  // Helper to get status tag
  const getStatusTag = (status: UserStatus) => {
    const statusMap: Record<UserStatus, { color: string; label: string; icon: React.ReactNode }> = {
      [UserStatus.ACTIVE]: { color: "green", label: "Đang hoạt động", icon: <CheckCircleOutlined /> },
      [UserStatus.INACTIVE]: { color: "default", label: "Không hoạt động", icon: <ClockCircleOutlined /> },
      [UserStatus.BANNED]: { color: "red", label: "Bị cấm", icon: <CloseCircleOutlined /> },
    };

    const tag = statusMap[status] || { color: "default", label: status, icon: null };
    return (
      <Tag
        color={tag.color}
        icon={tag.icon}
        className="px-2 py-1 rounded-full text-sm font-medium"
      >
        {tag.label}
      </Tag>
    );
  };

  // Helper to get role tag
  const getRoleTag = (role: string | UserRole | Role) => {
    let roleName: string;
    if (typeof role === 'string') {
      roleName = role;
    } else if (typeof role === 'object') {
      roleName = role.name;
    } else {
      roleName = role;
    }
    
    const roleMap: Record<UserRole, { color: string; label: string }> = {
      [UserRole.ADMIN]: { color: "red", label: 'Admin' },
      [UserRole.INSTRUCTOR]: { color: "blue", label: 'Giảng viên' },
      [UserRole.STUDENT]: { color: "green", label: 'Học viên' },
      [UserRole.MODERATOR]: { color: "orange", label: 'Kiểm duyệt' },
    };
    const tag = roleMap[roleName as UserRole] || { color: "default", label: roleName };
    return (
      <Tag color={tag.color} className="px-2 py-1 rounded-full text-sm font-medium">
        {tag.label}
      </Tag>
    );
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    console.log('Editing user:', user); // Debug log
    setEditingUser(user);
    form.setFieldsValue({
      fullname: user.fullname || user.name, // Thêm fallback cho name
      email: user.email,
      role: typeof user.role === 'object' ? user.role.name : user.role,
      status: user.status,
      phone: user.phone || '',
      address: user.address || '',
      dob: user.dob ? dayjs(user.dob) : null,
      gender: user.gender || 'Khác',
      approval_status: user.approval_status || 'approved'
    });
    console.log('Form values after set:', form.getFieldsValue()); // Debug log
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (id: string | number) => {
    try {
      const response = await deleteUser(id.toString());
      if (response.success) {
        message.success("Xóa người dùng thành công");
        fetchUsers(pagination.current);
      } else {
        message.error(response.message || "Lỗi khi xóa người dùng");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting user:", error.message);
        message.error("Lỗi khi xóa người dùng");
      }
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values before submit:', values); // Debug log
      
      if (editingUser) {
        // Update existing user
        console.log('Updating user with ID:', editingUser.id);
        
        // Tìm role_id dựa trên role name
        const selectedRole = roles.find(r => r.name === values.role);
        if (!selectedRole) {
          message.error('Không tìm thấy vai trò');
          return;
        }

        const updateData = {
          fullname: values.fullname,
          role_id: selectedRole._id,
          status: values.status,
          phone: values.phone,
          address: values.address,
          dob: values.dob ? values.dob.toISOString() : null,
          gender: values.gender,
          approval_status: values.approval_status,
          email: values.email
        };

        console.log('Update data being sent:', updateData); // Debug log
        const response = await updateUser(editingUser.id.toString(), updateData);
        if (response.success) {
          message.success("Cập nhật người dùng thành công");
          setIsModalVisible(false);
          fetchUsers(pagination.current);
        } else {
          message.error(response.message || "Lỗi khi cập nhật người dùng");
        }
      } else {
        // Add new user
        console.log('Thêm mới người dùng');
        
        // Tìm role_id dựa trên role name
        const selectedRole = roles.find(r => r.name === values.role);
        if (!selectedRole) {
          message.error('Không tìm thấy vai trò');
          return;
        }

        const userData = {
          email: values.email,
          password: values.password,
          fullname: values.fullname,
          role_id: selectedRole._id,
          status: values.status,
          phone: values.phone,
          address: values.address,
          dob: values.dob ? values.dob.toISOString() : null,
          gender: values.gender,
          approval_status: values.approval_status,
          nickname: values.fullname.toLowerCase().replace(/[^a-z0-9]/g, '-')
        };

        console.log('Create data being sent:', userData); // Debug log
        const response = await createUser(userData);
        if (response.success) {
          message.success("Thêm người dùng thành công");
          setIsModalVisible(false);
          fetchUsers(pagination.current);
        } else {
          message.error(response.message || "Lỗi khi thêm người dùng");
        }
      }
    } catch (error) {
      console.error('Error details:', {
        error: error,
        formValues: form.getFieldsValue(),
        editingUser: editingUser
      });
      message.error(editingUser ? "Lỗi khi cập nhật người dùng" : "Lỗi khi thêm người dùng");
    }
  };

  const handleViewDetails = (user: User) => {
    setViewingUser(user);
    setIsDetailsModalVisible(true);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetchUsers(pagination.current || 1, pagination.pageSize || 10);
  };

  const handleRoleChange = async (userId: string | number, newRole: UserRole) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Lấy tên role hiện tại
      let currentRoleName: string;
      if (typeof user.role === 'string') {
        currentRoleName = user.role;
      } else if (typeof user.role === 'object') {
        currentRoleName = user.role.name;
      } else {
        currentRoleName = user.role;
      }
      
      if (currentRoleName === newRole) return;

      // Tìm role_id dựa trên role name
      const selectedRole = roles.find(r => r.name === newRole);
      if (!selectedRole) {
        message.error('Vai trò không hợp lệ');
        return;
      }

      await updateUser(userId.toString(), { role_id: selectedRole._id });
      message.success('Cập nhật vai trò thành công');
      fetchUsers(pagination.current);
    } catch (error) {
      message.error('Lỗi khi cập nhật vai trò');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "#",
      dataIndex: "number",
      width: 60,
      align: "center",
      render: (number: number) => (
        <div className="font-medium text-center">{number}</div>
      ),
    },
    {
      title: "Người dùng",
      dataIndex: "fullname",
      render: (_: unknown, user: User) => (
        <Space direction="horizontal" size="middle" className="py-2">
          <Avatar
            src={user.avatar}
            icon={<UserOutlined />}
            size={48}
            className="border-2 border-gray-100 shadow-sm cursor-pointer hover:opacity-80"
            onClick={(e?: MouseEvent<HTMLElement>) => {
              e?.stopPropagation();
              handleViewDetails(user);
            }}
          />
          <div>
            <div 
              className="font-semibold text-base text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={(e: MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                handleViewDetails(user);
              }}
            >
              {user.fullname}
            </div>
            <div className="text-sm text-gray-600 font-medium">{user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Quyền hạn",
      dataIndex: "role",
      align: "center",
      render: (_: unknown, user: User) => {
        // Lấy tên role hiện tại
        let currentRoleName: string;
        if (typeof user.role === 'string') {
          currentRoleName = user.role;
        } else if (typeof user.role === 'object') {
          currentRoleName = user.role.name;
        } else {
          currentRoleName = user.role;
        }
        
        return (
          <Select
            value={currentRoleName as UserRole}
            onChange={(value: UserRole) => handleRoleChange(user.id, value)}
            style={{ width: '120px' }}
            options={roles.map(role => ({
              value: role.name,
              label: getRoleTag(role.name)
            }))}
          />
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (_: unknown, user: User) => getStatusTag(user.status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      align: "center",
      render: (date: string) => (
        <div className="text-sm">
          <div className="font-medium">{new Date(date).toLocaleDateString("vi-VN")}</div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_: unknown, user: User) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(user);
            }}
            className="flex items-center"
          />
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDeleteUser(user.id);
            }}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
          <p className="text-gray-500 mt-1">Quản lý và theo dõi thông tin người dùng</p>
        </div>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng số người dùng"
              value={userStats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
             title="Đang hoạt động"
             value={userStats.active}
             prefix={<CheckCircleOutlined />}
             valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Không hoạt động"
              value={userStats.inactive}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Tìm kiếm tên hoặc email"
            allowClear
            prefix={<SearchOutlined />}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            style={{ width: 300 }}
          />

          <Select
            placeholder="Lọc theo vai trò"
            allowClear
            style={{ width: 200 }}
            onChange={(value: UserRole | undefined) => {
              setSelectedRole(value);
            }}
            options={[
              { value: UserRole.ADMIN, label: 'Quản trị viên' },
              { value: UserRole.MODERATOR, label: 'Kiểm duyệt viên' },
              { value: UserRole.INSTRUCTOR, label: 'Giảng viên' },
              { value: UserRole.STUDENT, label: 'Học viên' },
            ]}
          />

          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 200 }}
            onChange={(value: UserStatus | undefined) => {
              setSelectedStatus(value);
            }}
            options={[
              { value: UserStatus.ACTIVE, label: 'Đang hoạt động' },
              { value: UserStatus.INACTIVE, label: 'Không hoạt động' },
              { value: UserStatus.BANNED, label: 'Bị cấm' },
            ]}
          />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleAddUser}
          >
            Thêm người dùng
          </Button>
        </div>
      </Card>

      <Card className="shadow-sm">
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={users}
            pagination={pagination}
            onChange={handleTableChange}
            className="users-table"
          />
        </Spin>
      </Card>

      <Modal
        title={editingUser ? "Sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ 
            role: UserRole.STUDENT, 
            status: UserStatus.ACTIVE,
            gender: 'Khác',
            approval_status: 'approved'
          }}
        >
          <Form.Item
            name="fullname"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select>
              {Object.values(UserRole).map((role) => (
                <Select.Option key={role} value={role}>
                  {getRoleTag(role)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              {Object.values(UserStatus).map((status) => (
                <Select.Option key={status} value={status}>
                  {getStatusTag(status)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="approval_status"
            label="Trạng thái phê duyệt"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái phê duyệt" }]}
          >
            <Select>
              <Select.Option value="approved">Đã phê duyệt</Select.Option>
              <Select.Option value="pending">Đang chờ phê duyệt</Select.Option>
              <Select.Option value="rejected">Bị từ chối</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ pattern: /^\d{10}$/, message: "Số điện thoại phải có 10 chữ số" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
          </Form.Item>
          <Form.Item
            name="dob"
            label="Ngày sinh"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
          >
            <Select>
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết người dùng"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {viewingUser && (
          <div className="p-4">
            {/* Header with avatar and basic info */}
            <div className="flex items-center mb-8 pb-6 border-b border-gray-100">
              <Avatar 
                src={viewingUser.avatar !== 'default-avatar.png' ? viewingUser.avatar : undefined} 
                icon={<UserOutlined />} 
                size={80} 
                className="mr-6 border-2 border-gray-100 shadow-sm"
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{viewingUser.fullname}</h3>
                <div className="flex items-center gap-4">
                  <div className="text-gray-600 flex items-center">
                    <span className="mr-2">Email:</span>
                    <span className="font-medium">{viewingUser.email}</span>
                  </div>
                  <div className="text-gray-600 flex items-center">
                    <span className="mr-2">Vai trò:</span>
                    {getRoleTag(viewingUser.role)}
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Thông tin cơ bản</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trạng thái:</span>
                      <span>{getStatusTag(viewingUser.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngày tạo:</span>
                      <span className="font-medium">
                        {new Date(viewingUser.createdAt).toLocaleDateString("vi-VN", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {viewingUser.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cập nhật lần cuối:</span>
                        <span className="font-medium">
                          {new Date(viewingUser.updatedAt).toLocaleDateString("vi-VN", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Thông tin liên hệ</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Số điện thoại:</span>
                      <span className="font-medium">{viewingUser.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Địa chỉ:</span>
                      <span className="font-medium">{viewingUser.address || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Thông tin cá nhân</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Giới tính:</span>
                      <span className="font-medium">{viewingUser.gender || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngày sinh:</span>
                      <span className="font-medium">
                        {viewingUser.dob ? new Date(viewingUser.dob).toLocaleDateString("vi-VN", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Role and Status Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Thông tin tài khoản</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vai trò:</span>
                      <span>{getRoleTag(viewingUser.role)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trạng thái:</span>
                      <span>{getStatusTag(viewingUser.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trạng thái phê duyệt:</span>
                      <span className="font-medium">
                        {viewingUser.approval_status === 'approved' ? 'Đã phê duyệt' :
                         viewingUser.approval_status === 'pending' ? 'Đang chờ phê duyệt' :
                         viewingUser.approval_status === 'rejected' ? 'Bị từ chối' : 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Thông tin hoạt động</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Số khóa học:</span>
                      <span className="font-medium">{viewingUser.coursesCount !== undefined && viewingUser.coursesCount !== null ? viewingUser.coursesCount : 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mô tả:</span>
                      <span className="font-medium">{viewingUser.description || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Thông tin bổ sung</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avatar:</span>
                      <span className="font-medium">
                        {viewingUser.avatar && viewingUser.avatar !== 'default-avatar.png' ? 'Đã cập nhật' : 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Xác thực email:</span>
                      <span className="font-medium">
                        {viewingUser.email_verified !== undefined ? (viewingUser.email_verified ? 'Đã xác thực' : 'Chưa xác thực') : 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style>
        {`
          .users-table .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
            color: #1f2937;
          }
          .users-table .ant-table-tbody > tr:hover > td {
            background: #f5f7fa;
          }
           .users-table .ant-table-tbody > tr > td {
            padding: 12px 8px;
          }
          .ant-tag {
            margin: 0;
          }
        `}
      </style>
    </div>
  );
};

export default UserPage;
