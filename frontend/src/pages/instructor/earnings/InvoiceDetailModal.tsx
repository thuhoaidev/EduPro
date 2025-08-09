import React from "react";
import { Modal, Avatar, Typography, Descriptions, Button } from "antd";

const { Title, Text } = Typography;

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

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Đóng</Button>
      ]}
      title={null}
      width={520}
      styles={{ body: { padding: 32, background: '#f9fafb', borderRadius: 16 } }}
      style={{ top: 40 }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <Avatar
          src={avatar}
          size={96}
          style={{ border: '4px solid #e0e7ff', boxShadow: '0 2px 8px #dbeafe', marginBottom: 12 }}
        />
        <Title level={4} style={{ margin: 0, color: '#2563eb', fontWeight: 700 }}>{name}</Title>
        {email && <Text type="secondary" style={{ fontSize: 15 }}>{email}</Text>}
      </div>
      <Descriptions
        column={1}
        bordered
        size="middle"
        styles={{
          label: { width: 160, fontWeight: 600, background: '#f1f5f9', color: '#2563eb' },
          content: { fontSize: 16, background: '#fff', color: '#0f172a' }
        }}
        style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ff' }}
      >
        <Descriptions.Item label="Mã hóa đơn">{invoice.invoiceNumber || invoice._id}</Descriptions.Item>
        <Descriptions.Item label="Số tiền">
          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 18 }}>{invoice.amount?.toLocaleString("vi-VN")} đ</span>
        </Descriptions.Item>
        <Descriptions.Item label="Ngân hàng">{invoice.bank}</Descriptions.Item>
        <Descriptions.Item label="Số tài khoản">{invoice.account}</Descriptions.Item>
        <Descriptions.Item label="Chủ tài khoản">{invoice.holder}</Descriptions.Item>
        <Descriptions.Item label="Ngày xuất">{new Date(invoice.createdAt || invoice.issuedAt).toLocaleString("vi-VN")}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <span style={{
            color: invoice.status === "approved" ? '#22c55e' : invoice.status === "pending" ? '#fa8c16' : invoice.status === "rejected" ? '#ef4444' : '#64748b',
            fontWeight: 600
          }}>
            {invoice.status === "approved" ? "Đã duyệt" : invoice.status === "pending" ? "Chờ duyệt" : invoice.status === "rejected" ? "Từ chối" : "Đã hủy"}
          </span>
        </Descriptions.Item>
        {invoice.note && <Descriptions.Item label="Ghi chú">{invoice.note}</Descriptions.Item>}
      </Descriptions>
    </Modal>
  );
};

export default InvoiceDetailModal;