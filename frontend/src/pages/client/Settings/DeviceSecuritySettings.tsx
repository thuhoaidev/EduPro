import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Alert, 
  Spin,
  Row,
  Col,
  Statistic,
  Tooltip,
  Space
} from 'antd';
import { 
  LaptopOutlined, 
  SecurityScanOutlined, 
  ClockCircleOutlined,
  BookOutlined,
  GlobalOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import deviceSecurityService, { type DeviceInfo } from '../../../services/deviceSecurityService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const DeviceSecuritySettings: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user devices
  const loadDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await deviceSecurityService.getUserDevices();
      setDevices(response.data || []);
    } catch (error: any) {
      console.error('Error loading devices:', error);
      setError('Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // Get device status
  const getDeviceStatus = (device: DeviceInfo) => {
    const lastActivity = dayjs(device.last_activity);
    const daysSinceActivity = dayjs().diff(lastActivity, 'day');
    
    if (!device.is_active) {
      return { status: 'inactive', color: 'default', text: 'Không hoạt động' };
    } else if (daysSinceActivity > 7) {
      return { status: 'idle', color: 'orange', text: 'Không hoạt động gần đây' };
    } else if (daysSinceActivity > 1) {
      return { status: 'recent', color: 'blue', text: 'Hoạt động gần đây' };
    } else {
      return { status: 'active', color: 'green', text: 'Đang hoạt động' };
    }
  };

  // Get browser info from device_info
  const getBrowserInfo = (deviceInfo: any) => {
    if (!deviceInfo) return 'Không xác định';
    
    const userAgent = deviceInfo.userAgent || '';
    
    // Simple browser detection
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return 'Trình duyệt khác';
  };

  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: 'device_id',
      key: 'device_id',
      width: 200,
      render: (deviceId: string, record: DeviceInfo) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <LaptopOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <Text code style={{ fontSize: 12 }}>
              {deviceId.substring(0, 16)}...
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getBrowserInfo(record.device_info)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      width: 200,
      render: (course: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BookOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          <Text>{course?.title || 'Không xác định'}</Text>
        </div>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 150,
      render: (ip: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <GlobalOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
          <Text code>{ip || 'Không xác định'}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record: DeviceInfo) => {
        const status = getDeviceStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: 'Đăng ký',
      dataIndex: 'registered_at',
      key: 'registered_at',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
            <Text>{dayjs(date).fromNow()}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Hoạt động cuối',
      dataIndex: 'last_activity',
      key: 'last_activity',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <Text type="secondary">{dayjs(date).fromNow()}</Text>
        </Tooltip>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: devices.length,
    active: devices.filter(d => getDeviceStatus(d).status === 'active').length,
    recent: devices.filter(d => getDeviceStatus(d).status === 'recent').length,
    idle: devices.filter(d => getDeviceStatus(d).status === 'idle').length,
    inactive: devices.filter(d => getDeviceStatus(d).status === 'inactive').length,
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải danh sách thiết bị...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <SecurityScanOutlined style={{ marginRight: 8 }} />
        Bảo mật thiết bị
      </Title>

      <Alert
        message="Thông tin về bảo mật thiết bị"
        description={
          <div>
            <Paragraph>
              Hệ thống theo dõi các thiết bị bạn sử dụng để truy cập khóa học nhằm đảm bảo bảo mật 
              và ngăn chặn việc chia sẻ tài khoản trái phép.
            </Paragraph>
            <ul style={{ marginBottom: 0 }}>
              <li>Mỗi tài khoản chỉ được sử dụng trên một thiết bị cho mỗi khóa học</li>
              <li>Thiết bị được nhận diện thông qua thông tin trình duyệt</li>
              <li>Việc sử dụng nhiều tài khoản trên cùng thiết bị sẽ bị phát hiện</li>
              <li>Tài khoản vi phạm có thể bị khóa bởi quản trị viên</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng thiết bị"
              value={stats.total}
              prefix={<LaptopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<SecurityScanOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hoạt động gần đây"
              value={stats.recent}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Không hoạt động"
              value={stats.idle + stats.inactive}
              valueStyle={{ color: '#8c8c8c' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Devices Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={devices}
          rowKey={(record) => `${record.user_id}-${record.course_id}-${record.device_id}`}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} thiết bị`,
          }}
          locale={{
            emptyText: 'Chưa có thiết bị nào được đăng ký'
          }}
        />
      </Card>
    </div>
  );
};

export default DeviceSecuritySettings;
