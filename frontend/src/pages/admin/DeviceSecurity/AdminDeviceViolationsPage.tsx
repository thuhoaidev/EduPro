import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Input, 
  message, 
  Statistic, 
  Row, 
  Col,
  Select,
  Typography,
  Alert,
  Tooltip
} from 'antd';
import { 
  ExclamationCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EyeOutlined,
  SecurityScanOutlined,
  UserOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import deviceSecurityService, { type DeviceViolation, type ViolationStats } from '../../../services/deviceSecurityService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminDeviceViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<DeviceViolation[]>([]);
  const [stats, setStats] = useState<ViolationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<DeviceViolation | null>(null);
  const [action, setAction] = useState<'block_users' | 'dismiss'>('dismiss');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all'
  });

  // Load violations and stats
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
      await deviceSecurityService.handleViolation(
        selectedViolation.id,
        action,
        notes
      );
      
      message.success(
        action === 'block_users' 
          ? 'Đã khóa tài khoản vi phạm' 
          : 'Đã bỏ qua vi phạm'
      );
      
      setModalVisible(false);
      setSelectedViolation(null);
      setNotes('');
      loadData();
    } catch (error) {
      console.error('Error handling violation:', error);
      message.error('Không thể xử lý vi phạm');
    } finally {
      setActionLoading(false);
    }
  };

  // Open action modal
  const openActionModal = (violation: DeviceViolation) => {
    setSelectedViolation(violation);
    setModalVisible(true);
    setAction('dismiss');
    setNotes('');
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      case 'critical': return 'purple';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'reviewed': return 'blue';
      case 'resolved': return 'green';
      case 'dismissed': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device_id',
      key: 'device_id',
      width: 200,
      render: (deviceId: string) => (
        <Tooltip title={deviceId}>
          <Text code style={{ fontSize: 12 }}>
            <LaptopOutlined style={{ marginRight: 4 }} />
            {deviceId.substring(0, 12)}...
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Loại vi phạm',
      dataIndex: 'violation_type',
      key: 'violation_type',
      width: 150,
      render: (type: string) => {
        const typeMap = {
          'multiple_accounts': 'Nhiều tài khoản',
          'suspicious_activity': 'Hoạt động khả nghi',
          'account_sharing': 'Chia sẻ tài khoản'
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'user_ids',
      key: 'user_ids',
      width: 120,
      render: (userIds: number[]) => (
        <Tag icon={<UserOutlined />} color="blue">
          {userIds.length} tài khoản
        </Tag>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap = {
          'pending': 'Chờ xử lý',
          'reviewed': 'Đã xem',
          'resolved': 'Đã xử lý',
          'dismissed': 'Đã bỏ qua'
        };
        return (
          <Tag color={getStatusColor(status)}>
            {statusMap[status as keyof typeof statusMap] || status}
          </Tag>
        );
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record: DeviceViolation) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openActionModal(record)}
            disabled={record.status === 'resolved' || record.status === 'dismissed'}
          >
            Xử lý
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <SecurityScanOutlined style={{ marginRight: 8 }} />
        Quản lý vi phạm bảo mật thiết bị
      </Title>

      {/* Statistics */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng vi phạm"
                value={stats.total}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={stats.pending}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã xử lý"
                value={stats.resolved}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã bỏ qua"
                value={stats.dismissed}
                valueStyle={{ color: '#8c8c8c' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Trạng thái:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="all">Tất cả</Option>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="reviewed">Đã xem</Option>
              <Option value="resolved">Đã xử lý</Option>
              <Option value="dismissed">Đã bỏ qua</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Text strong>Mức độ:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={filters.severity}
              onChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
            >
              <Option value="all">Tất cả</Option>
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
              <Option value="critical">Nghiêm trọng</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Violations Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={violations}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} vi phạm`,
          }}
        />
      </Card>

      {/* Action Modal */}
      <Modal
        title="Xử lý vi phạm bảo mật"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={actionLoading}
            onClick={handleViolationAction}
            danger={action === 'block_users'}
          >
            {action === 'block_users' ? 'Khóa tài khoản' : 'Bỏ qua vi phạm'}
          </Button>,
        ]}
        width={600}
      >
        {selectedViolation && (
          <div>
            <Alert
              message="Thông tin vi phạm"
              description={
                <div>
                  <p><strong>Device ID:</strong> {selectedViolation.device_id}</p>
                  <p><strong>Số tài khoản vi phạm:</strong> {selectedViolation.user_ids.length}</p>
                  <p><strong>Khóa học:</strong> {selectedViolation.course_ids.length} khóa học</p>
                  <p><strong>IP Address:</strong> {selectedViolation.ip_address}</p>
                  <p><strong>Mức độ:</strong> 
                    <Tag color={getSeverityColor(selectedViolation.severity)} style={{ marginLeft: 8 }}>
                      {selectedViolation.severity.toUpperCase()}
                    </Tag>
                  </p>
                  <p><strong>Thời gian:</strong> {dayjs(selectedViolation.created_at).format('DD/MM/YYYY HH:mm:ss')}</p>
                </div>
              }
              type="warning"
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <Text strong>Hành động:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={action}
                onChange={setAction}
              >
                <Option value="dismiss">Bỏ qua vi phạm</Option>
                <Option value="block_users">Khóa tài khoản vi phạm</Option>
              </Select>
            </div>

            <div>
              <Text strong>Ghi chú:</Text>
              <TextArea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về quyết định xử lý..."
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDeviceViolationsPage;
