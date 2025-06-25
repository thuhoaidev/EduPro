import { useState, useEffect } from "react";
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
  DatePicker,
  Upload,
  Tooltip,
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
  TeamOutlined,
  UserSwitchOutlined,
  CalendarOutlined,
  PhoneOutlined,
  HomeOutlined,
  GiftOutlined,
  ManOutlined,
} from "@ant-design/icons";
import {
  UserRole,
  UserStatus,
  type User,
} from "../../../interfaces/Admin.interface";
import { getAllUsers, createUser, updateUser, deleteUser } from "../../../services/userService";
import type { TablePaginationConfig } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs'; // Import dayjs
import 'dayjs/locale/vi'; // Import Vietnamese locale for dayjs if needed
import type { UploadFile } from 'antd/es/upload/interface';
import styles from './UserPage.module.css';

dayjs.locale('vi'); // Set default locale to Vietnamese if needed

interface Role {
  _id: string;
  name: UserRole;
}

const { RangePicker } = DatePicker;

// --- Helper Components ---

interface StatCardsProps {
  userStats: {
    total: number;
    active: number;
    inactive: number;
  };
}

const StatCards = ({ userStats }: StatCardsProps) => (
  <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
    <Col xs={24} sm={12} md={8}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Tổng số người dùng"
          value={userStats.total}
          prefix={<TeamOutlined className={styles.statIcon} />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={8}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Đang hoạt động"
          value={userStats.active}
          prefix={<UserSwitchOutlined className={styles.statIcon} style={{ color: '#52c41a' }} />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={8}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Không hoạt động"
          value={userStats.inactive}
          prefix={<CloseCircleOutlined className={styles.statIcon} style={{ color: '#ff4d4f' }} />}
        />
      </Card>
    </Col>
  </Row>
);

interface FilterSectionProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearch: (value: string) => void;
  selectedRole: UserRole | undefined;
  setSelectedRole: (role: UserRole | undefined) => void;
  selectedStatus: UserStatus | undefined;
  setSelectedStatus: (status: UserStatus | undefined) => void;
  setDateRange: (dates: any) => void;
}

const FilterSection = ({
  searchInput,
  setSearchInput,
  setSearch,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  setDateRange,
}: FilterSectionProps) => (
  <div className={styles.filterGroup}>
    <Input
      placeholder="Tìm kiếm theo tên, email..."
      prefix={<SearchOutlined />}
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      onPressEnter={() => setSearch(searchInput)}
      className={styles.filterInput}
      allowClear
    />
    <Select
      placeholder="Lọc theo vai trò"
      value={selectedRole}
      onChange={setSelectedRole}
      className={styles.filterSelect}
      allowClear
    >
      {Object.values(UserRole).map((role) => (
        <Select.Option key={role} value={role}>
          {role === UserRole.ADMIN ? 'Admin' :
           role === UserRole.INSTRUCTOR ? 'Giảng viên' :
           role === UserRole.STUDENT ? 'Học viên' :
           role === UserRole.MODERATOR ? 'Kiểm duyệt' : role}
        </Select.Option>
      ))}
    </Select>
    <Select
      placeholder="Lọc theo trạng thái"
      value={selectedStatus}
      onChange={setSelectedStatus}
      className={styles.filterSelect}
      allowClear
    >
      <Select.Option value={UserStatus.ACTIVE}>Hoạt động</Select.Option>
      <Select.Option value={UserStatus.INACTIVE}>Không hoạt động</Select.Option>
    </Select>
    <RangePicker
      placeholder={['Từ ngày', 'Đến ngày']}
      onChange={(dates) => setDateRange(dates)}
      className={styles.filterDateRange}
      format="DD/MM/YYYY"
    />
  </div>
);

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [userForm] = Form.useForm();
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
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [avatarFileList, setAvatarFileList] = useState<UploadFile[]>([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

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

  // Calculate user statistics
  const calculateUserStats = (users: User[], totalUsers: number) => {
    setUserStats({
      total: totalUsers,
      active: users.filter(user => user.status === UserStatus.ACTIVE).length,
      inactive: users.filter(user => user.status === UserStatus.INACTIVE).length,
    });
  };

  // Fetch users
  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search,
        role: selectedRole,
        status: selectedStatus,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      };
      
      const response = await getAllUsers(params);
      
      if (response.success && response.data) {
        const sortedUsers = [...response.data.users].sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const mappedUsers = sortedUsers.map((user, index) => ({
            id: user._id,
          fullname: user.fullname || user.name || 'Chưa có tên',
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
        }));

        const newTotal = response.data.pagination.total;

        setUsers(mappedUsers as User[]);
        setPagination({
          ...pagination,
          current: page,
          total: newTotal,
        });
        calculateUserStats(mappedUsers as User[], newTotal);
      } else {
        message.error(response.message || "Lỗi khi tải danh sách người dùng");
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || "Lỗi khi tải danh sách người dùng");
      } else {
        message.error("Lỗi không xác định khi tải danh sách người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when search or filters change
  useEffect(() => {
    fetchUsers();
  }, [search, selectedRole, selectedStatus, dateRange]);

  // Helper to get status tag
  const getStatusTag = (status: UserStatus) => {
    const statusMap: Record<UserStatus, { color: string; label: string; icon: React.ReactNode }> = {
      [UserStatus.ACTIVE]: { color: "success", label: "Hoạt động", icon: <CheckCircleOutlined /> },
      [UserStatus.INACTIVE]: { color: "default", label: "Không hoạt động", icon: <ClockCircleOutlined /> },
    };

    const tag = statusMap[status] || { color: "default", label: status, icon: null };
    return (
      <Tag
        color={tag.color}
        icon={tag.icon}
        className={styles.statusTag}
      >
        {tag.label}
      </Tag>
    );
  };

  // Helper to get role tag
  const getRoleTag = (role: string | UserRole | Role) => {
    let roleName: string;
    if (typeof role === 'string') {
      const foundRole = roles.find(r => r._id === role);
      roleName = foundRole ? foundRole.name : 'Unknown';
    } else if (typeof role === 'object' && role !== null && 'name' in role) {
      roleName = role.name;
    } else {
      roleName = String(role);
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
    userForm.resetFields();
    setAvatarFileList([]);
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setAvatarFileList(user.avatar ? [{
      uid: '-1',
      name: 'avatar.png',
      status: 'done',
      url: user.avatar,
    }] : []);

    let roleName: string;
    if (typeof user.role === 'string') {
        const foundRole = roles.find(r => r._id === user.role);
        roleName = foundRole ? foundRole.name : '';
    } else if (typeof user.role === 'object' && user.role !== null) {
        roleName = user.role.name;
    } else {
        roleName = '';
    }

    userForm.setFieldsValue({
      fullname: user.fullname || user.name,
      email: user.email,
      role: roleName,
      status: user.status,
      phone: user.phone || '',
      address: user.address || '',
      dob: user.dob ? dayjs(user.dob) : null,
      gender: user.gender || 'Khác',
      approval_status: user.approval_status || 'approved'
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (id: string | number) => {
    try {
      const response = await deleteUser(id.toString());
      if (response.success) {
        message.success("Xóa người dùng thành công");
        fetchUsers();
      } else {
        message.error(response.message || "Lỗi khi xóa người dùng");
      }
    } catch (error) {
        message.error("Lỗi khi xóa người dùng");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await userForm.validateFields();
      // Always get roleId from roles list
      const roleId = roles.find(r => r.name === values.role)?._id;
      if (!roleId) {
        message.error("Vai trò không hợp lệ!");
          return;
        }
      // Build payload
      type UserPayload = {
        fullname: string;
        email: string;
        status?: UserStatus;
        phone?: string;
        address?: string;
        dob?: string | null;
        gender?: string;
        approval_status?: string;
        role_id: string;
        password?: string;
      };
      let payload: Omit<UserPayload, 'password'> | UserPayload;
      if (!editingUser) {
        payload = {
          ...{
            fullname: values.fullname,
            email: values.email,
            status: values.status,
            phone: values.phone,
            address: values.address,
            dob: values.dob ? values.dob.toISOString() : null,
            gender: values.gender,
            approval_status: values.approval_status,
            role_id: roleId,
          },
          password: values.password as string,
        };
      } else {
        payload = {
          fullname: values.fullname,
          email: values.email,
          status: values.status,
          phone: values.phone,
          address: values.address,
          dob: values.dob ? values.dob.toISOString() : null,
          gender: values.gender,
          approval_status: values.approval_status,
          role_id: roleId,
        };
      }
      if (editingUser) {
        await updateUser(editingUser.id.toString(), payload);
        message.success("Cập nhật người dùng thành công");
      } else {
        await createUser(payload as UserPayload);
        message.success("Thêm người dùng thành công");
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      console.log('Failed:', error);
      message.error(error?.response?.data?.message || "Thao tác thất bại. Vui lòng thử lại.");
    }
  };

  const handleViewDetails = (user: User) => {
    setViewingUser(user);
    setIsDetailsModalVisible(true);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetchUsers(pagination.current || 1, pagination.pageSize || 10);
  };

  return (
    <div className={styles.userPageContainer}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
          <p className="text-gray-500 mt-1">Quản lý và theo dõi thông tin người dùng</p>
        </div>
      </div>

      <StatCards userStats={userStats} />
      <FilterSection
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearch={setSearch}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        setDateRange={setDateRange}
      />

      <Card className={styles.userTableCard}>
        <Table
          rowKey="id"
          dataSource={users}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          className={styles.userTable}
          scroll={{ x: true }}
          title={() => (
            <div className={styles.tableHeader}>
              <h4 className={styles.tableTitle}>Danh sách người dùng</h4>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={handleAddUser}
                className={styles.addUserBtn}
              >
                Thêm người dùng
              </Button>
            </div>
          )}
          onRow={(record) => {
            return {
              onClick: () => {
                handleViewDetails(record);
              },
            };
          }}
          columns={[
            {
              title: 'STT',
              dataIndex: 'number',
              width: 70,
            },
            {
              title: 'Người dùng',
              dataIndex: 'fullname',
              render: (_, record) => (
                <div className={styles.avatarCell}>
                  <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
                    <div className={styles.userName}>{record.fullname}</div>
                    <div className={styles.userEmail}>{record.email}</div>
            </div>
          </div>
      ),
    },
    {
              title: 'Vai trò',
              dataIndex: 'role',
              render: (role) => getRoleTag(role),
              width: 120,
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              render: (status) => getStatusTag(status),
              width: 150,
            },
            {
              title: 'Ngày tạo',
              dataIndex: 'createdAt',
              render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
              width: 150,
            },
            {
              title: 'Thao tác',
              key: 'action',
              width: 120,
              render: (_, record) => (
                <Space className={styles.actionBtns}>
                  <Tooltip title="Chỉnh sửa">
          <Button
                      type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
                        handleEditUser(record);
            }}
                      className={styles.actionBtn}
          />
                  </Tooltip>
                  <Tooltip title="Xóa">
          <Popconfirm
                      title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={(e) => {
              e?.stopPropagation();
                        handleDeleteUser(record.id);
            }}
                      onCancel={(e) => e?.stopPropagation()}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
                        type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
                        className={styles.actionBtn}
            />
          </Popconfirm>
                  </Tooltip>
        </Space>
      ),
    },
          ]}
        />
      </Card>

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? "Lưu thay đổi" : "Thêm"}
        cancelText="Hủy"
        destroyOnHidden
        className={styles.userModal}
      >
        <Form form={userForm} layout="vertical" className={styles.userForm}>
          <div className={styles.formGrid}>
            <div className={styles.formLeftCol}>
          <Form.Item
            name="fullname"
            label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                className={styles.formItem}
          >
                <Input className={styles.input} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
                rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                className={styles.formItem}
              >
                <Input className={styles.input} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                  className={styles.formItem}
                >
                  <Input.Password className={styles.input} />
            </Form.Item>
          )}
              <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]} className={styles.formItem}>
                <Select className={styles.input}>
                  {roles.map(r => <Select.Option key={r._id} value={r.name}>{r.name}</Select.Option>)}
            </Select>
          </Form.Item>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]} className={styles.formItem}>
                <Select className={styles.input}>
                  <Select.Option value={UserStatus.ACTIVE}>Hoạt động</Select.Option>
                  <Select.Option value={UserStatus.INACTIVE}>Không hoạt động</Select.Option>
            </Select>
          </Form.Item>
            </div>
            <div className={styles.formRightCol}>
              <Form.Item name="avatar" label="Ảnh đại diện" className={styles.formItem}>
                <div className={styles.avatarUploadWrapper}>
                  <Upload
                    listType="picture-card"
                    fileList={avatarFileList}
                    onPreview={async file => {
                      let src = file.url as string;
                      if (!src) {
                        src = await new Promise(resolve => {
                          const reader = new FileReader();
                          reader.readAsDataURL(file.originFileObj as any);
                          reader.onload = () => resolve(reader.result as string);
                        });
                      }
                      const image = new Image();
                      image.src = src;
                      const imgWindow = window.open(src);
                      imgWindow?.document.write(image.outerHTML);
                    }}
                    onChange={({ fileList }) => setAvatarFileList(fileList)}
                    beforeUpload={() => false}
                    className={styles.avatarUpload}
                  >
                    {avatarFileList.length < 1 && '+ Tải lên'}
                  </Upload>
                </div>
          </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" className={styles.formItem}>
                <Input className={styles.input} />
          </Form.Item>
              <Form.Item name="address" label="Địa chỉ" className={styles.formItem}>
                <Input className={styles.input} />
          </Form.Item>
              <Form.Item name="dob" label="Ngày sinh" className={styles.formItem}>
                <DatePicker className={styles.input} format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
              <Form.Item name="gender" label="Giới tính" className={styles.formItem}>
                <Select className={styles.input}>
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết người dùng"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnHidden
        className={styles.userDetailModal}
      >
        {viewingUser && (
          <div className={styles.userDetailWrapper}>
            <div className={styles.userDetailHeaderBox}>
              <Avatar size={96} src={viewingUser.avatar} className={styles.userDetailAvatar} />
              <div className={styles.userDetailHeaderInfo}>
                <div className={styles.userDetailName}>{viewingUser.fullname}</div>
                <div className={styles.userDetailEmail}>{viewingUser.email}</div>
                <div className={styles.userDetailRoleTag}>{getRoleTag(viewingUser.role)}</div>
                  </div>
                  </div>
            <div className={styles.userDetailCard}>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><CalendarOutlined /> Ngày tạo:</span>
                <span>{dayjs(viewingUser.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><UserOutlined /> Trạng thái:</span>
                      <span>{getStatusTag(viewingUser.status)}</span>
                    </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><PhoneOutlined /> Số điện thoại:</span>
                <span>{viewingUser.phone || 'Chưa cập nhật'}</span>
                    </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><HomeOutlined /> Địa chỉ:</span>
                <span>{viewingUser.address || 'Chưa cập nhật'}</span>
                      </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><GiftOutlined /> Ngày sinh:</span>
                <span>{viewingUser.dob ? dayjs(viewingUser.dob).format('DD/MM/YYYY') : 'Chưa cập nhật'}</span>
                  </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><ManOutlined /> Giới tính:</span>
                <span>{viewingUser.gender || 'Chưa cập nhật'}</span>
                </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserPage;
