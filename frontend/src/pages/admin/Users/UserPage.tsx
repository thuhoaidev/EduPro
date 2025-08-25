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
  Progress,
  Spin
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
import { motion } from 'framer-motion';

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
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
      <Col xs={24} sm={12} lg={6}>
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '12px', 
              backgroundColor: '#e6f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TeamOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <Statistic
                title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng người dùng</Text>}
                value={userStats.total}
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>+12% tháng này</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '12px', 
              backgroundColor: '#f6ffed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserSwitchOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <Statistic
                title={<Text style={{ fontSize: '14px', color: '#666' }}>Đang hoạt động</Text>}
                value={userStats.active}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>+8% tháng này</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '12px', 
              backgroundColor: '#fff1f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <Statistic
                title={<Text style={{ fontSize: '14px', color: '#666' }}>Không hoạt động</Text>}
                value={userStats.inactive}
                valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 600 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <FallOutlined style={{ color: '#ff4d4f' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>-3% tháng này</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '12px', 
              backgroundColor: '#fff7e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserOutlined style={{ color: '#fa8c16', fontSize: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <Statistic
                title={<Text style={{ fontSize: '14px', color: '#666' }}>Tỷ lệ hoạt động</Text>}
                value={userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}
                suffix="%"
                valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 600 }}
              />
              <Progress 
                percent={userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0} 
                size="small" 
                showInfo={false} 
                strokeColor="#fa8c16"
                style={{ marginTop: '8px' }}
              />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  </motion.div>
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
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
  >
    <Card 
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px', 
        paddingBottom: '12px', 
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FilterOutlined style={{ color: '#667eea', fontSize: '20px' }} />
          <Text strong style={{ fontSize: '16px', color: '#1a1a1a' }}>Bộ lọc tìm kiếm</Text>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <Input
          placeholder="Tìm kiếm theo tên, email..."
          prefix={<SearchOutlined />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={() => setSearch(searchInput)}
          style={{ 
            minWidth: '250px',
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}
          allowClear
        />
        <Select
          placeholder="Lọc theo vai trò"
          value={selectedRole}
          onChange={setSelectedRole}
          style={{ 
            minWidth: '180px',
            borderRadius: '8px'
          }}
          allowClear
        >
          {Object.values(UserRole).map((role) => (
            <Select.Option key={role} value={role}>
              {role === UserRole.ADMIN ? 'Quản trị viên' :
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
          style={{ 
            minWidth: '180px',
            borderRadius: '8px'
          }}
          allowClear
        >
          <Select.Option value={UserStatus.ACTIVE}>Hoạt động</Select.Option>
          <Select.Option value={UserStatus.INACTIVE}>Không hoạt động</Select.Option>
        </Select>
        <RangePicker
          placeholder={['Từ ngày', 'Đến ngày']}
          onChange={(dates) => setDateRange(dates)}
          style={{ 
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}
          format="DD/MM/YYYY"
        />
      </div>
    </Card>
  </motion.div>
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
            role_id: user.role_id,
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
        className="status-tag"
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
      <Tag color={tag.color} className="role-tag">
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

  if (loading && users.length === 0) {
    return (
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              padding: '80px 24px'
            }}
          >
            <Spin size="large" />
            <Text style={{ marginTop: 16, fontSize: '16px' }}>Đang tải dữ liệu...</Text>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: '32px' }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                  <TrophyOutlined style={{ marginRight: '12px', color: '#667eea' }} />
                  Quản lý người dùng
                </Title>
                <Text type="secondary" style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
                  Quản lý và theo dõi thông tin người dùng hệ thống
                </Text>
                <div style={{ marginTop: '12px' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                    Cập nhật: {new Date().toLocaleString('vi-VN')}
                  </Text>
                </div>
              </div>
              <Space>
                <Button 
                  type="primary" 
                  icon={<UserAddOutlined />} 
                  onClick={handleAddUser}
                  style={{ 
                    borderRadius: '8px',
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Thêm người dùng
                </Button>
              </Space>
            </div>
          </Card>
        </motion.div>

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

        {/* Course List Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              paddingBottom: '12px', 
              borderBottom: '1px solid #f0f0f0',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TeamOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                  Danh sách người dùng
                </Title>
                <Badge count={users.length} showZero style={{ 
                  backgroundColor: '#1890ff',
                  borderRadius: '8px'
                }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
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
              style={{ 
                borderRadius: '12px',
                overflow: 'hidden'
              }}
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
                  dataIndex: 'role_id',
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
                  render: (_, record) => {
                    // Kiểm tra nếu người dùng là quản trị viên thì chỉ hiển thị nút xem chi tiết
                    const isAdmin = record.role_id === UserRole.ADMIN || 
                                  (typeof record.role_id === 'object' && record.role_id?.name === UserRole.ADMIN);
                    
                    return (
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
                        {!isAdmin && (
                          <>
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
                          </>
                        )}
                      </Space>
                    );
                  },
                },
              ]}
            />
          </Card>
        </motion.div>

        {/* Add/Edit User Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {editingUser ? (
                <>
                  <EditOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                  <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                    Chỉnh sửa người dùng
                  </Text>
                </>
              ) : (
                <>
                  <UserAddOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                  <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                    Thêm người dùng mới
                  </Text>
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
          width={800}
          style={{ borderRadius: '16px' }}
          okButtonProps={{ 
            style: { 
              borderRadius: '8px',
              height: '40px',
              fontSize: '14px',
              fontWeight: '500'
            } 
          }}
          cancelButtonProps={{ 
            style: { 
              borderRadius: '8px',
              height: '40px',
              fontSize: '14px'
            } 
          }}
        >
          <Form form={userForm} layout="vertical" style={{ marginTop: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="fullname"
                  label={<Text strong>Họ và tên</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input 
                    placeholder="Nhập họ và tên" 
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      fontSize: '14px'
                    }} 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label={<Text strong>Email</Text>}
                  rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                >
                  <Input 
                    placeholder="Nhập email" 
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      fontSize: '14px'
                    }} 
                  />
                </Form.Item>
              </Col>
              {!editingUser && (
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label={<Text strong>Mật khẩu</Text>}
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                  >
                    <Input.Password 
                      placeholder="Nhập mật khẩu" 
                      style={{ 
                        borderRadius: '8px',
                        height: '40px',
                        fontSize: '14px'
                      }} 
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={12}>
                <Form.Item 
                  name="role" 
                  label={<Text strong>Vai trò</Text>}
                  rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]} 
                >
                  <Select 
                    placeholder="Chọn vai trò" 
                    style={{ 
                      borderRadius: '8px',
                      height: '40px'
                    }}
                  >
                    {Object.values(UserRole).map((role) => (
                      <Select.Option key={role} value={role}>
                        {role === UserRole.ADMIN ? 'Quản trị viên' :
                         role === UserRole.INSTRUCTOR ? 'Giảng viên' :
                         role === UserRole.STUDENT ? 'Học viên' :
                         role === UserRole.MODERATOR ? 'Kiểm duyệt' : role}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="status" 
                  label={<Text strong>Trạng thái</Text>}
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]} 
                >
                  <Select 
                    placeholder="Chọn trạng thái" 
                    style={{ 
                      borderRadius: '8px',
                      height: '40px'
                    }}
                  >
                    <Select.Option value={UserStatus.ACTIVE}>Hoạt động</Select.Option>
                    <Select.Option value={UserStatus.INACTIVE}>Không hoạt động</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label={<Text strong>Số điện thoại</Text>}>
                  <Input 
                    placeholder="Nhập số điện thoại" 
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      fontSize: '14px'
                    }} 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="address" label={<Text strong>Địa chỉ</Text>}>
                  <Input 
                    placeholder="Nhập địa chỉ" 
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      fontSize: '14px'
                    }} 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dob" label={<Text strong>Ngày sinh</Text>}>
                  <DatePicker 
                    format="DD/MM/YYYY" 
                    style={{ 
                      width: '100%',
                      borderRadius: '8px',
                      height: '40px'
                    }} 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" label={<Text strong>Giới tính</Text>}>
                  <Select 
                    placeholder="Chọn giới tính" 
                    style={{ 
                      borderRadius: '8px',
                      height: '40px'
                    }}
                  >
                    <Select.Option value="Nam">Nam</Select.Option>
                    <Select.Option value="Nữ">Nữ</Select.Option>
                    <Select.Option value="Khác">Khác</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="avatar" label={<Text strong>Ảnh đại diện</Text>}>
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
                    style={{ 
                      borderRadius: '8px'
                    }}
                  >
                    {avatarFileList.length < 1 && '+ Tải lên'}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* User Details Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserOutlined style={{ color: '#667eea', fontSize: '20px' }} />
              <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                Chi tiết người dùng
              </Text>
            </div>
          }
          open={isDetailsModalVisible}
          onCancel={() => setIsDetailsModalVisible(false)}
          footer={null}
          width={600}
          style={{ borderRadius: '16px' }}
        >
          {viewingUser && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <Avatar 
                  size={96} 
                  src={viewingUser.avatar && viewingUser.avatar !== 'default-avatar.jpg' && viewingUser.avatar !== '' && (viewingUser.avatar.includes('googleusercontent.com') || viewingUser.avatar.startsWith('http')) ? viewingUser.avatar : undefined} 
                  style={{ border: '2px solid #f0f0f0' }}
                />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>
                    {viewingUser.fullname}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MailOutlined style={{ color: '#1890ff' }} />
                    {viewingUser.email}
                  </div>
                  <div>{getRoleTag(viewingUser.role_id)}</div>
                </div>
              </div>
              
              <Card 
                style={{ 
                  backgroundColor: '#fafafa',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0'
                }} 
                bordered={false}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px 0'
                }}>
                  <CalendarOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Ngày tạo:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text style={{ fontSize: '14px', color: '#666' }}>
                        {dayjs(viewingUser.createdAt).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px 0'
                }}>
                  <UserOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Trạng thái:</Text>
                    <div style={{ marginTop: '4px' }}>
                      {getStatusTag(viewingUser.status)}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px 0'
                }}>
                  <PhoneOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Số điện thoại:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text style={{ fontSize: '14px', color: '#666' }}>
                        {viewingUser.phone || 'Chưa cập nhật'}
                      </Text>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px 0'
                }}>
                  <HomeOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Địa chỉ:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text style={{ fontSize: '14px', color: '#666' }}>
                        {viewingUser.address || 'Chưa cập nhật'}
                      </Text>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px 0'
                }}>
                  <GiftOutlined style={{ color: '#eb2f96', fontSize: '16px' }} />
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Ngày sinh:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text style={{ fontSize: '14px', color: '#666' }}>
                        {viewingUser.dob ? dayjs(viewingUser.dob).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                      </Text>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px 0'
                }}>
                  <ManOutlined style={{ color: '#13c2c2', fontSize: '16px' }} />
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Giới tính:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text style={{ fontSize: '14px', color: '#666' }}>
                        {viewingUser.gender || 'Chưa cập nhật'}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </Modal>
      </div>
    </motion.div>
  );
};

export default UserPage;
