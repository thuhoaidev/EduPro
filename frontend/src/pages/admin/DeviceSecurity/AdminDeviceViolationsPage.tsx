import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Input,
  message,
  Statistic,
  Row,
  Col,
  Typography,
  Tooltip,
  Badge,
  Descriptions,
  Divider,
  List,
  Avatar,
  Empty,
  Alert,
  Timeline
} from 'antd';
import {
  SecurityScanOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DesktopOutlined,
  GlobalOutlined,
  CalendarOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import deviceSecurityService from '../../../services/deviceSecurityService';
import type { DeviceViolation, ViolationStats } from '../../../services/deviceSecurityService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdminDeviceViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<DeviceViolation[]>([]);
  const [stats, setStats] = useState<ViolationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<DeviceViolation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [violationsData, statsData] = await Promise.all([
        deviceSecurityService.getViolations(),
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
  }, []);

  // Handle violation action
  const handleViolationAction = async () => {
    if (!selectedViolation) return;
    
    setActionLoading(true);
    try {
      const values = await form.validateFields();
      
      await deviceSecurityService.handleViolation(
        selectedViolation._id, 
        values.action,
        values.notes || ''
      );

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
      title: 'ID Vi phạm',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => (
        <Text code>#{id?.substring(0, 8) || 'N/A'}</Text>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device_id',
      key: 'device_id',
      width: 200,
      render: (deviceId: string, record: DeviceViolation) => (
        <Space direction="vertical" size="small">
          <Space>
            <DesktopOutlined style={{ color: '#1890ff' }} />
            <Text code>{deviceId?.substring(0, 12) || 'N/A'}...</Text>
          </Space>
          {record.ip_address && (
            <Space>
              <GlobalOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary">{record.ip_address}</Text>
            </Space>
          )}
          {record.device_info?.userAgent && (
            <Tooltip title={record.device_info.userAgent}>
              <Text type="secondary" ellipsis style={{ maxWidth: 150 }}>
                {record.device_info.userAgent.substring(0, 30)}...
              </Text>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Người dùng vi phạm',
      dataIndex: 'user_ids',
      key: 'users',
      width: 250,
      render: (userIds: any[]) => {
        if (!userIds || userIds.length === 0) {
          return <Text type="secondary">Không có dữ liệu</Text>;
        }
        return (
          <Space direction="vertical" size="small">
            {userIds.slice(0, 3).map((user: any, index: number) => (
              <Space key={index}>
                <Avatar size="small" icon={<UserOutlined />} />
                <div>
                  <Text strong>{user.fullname || user.username || `User ${index + 1}`}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {user.email || 'No email'}
                  </Text>
                </div>
              </Space>
            ))}
            {userIds.length > 3 && (
              <Text type="secondary">+{userIds.length - 3} người khác</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Khóa học',
      dataIndex: 'course_id',
      key: 'course_id',
      width: 150,
      render: (courseId: any) => (
        <Space direction="vertical" size="small">
          <Text strong>{courseId?.title || `Khóa học #${courseId}`}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>ID: {courseId}</Text>
        </Space>
      ),
    },
    {
      title: 'Loại vi phạm',
      dataIndex: 'violation_type',
      key: 'violation_type',
      width: 120,
      render: (type: string) => {
        const typeConfig = {
          multiple_accounts: { color: 'red', text: 'Nhiều tài khoản' },
          device_sharing: { color: 'orange', text: 'Chia sẻ thiết bị' },
          suspicious_activity: { color: 'purple', text: 'Hoạt động đáng nghi' }
        };
        const config = typeConfig[type as keyof typeof typeConfig] || { color: 'default', text: type };
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => {
        const severityConfig = {
          low: { color: 'green', text: 'Thấp' },
          medium: { color: 'orange', text: 'Trung bình' },
          high: { color: 'red', text: 'Cao' },
          critical: { color: 'purple', text: 'Nghiêm trọng' }
        };
        const config = severityConfig[severity as keyof typeof severityConfig] || { color: 'default', text: severity };
        return (
          <Badge color={config.color} text={config.text} />
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Chờ xử lý', icon: <ExclamationCircleOutlined /> },
          resolved: { color: 'green', text: 'Đã xử lý', icon: <CheckCircleOutlined /> },
          dismissed: { color: 'gray', text: 'Đã bỏ qua', icon: <CloseCircleOutlined /> }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status, icon: null };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 180,
      render: (record: DeviceViolation) => (
        <Space direction="vertical" size="small">
          <Space>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <div>
              <Text strong>Phát hiện:</Text>
              <br />
              <Text style={{ fontSize: '12px' }}>
                {record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
              </Text>
            </div>
          </Space>
          {record.reviewed_at && (
            <Space>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
              <div>
                <Text strong>Xử lý:</Text>
                <br />
                <Text style={{ fontSize: '12px' }}>
                  {dayjs(record.reviewed_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: DeviceViolation) => (
        <Space direction="vertical" size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              Modal.info({
                title: (
                  <Space>
                    <SecurityScanOutlined style={{ color: '#1890ff' }} />
                    Chi tiết vi phạm #{record._id?.substring(0, 8) || 'N/A'}
                  </Space>
                ),
                width: 800,
                content: (
                  <div style={{ marginTop: 16 }}>
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="ID Vi phạm" span={2}>
                        <Text code>{record._id || 'N/A'}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại vi phạm">
                        <Tag color="red">{record.violation_type || 'N/A'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mức độ">
                        <Badge color={record.severity === 'high' ? 'red' : 'orange'} text={record.severity || 'N/A'} />
                      </Descriptions.Item>
                      <Descriptions.Item label="Thiết bị ID" span={2}>
                        <Text code>{record.device_id || 'N/A'}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ IP">
                        <Text>{record.ip_address || 'N/A'}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Khóa học">
                        <Text>{record.course_ids?.length > 0 ? record.course_ids.join(', ') : 'N/A'}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="User Agent" span={2}>
                        <Text ellipsis style={{ maxWidth: 500 }}>
                          {record.device_info?.userAgent || 'N/A'}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian phát hiện">
                        <Text>{record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái">
                        <Tag color={record.status === 'pending' ? 'orange' : record.status === 'resolved' ? 'green' : 'gray'}>
                          {record.status === 'pending' ? 'Chờ xử lý' : record.status === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua'}
                        </Tag>
                      </Descriptions.Item>
                      {record.reviewed_at && (
                        <Descriptions.Item label="Thời gian xử lý">
                          <Text>{dayjs(record.reviewed_at).format('DD/MM/YYYY HH:mm:ss')}</Text>
                        </Descriptions.Item>
                      )}
                      {record.reviewed_by && (
                        <Descriptions.Item label="Người xử lý">
                          <Text>{record.reviewed_by}</Text>
                        </Descriptions.Item>
                      )}
                      {record.admin_notes && (
                        <Descriptions.Item label="Ghi chú admin" span={2}>
                          <Text>{record.admin_notes}</Text>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                    
                    {record.user_ids && record.user_ids.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Title level={5}>Người dùng vi phạm:</Title>
                        <List
                          size="small"
                          dataSource={record.user_ids}
                          renderItem={(user: any, index: number) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={user.fullname || user.username || `User ${index + 1}`}
                                description={user.email || 'No email'}
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                    
                    {record.device_info && (
                      <div style={{ marginTop: 16 }}>
                        <Title level={5}>Thông tin thiết bị:</Title>
                        <Descriptions size="small" bordered>
                          {record.device_info.userAgent && (
                            <Descriptions.Item label="User Agent" span={3}>
                              <Text style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                                {record.device_info.userAgent}
                              </Text>
                            </Descriptions.Item>
                          )}
                          {record.device_info.acceptLanguage && (
                            <Descriptions.Item label="Accept Language">
                              <Text>{record.device_info.acceptLanguage}</Text>
                            </Descriptions.Item>
                          )}
                          {record.device_info.acceptEncoding && (
                            <Descriptions.Item label="Accept Encoding">
                              <Text>{record.device_info.acceptEncoding}</Text>
                            </Descriptions.Item>
                          )}
                        </Descriptions>
                      </div>
                    )}
                  </div>
                ),
                okText: 'Đóng'
              });
            }}
          >
            Xem chi tiết
          </Button>
          {record.status === 'pending' && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setSelectedViolation(record);
                setActionModalVisible(true);
              }}
            >
              Xử lý
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SecurityScanOutlined style={{ marginRight: 8 }} />
        Quản lý Vi phạm Thiết bị
      </Title>
      
      {/* Stats Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng vi phạm"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
                prefix={<SecurityScanOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
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

      {/* Violations Table */}
      <Card title="Danh sách Vi phạm" extra={
        <Button onClick={loadData} loading={loading}>
          Làm mới
        </Button>
      }>
        <Table
          columns={columns}
          dataSource={violations}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1400 }}
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
        title={
          <Space>
            <EditOutlined />
            Xử lý Vi phạm
          </Space>
        }
        open={actionModalVisible}
        onOk={handleViolationAction}
        onCancel={() => {
          setActionModalVisible(false);
          setSelectedViolation(null);
          form.resetFields();
        }}
        confirmLoading={actionLoading}
        okText="Xử lý"
        cancelText="Hủy"
      >
        {selectedViolation && (
          <div>
            <Alert
              message="Thông tin vi phạm"
              description={
                <div>
                  <p><strong>Device ID:</strong> {selectedViolation.device_id}</p>
                  <p><strong>Loại vi phạm:</strong> {selectedViolation.violation_type}</p>
                  <p><strong>Số người dùng:</strong> {selectedViolation.user_ids?.length || 0}</p>
                </div>
              }
              type="warning"
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
                  placeholder="Nhập ghi chú về quyết định xử lý..."
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
