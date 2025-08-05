import React from 'react';
import { Alert, Typography, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface DeviceViolationAlertProps {
  message: string;
  onClose?: () => void;
}

const DeviceViolationAlert: React.FC<DeviceViolationAlertProps> = ({
  message,
  onClose
}) => {
  return (
    <Alert
      message={
        <Space>
          <ExclamationCircleOutlined />
          <strong>Vi phạm bảo mật thiết bị</strong>
        </Space>
      }
      description={
        <div>
          <Paragraph style={{ marginBottom: 8 }}>
            {message}
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            <Text type="danger">
              ⚠️ Hành vi này đã được ghi nhận và báo cáo cho quản trị viên. 
              Tài khoản của bạn có thể bị khóa nếu tiếp tục vi phạm.
            </Text>
          </Paragraph>
        </div>
      }
      type="error"
      showIcon
      closable={!!onClose}
      onClose={onClose}
      style={{ marginBottom: 16 }}
    />
  );
};

export default DeviceViolationAlert;
