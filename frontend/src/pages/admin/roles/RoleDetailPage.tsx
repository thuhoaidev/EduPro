import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Avatar,
  Row,
  Col,
  Statistic,
  Divider,
  List,
  Badge,
  Descriptions,
  Alert,
  Tabs,
  Table,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  message,
  Switch,
  Progress,
  Timeline,
  Checkbox,
} from 'antd';
import { getRoleById, updateRole } from '../../../services/roleService';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ArrowLeftOutlined,
  EditOutlined,
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
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
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

interface User {
  id: string;
  fullname: string;
  email: string;
  avatar?: string;
  status: 'hoạt_động' | 'không_hoạt_động' | 'chờ_duyệt';
  joinedAt: string;
  lastLogin: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

const RoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { forceReloadUser } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();
  const [permissions] = useState<Permission[]>([
    {
      id: '1',
      name: 'quản lý người dùng',
      description: 'Quản lý toàn bộ người dùng trong hệ thống',
      category: 'Quản lý người dùng',
    },
    {
      id: '2',
      name: 'phân quyền người dùng',
      description: 'Gán vai trò và phân quyền cho người dùng',
      category: 'Quản lý người dùng',
    },
    {
      id: '3',
      name: 'khóa mở người dùng',
      description: 'Khóa hoặc mở khóa tài khoản người dùng',
      category: 'Quản lý người dùng',
    },
    {
      id: '4',
      name: 'duyệt giảng viên',
      description: 'Duyệt hồ sơ đăng ký giảng viên',
      category: 'Quản lý người dùng',
    },
    {
      id: '5',
      name: 'quản lý khóa học',
      description: 'Duyệt, từ chối, xóa khóa học',
      category: 'Quản lý nội dung',
    },
    {
      id: '6',
      name: 'quản lý bài viết',
      description: 'Duyệt, từ chối bài viết blog',
      category: 'Quản lý nội dung',
    },
    {
      id: '7',
      name: 'quản lý bình luận',
      description: 'Xóa bình luận vi phạm',
      category: 'Quản lý nội dung',
    },
    {
      id: '8',
      name: 'quản lý danh mục',
      description: 'Tạo, sửa, xóa danh mục khóa học',
      category: 'Quản lý nội dung',
    },
    {
      id: '9',
      name: 'quản lý vai trò',
      description: 'Tạo, sửa, xóa vai trò và phân quyền',
      category: 'Quản lý hệ thống',
    },
    {
      id: '10',
      name: 'quản lý voucher',
      description: 'Tạo, sửa, xóa mã giảm giá',
      category: 'Quản lý hệ thống',
    },
    {
      id: '11',
      name: 'quản lý thanh toán',
      description: 'Xem lịch sử giao dịch',
      category: 'Quản lý hệ thống',
    },
    {
      id: '12',
      name: 'quản lý báo cáo',
      description: 'Xử lý báo cáo vi phạm',
      category: 'Quản lý hệ thống',
    },
    {
      id: '13',
      name: 'xem thống kê tổng quan',
      description: 'Xem dashboard tổng thể hệ thống',
      category: 'Thống kê và báo cáo',
    },
    {
      id: '14',
      name: 'xem thống kê doanh thu',
      description: 'Xem báo cáo tài chính',
      category: 'Thống kê và báo cáo',
    },
    {
      id: '15',
      name: 'xem thống kê người dùng',
      description: 'Xem thống kê người dùng',
      category: 'Thống kê và báo cáo',
    },
    {
      id: '16',
      name: 'xem thống kê khóa học',
      description: 'Xem thống kê khóa học',
      category: 'Thống kê và báo cáo',
    },
    {
      id: '17',
      name: 'tạo khóa học',
      description: 'Tạo khóa học mới',
      category: 'Quản lý khóa học',
    },
    {
      id: '18',
      name: 'chỉnh sửa khóa học',
      description: 'Sửa khóa học của mình',
      category: 'Quản lý khóa học',
    },
    {
      id: '19',
      name: 'xóa khóa học',
      description: 'Xóa khóa học của mình',
      category: 'Quản lý khóa học',
    },
    {
      id: '20',
      name: 'xuất bản khóa học',
      description: 'Đăng khóa học',
      category: 'Quản lý khóa học',
    },
    {
      id: '21',
      name: 'tạo bài học',
      description: 'Tạo bài học mới',
      category: 'Quản lý nội dung',
    },
    {
      id: '22',
      name: 'chỉnh sửa bài học',
      description: 'Sửa bài học',
      category: 'Quản lý nội dung',
    },
    {
      id: '23',
      name: 'xóa bài học',
      description: 'Xóa bài học',
      category: 'Quản lý nội dung',
    },
    {
      id: '24',
      name: 'upload video',
      description: 'Upload video bài giảng',
      category: 'Quản lý nội dung',
    },
    {
      id: '25',
      name: 'tạo quiz',
      description: 'Tạo bài kiểm tra',
      category: 'Quản lý nội dung',
    },
    {
      id: '26',
      name: 'chỉnh sửa quiz',
      description: 'Sửa bài kiểm tra',
      category: 'Quản lý nội dung',
    },
    {
      id: '27',
      name: 'xem danh sách học viên',
      description: 'Xem học viên đăng ký',
      category: 'Quản lý học viên',
    },
    {
      id: '28',
      name: 'xem tiến độ học viên',
      description: 'Theo dõi tiến độ học',
      category: 'Quản lý học viên',
    },
    {
      id: '29',
      name: 'gửi thông báo',
      description: 'Gửi thông báo cho học viên',
      category: 'Quản lý học viên',
    },
    {
      id: '30',
      name: 'xem thống kê thu nhập',
      description: 'Xem doanh thu',
      category: 'Thu nhập',
    },
    {
      id: '31',
      name: 'rút tiền',
      description: 'Tạo yêu cầu rút tiền',
      category: 'Thu nhập',
    },
    {
      id: '32',
      name: 'xem lịch sử giao dịch',
      description: 'Xem giao dịch',
      category: 'Thu nhập',
    },
    {
      id: '33',
      name: 'xem khóa học',
      description: 'Xem danh sách khóa học',
      category: 'Học tập',
    },
    {
      id: '34',
      name: 'đăng ký khóa học',
      description: 'Đăng ký khóa học',
      category: 'Học tập',
    },
    {
      id: '35',
      name: 'xem bài học',
      description: 'Xem video bài giảng',
      category: 'Học tập',
    },
    {
      id: '36',
      name: 'làm quiz',
      description: 'Làm bài kiểm tra',
      category: 'Học tập',
    },
    {
      id: '37',
      name: 'xem tiến độ',
      description: 'Xem tiến độ học tập',
      category: 'Học tập',
    },
    {
      id: '38',
      name: 'tạo ghi chú',
      description: 'Tạo ghi chú khi học',
      category: 'Học tập',
    },
    {
      id: '39',
      name: 'bình luận bài học',
      description: 'Bình luận bài học',
      category: 'Tương tác',
    },
    {
      id: '40',
      name: 'đánh giá khóa học',
      description: 'Đánh giá khóa học',
      category: 'Tương tác',
    },
    {
      id: '41',
      name: 'báo cáo vấn đề',
      description: 'Báo cáo vấn đề',
      category: 'Tương tác',
    },
    {
      id: '42',
      name: 'xem bài viết',
      description: 'Xem bài viết blog',
      category: 'Cộng đồng',
    },
    {
      id: '43',
      name: 'bình luận bài viết',
      description: 'Bình luận bài viết',
      category: 'Cộng đồng',
    },
    {
      id: '44',
      name: 'thích lưu bài viết',
      description: 'Thích/lưu bài viết',
      category: 'Cộng đồng',
    },
    {
      id: '45',
      name: 'xem chứng chỉ',
      description: 'Xem chứng chỉ đã đạt',
      category: 'Chứng chỉ',
    },
    {
      id: '46',
      name: 'tải chứng chỉ',
      description: 'Tải chứng chỉ',
      category: 'Chứng chỉ',
    },
    {
      id: '47',
      name: 'duyệt bài viết',
      description: 'Duyệt bài viết blog',
      category: 'Duyệt nội dung',
    },
    {
      id: '48',
      name: 'từ chối bài viết',
      description: 'Từ chối bài viết',
      category: 'Duyệt nội dung',
    },
    {
      id: '49',
      name: 'duyệt bình luận',
      description: 'Duyệt bình luận',
      category: 'Duyệt nội dung',
    },
    {
      id: '50',
      name: 'xóa bình luận',
      description: 'Xóa bình luận vi phạm',
      category: 'Duyệt nội dung',
    },
    {
      id: '51',
      name: 'xem báo cáo',
      description: 'Xem danh sách báo cáo',
      category: 'Xử lý báo cáo',
    },
    {
      id: '52',
      name: 'xử lý báo cáo',
      description: 'Xử lý báo cáo vi phạm',
      category: 'Xử lý báo cáo',
    },
    {
      id: '53',
      name: 'cảnh cáo người dùng',
      description: 'Cảnh cáo người dùng',
      category: 'Xử lý báo cáo',
    },
    {
      id: '54',
      name: 'quản lý từ khóa',
      description: 'Quản lý từ khóa cấm',
      category: 'Quản lý cộng đồng',
    },
    {
      id: '55',
      name: 'xem thống kê báo cáo',
      description: 'Thống kê báo cáo',
      category: 'Quản lý cộng đồng',
    },
    {
      id: '56',
      name: 'xem khóa học công khai',
      description: 'Xem thông tin khóa học',
      category: 'Xem công khai',
    },
    {
      id: '57',
      name: 'xem bài viết công khai',
      description: 'Xem bài viết blog',
      category: 'Xem công khai',
    },
    {
      id: '58',
      name: 'tìm kiếm khóa học',
      description: 'Tìm kiếm khóa học',
      category: 'Xem công khai',
    },
    {
      id: '59',
      name: 'xem giảng viên',
      description: 'Xem thông tin giảng viên',
      category: 'Xem công khai',
    },
  ]);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Load role data from API
  useEffect(() => {
    if (id) {
      loadRole();
    }
  }, [id]);

