import React, { useState } from 'react';
import { Modal, Button, Alert, Typography, Space, Spin } from 'antd';
import { ExclamationCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import deviceSecurityService from '../../services/deviceSecurityService';

const { Title, Text, Paragraph } = Typography;

interface DeviceRegistrationModalProps {
  visible: boolean;
  courseId: number;
  courseName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const DeviceRegistrationModal: React.FC<DeviceRegistrationModalProps> = ({
  visible,
  courseId,
  courseName,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      await deviceSecurityService.registerDevice(courseId);
      
      onSuccess();
    } catch (error: any) {
      console.error('Device registration error:', error);
      setError(error.message || 'Đăng ký thiết bị thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <span>Đăng ký thiết bị</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="register" 
          type="primary" 
          loading={loading}
          onClick={handleRegister}
        >
          Đăng ký thiết bị
        </Button>
      ]}
      width={500}
      closable={false}
      maskClosable={false}
    >
      <div style={{ padding: '20px 0' }}>
        <Alert
          message="Yêu cầu đăng ký thiết bị"
          description={
            <div>
              <Paragraph>
                Để đảm bảo bảo mật và ngăn chặn việc chia sẻ tài khoản, bạn cần đăng ký thiết bị này 
                để truy cập khóa học <strong>{courseName}</strong>.
              </Paragraph>
              <Paragraph>
                <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                <strong>Lưu ý quan trọng:</strong>
              </Paragraph>
              <ul style={{ marginLeft: 20 }}>
                <li>Mỗi tài khoản chỉ được sử dụng trên một thiết bị cho mỗi khóa học</li>
                <li>Việc sử dụng nhiều tài khoản trên cùng một thiết bị sẽ bị phát hiện</li>
                <li>Tài khoản vi phạm có thể bị khóa bởi quản trị viên</li>
                <li>Thiết bị sẽ được nhận diện thông qua thông tin trình duyệt</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
        />

        {error && (
          <Alert
            message="Lỗi đăng ký"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Spin size="large" />
            <div style={{ marginTop: 10 }}>
              <Text>Đang đăng ký thiết bị...</Text>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DeviceRegistrationModal;
