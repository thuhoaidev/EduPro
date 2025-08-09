import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../hooks/usePermissions';
import { useAuth } from '../../../contexts/AuthContext';
import { getRoles, createRole, deleteRole } from '../../../services/roleService';
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
  message,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Statistic,
  Typography,
  Avatar,
  List,
  Switch,
  Tabs,
  Descriptions,
  Alert,
  Divider,
  Badge,
  Progress,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  TeamOutlined,
  EyeOutlined,
  KeyOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  AuditOutlined,
  GlobalOutlined,
  SettingOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  StarOutlined,
  TrophyOutlined,
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
  icon?: string;
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
       id: '60',
       name: 'approve_courses',
       description: 'Duyệt khóa học',
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
  const [form] = Form.useForm();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
      message.error('Không thể tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  };

  const permissionCategories = Array.from(new Set(permissions.map(p => p.category)));

  const handleAddRole = () => {
    form.resetFields();
    setIsModalVisible(true);
  };



  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId);
      message.success('Đã xóa vai trò thành công');
      await loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      message.error('Không thể xóa vai trò');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      await createRole({
        name: values.name,
        description: values.description,
        permissions: values.permissions
      });
      message.success('Đã tạo vai trò mới thành công');
      
      setIsModalVisible(false);
      await loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      message.error('Không thể lưu vai trò');
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
      case 'quản trị viên':
        return <CrownOutlined style={{ color: '#ff4d4f' }} />;
      case 'instructor':
      case 'giảng viên':
        return <TeamOutlined style={{ color: '#1890ff' }} />;
      case 'student':
      case 'học viên':
        return <UserOutlined style={{ color: '#52c41a' }} />;
      case 'moderator':
      case 'điều hành viên':
        return <SafetyOutlined style={{ color: '#722ed1' }} />;
      default:
        return <UserOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
      case 'quản trị viên':
        return '#ff4d4f';
      case 'instructor':
      case 'giảng viên':
        return '#1890ff';
      case 'student':
      case 'học viên':
        return '#52c41a';
      case 'moderator':
      case 'điều hành viên':
        return '#722ed1';
      default:
        return '#8c8c8c';
    }
  };

  const columns = [
    {
      title: 'Vai trò',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Space size="middle">
            <Avatar 
              size={48}
              icon={getRoleIcon(name)}
              style={{ 
                backgroundColor: getRoleColor(name) + '20',
                border: `2px solid ${getRoleColor(name)}`,
              }}
            />
            <div>
              <Text strong style={{ fontSize: '16px', color: getRoleColor(name) }}>
                {name}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description}
              </Text>
            </div>
          </Space>
        </motion.div>
      ),
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissionList: string[]) => (
        <div style={{ maxWidth: 300 }}>
          {permissionList.includes('all') ? (
            <Badge.Ribbon text="Toàn quyền" color="red">
              <Card size="small" style={{ backgroundColor: '#fff2f0', border: '1px solid #ffccc7' }}>
                <Space>
                  <CrownOutlined style={{ color: '#ff4d4f' }} />
                  <Text strong style={{ color: '#ff4d4f' }}>Quyền quản trị tối cao</Text>
                </Space>
              </Card>
            </Badge.Ribbon>
          ) : (
            <div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Quyền chính:</Text>
              </div>
              {permissionList.slice(0, 3).map(perm => (
                <Tag 
                  key={perm} 
                  color="blue" 
                  style={{ 
                    marginBottom: 4, 
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '12px'
                  }}
                >
                  {perm}
                </Tag>
              ))}
              {permissionList.length > 3 && (
                <Tag 
                  color="default" 
                  style={{ 
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '12px'
                  }}
                >
                  +{permissionList.length - 3} quyền khác
                </Tag>
              )}
                             <Progress 
                 percent={Math.min((permissionList.length / permissions.length) * 100, 100)} 
                 size="small" 
                 showInfo={false}
                 strokeColor={getRoleColor(name)}
                 style={{ marginTop: 8 }}
               />
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Role) => {
        const isRoleActive = isActive !== false;
        return (
          <Space direction="vertical" size="small">
            <Tag 
              color={isRoleActive ? 'green' : 'red'} 
              icon={isRoleActive ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              style={{ 
                borderRadius: '12px',
                padding: '4px 12px',
                fontSize: '12px'
              }}
            >
              {isRoleActive ? 'Hoạt động' : 'Không hoạt động'}
            </Tag>
            {record.userCount !== undefined && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {record.userCount} người dùng
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => (
        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleDateString('vi-VN')}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {new Date(date).toLocaleTimeString('vi-VN')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: Role) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => navigate(`/admin/roles/${record._id}`)}
              style={{ 
                borderRadius: '8px',
                color: '#1890ff'
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa vai trò này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteRole(record._id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
                disabled={record.name === 'admin' || record.name === 'quản trị viên'}
                style={{ 
                  borderRadius: '8px'
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!canManageRoles()) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ padding: '24px', textAlign: 'center' }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Title level={3} style={{ color: '#ff4d4f' }}>Không có quyền truy cập</Title>
              <Text type="secondary">Bạn không có quyền quản lý phân quyền trong hệ thống.</Text>
            </div>
          }
        />
      </motion.div>
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
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                <KeyOutlined style={{ marginRight: '12px', color: '#667eea' }} />
                Quản lý phân quyền
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Quản lý vai trò và quyền hạn của người dùng trong hệ thống
              </Text>
            </div>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} lg={8}>
              <Card 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Statistic
                  title={<Text style={{ fontSize: '16px', fontWeight: 600 }}>Tổng số vai trò</Text>}
                  value={roles.length}
                  prefix={<SafetyCertificateOutlined style={{ color: '#667eea' }} />}
                  valueStyle={{ color: '#667eea', fontSize: '32px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Statistic
                  title={<Text style={{ fontSize: '16px', fontWeight: 600 }}>Vai trò đang hoạt động</Text>}
                  value={roles.filter(r => r.isActive !== false).length}
                  prefix={<UserSwitchOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Statistic
                  title={<Text style={{ fontSize: '16px', fontWeight: 600 }}>Tổng số quyền</Text>}
                  value={permissions.length}
                  prefix={<LockOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1', fontSize: '32px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/* Main Content */}
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
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Tabs 
              defaultActiveKey="roles" 
              type="card"
              size="large"
              style={{ marginTop: '16px' }}
            >
              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    <SafetyCertificateOutlined style={{ marginRight: '8px' }} />
                    Vai trò
                  </span>
                } 
                key="roles"
              >
                <div style={{ marginBottom: '24px' }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddRole}
                    size="large"
                    style={{ 
                      borderRadius: '12px',
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)'
                    }}
                  >
                    Thêm vai trò mới
                  </Button>
                </div>
                
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
                    style: { marginTop: '24px' }
                  }}
                  style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                />
              </TabPane>

              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    <LockOutlined style={{ marginRight: '8px' }} />
                    Quyền hạn
                  </span>
                } 
                key="permissions"
              >
                <div style={{ padding: '16px 0' }}>
                  {permissionCategories.map((category, index) => (
                    <motion.div 
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      style={{ marginBottom: '32px' }}
                    >
                      <Card 
                        title={
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <GlobalOutlined style={{ marginRight: '12px', color: '#667eea' }} />
                            <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                              {category}
                            </Text>
                          </div>
                        }
                        style={{ 
                          borderRadius: '12px',
                          border: '1px solid #f0f0f0',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        <List
                          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
                          dataSource={permissions.filter(p => p.category === category)}
                          renderItem={permission => (
                            <List.Item>
                              <Card 
                                size="small"
                                style={{ 
                                  borderRadius: '12px',
                                  border: '1px solid #f0f0f0',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                                hoverable
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                      <span style={{ fontSize: '20px', marginRight: '8px' }}>
                                        {permission.icon}
                                      </span>
                                      <Text strong style={{ fontSize: '14px' }}>
                                        {permission.name}
                                      </Text>
                                    </div>
                                    <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                      {permission.description}
                                    </Text>
                                  </div>
                                  <Switch 
                                    checked={permission.isActive}
                                    size="small"
                                    style={{ marginLeft: '12px' }}
                                  />
                                </div>
                              </Card>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabPane>

              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    <AuditOutlined style={{ marginRight: '8px' }} />
                    Phân tích
                  </span>
                } 
                key="analytics"
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card 
                      title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <TrophyOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                          <Text strong>Thống kê vai trò</Text>
                        </div>
                      }
                      style={{ 
                        borderRadius: '12px',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Vai trò được sử dụng nhiều nhất">
                          <Tag color="blue" style={{ borderRadius: '8px' }}>
                            {roles.length > 0 ? roles.reduce((max, role) => (role.userCount || 0) > (max.userCount || 0) ? role : max).name : 'Không có dữ liệu'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Vai trò có nhiều quyền nhất">
                          <Tag color="green" style={{ borderRadius: '8px' }}>
                            {roles.length > 0 ? roles.reduce((max, role) => role.permissions.length > max.permissions.length ? role : max).name : 'Không có dữ liệu'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Vai trò mới nhất">
                          <Tag color="purple" style={{ borderRadius: '8px' }}>
                            {roles.length > 0 ? roles.reduce((max, role) => new Date(role.createdAt || 0) > new Date(max.createdAt || 0) ? role : max).name : 'Không có dữ liệu'}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card 
                      title={
                                                 <div style={{ display: 'flex', alignItems: 'center' }}>
                           <SafetyOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                           <Text strong>Cảnh báo bảo mật</Text>
                         </div>
                      }
                      style={{ 
                        borderRadius: '12px',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      <Alert
                        message="Vai trò Quản trị viên có toàn quyền"
                        description="Vai trò quản trị viên có quyền truy cập tất cả chức năng trong hệ thống. Hãy cẩn thận khi phân quyền."
                        type="warning"
                        showIcon
                        style={{ marginBottom: '16px', borderRadius: '8px' }}
                      />
                      <Alert
                        message="Kiểm tra quyền định kỳ"
                        description="Nên kiểm tra và cập nhật quyền hạn định kỳ để đảm bảo bảo mật hệ thống."
                        type="info"
                        showIcon
                        style={{ borderRadius: '8px' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </motion.div>

        {/* Add/Edit Role Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SettingOutlined style={{ marginRight: '8px', color: '#667eea' }} />
              <Text strong style={{ fontSize: '18px' }}>
                Thêm vai trò mới
              </Text>
            </div>
          }
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          width={700}
          okText="Thêm mới"
          cancelText="Hủy"
          okButtonProps={{
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              height: '40px',
              fontWeight: 600
            }
          }}
          cancelButtonProps={{
            style: {
              borderRadius: '8px',
              height: '40px'
            }
          }}
          style={{ borderRadius: '16px' }}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ permissions: [] }}
            style={{ marginTop: '16px' }}
          >
            <Form.Item
              name="name"
              label={<Text strong>Tên vai trò</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
            >
              <Input 
                placeholder="Nhập tên vai trò" 
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Text strong>Mô tả</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="Mô tả vai trò và quyền hạn"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="permissions"
              label={<Text strong>Quyền hạn</Text>}
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một quyền!' }]}
            >
                             <Select
                 mode="multiple"
                 placeholder="Chọn quyền hạn"
                 optionLabelProp="label"
                 size="large"
                 style={{ width: '100%', borderRadius: '8px' }}
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
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '8px' }}>{permission.icon}</span>
                            <div>
                              <Text strong>{permission.name}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {permission.description}
                              </Text>
                            </div>
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