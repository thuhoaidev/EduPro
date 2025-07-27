import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'quản_trị_viên',
      description: 'Quản trị viên hệ thống với toàn quyền',
      permissions: ['all'],
      userCount: 3,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'giảng_viên',
      description: 'Giảng viên có thể tạo và quản lý khóa học',
      permissions: ['tạo_khóa_học', 'chỉnh_sửa_khóa_học', 'xóa_khóa_học', 'tạo_bài_học', 'chỉnh_sửa_bài_học'],
      userCount: 25,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
    },
    {
      id: '3',
      name: 'học_viên',
      description: 'Học viên có thể đăng ký và học khóa học',
      permissions: ['đăng_ký_khóa_học', 'xem_khóa_học', 'xem_bài_học'],
      userCount: 150,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-05',
    },
    {
      id: '4',
      name: 'kiểm_duyệt_viên',
      description: 'Người kiểm duyệt nội dung',
      permissions: ['phê_duyệt_nội_dung', 'từ_chối_nội_dung', 'xem_báo_cáo', 'xử_lý_báo_cáo'],
      userCount: 8,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-12',
    },
  ]);

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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

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

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(role => role.id !== roleId));
    message.success('Đã xóa vai trò thành công');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingRole) {
        // Update existing role
        setRoles(roles.map(role => 
          role.id === editingRole.id 
            ? { ...role, ...values, updatedAt: new Date().toISOString().split('T')[0] }
            : role
        ));
        message.success('Đã cập nhật vai trò thành công');
      } else {
        // Add new role
        const newRole: Role = {
          id: Date.now().toString(),
          ...values,
          userCount: 0,
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        setRoles([...roles, newRole]);
        message.success('Đã tạo vai trò mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <Space>
          <Avatar 
            icon={name === 'quản_trị_viên' ? <CrownOutlined /> : name === 'giảng_viên' ? <TeamOutlined /> : <UserOutlined />}
            style={{ 
              backgroundColor: name === 'quản_trị_viên' ? '#ff4d4f' : name === 'giảng_viên' ? '#1890ff' : '#52c41a' 
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
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
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
              onClick={() => navigate(`/admin/roles/${record.id}`)}
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
            onConfirm={() => handleDeleteRole(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
                disabled={record.name === 'quản_trị_viên'}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
                value={roles.filter(r => r.isActive).length}
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
                rowKey="id"
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
                      {roles.reduce((max, role) => role.userCount > max.userCount ? role : max).name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vai trò có nhiều quyền nhất">
                      {roles.reduce((max, role) => role.permissions.length > max.permissions.length ? role : max).name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vai trò mới nhất">
                      {roles.reduce((max, role) => new Date(role.createdAt) > new Date(max.createdAt) ? role : max).name}
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