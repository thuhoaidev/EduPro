import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../hooks/usePermissions';
import PermissionGuard from '../../../components/common/PermissionGuard';
import { useAuth } from '../../../contexts/AuthContext';
import { getRoles, updateRole, createRole, deleteRole } from '../../../services/roleService';
import type { Role as ApiRole } from '../../../services/roleService';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic,
  Divider,
  Typography,
  Avatar,
  List,
  Switch,
  Tabs,
  Descriptions,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  TeamOutlined,
  SettingOutlined,
  EyeOutlined,
  KeyOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  AuditOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { canManageRoles, isAdmin } = usePermissions();
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [permissions] = useState<Permission[]>([
    {
      id: '1',
      name: 'quản lý người dùng',
      description: 'Quản lý toàn bộ người dùng trong hệ thống',
      category: 'Quản lý người dùng',
      isActive: true,
    },
    {
      id: '2',
      name: 'phân quyền người dùng',
      description: 'Gán vai trò và phân quyền cho người dùng',
      category: 'Quản lý người dùng',
      isActive: true,
    },
    {
      id: '3',
      name: 'khóa mở người dùng',
      description: 'Khóa hoặc mở khóa tài khoản người dùng',
      category: 'Quản lý người dùng',
      isActive: true,
    },
    {
      id: '4',
      name: 'duyệt giảng viên',
      description: 'Duyệt hồ sơ đăng ký giảng viên',
      category: 'Quản lý người dùng',
      isActive: true,
    },
    {
      id: '5',
      name: 'quản lý khóa học',
      description: 'Duyệt, từ chối, xóa khóa học',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '6',
      name: 'quản lý bài viết',
      description: 'Duyệt, từ chối bài viết blog',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '7',
      name: 'quản lý bình luận',
      description: 'Xóa bình luận vi phạm',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '8',
      name: 'quản lý danh mục',
      description: 'Tạo, sửa, xóa danh mục khóa học',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '9',
      name: 'quản lý vai trò',
      description: 'Tạo, sửa, xóa vai trò và phân quyền',
      category: 'Quản lý hệ thống',
      isActive: true,
    },
    {
      id: '10',
      name: 'quản lý voucher',
      description: 'Tạo, sửa, xóa mã giảm giá',
      category: 'Quản lý hệ thống',
      isActive: true,
    },
    {
      id: '11',
      name: 'quản lý thanh toán',
      description: 'Xem lịch sử giao dịch',
      category: 'Quản lý hệ thống',
      isActive: true,
    },
    {
      id: '12',
      name: 'quản lý báo cáo',
      description: 'Xử lý báo cáo vi phạm',
      category: 'Quản lý hệ thống',
      isActive: true,
    },
    {
      id: '13',
      name: 'xem thống kê tổng quan',
      description: 'Xem dashboard tổng thể hệ thống',
      category: 'Thống kê và báo cáo',
      isActive: true,
    },
    {
      id: '14',
      name: 'xem thống kê doanh thu',
      description: 'Xem báo cáo tài chính',
      category: 'Thống kê và báo cáo',
      isActive: true,
    },
    {
      id: '15',
      name: 'xem thống kê người dùng',
      description: 'Xem thống kê người dùng',
      category: 'Thống kê và báo cáo',
      isActive: true,
    },
    {
      id: '16',
      name: 'xem thống kê khóa học',
      description: 'Xem thống kê khóa học',
      category: 'Thống kê và báo cáo',
      isActive: true,
    },
    {
      id: '17',
      name: 'tạo khóa học',
      description: 'Tạo khóa học mới',
      category: 'Quản lý khóa học',
      isActive: true,
    },
    {
      id: '18',
      name: 'chỉnh sửa khóa học',
      description: 'Sửa khóa học của mình',
      category: 'Quản lý khóa học',
      isActive: true,
    },
    {
      id: '19',
      name: 'xóa khóa học',
      description: 'Xóa khóa học của mình',
      category: 'Quản lý khóa học',
      isActive: true,
    },
    {
      id: '20',
      name: 'xuất bản khóa học',
      description: 'Đăng khóa học',
      category: 'Quản lý khóa học',
      isActive: true,
    },
    {
      id: '21',
      name: 'tạo bài học',
      description: 'Tạo bài học mới',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '22',
      name: 'chỉnh sửa bài học',
      description: 'Sửa bài học',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '23',
      name: 'xóa bài học',
      description: 'Xóa bài học',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '24',
      name: 'upload video',
      description: 'Upload video bài giảng',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '25',
      name: 'tạo quiz',
      description: 'Tạo bài kiểm tra',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '26',
      name: 'chỉnh sửa quiz',
      description: 'Sửa bài kiểm tra',
      category: 'Quản lý nội dung',
      isActive: true,
    },
    {
      id: '27',
      name: 'xem danh sách học viên',
      description: 'Xem học viên đăng ký',
      category: 'Quản lý học viên',
      isActive: true,
    },
    {
      id: '28',
      name: 'xem tiến độ học viên',
      description: 'Theo dõi tiến độ học',
      category: 'Quản lý học viên',
      isActive: true,
    },
    {
      id: '29',
      name: 'gửi thông báo',
      description: 'Gửi thông báo cho học viên',
      category: 'Quản lý học viên',
      isActive: true,
    },
    {
      id: '30',
      name: 'xem thống kê thu nhập',
      description: 'Xem doanh thu',
      category: 'Thu nhập',
      isActive: true,
    },
    {
      id: '31',
      name: 'rút tiền',
      description: 'Tạo yêu cầu rút tiền',
      category: 'Thu nhập',
      isActive: true,
    },
    {
      id: '32',
      name: 'xem lịch sử giao dịch',
      description: 'Xem giao dịch',
      category: 'Thu nhập',
      isActive: true,
    },
    {
      id: '33',
      name: 'xem khóa học',
      description: 'Xem danh sách khóa học',
      category: 'Học tập',
      isActive: true,
    },
    {
      id: '34',
      name: 'đăng ký khóa học',
      description: 'Đăng ký khóa học',
      category: 'Học tập',
      isActive: true,
    },
    {
      id: '35',
      name: 'xem bài học',
      description: 'Xem video bài giảng',
      category: 'Học tập',
      isActive: true,
    },
    {
      id: '36',
      name: 'làm quiz',
      description: 'Làm bài kiểm tra',
      category: 'Học tập',
      isActive: true,
    },
    {
      id: '37',
      name: 'xem tiến độ',
      description: 'Xem tiến độ học tập',
      category: 'Học tập',
      isActive: true,
    },
    {
      id: '38',
      name: 'tạo ghi chú',
      description: 'Tạo ghi chú khi học',
      category: 'Học tập',
      isActive: true,
    },
    {
      id: '39',
      name: 'bình luận bài học',
      description: 'Bình luận bài học',
      category: 'Tương tác',
      isActive: true,
    },
    {
      id: '40',
      name: 'đánh giá khóa học',
      description: 'Đánh giá khóa học',
      category: 'Tương tác',
      isActive: true,
    },
    {
      id: '41',
      name: 'báo cáo vấn đề',
      description: 'Báo cáo vấn đề',
      category: 'Tương tác',
      isActive: true,
    },
    {
      id: '42',
      name: 'xem bài viết',
      description: 'Xem bài viết blog',
      category: 'Cộng đồng',
      isActive: true,
    },
    {
      id: '43',
      name: 'bình luận bài viết',
      description: 'Bình luận bài viết',
      category: 'Cộng đồng',
      isActive: true,
    },
    {
      id: '44',
      name: 'thích lưu bài viết',
      description: 'Thích/lưu bài viết',
      category: 'Cộng đồng',
      isActive: true,
    },
    {
      id: '45',
      name: 'xem chứng chỉ',
      description: 'Xem chứng chỉ đã đạt',
      category: 'Chứng chỉ',
      isActive: true,
    },
    {
      id: '46',
      name: 'tải chứng chỉ',
      description: 'Tải chứng chỉ',
      category: 'Chứng chỉ',
      isActive: true,
    },
    {
      id: '47',
      name: 'duyệt bài viết',
      description: 'Duyệt bài viết blog',
      category: 'Duyệt nội dung',
      isActive: true,
    },
    {
      id: '48',
      name: 'từ chối bài viết',
      description: 'Từ chối bài viết',
      category: 'Duyệt nội dung',
      isActive: true,
    },
    {
      id: '49',
      name: 'duyệt bình luận',
      description: 'Duyệt bình luận',
      category: 'Duyệt nội dung',
      isActive: true,
    },
    {
      id: '50',
      name: 'xóa bình luận',
      description: 'Xóa bình luận vi phạm',
      category: 'Duyệt nội dung',
      isActive: true,
    },
    {
      id: '51',
      name: 'xem báo cáo',
      description: 'Xem danh sách báo cáo',
      category: 'Xử lý báo cáo',
      isActive: true,
    },
    {
      id: '52',
      name: 'xử lý báo cáo',
      description: 'Xử lý báo cáo vi phạm',
      category: 'Xử lý báo cáo',
      isActive: true,
    },
    {
      id: '53',
      name: 'cảnh cáo người dùng',
      description: 'Cảnh cáo người dùng',
      category: 'Xử lý báo cáo',
      isActive: true,
    },
    {
      id: '54',
      name: 'quản lý từ khóa',
      description: 'Quản lý từ khóa cấm',
      category: 'Quản lý cộng đồng',
      isActive: true,
    },
    {
      id: '55',
      name: 'xem thống kê báo cáo',
      description: 'Thống kê báo cáo',
      category: 'Quản lý cộng đồng',
      isActive: true,
    },
    {
      id: '56',
      name: 'xem khóa học công khai',
      description: 'Xem thông tin khóa học',
      category: 'Xem công khai',
      isActive: true,
    },
    {
      id: '57',
      name: 'xem bài viết công khai',
      description: 'Xem bài viết blog',
      category: 'Xem công khai',
      isActive: true,
    },
    {
      id: '58',
      name: 'tìm kiếm khóa học',
      description: 'Tìm kiếm khóa học',
      category: 'Xem công khai',
      isActive: true,
    },
    {
      id: '59',
      name: 'xem giảng viên',
      description: 'Xem thông tin giảng viên',
      category: 'Xem công khai',
      isActive: true,
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  // Load roles from API
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      setRoles(response.data || []);
      console.log('Roles loaded:', response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
      message.error('Không thể tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  };

  const permissionCategories = Array.from(new Set(permissions.map(p => p.category)));

  const handleAddRole = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsModalVisible(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId);
      message.success('Đã xóa vai trò thành công');
      await loadRoles(); // Reload roles after deletion
    } catch (error) {
      console.error('Error deleting role:', error);
      message.error('Không thể xóa vai trò');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRole) {
        // Update existing role
        console.log('Updating role with data:', values);
        await updateRole(editingRole._id, {
          name: values.name,
          description: values.description,
          permissions: values.permissions
        });
        message.success('Đã cập nhật vai trò thành công');
      } else {
        // Add new role
        console.log('Creating new role with data:', values);
        await createRole({
          name: values.name,
          description: values.description,
          permissions: values.permissions
        });
        message.success('Đã tạo vai trò mới thành công');
      }
      
      setIsModalVisible(false);
      await loadRoles(); // Reload roles after update/create
    } catch (error) {
      console.error('Error saving role:', error);
      message.error('Không thể lưu vai trò');
    }
  };

  const columns = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <Space>
                  <Avatar 
          icon={name === 'quản trị viên' ? <CrownOutlined /> : name === 'giảng viên' ? <TeamOutlined /> : <UserOutlined />}
          style={{ 
            backgroundColor: name === 'quản trị viên' ? '#ff4d4f' : name === 'giảng viên' ? '#1890ff' : '#52c41a' 
          }}
        />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số người dùng',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }}>
          <Avatar icon={<UserOutlined />} />
        </Badge>
      ),
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissionList: string[]) => (
        <div style={{ maxWidth: 200 }}>
          {permissionList.includes('all') ? (
            <Tag color="red" icon={<CrownOutlined />}>Toàn quyền</Tag>
          ) : (
            permissionList.slice(0, 3).map(perm => (
              <Tag key={perm} color="blue" style={{ marginBottom: 4 }}>
                {perm}
              </Tag>
            ))
          )}
          {permissionList.length > 3 && (
            <Tag color="default">+{permissionList.length - 3} quyền khác</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Role) => {
        // Mặc định là hoạt động nếu không có trường isActive hoặc isActive = true
        const isRoleActive = isActive !== false; // Chỉ false mới là không hoạt động
        return (
          <Tag color={isRoleActive ? 'green' : 'red'}>
            {isRoleActive ? 'Hoạt động' : 'Không hoạt động'}
          </Tag>
        );
      },
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => (
        <Text type="secondary">{date}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: Role) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => navigate(`/admin/roles/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditRole(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa vai trò này?"
                         onConfirm={() => handleDeleteRole(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
                disabled={record.name === 'admin' || record.name === 'quản trị viên'}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Check if user has permission to manage roles
  if (!canManageRoles()) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={3}>Không có quyền truy cập</Title>
        <Text type="secondary">Bạn không có quyền quản lý phân quyền trong hệ thống.</Text>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0 }}>
            <KeyOutlined style={{ marginRight: '8px' }} />
            Quản lý phân quyền
          </Title>
          <Text type="secondary">
            Quản lý vai trò và quyền hạn của người dùng trong hệ thống
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số vai trò"
                value={roles.length}
                prefix={<SafetyCertificateOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
                         <Card>
               <Statistic
                 title="Vai trò đang hoạt động"
                 value={roles.filter(r => r.isActive !== false).length}
                 prefix={<UserSwitchOutlined />}
                 valueStyle={{ color: '#52c41a' }}
               />
             </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số quyền"
                value={permissions.length}
                prefix={<LockOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng người dùng"
                value={roles.reduce((sum, role) => sum + role.userCount, 0)}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="roles" type="card">
          <TabPane 
            tab={
              <span>
                <SafetyCertificateOutlined />
                Vai trò
              </span>
            } 
            key="roles"
          >
            <Card
              title="Danh sách vai trò"
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddRole}
                >
                  Thêm vai trò mới
                </Button>
              }
            >
              <Table
                columns={columns}
                dataSource={roles}
                rowKey="_id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} vai trò`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <LockOutlined />
                Quyền hạn
              </span>
            } 
            key="permissions"
          >
            <Card title="Danh sách quyền hạn">
              {permissionCategories.map(category => (
                <div key={category} style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ marginBottom: '16px' }}>
                    <GlobalOutlined style={{ marginRight: '8px' }} />
                    {category}
                  </Title>
                  <List
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={permissions.filter(p => p.category === category)}
                    renderItem={permission => (
                      <List.Item>
                        <Card size="small">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <Text strong>{permission.name}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {permission.description}
                              </Text>
                            </div>
                            <Switch 
                              checked={permission.isActive}
                              size="small"
                            />
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                  <Divider />
                </div>
              ))}
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <AuditOutlined />
                Phân tích
              </span>
            } 
            key="analytics"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Thống kê vai trò">
                  <Descriptions column={1}>
                    <Descriptions.Item label="Vai trò được sử dụng nhiều nhất">
                      {roles.length > 0 ? roles.reduce((max, role) => (role.userCount || 0) > (max.userCount || 0) ? role : max).name : 'Không có dữ liệu'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vai trò có nhiều quyền nhất">
                      {roles.length > 0 ? roles.reduce((max, role) => role.permissions.length > max.permissions.length ? role : max).name : 'Không có dữ liệu'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vai trò mới nhất">
                      {roles.length > 0 ? roles.reduce((max, role) => new Date(role.createdAt || 0) > new Date(max.createdAt || 0) ? role : max).name : 'Không có dữ liệu'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Cảnh báo bảo mật">
                  <Alert
                    message="Vai trò Quản trị viên có toàn quyền"
                    description="Vai trò quản trị viên có quyền truy cập tất cả chức năng trong hệ thống. Hãy cẩn thận khi phân quyền."
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                  <Alert
                    message="Kiểm tra quyền định kỳ"
                    description="Nên kiểm tra và cập nhật quyền hạn định kỳ để đảm bảo bảo mật hệ thống."
                    type="info"
                    showIcon
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        {/* Add/Edit Role Modal */}
        <Modal
          title={editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          width={600}
          okText={editingRole ? 'Cập nhật' : 'Thêm mới'}
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ permissions: [] }}
          >
            <Form.Item
              name="name"
              label="Tên vai trò"
              rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
            >
              <Input placeholder="Nhập tên vai trò" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="Mô tả vai trò và quyền hạn"
              />
            </Form.Item>

            <Form.Item
              name="permissions"
              label="Quyền hạn"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một quyền!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn quyền hạn"
                style={{ width: '100%' }}
                optionLabelProp="label"
              >
                {permissionCategories.map(category => (
                  <Select.OptGroup key={category} label={category}>
                    {permissions
                      .filter(p => p.category === category)
                      .map(permission => (
                        <Option 
                          key={permission.id} 
                          value={permission.name}
                          label={permission.name}
                        >
                          <div>
                            <Text strong>{permission.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {permission.description}
                            </Text>
                          </div>
                        </Option>
                      ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </motion.div>
  );
};

export default RolesPage; 