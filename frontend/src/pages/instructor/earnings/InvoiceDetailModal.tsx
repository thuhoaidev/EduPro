import React from "react";
import { Modal, Avatar, Typography, Descriptions, Button, Card, Row, Col, Tag, Divider, Space } from "antd";
import { 
  FileTextOutlined, 
  UserOutlined, 
  DollarOutlined, 
  BankOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  WalletOutlined,
  PrinterOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const FADE_IN_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface InvoiceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: any | null;
  sending?: boolean;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ visible, onClose, invoice, sending }) => {
  if (!invoice) return null;

  const teacher = invoice.teacherId || {};
  const avatar = teacher.avatar || localStorage.getItem("avatar") || "/images/default-avatar.png";
  const name = teacher.fullname || localStorage.getItem("name") || "Giảng viên";
  const email = teacher.email || localStorage.getItem("email") || "";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return { color: "success", text: "✅ Đã duyệt", icon: <CheckCircleOutlined /> };
      case "pending":
        return { color: "processing", text: "⏳ Chờ duyệt", icon: <ClockCircleOutlined /> };
      case "rejected":
        return { color: "error", text: "❌ Từ chối", icon: <CloseCircleOutlined /> };
      default:
        return { color: "default", text: "🚫 Đã hủy", icon: <CloseCircleOutlined /> };
    }
  };

  const statusConfig = getStatusConfig(invoice.status);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button 
          key="print" 
          type="primary"
          icon={<PrinterOutlined />}
          style={{ 
            borderRadius: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            fontWeight: 600
          }}
          onClick={() => window.print()}
        >
          In hóa đơn
        </Button>,
        <Button key="close" onClick={onClose} style={{ borderRadius: 8 }}>
          Đóng
        </Button>
      ]}
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '700'
        }}>
          <FileTextOutlined style={{ marginRight: 8, fontSize: 20 }} />
          Hóa đơn rút tiền
        </div>
      }
      width={700}
      styles={{ 
        body: { 
          padding: 0, 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 16 
        },
        header: { borderRadius: '16px 16px 0 0' }
      }}
      style={{ top: 40 }}
    >
      <style>{`
        @media print {
          .ant-modal-mask,
          .ant-modal-wrap,
          .ant-modal-header,
          .ant-modal-footer {
            display: none !important;
          }
          .ant-modal {
            position: static !important;
            width: 100% !important;
            height: auto !important;
          }
          .ant-modal-content {
            box-shadow: none !important;
            border: 1px solid #d9d9d9 !important;
          }
        }
        .invoice-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          margin: 24px;
        }
        .invoice-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px 16px 0 0;
          padding: 24px;
          text-align: center;
        }
        .teacher-avatar {
          border: 4px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .amount-display {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          margin: 16px 0;
        }
        .info-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.1);
          margin: 8px 0;
        }
        .status-badge {
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          font-size: 14px;
        }
      `}</style>

      <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP_VARIANTS}>
        <Card className="invoice-card" bodyStyle={{ padding: 0 }}>
          {/* Header */}
          <div className="invoice-header">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Avatar
                src={avatar}
                size={80}
                className="teacher-avatar"
                icon={<UserOutlined />}
              />
              <Title level={3} style={{ margin: '16px 0 8px 0', color: 'white' }}>
                {name}
              </Title>
              {email && (
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 }}>
                  {email}
                </Text>
              )}
            </motion.div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {/* Invoice Number and Status */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card className="info-card" size="small">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileTextOutlined style={{ color: '#667eea', fontSize: 16 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Mã hóa đơn</Text>
                      <br />
                      <Text strong style={{ fontSize: 14 }}>
                        {invoice.invoiceNumber || invoice._id}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card className="info-card" size="small">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#667eea', fontSize: 16 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Ngày xuất</Text>
                      <br />
                      <Text strong style={{ fontSize: 14 }}>
                        {new Date(invoice.createdAt || invoice.issuedAt).toLocaleDateString("vi-VN")}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Amount Display */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="amount-display"
            >
              <DollarOutlined style={{ fontSize: 32, marginBottom: 8, opacity: 0.8 }} />
              <Title level={2} style={{ margin: '8px 0', color: 'white' }}>
                {invoice.amount?.toLocaleString("vi-VN")} đ
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 }}>
                Số tiền rút
              </Text>
            </motion.div>

            {/* Status */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ textAlign: 'center', marginBottom: 24 }}
            >
              <Tag 
                color={statusConfig.color} 
                icon={statusConfig.icon}
                className="status-badge"
                style={{ fontSize: 16, padding: '12px 24px' }}
              >
                {statusConfig.text}
              </Tag>
            </motion.div>

            <Divider />

            {/* Bank Information */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Title level={4} style={{ marginBottom: 16, color: '#2c3e50' }}>
                <BankOutlined style={{ marginRight: 8, color: '#667eea' }} />
                Thông tin ngân hàng
              </Title>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card className="info-card" size="small">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BankOutlined style={{ color: '#667eea', fontSize: 16 }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Ngân hàng</Text>
                        <br />
                        <Text strong style={{ fontSize: 14 }}>
                          {invoice.bank}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card className="info-card" size="small">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <WalletOutlined style={{ color: '#667eea', fontSize: 16 }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Số tài khoản</Text>
                        <br />
                        <Text strong style={{ fontSize: 14 }}>
                          {invoice.account}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card className="info-card" size="small">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserOutlined style={{ color: '#667eea', fontSize: 16 }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Chủ tài khoản</Text>
                        <br />
                        <Text strong style={{ fontSize: 14 }}>
                          {invoice.holder}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </motion.div>

            {/* Note */}
            {invoice.note && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{ marginTop: 24 }}
              >
                <Divider />
                <Title level={4} style={{ marginBottom: 16, color: '#2c3e50' }}>
                  Ghi chú
                </Title>
                <Card className="info-card" size="small">
                  <Text style={{ fontSize: 14, color: '#595959' }}>
                    {invoice.note}
                  </Text>
                </Card>
              </motion.div>
            )}

            {/* Footer */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ 
                textAlign: 'center', 
                marginTop: 32, 
                padding: '16px',
                background: 'rgba(102, 126, 234, 0.05)',
                borderRadius: 12
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hóa đơn này được tạo tự động bởi hệ thống EduPro
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Vui lòng lưu giữ hóa đơn này để làm bằng chứng giao dịch
              </Text>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </Modal>
  );
};

export default InvoiceDetailModal;