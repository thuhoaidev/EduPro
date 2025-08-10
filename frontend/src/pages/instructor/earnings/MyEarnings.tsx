import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, Tag, Button, message, Popconfirm, Typography, Space, Row, Col } from "antd";
import { DollarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, WalletOutlined, HistoryOutlined, FileTextOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WithdrawModal from "../../../components/common/WithdrawModal";
import InvoiceDetailModal from "./InvoiceDetailModal";

const { Title, Text } = Typography;

const FADE_IN_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const MyEarnings = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/teacher-wallet/wallet", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWallet(res.data.wallet);
    setLoading(false);
  };

  const fetchWithdrawRequests = async () => {
    setLoadingRequests(true);
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/teacher-wallet/my-withdraw-requests", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWithdrawRequests(res.data.requests || []);
    setLoadingRequests(false);
  };

  useEffect(() => {
    fetchWallet();
    fetchWithdrawRequests();
    (window as any).fetchWallet = fetchWallet;
  }, []);

  const handleWithdraw = async (values: any) => {
    setWithdrawLoading(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = {
        amount: values.amount,
        bank: values.bank,
        account: values.account,
        holder: values.holder,
        note: values.note
      };
      
      await axios.post("http://localhost:5000/api/teacher-wallet/withdraw", submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đã gửi yêu cầu rút tiền!");
      setIsModalVisible(false);
      await fetchWallet();
      await fetchWithdrawRequests();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi rút tiền");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleCancelWithdraw = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/teacher-wallet/withdraw/${id}/cancel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đã hủy yêu cầu rút tiền!");
      await fetchWallet();
      await fetchWithdrawRequests();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi hủy yêu cầu rút tiền");
    }
  };

  // Thay thế gửi email bằng tải PDF
  const handleDownloadInvoice = async () => {
    // Đã xóa chức năng tải PDF
  };

  // Xóa nút tải PDF khỏi modal
  const handleShowInvoiceDetail = (invoice: any) => {
    setSelectedInvoice(invoice);
    setModalVisible(true);
  };

  // Tính toán thống kê
  const totalRequests = withdrawRequests.length;
  const pendingRequests = withdrawRequests.filter(r => r.status === "pending").length;
  const approvedRequests = withdrawRequests.filter(r => r.status === "approved").length;
  const rejectedRequests = withdrawRequests.filter(r => r.status === "rejected").length;
  const cancelledRequests = withdrawRequests.filter(r => r.status === "cancelled").length;
  const totalWithdrawn = withdrawRequests.filter(r => r.status === "approved").reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalEarnings = totalWithdrawn + (wallet?.balance || 0);

  return (
    <div style={{ 
      padding: "32px 24px", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh"
    }}>
      <style>{`
        .stats-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
        }
        .main-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          border: none;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        .withdraw-button {
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          height: 48px;
          font-size: 16px;
        }
        .withdraw-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }
        .page-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          margin-bottom: 32px;
        }
        .ant-table {
          background: transparent;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-weight: 600;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0;
          background: transparent;
        }
        .ant-table-tbody > tr:hover > td {
          background: rgba(102, 126, 234, 0.05) !important;
        }
        .table-row-earning {
          background-color: rgba(34, 197, 94, 0.05) !important;
        }
        .table-row-refund {
          background-color: rgba(156, 163, 175, 0.05) !important;
        }
        .table-row-withdraw {
          background-color: rgba(239, 68, 68, 0.05) !important;
        }
        .table-row-approved {
          background-color: rgba(34, 197, 94, 0.05) !important;
        }
        .table-row-rejected {
          background-color: rgba(239, 68, 68, 0.05) !important;
        }
        .table-row-pending {
          background-color: rgba(251, 191, 36, 0.05) !important;
        }
        .table-row-cancelled {
          background-color: rgba(156, 163, 175, 0.05) !important;
        }
        .status-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          border: none;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .status-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP_VARIANTS}>
        <Title level={2} className="page-title" style={{ textAlign: 'center' }}>
          <WalletOutlined style={{ marginRight: 12 }} />
          Quản lý thu nhập
        </Title>
        
        {/* Thống kê chính */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="stats-card">
                <Statistic 
                  title={<span style={{ color: '#667eea', fontWeight: '600' }}>Số dư hiện tại</span>}
                  value={wallet?.balance || 0} 
                  suffix="đ" 
                  prefix={<WalletOutlined style={{ color: '#667eea' }} />}
                  valueStyle={{ color: '#2c3e50', fontWeight: '700', fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="stats-card">
                <Statistic 
                  title={<span style={{ color: '#52c41a', fontWeight: '600' }}>Tổng thu nhập</span>}
                  value={totalEarnings.toLocaleString("vi-VN")} 
                  suffix="đ" 
                  prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontWeight: '700', fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="stats-card">
                <Statistic 
                  title={<span style={{ color: '#faad14', fontWeight: '600' }}>Đã rút</span>}
                  value={totalWithdrawn.toLocaleString("vi-VN")} 
                  suffix="đ" 
                  prefix={<CheckCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14', fontWeight: '700', fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="stats-card">
                <Statistic 
                  title={<span style={{ color: '#722ed1', fontWeight: '600' }}>Yêu cầu rút tiền</span>}
                  value={totalRequests} 
                  prefix={<HistoryOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1', fontWeight: '700', fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={{ ...FADE_IN_UP_VARIANTS, visible: { ...FADE_IN_UP_VARIANTS.visible, transition: { delay: 0.2 } } }}
          style={{ marginBottom: 32 }}
        >
          <Card className="main-card">
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                onClick={() => setIsModalVisible(true)} 
                className="withdraw-button"
                icon={<DollarOutlined style={{ marginRight: 8 }} />}
              >
                Rút tiền
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ ...FADE_IN_UP_VARIANTS, visible: { ...FADE_IN_UP_VARIANTS.visible, transition: { delay: 0.4 } } }}
        style={{ marginBottom: 32 }}
      >
        {/* Lịch sử giao dịch */}
        <Card 
          className="main-card"
          title={
            <span style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '700'
            }}>
              <HistoryOutlined style={{ marginRight: 8 }} />
              Lịch sử giao dịch
            </span>
          }
        >
          <Table
            dataSource={wallet?.history?.slice().sort((a: any, b: any) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime()) || []}
            loading={loading}
            rowKey={(r: any) => r?._id || Math.random().toString()}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giao dịch`,
              style: { marginTop: '24px' }
            }}
            style={{ borderRadius: '12px', overflow: 'hidden' }}
            columns={[
              { 
                title: "Loại", 
                dataIndex: "type", 
                render: (t: string, record: any) => {
                  if (t === "earning") {
                    return <Tag color="green" icon={<CheckCircleOutlined />} style={{ padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>💰 Thu nhập</Tag>;
                  }
                  if (t === "refund") {
                    return <Tag color="#bfbfbf" icon={<CloseCircleOutlined />} style={{ padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>🔄 Hoàn tiền</Tag>;
                  }
                  return <Tag color="red" icon={<CloseCircleOutlined />} style={{ padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>💸 Rút tiền</Tag>;
                }
              },
              { 
                title: "Số tiền", 
                dataIndex: "amount", 
                render: (amount: number, record: any) => (
                  <Text strong style={{ color: record.type === "earning" ? "#22c55e" : "#ef4444", fontSize: 18, fontWeight: 700 }}>
                    {amount.toLocaleString("vi-VN")} đ
                  </Text>
                ),
                sorter: (a: any, b: any) => (Number(a.amount) || 0) - (Number(b.amount) || 0),
              },
              { 
                title: "Ghi chú", 
                dataIndex: "note",
                render: (note: string) => <Text type="secondary" style={{ fontSize: 14 }}>{note || "Không có ghi chú"}</Text>
              },
              { 
                title: "Ngày", 
                dataIndex: "createdAt", 
                render: (d: string) => <Text type="secondary" style={{ fontSize: 14 }}>{new Date(d).toLocaleString()}</Text>,
                sorter: (a: any, b: any) => new Date(String(a.createdAt)).getTime() - new Date(String(b.createdAt)).getTime(),
                defaultSortOrder: 'descend',
              },
            ]}
            rowClassName={(record: any) => {
              if (record.type === "earning") return "table-row-earning";
              if (record.type === "refund") return "table-row-refund";
              return "table-row-withdraw";
            }}
          />
        </Card>
      </motion.div>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ ...FADE_IN_UP_VARIANTS, visible: { ...FADE_IN_UP_VARIANTS.visible, transition: { delay: 0.6 } } }}
      >
        {/* Yêu cầu rút tiền */}
        <Card 
          className="main-card"
          title={
            <span style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '700'
            }}>
              <DollarOutlined style={{ marginRight: 8 }} />
              Yêu cầu rút tiền của bạn
            </span>
          }
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="status-card" style={{ textAlign: "center", background: "rgba(251, 191, 36, 0.1)" }}>
                  <Statistic 
                    title={<span style={{ color: "#fa8c16", fontWeight: '600' }}>Chờ duyệt</span>} 
                    value={pendingRequests} 
                    prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />} 
                    valueStyle={{ color: "#fa8c16", fontWeight: '700', fontSize: '24px' }} 
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="status-card" style={{ textAlign: "center", background: "rgba(34, 197, 94, 0.1)" }}>
                  <Statistic 
                    title={<span style={{ color: "#52c41a", fontWeight: '600' }}>Đã duyệt</span>} 
                    value={approvedRequests} 
                    prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />} 
                    valueStyle={{ color: "#52c41a", fontWeight: '700', fontSize: '24px' }} 
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="status-card" style={{ textAlign: "center", background: "rgba(239, 68, 68, 0.1)" }}>
                  <Statistic 
                    title={<span style={{ color: "#ff4d4f", fontWeight: '600' }}>Từ chối</span>} 
                    value={rejectedRequests} 
                    prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />} 
                    valueStyle={{ color: "#ff4d4f", fontWeight: '700', fontSize: '24px' }} 
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="status-card" style={{ textAlign: "center", background: "rgba(156, 163, 175, 0.1)" }}>
                  <Statistic 
                    title={<span style={{ color: "#8c8c8c", fontWeight: '600' }}>Đã hủy</span>} 
                    value={cancelledRequests} 
                    prefix={<CloseCircleOutlined style={{ color: "#8c8c8c" }} />} 
                    valueStyle={{ color: "#8c8c8c", fontWeight: '700', fontSize: '24px' }} 
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>

          <Table
            dataSource={withdrawRequests.slice().sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime())}
            loading={loadingRequests}
            rowKey={(r: any) => r?._id || Math.random().toString()}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
              style: { marginTop: '24px' }
            }}
            style={{ borderRadius: '12px', overflow: 'hidden' }}
            columns={[
              { 
                title: "Số tiền", 
                dataIndex: "amount", 
                render: (amount) => (
                  <Text strong style={{ color: "#22c55e", fontSize: 18, fontWeight: 700 }}>
                    {amount.toLocaleString("vi-VN")} đ
                  </Text>
                ),
                sorter: (a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0),
              },
              { title: "Ngân hàng", dataIndex: "bank", render: (bank) => <Text style={{ fontSize: 14, fontWeight: 500 }}>{bank}</Text> },
              { title: "Số tài khoản", dataIndex: "account", render: (account) => <Text style={{ fontSize: 14, fontWeight: 500 }}>{account}</Text> },
              { title: "Chủ tài khoản", dataIndex: "holder", render: (holder) => <Text style={{ fontSize: 14, fontWeight: 500 }}>{holder}</Text> },
              { 
                title: "Trạng thái", 
                dataIndex: "status", 
                render: (status) => {
                  const statusConfig = {
                    approved: { color: "green", text: "✅ Đã duyệt", icon: <CheckCircleOutlined /> },
                    rejected: { color: "red", text: "❌ Từ chối", icon: <CloseCircleOutlined /> },
                    pending: { color: "orange", text: "⏳ Chờ duyệt", icon: <ClockCircleOutlined /> },
                    cancelled: { color: "gray", text: "🚫 Đã hủy", icon: <CloseCircleOutlined /> }
                  } as const;
                  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
                  return (
                    <Tag color={config.color} icon={config.icon} style={{ padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                      {config.text}
                    </Tag>
                  );
                },
                filters: [
                  { text: "Chờ duyệt", value: "pending" },
                  { text: "Đã duyệt", value: "approved" },
                  { text: "Từ chối", value: "rejected" },
                  { text: "Đã hủy", value: "cancelled" }
                ],
                onFilter: (value, record) => record.status === value,
              },
              { 
                title: "Lý do từ chối", 
                dataIndex: "note", 
                render: (note, record) => record.status === "rejected" ? (
                  <Text type="danger" style={{ fontSize: 12, fontWeight: 500 }}>{note}</Text>
                ) : null 
              },
              { 
                title: "Ngày yêu cầu", 
                dataIndex: "createdAt", 
                render: (d) => <Text type="secondary" style={{ fontSize: 14 }}>{new Date(d).toLocaleString()}</Text>,
                sorter: (a, b) => new Date(String(a.createdAt)).getTime() - new Date(String(b.createdAt)).getTime(),
                defaultSortOrder: 'descend',
              },
              {
                title: "Thao tác",
                dataIndex: "_id",
                render: (_id: string, record: any) => {
                  if (record.status === "pending") {
                    return (
                      <Popconfirm 
                        title="Bạn chắc chắn muốn hủy?" 
                        onConfirm={() => handleCancelWithdraw(_id)} 
                        okText="Đồng ý" 
                        cancelText="Hủy"
                      >
                        <Button 
                          danger 
                          size="small"
                          style={{ borderRadius: 8, fontWeight: 600 }}
                        >
                          Hủy
                        </Button>
                      </Popconfirm>
                    );
                  } else if (record.status === "approved") {
                    return (
                      <Button 
                        type="primary"
                        size="small"
                        icon={<FileTextOutlined />}
                        style={{ 
                          borderRadius: 8, 
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none'
                        }}
                        onClick={() => {
                          setSelectedInvoice(record);
                          setModalVisible(true);
                        }}
                      >
                        Hóa đơn
                      </Button>
                    );
                  }
                  return null;
                },
              },
            ]}
            rowClassName={(record) => {
              if (record.status === "approved") return "table-row-approved";
              if (record.status === "rejected") return "table-row-rejected";
              if (record.status === "cancelled") return "table-row-cancelled";
              return "table-row-pending";
            }}
          />
        </Card>
      </motion.div>

      <WithdrawModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleWithdraw}
        walletBalance={wallet?.balance || 0}
        loading={withdrawLoading}
      />

      <InvoiceDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default MyEarnings;
