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
  Typography,
  Badge,
  Divider,
  Progress
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
  TrophyOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  MailOutlined,
  GlobalOutlined,
  RiseOutlined,
  FallOutlined
} from "@ant-design/icons";
import {
  UserRole,
  UserStatus,
  type User,
} from "../../../interfaces/Admin.interface";
import { getAllUsers, createUser, updateUser, deleteUser } from "../../../services/userService";
import type { TablePaginationConfig } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import type { UploadFile } from 'antd/es/upload/interface';
import styles from './UserPage.module.css';

dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;

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
  <Row gutter={[24, 24]} className={styles.statsRow}>
    <Col xs={24} sm={12} lg={6}>
      <Card className={styles.statCard} bordered={false}>
        <div className={styles.statContent}>
          <div className={styles.statIcon} style={{ backgroundColor: '#e6f7ff' }}>
            <TeamOutlined style={{ color: '#1890ff' }} />
          </div>
          <div className={styles.statInfo}>
            <Statistic
              title="Tổng người dùng"
              value={userStats.total}
              valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 600 }}
            />
            <div className={styles.statTrend}>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary">+12% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className={styles.statCard} bordered={false}>
        <div className={styles.statContent}>
          <div className={styles.statIcon} style={{ backgroundColor: '#f6ffed' }}>
            <UserSwitchOutlined style={{ color: '#52c41a' }} />
          </div>
          <div className={styles.statInfo}>
            <Statistic
              title="Đang hoạt động"
              value={userStats.active}
              valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
            />
            <div className={styles.statTrend}>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary">+8% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className={styles.statCard} bordered={false}>
        <div className={styles.statContent}>
          <div className={styles.statIcon} style={{ backgroundColor: '#fff1f0' }}>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          </div>
          <div className={styles.statInfo}>
            <Statistic
              title="Không hoạt động"
              value={userStats.inactive}
              valueStyle={{ color: '#ff4d4f', fontSize: 28, fontWeight: 600 }}
            />
            <div className={styles.statTrend}>
              <FallOutlined style={{ color: '#ff4d4f' }} />
              <Text type="secondary">-3% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className={styles.statCard} bordered={false}>
        <div className={styles.statContent}>
          <div className={styles.statIcon} style={{ backgroundColor: '#fff7e6' }}>
            <UserOutlined style={{ color: '#fa8c16' }} />
          </div>
          <div className={styles.statInfo}>
            <Statistic
              title="Tỷ lệ hoạt động"
              value={userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}
              suffix="%"
              valueStyle={{ color: '#fa8c16', fontSize: 28, fontWeight: 600 }}
            />
            <Progress 
              percent={userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0} 
              size="small" 
              showInfo={false} 
              strokeColor="#fa8c16"
            />
          </div>
        </div>
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
  onRefresh: () => void;
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
  onRefresh,
}: FilterSectionProps) => (
  <Card className={styles.filterCard} bordered={false}>
    <div className={styles.filterHeader}>
      <div className={styles.filterTitle}>
        <FilterOutlined className={styles.filterIcon} />
        <Text strong>Bộ lọc tìm kiếm</Text>
      </div>
      <Button 
        icon={<ReloadOutlined />} 
        onClick={onRefresh}
        className={styles.refreshBtn}
      >
        Làm mới
      </Button>
    </div>
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
  </Card>
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
    pageSize: 15,
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
  const fetchUsers = async (page = 1, limit = 15) => {
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
      <Tag color={tag.color} className={styles.roleTag}>
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
    if (typeof user.role_id === 'string') {
        const foundRole = roles.find(r => r._id === user.role_id);
        roleName = foundRole ? foundRole.name : '';
    } else if (typeof user.role_id === 'object' && user.role_id !== null) {
        roleName = user.role_id.name;
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
      const isEdit = !!editingUser;
      if (!isEdit) {
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

      // Xử lý upload avatar: nếu có file, gửi kèm file, nếu không gửi url hoặc không gửi trường avatar
      let formData: FormData | null = null;
      if (avatarFileList.length > 0 && avatarFileList[0].originFileObj) {
        formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData!.append(key, value as string);
          }
        });
        formData.append('avatar', avatarFileList[0].originFileObj as File);
      }

      if (isEdit) {
        if (formData) {
          await updateUser(editingUser.id.toString(), formData, true);
        } else {
          await updateUser(editingUser.id.toString(), payload);
        }
        message.success("Cập nhật người dùng thành công");
      } else {
        if (formData) {
          await createUser(formData, true);
        } else {
          await createUser(payload as UserPayload);
        }
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

  const handleRefresh = () => {
    setSearchInput("");
    setSearch("");
    setSelectedRole(undefined);
    setSelectedStatus(undefined);
    setDateRange(null);
    fetchUsers();
  };

  return (
    <div className={styles.userPageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Title level={2} className={styles.pageTitle}>
            <TrophyOutlined className={styles.titleIcon} />
            Quản lý người dùng
          </Title>
          <Text type="secondary" className={styles.pageSubtitle}>
            Quản lý và theo dõi thông tin người dùng hệ thống
          </Text>
        </div>
        <div className={styles.headerRight}>
          <Space>
            <Button 
              icon={<ExportOutlined />} 
              className={styles.exportBtn}
            >
              Xuất dữ liệu
            </Button>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={handleAddUser}
              className={styles.addUserBtn}
            >
              Thêm người dùng
            </Button>
          </Space>
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
        onRefresh={handleRefresh}
      />

      <Card className={styles.userTableCard} bordered={false}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitleSection}>
            <Title level={4} className={styles.tableTitle}>
              <TeamOutlined className={styles.tableIcon} />
              Danh sách người dùng
            </Title>
            <Badge count={users.length} showZero className={styles.userCountBadge} />
          </div>
          <div className={styles.tableActions}>
            <Text type="secondary">
              Hiển thị {((pagination.current - 1) * pagination.pageSize) + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} của {pagination.total} người dùng
            </Text>
          </div>
        </div>
        
        <Table
          rowKey="id"
          dataSource={users}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
            pageSizeOptions: ['10', '20', '50', '100'],
            size: 'small',
          }}
          onChange={handleTableChange}
          className={styles.userTable}
          scroll={{ x: 900 }}
          size="small"
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
              align: 'center' as const,
              render: (_, __, index) => (
                <Badge count={index + 1} showZero style={{ backgroundColor: '#1890ff' }} />
              ),
            },
            {
              title: 'Người dùng',
              dataIndex: 'fullname',
              width: 250,
              render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar 
                    src={record.avatar} 
                    icon={<UserOutlined />} 
                    size={40}
                    style={{ border: '2px solid #f0f0f0' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {record.fullname}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MailOutlined style={{ fontSize: '12px' }} />
                      {record.email}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: 'Vai trò',
              dataIndex: 'role',
              width: 120,
              align: 'center' as const,
              render: (role) => getRoleTag(role),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              width: 100,
              align: 'center' as const,
              render: (status) => getStatusTag(status),
            },
            {
              title: 'Ngày tạo',
              dataIndex: 'createdAt',
              width: 150,
              align: 'center' as const,
              render: (date) => (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                    {dayjs(date).format('DD/MM/YYYY')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {dayjs(date).format('HH:mm')}
                  </div>
                </div>
              ),
            },
            {
              title: 'Thao tác',
              key: 'action',
              width: 120,
              align: 'center' as const,
              render: (_, record) => (
                <Space size="small">
                  <Tooltip title="Xem chi tiết">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(record);
                      }}
                      style={{ color: '#1890ff' }}
                    />
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditUser(record);
                      }}
                      style={{ color: '#52c41a' }}
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
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </Tooltip>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            {editingUser ? (
              <>
                <EditOutlined className={styles.modalIcon} />
                Chỉnh sửa người dùng
              </>
            ) : (
              <>
                <UserAddOutlined className={styles.modalIcon} />
                Thêm người dùng mới
              </>
            )}
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? "Lưu thay đổi" : "Thêm"}
        cancelText="Hủy"
        destroyOnHidden
        className={styles.userModal}
        width={800}
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
                <Input className={styles.input} placeholder="Nhập họ và tên" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                className={styles.formItem}
              >
                <Input className={styles.input} placeholder="Nhập email" />
              </Form.Item>
              {!editingUser && (
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                  className={styles.formItem}
                >
                  <Input.Password className={styles.input} placeholder="Nhập mật khẩu" />
                </Form.Item>
              )}
              <Form.Item 
                name="role" 
                label="Vai trò" 
                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]} 
                className={styles.formItem}
              >
                <Select className={styles.input} placeholder="Chọn vai trò">
                  {roles.map(r => <Select.Option key={r._id} value={r.name}>{r.name}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item 
                name="status" 
                label="Trạng thái" 
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]} 
                className={styles.formItem}
              >
                <Select className={styles.input} placeholder="Chọn trạng thái">
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
                <Input className={styles.input} placeholder="Nhập số điện thoại" />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ" className={styles.formItem}>
                <Input className={styles.input} placeholder="Nhập địa chỉ" />
              </Form.Item>
              <Form.Item name="dob" label="Ngày sinh" className={styles.formItem}>
                <DatePicker className={styles.input} format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="gender" label="Giới tính" className={styles.formItem}>
                <Select className={styles.input} placeholder="Chọn giới tính">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <UserOutlined className={styles.modalIcon} />
            Chi tiết người dùng
          </div>
        }
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
              <Avatar 
                size={96} 
                src={viewingUser.avatar && viewingUser.avatar !== 'default-avatar.jpg' && viewingUser.avatar !== '' && (viewingUser.avatar.includes('googleusercontent.com') || viewingUser.avatar.startsWith('http')) ? viewingUser.avatar : undefined} 
                className={styles.userDetailAvatar} 
              />
              <div className={styles.userDetailHeaderInfo}>
                <div className={styles.userDetailName}>{viewingUser.fullname}</div>
                <div className={styles.userDetailEmail}>
                  <MailOutlined className={styles.emailIcon} />
                  {viewingUser.email}
                </div>
                <div className={styles.userDetailRoleTag}>{getRoleTag(viewingUser.role_id)}</div>
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
