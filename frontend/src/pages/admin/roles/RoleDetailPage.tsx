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
} from 'antd';
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
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  const [role, setRole] = useState<Role | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions] = useState<Permission[]>([
    { id: '1', name: 'quản_lý_người_dùng', description: 'Quản lý người dùng', category: 'Quản lý người dùng', isActive: true },
    { id: '2', name: 'quản_lý_vai_trò', description: 'Quản lý vai trò', category: 'Quản lý vai trò', isActive: true },
    { id: '3', name: 'tạo_khóa_học', description: 'Tạo khóa học', category: 'Quản lý khóa học', isActive: true },
    { id: '4', name: 'chỉnh_sửa_khóa_học', description: 'Chỉnh sửa khóa học', category: 'Quản lý khóa học', isActive: true },
    { id: '5', name: 'xóa_khóa_học', description: 'Xóa khóa học', category: 'Quản lý khóa học', isActive: true },
    { id: '6', name: 'phê_duyệt_khóa_học', description: 'Phê duyệt khóa học', category: 'Quản lý khóa học', isActive: true },
    { id: '7', name: 'tạo_bài_học', description: 'Tạo bài học', category: 'Quản lý bài học', isActive: true },
    { id: '8', name: 'chỉnh_sửa_bài_học', description: 'Chỉnh sửa bài học', category: 'Quản lý bài học', isActive: true },
    { id: '9', name: 'phê_duyệt_nội_dung', description: 'Phê duyệt nội dung', category: 'Kiểm duyệt nội dung', isActive: true },
    { id: '10', name: 'từ_chối_nội_dung', description: 'Từ chối nội dung', category: 'Kiểm duyệt nội dung', isActive: true },
    { id: '11', name: 'xem_báo_cáo', description: 'Xem báo cáo', category: 'Báo cáo', isActive: true },
    { id: '12', name: 'xử_lý_báo_cáo', description: 'Xử lý báo cáo', category: 'Báo cáo', isActive: true },
    { id: '13', name: 'xem_thống_kê', description: 'Xem thống kê', category: 'Thống kê', isActive: true },
    { id: '14', name: 'quản_lý_thanh_toán', description: 'Quản lý thanh toán', category: 'Thanh toán', isActive: true },
    { id: '15', name: 'cài_đặt_hệ_thống', description: 'Cài đặt hệ thống', category: 'Hệ thống', isActive: true },
  ]);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    const mockRole: Role = {
      id: id || '1',
      name: 'giảng_viên',
      description: 'Giảng viên có thể tạo và quản lý khóa học',
      permissions: ['tạo_khóa_học', 'chỉnh_sửa_khóa_học', 'xóa_khóa_học', 'tạo_bài_học', 'chỉnh_sửa_bài_học'],
      userCount: 25,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
    };

    const mockUsers: User[] = [
      {
        id: '1',
        fullname: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        status: 'hoạt_động',
        joinedAt: '2024-01-15',
        lastLogin: '2024-01-20',
      },
      {
        id: '2',
        fullname: 'Trần Thị B',
        email: 'tranthib@example.com',
        status: 'hoạt_động',
        joinedAt: '2024-01-10',
        lastLogin: '2024-01-19',
      },
      {
        id: '3',
        fullname: 'Lê Văn C',
        email: 'levanc@example.com',
        status: 'không_hoạt_động',
        joinedAt: '2024-01-05',
        lastLogin: '2024-01-15',
      },
    ];

    setRole(mockRole);
    setUsers(mockUsers);
  }, [id]);

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

  const handleEditModalOk = () => {
    form.validateFields().then(values => {
      if (role) {
        setRole({
          ...role,
          ...values,
          updatedAt: new Date().toISOString().split('T')[0],
        });
        message.success('Đã cập nhật vai trò thành công');
        setIsEditModalVisible(false);
      }
    });
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

  if (!role) {
    return <div>Đang tải...</div>;
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
                  icon={role.name === 'quản_trị_viên' ? <CrownOutlined /> : role.name === 'giảng_viên' ? <TeamOutlined /> : <UserOutlined />}
                  size={48}
                  style={{ 
                    backgroundColor: role.name === 'quản_trị_viên' ? '#ff4d4f' : role.name === 'giảng_viên' ? '#1890ff' : '#52c41a',
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

            {role.name === 'quản_trị_viên' && (
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
          width={600}
          okText="Cập nhật"
          cancelText="Hủy"
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
              <Select
                mode="multiple"
                placeholder="Chọn quyền hạn"
                style={{ width: '100%' }}
                optionLabelProp="label"
              >
                {Array.from(new Set(permissions.map(p => p.category))).map(category => (
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