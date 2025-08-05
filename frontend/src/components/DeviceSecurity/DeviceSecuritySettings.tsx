import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Statistic,
  Tooltip,
  message
} from 'antd';
import {
  SafetyOutlined,
  DesktopOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import deviceSecurityService, { type DeviceInfo } from '../../services/deviceSecurityService';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

const DeviceSecuritySettings: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceSecurityService.getUserDevices();
      setDevices(response.data);
    } catch (error) {
      console.error('Fetch devices error:', error);
      message.error('Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<DeviceInfo> = [
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      render: (course: any) => course?.title || `Course ${course?.id}`
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (deviceId: string) => (
        <Tooltip title={deviceId}>
          <Space>
            <DesktopOutlined />
            <Text code>{deviceId.substring(0, 12)}...</Text>
          </Space>
        </Tooltip>
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip: string) => <Text code>{ip}</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Đăng ký',
      dataIndex: 'registered_at',
      key: 'registered_at',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Hoạt động cuối',
      dataIndex: 'last_activity',
      key: 'last_activity',
      render: (date: string) => 
        date ? moment(date).format('DD/MM/YYYY HH:mm') : 'Chưa có'
    }
  ];

  const activeDevices = devices.filter(d => d.is_active);
  const totalCourses = new Set(devices.map(d => d.course_id)).size;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <SafetyOutlined style={{ marginRight: 8 }} />
        Bảo mật thiết bị
      </Title>

      <Alert
        message="Thông tin bảo mật"
        description={
          <div>
            <Paragraph>
              Hệ thống bảo mật thiết bị giúp ngăn chặn việc chia sẻ tài khoản và đảm bảo 
              mỗi tài khoản chỉ được sử dụng trên một thiết bị cho mỗi khóa học.
            </Paragraph>
            <ul>
              <li>Mỗi thiết bị sẽ được nhận diện thông qua thông tin trình duyệt</li>
              <li>Bạn cần đăng ký thiết bị trước khi truy cập khóa học</li>
              <li>Việc sử dụng nhiều tài khoản trên cùng thiết bị sẽ bị phát hiện</li>
              <li>Tài khoản vi phạm có thể bị khóa bởi quản trị viên</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Tổng thiết bị" 
              value={devices.length}
              prefix={<DesktopOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Thiết bị hoạt động" 
              value={activeDevices.length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Khóa học đã đăng ký" 
              value={totalCourses}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Devices Table */}
      <Card
        title="Danh sách thiết bị đã đăng ký"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchDevices}>
            Làm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={devices}
          rowKey={(record) => `${record.user_id}-${record.course_id}-${record.device_id}`}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} thiết bị`
          }}
        />
      </Card>

      {/* Help Section */}
      <Card 
        title={
          <Space>
            <InfoCircleOutlined />
            <span>Hướng dẫn sử dụng</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Title level={4}>Đăng ký thiết bị mới</Title>
            <Paragraph>
              1. Truy cập vào khóa học bạn muốn học<br/>
              2. Hệ thống sẽ yêu cầu đăng ký thiết bị<br/>
              3. Nhấn "Đăng ký thiết bị" để hoàn tất<br/>
              4. Thiết bị sẽ được lưu vào danh sách
            </Paragraph>
          </Col>
          <Col span={12}>
            <Title level={4}>Lưu ý quan trọng</Title>
            <Paragraph>
              • Không chia sẻ tài khoản với người khác<br/>
              • Không sử dụng nhiều tài khoản trên cùng thiết bị<br/>
              • Thiết bị không hoạt động sẽ tự động bị vô hiệu hóa<br/>
              • Liên hệ admin nếu gặp vấn đề
            </Paragraph>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DeviceSecuritySettings;