  const loadRole = async () => {
    try {
      setLoading(true);
      const response = await getRoleById(id!);
      setRole(response.data);
      console.log('Role loaded:', response.data);
    } catch (error) {
      console.error('Error loading role:', error);
      message.error('Không thể tải thông tin vai trò');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = () => {
    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive,
      });
      setIsEditModalVisible(true);
    }
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (role) {
        setEditLoading(true);
        console.log('RoleDetailPage - Updating role with data:', values);
        console.log('RoleDetailPage - Role ID:', role._id);
        
        const response = await updateRole(role._id, {
          name: values.name,
          description: values.description,
          permissions: values.permissions
        });

        console.log('RoleDetailPage - Role updated successfully:', response);
        message.success('Đã cập nhật vai trò thành công');

        // Force reload user data để cập nhật sidebar
        console.log('RoleDetailPage - Force reloading user data...');
        await forceReloadUser();
        console.log('RoleDetailPage - Force reload completed');
        message.info('Đã reload user data. Hãy kiểm tra sidebar!');

        // Reload role data
        console.log('RoleDetailPage - Reloading role data...');
        await loadRole();
        console.log('RoleDetailPage - Role data reloaded');
        setIsEditModalVisible(false);
      }
    } catch (error) {
      console.error('RoleDetailPage - Error updating role:', error);
      message.error('Không thể cập nhật vai trò');
    } finally {
      setEditLoading(false);
    }
  };

  const getPermissionCategory = (permissionName: string) => {
    const permission = permissions.find(p => p.name === permissionName);
    return permission?.category || 'Không xác định';
  };

  const userColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (name: string, record: User) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'hoạt_động' ? 'green' : status === 'chờ_duyệt' ? 'orange' : 'red'}>
          {status === 'hoạt_động' ? 'Hoạt động' : status === 'chờ_duyệt' ? 'Chờ duyệt' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Tham gia',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => (
        <Text type="secondary">{date}</Text>
      ),
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => (
        <Text type="secondary">{date}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: () => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Gửi tin nhắn">
            <Button type="text" icon={<MailOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Đang tải thông tin vai trò...</div>
      </div>
    );
  }

  if (!role) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Không tìm thấy vai trò</div>
      </div>
    );
  }

  const permissionCategories = Array.from(new Set(role.permissions.map(p => getPermissionCategory(p))));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/roles')}
            style={{ marginBottom: '16px' }}
          >
            Quay lại
          </Button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                        <Avatar 
          icon={role.name === 'quản trị viên' ? <CrownOutlined /> : role.name === 'giảng viên' ? <TeamOutlined /> : <UserOutlined />}
          size={48}
          style={{ 
            backgroundColor: role.name === 'quản trị viên' ? '#ff4d4f' : role.name === 'giảng viên' ? '#1890ff' : '#52c41a',
            marginRight: '16px'
          }}
        />
                {role.name}
              </Title>
              <Text type="secondary">{role.description}</Text>
            </div>
            
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEditRole}
              >
                Chỉnh sửa
              </Button>
            </Space>
          </div>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Số người dùng"
                value={role.userCount}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Số quyền"
                value={role.permissions.length}
                prefix={<LockOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Trạng thái"
                value={role.isActive ? 'Hoạt động' : 'Không hoạt động'}
                prefix={<SafetyCertificateOutlined />}
                valueStyle={{ color: role.isActive ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Cập nhật lần cuối"
                value={role.updatedAt}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="overview" type="card">
          <TabPane 
            tab={
              <span>
                <InfoCircleOutlined />
                Tổng quan
              </span>
            } 
            key="overview"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Thông tin vai trò">
                  <Descriptions column={1}>
                    <Descriptions.Item label="Tên vai trò">
                      <Text strong>{role.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                      {role.description}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={role.isActive ? 'green' : 'red'}>
                        {role.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {role.createdAt}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật lần cuối">
                      {role.updatedAt}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Phân tích quyền hạn">
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Phân bố quyền theo danh mục:</Text>
                  </div>
                  {permissionCategories.map(category => {
                    const categoryPermissions = role.permissions.filter(p => getPermissionCategory(p) === category);
                    const percentage = (categoryPermissions.length / role.permissions.length) * 100;
                    
                    return (
                      <div key={category} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <Text>{category}</Text>
                          <Text type="secondary">{categoryPermissions.length} quyền</Text>
                        </div>
                        <Progress 
                          percent={percentage} 
                          size="small" 
                          strokeColor="#1890ff"
                        />
                      </div>
                    );
                  })}
                </Card>
              </Col>
            </Row>

            {role.name === 'quản trị viên' && (
              <Alert
                message="Cảnh báo bảo mật"
                description="Vai trò quản trị viên có toàn quyền trong hệ thống. Hãy cẩn thận khi phân quyền cho vai trò này."
                type="warning"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <LockOutlined />
                Quyền hạn ({role.permissions.length})
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
                    grid={{ gutter: 16, column: 2 }}
                    dataSource={role.permissions.filter(p => getPermissionCategory(p) === category)}
                    renderItem={permissionName => {
                      const permission = permissions.find(p => p.name === permissionName);
                      return (
                        <List.Item>
                          <Card size="small">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <Text strong>{permissionName}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {permission?.description || 'Không có mô tả'}
                                </Text>
                              </div>
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            </div>
                          </Card>
                        </List.Item>
                      );
                    }}
                  />
                  <Divider />
                </div>
              ))}
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Người dùng ({users.length})
              </span>
            } 
            key="users"
          >
            <Card title="Danh sách người dùng thuộc vai trò">
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} người dùng`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <AuditOutlined />
                Lịch sử
              </span>
            } 
            key="history"
          >
            <Card title="Lịch sử thay đổi">
              <Timeline>
                <Timeline.Item 
                  dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
                  color="blue"
                >
                  <p><Text strong>Cập nhật vai trò</Text></p>
                  <p>Thay đổi quyền hạn và mô tả</p>
                  <p><Text type="secondary">{role.updatedAt}</Text></p>
                </Timeline.Item>
                <Timeline.Item 
                  dot={<UserSwitchOutlined style={{ fontSize: '16px' }} />}
                  color="green"
                >
                  <p><Text strong>Thêm người dùng mới</Text></p>
                  <p>Nguyễn Văn A được gán vai trò này</p>
                  <p><Text type="secondary">2024-01-15</Text></p>
                </Timeline.Item>
                <Timeline.Item 
                  dot={<SafetyCertificateOutlined style={{ fontSize: '16px' }} />}
                  color="green"
                >
                  <p><Text strong>Tạo vai trò</Text></p>
                  <p>Vai trò được tạo với các quyền cơ bản</p>
                  <p><Text type="secondary">{role.createdAt}</Text></p>
                </Timeline.Item>
              </Timeline>
            </Card>
          </TabPane>
        </Tabs>

        {/* Edit Role Modal */}
        <Modal
          title="Chỉnh sửa vai trò"
          open={isEditModalVisible}
          onOk={handleEditModalOk}
          onCancel={() => setIsEditModalVisible(false)}
          width={800}
          okText="Cập nhật"
          cancelText="Hủy"
          confirmLoading={editLoading}
        >
          <Form
            form={form}
            layout="vertical"
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
              <Checkbox.Group style={{ width: '100%' }}>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {Array.from(new Set(permissions.map(p => p.category))).map(category => (
                    <div key={category} style={{ marginBottom: '16px' }}>
                      <Text strong style={{ display: 'block', marginBottom: '8px', color: '#1890ff' }}>
                        {category}
                      </Text>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        {permissions
                          .filter(p => p.category === category)
                          .map(permission => (
                            <Checkbox key={permission.id} value={permission.name}>
                              <div>
                                <Text strong>{permission.name}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {permission.description}
                                </Text>
                              </div>
                            </Checkbox>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </motion.div>
  );
};

export default RoleDetailPage; 