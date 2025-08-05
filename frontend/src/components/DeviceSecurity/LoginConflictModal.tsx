import React from 'react';
import { Modal, Button, Alert, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface LoginConflictModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const LoginConflictModal: React.FC<LoginConflictModalProps> = ({
  visible,
  message,
  onClose
}) => {
  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Vi phạm bảo mật thiết bị</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đã hiểu
        </Button>
      ]}
      width={500}
      closable={false}
      maskClosable={false}
    >
      <div style={{ padding: '20px 0' }}>
        <Alert
          message="Phát hiện vi phạm bảo mật"
          description={message}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Alert
          message={
            <Space>
              <WarningOutlined />
              <strong>Cảnh báo nghiêm trọng</strong>
            </Space>
          }
          description={
            <div>
              <Paragraph style={{ marginBottom: 8 }}>
                Hành vi này đã được ghi nhận và báo cáo cho quản trị viên hệ thống.
              </Paragraph>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>Hậu quả có thể xảy ra:</strong>
              </Paragraph>
              <ul style={{ marginLeft: 20, marginBottom: 8 }}>
                <li>Tài khoản của bạn có thể bị khóa vĩnh viễn</li>
                <li>Mất quyền truy cập vào tất cả khóa học</li>
                <li>Không được hoàn tiền nếu đã thanh toán</li>
                <li>Bị cấm tạo tài khoản mới</li>
              </ul>
              <Paragraph style={{ marginBottom: 0 }}>
                <Text type="danger">
                  ⚠️ Vui lòng tuân thủ quy định sử dụng: mỗi tài khoản chỉ được sử dụng 
                  bởi một người trên một thiết bị.
                </Text>
              </Paragraph>
            </div>
          }
          type="warning"
          showIcon
        />

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Text type="secondary">
            Nếu bạn cho rằng đây là lỗi hệ thống, vui lòng liên hệ với bộ phận hỗ trợ.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default LoginConflictModal;
