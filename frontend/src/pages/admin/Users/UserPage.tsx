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

  // Fetch users
  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page,
        limit,
        search,
        role: selectedRole,
        status: selectedStatus,
      });
      
      if (response.success) {
        // Map the API response to our frontend User interface
        const mappedUsers = response.data.users.map((user) => ({
          id: user._id,
          fullName: user.name,
          email: user.email,
          avatar: user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          role: user.role_id.name,
          status: user.status,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        }));

        setUsers(mappedUsers);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.pagination.total,
        });
      } else {
        message.error(response.message || "Lỗi khi tải danh sách người dùng");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching users:", error.message);
        message.error("Lỗi khi tải danh sách người dùng");
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
  const getRoleTag = (role: UserRole) => {
    const roleMap: Record<UserRole, { color: string; label: string }> = {
      [UserRole.ADMIN]: { color: "red", label: 'Admin' },
      [UserRole.INSTRUCTOR]: { color: "blue", label: 'Giảng viên' },
      [UserRole.STUDENT]: { color: "green", label: 'Học viên' },
      [UserRole.MODERATOR]: { color: "orange", label: 'Kiểm duyệt viên' },
    };
    const tag = roleMap[role] || { color: "default", label: role };
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
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await deleteUser(id);
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
      if (editingUser) {
        // Update existing user
        await updateUser(editingUser.id.toString(), {
          name: values.fullName,
          role_id: values.role,
          status: values.status,
        });
        message.success("Cập nhật người dùng thành công");
      } else {
        // Add new user
        await createUser({
          email: values.email,
          password: values.password,
          name: values.fullName,
          role_id: values.role,
          status: values.status,
        });
        message.success("Thêm người dùng thành công");
      }
      setIsModalVisible(false);
      fetchUsers(pagination.current);
    } catch (error) {
      message.error(editingUser ? "Lỗi khi cập nhật người dùng" : "Lỗi khi thêm người dùng");
      console.error("Error saving user:", error);
    }
  };

  const handleViewDetails = (user: User) => {
    setViewingUser(user);
    setIsDetailsModalVisible(true);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetchUsers(pagination.current || 1, pagination.pageSize || 10);
  };

  const columns: ColumnsType<User> = [
    {
      title: "#",
      dataIndex: "id",
      width: 60,
      align: "center",
    },
    {
      title: "Người dùng",
      dataIndex: "fullName",
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
              {user.fullName}
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
      render: (_: unknown, user: User) => getRoleTag(user.role),
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
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng số người dùng"
              value={userStats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đang hoạt động"
              value={userStats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Không hoạt động"
              value={userStats.inactive}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Bị cấm"
              value={userStats.banned}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
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
          initialValues={{ role: UserRole.STUDENT, status: UserStatus.ACTIVE }}
        >
          <Form.Item
            name="fullName"
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
        </Form>
      </Modal>

      <Modal
        title="Chi tiết người dùng"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={600}
      >
        {viewingUser && (
          <div>
            <div className="flex items-center mb-6">
              <Avatar src={viewingUser.avatar} icon={<UserOutlined />} size={64} className="mr-4" />
              <div>
                <div className="text-xl font-bold text-gray-800">{viewingUser.fullName}</div>
                <div className="text-gray-600">{viewingUser.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-500 text-sm">ID:</div>
                <div className="font-medium">{viewingUser.id}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Vai trò:</div>
                <div className="font-medium">{getRoleTag(viewingUser.role)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Trạng thái:</div>
                <div className="font-medium">{getStatusTag(viewingUser.status)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Ngày tạo:</div>
                <div className="font-medium">{new Date(viewingUser.createdAt).toLocaleDateString("vi-VN")}</div>
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
