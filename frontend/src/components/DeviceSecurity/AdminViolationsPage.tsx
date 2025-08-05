import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Input,
  Select,
  message,
  Statistic,
  Row,
  Col,
  Typography,
  Tooltip,
  Popconfirm,
  Alert
} from 'antd';
import {
  ExclamationCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import deviceSecurityService, { type DeviceViolation, type ViolationStats } from '../../services/deviceSecurityService';
import moment from 'moment';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<DeviceViolation[]>([]);
  const [stats, setStats] = useState<ViolationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<DeviceViolation | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'block_users' | 'dismiss'>('dismiss');
  const [adminNotes, setAdminNotes] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    severity: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [violationsRes, statsRes] = await Promise.all([
        deviceSecurityService.getViolations(filters),
        deviceSecurityService.getViolationStats()
      ]);

      setViolations(violationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
      message.error('Không thể tải dữ liệu vi phạm');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedViolation) return;

    try {
      await deviceSecurityService.handleViolation(
        selectedViolation.id,
        actionType,
        adminNotes
      );

      message.success(
        actionType === 'block_users' 
          ? 'Đã khóa tài khoản vi phạm' 
          : 'Đã bỏ qua vi phạm'
      );

      setActionModalVisible(false);
      setAdminNotes('');
      fetchData();
    } catch (error) {
      console.error('Handle violation error:', error);
      message.error('Không thể xử lý vi phạm');
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      critical: 'purple'
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      reviewed: 'blue',
      resolved: 'green',
      dismissed: 'gray'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<DeviceViolation> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device_id',
      key: 'device_id',
      width: 120,
      render: (deviceId: string) => (
        <Tooltip title={deviceId}>
          <Text code>{deviceId.substring(0, 8)}...</Text>
        </Tooltip>
      )
    },
    {
      title: 'Loại vi phạm',
      dataIndex: 'violation_type',
      key: 'violation_type',
      width: 120,
      render: (type: string) => {
        const typeMap = {
          multiple_accounts: 'Nhiều tài khoản',
          suspicious_activity: 'Hoạt động đáng ngờ',
          account_sharing: 'Chia sẻ tài khoản'
        };
        return typeMap[type as keyof typeof typeMap] || type;
      }
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'user_ids',
      key: 'user_count',
      width: 100,
      render: (userIds: number[]) => (
        <Tag color="blue">{userIds.length} tài khoản</Tag>
      )
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
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'pending' && 'Chờ xử lý'}
          {status === 'reviewed' && 'Đã xem'}
          {status === 'resolved' && 'Đã xử lý'}
          {status === 'dismissed' && 'Đã bỏ qua'}
        </Tag>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedViolation(record);
              setDetailModalVisible(true);
            }}
          />
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => {
                  setSelectedViolation(record);
                  setActionType('dismiss');
                  setActionModalVisible(true);
                }}
                style={{ color: 'green' }}
              />
              <Popconfirm
                title="Khóa tất cả tài khoản vi phạm?"
                onConfirm={() => {
                  setSelectedViolation(record);
                  setActionType('block_users');
                  setActionModalVisible(true);
                }}
                okText="Khóa"
                cancelText="Hủy"
              >
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  style={{ color: 'red' }}
                />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <WarningOutlined style={{ marginRight: 8 }} />
        Quản lý vi phạm bảo mật thiết bị
      </Title>

      {/* Statistics */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="Tổng vi phạm" value={stats.total} />
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
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Bộ lọc:</Text>
          </Col>
          <Col>
            <Select
              placeholder="Trạng thái"
              style={{ width: 120 }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="pending">Chờ xử lý</Option>
              <Option value="reviewed">Đã xem</Option>
              <Option value="resolved">Đã xử lý</Option>
              <Option value="dismissed">Đã bỏ qua</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Mức độ"
              style={{ width: 120 }}
              value={filters.severity}
              onChange={(value) => setFilters({ ...filters, severity: value })}
              allowClear
            >
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={violations}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} vi phạm`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết vi phạm"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedViolation && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>ID vi phạm:</Text> {selectedViolation.id}
              </Col>
              <Col span={12}>
                <Text strong>Thiết bị:</Text> 
                <Text code>{selectedViolation.device_id}</Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text strong>Số tài khoản:</Text> {selectedViolation.user_ids.length}
              </Col>
              <Col span={12}>
                <Text strong>Số khóa học:</Text> {selectedViolation.course_ids.length}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text strong>Mức độ:</Text> 
                <Tag color={getSeverityColor(selectedViolation.severity)}>
                  {selectedViolation.severity.toUpperCase()}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>IP:</Text> {selectedViolation.ip_address}
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text strong>Danh sách User ID:</Text>
              <div style={{ marginTop: 8 }}>
                {selectedViolation.user_ids.map(userId => (
                  <Tag key={userId} color="blue">User {userId}</Tag>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Text strong>Danh sách Course ID:</Text>
              <div style={{ marginTop: 8 }}>
                {selectedViolation.course_ids.map(courseId => (
                  <Tag key={courseId} color="green">Course {courseId}</Tag>
                ))}
              </div>
            </div>
            {selectedViolation.admin_notes && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Ghi chú admin:</Text>
                <div style={{ marginTop: 8 }}>
                  <Alert message={selectedViolation.admin_notes} type="info" />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={actionType === 'block_users' ? 'Khóa tài khoản' : 'Bỏ qua vi phạm'}
        open={actionModalVisible}
        onOk={handleAction}
        onCancel={() => {
          setActionModalVisible(false);
          setAdminNotes('');
        }}
        okText={actionType === 'block_users' ? 'Khóa tài khoản' : 'Bỏ qua'}
        cancelText="Hủy"
        okButtonProps={{ 
          danger: actionType === 'block_users',
          type: actionType === 'block_users' ? 'primary' : 'default'
        }}
      >
        <div>
          {actionType === 'block_users' ? (
            <Alert
              message="Cảnh báo"
              description="Bạn sắp khóa tất cả tài khoản vi phạm. Hành động này không thể hoàn tác."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Alert
              message="Bỏ qua vi phạm"
              description="Vi phạm sẽ được đánh dấu là đã bỏ qua và không được xử lý."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <div>
            <Text strong>Ghi chú (tùy chọn):</Text>
            <TextArea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Nhập ghi chú về quyết định của bạn..."
              style={{ marginTop: 8 }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminViolationsPage;
