import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Tooltip,
  Avatar,
  Divider,
  Alert
} from 'antd';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import deviceSecurityService, { type DeviceViolation, type ViolationStats } from '../../../services/deviceSecurityService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminDeviceViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<DeviceViolation[]>([]);
  const [stats, setStats] = useState<ViolationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<DeviceViolation | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    dateRange: null as any
  });

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [violationsData, statsData] = await Promise.all([
        deviceSecurityService.getViolations({
          status: filters.status !== 'all' ? filters.status : undefined,
          severity: filters.severity !== 'all' ? filters.severity : undefined,
          limit: 100
        }),
        deviceSecurityService.getViolationStats()
      ]);
      
      setViolations(violationsData.data || []);
      setStats(statsData.data || null);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Không thể tải dữ liệu vi phạm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // Handle violation action
  const handleViolationAction = async () => {
    if (!selectedViolation) return;

    setActionLoading(true);
    try {
      const values = await form.validateFields();
      
      await deviceSecurityService.handleViolation(selectedViolation._id, {
        action: values.action,
        notes: values.notes || ''
      });

      message.success(
        values.action === 'block_users' 
          ? 'Đã khóa tài khoản vi phạm' 
          : 'Đã bỏ qua vi phạm'
      );
      
      setActionModalVisible(false);
      setSelectedViolation(null);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Error handling violation:', error);
      message.error('Không thể xử lý vi phạm');
    } finally {
      setActionLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (deviceId: string) => (
        <Space>
          <LaptopOutlined />
          <Text code>{deviceId.substring(0, 8)}...</Text>
        </Space>
      ),
    },
    {
      title: 'Người dùng vi phạm',
      dataIndex: 'user_ids',
      key: 'users',
      render: (userIds: any[]) => (
        <Space direction="vertical" size="small">
          {userIds.map((user: any, index: number) => (
            <Space key={index}>
              <Avatar size="small" icon={<UserOutlined />} />
              <Text>{user.fullname || user.username}</Text>
              <Text type="secondary">({user.email})</Text>
            </Space>
          ))}
        </Space>
      ),
    },
    {
      title: 'Khóa học',
      dataIndex: 'course_id',
      key: 'course_id',
      render: (courseId: any) => (
        <Text>{courseId?.title || `Course #${courseId}`}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Chờ xử lý', icon: <ExclamationCircleOutlined /> },
          resolved: { color: 'green', text: 'Đã xử lý', icon: <CheckCircleOutlined /> },
          dismissed: { color: 'gray', text: 'Đã bỏ qua', icon: <CloseCircleOutlined /> }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'detected_at',
      key: 'detected_at',
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <Text>{dayjs(date).fromNow()}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: DeviceViolation) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setSelectedViolation(record);
                setActionModalVisible(true);
              }}
            >
              Xử lý
            </Button>
          )}
          <Button
            size="small"
            onClick={() => {
              Modal.info({
                title: 'Chi tiết vi phạm',
                width: 600,
                content: (
                  <div>
                    <p><strong>Device ID:</strong> {record.device_id}</p>
                    <p><strong>IP Address:</strong> {record.ip_address}</p>
                    <p><strong>User Agent:</strong> {record.user_agent}</p>
                    <p><strong>Ghi chú:</strong> {record.admin_notes || 'Không có'}</p>
                  </div>
                ),
              });
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Quản lý Vi phạm Thiết bị</Title>
      
      {/* Stats Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng vi phạm"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã xử lý"
                value={stats.resolved}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã bỏ qua"
                value={stats.dismissed}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="resolved">Đã xử lý</Option>
              <Option value="dismissed">Đã bỏ qua</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Mức độ"
              value={filters.severity}
              onChange={(value) => setFilters({ ...filters, severity: value })}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Button onClick={loadData} loading={loading}>
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      
      <Card>
        <Table
          columns={columns}
          dataSource={violations}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} vi phạm`,
          }}
        />
      </Card>

      {/* Action Modal */}
      <Modal
        title="Xử lý Vi phạm"
        open={actionModalVisible}
        onOk={handleViolationAction}
        onCancel={() => {
          setActionModalVisible(false);
          setSelectedViolation(null);
          form.resetFields();
        }}
        confirmLoading={actionLoading}
        width={600}
      >
        {selectedViolation && (
          <div>
            <Alert
              message={`Vi phạm từ ${selectedViolation.user_ids.length} tài khoản trên cùng thiết bị`}
              description={`Device: ${selectedViolation.device_id.substring(0, 16)}...`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Form form={form} layout="vertical">
              <Form.Item
                name="action"
                label="Hành động"
                rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
              >
                <Select placeholder="Chọn hành động">
                  <Option value="block_users">Khóa tài khoản vi phạm</Option>
                  <Option value="dismiss">Bỏ qua vi phạm</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="notes"
                label="Ghi chú"
              >
                <TextArea
                  rows={4}
                  placeholder="Ghi chú về quyết định xử lý..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDeviceViolationsPage;
