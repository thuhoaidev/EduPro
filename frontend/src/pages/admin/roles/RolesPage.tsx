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
      name: 'quản trị viên',
      description: 'Quản trị viên hệ thống với toàn quyền',
      permissions: [
        'quản lý người dùng', 'phân quyền người dùng', 'khóa mở người dùng', 'duyệt giảng viên',
        'quản lý khóa học', 'quản lý bài viết', 'quản lý bình luận', 'quản lý danh mục',
        'quản lý vai trò', 'quản lý voucher', 'quản lý thanh toán', 'quản lý báo cáo',
        'xem thống kê tổng quan', 'xem thống kê doanh thu', 'xem thống kê người dùng', 'xem thống kê khóa học'
      ],
      userCount: 3,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'giảng viên',
      description: 'Giảng viên có thể tạo và quản lý khóa học',
      permissions: [
        'tạo khóa học', 'chỉnh sửa khóa học', 'xóa khóa học', 'xuất bản khóa học',
        'tạo bài học', 'chỉnh sửa bài học', 'xóa bài học', 'upload video',
        'tạo quiz', 'chỉnh sửa quiz',
        'xem danh sách học viên', 'xem tiến độ học viên', 'gửi thông báo',
        'xem thống kê thu nhập', 'rút tiền', 'xem lịch sử giao dịch'
      ],
      userCount: 25,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
    },
    {
      id: '3',
      name: 'học viên',
      description: 'Học viên có thể đăng ký và học khóa học',
      permissions: [
        'xem khóa học', 'đăng ký khóa học', 'xem bài học', 'làm quiz',
        'xem tiến độ', 'tạo ghi chú',
        'bình luận bài học', 'đánh giá khóa học', 'báo cáo vấn đề',
        'xem bài viết', 'bình luận bài viết', 'thích lưu bài viết',
        'xem chứng chỉ', 'tải chứng chỉ'
      ],
      userCount: 150,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-05',
    },
    {
      id: '4',
      name: 'kiểm duyệt viên',
      description: 'Người kiểm duyệt nội dung',
      permissions: [
        'duyệt bài viết', 'từ chối bài viết', 'duyệt bình luận', 'xóa bình luận',
        'xem báo cáo', 'xử lý báo cáo', 'cảnh cáo người dùng',
        'quản lý từ khóa', 'xem thống kê báo cáo'
      ],
      userCount: 8,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-12',
    },
    {
      id: '5',
      name: 'khách',
      description: 'Người dùng chưa đăng nhập',
      permissions: [
        'xem khóa học công khai', 'xem bài viết công khai',
        'tìm kiếm khóa học', 'xem giảng viên'
      ],
      userCount: 0,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ]);

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
                disabled={record.name === 'quản trị viên'}
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