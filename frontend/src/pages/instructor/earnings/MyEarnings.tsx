import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, Tag, Button, message, Popconfirm, Typography, Space, Row, Col } from "antd";
import { DollarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, WalletOutlined, HistoryOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WithdrawModal from "../../../components/common/WithdrawModal";
import InvoiceDetailModal from "./InvoiceDetailModal";

const { Title, Text } = Typography;

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
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Thống kê chính */}
      <Card style={{ marginBottom: 32, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <Title level={2} style={{ marginBottom: 32, color: "#2563eb", fontWeight: 700, letterSpacing: 1 }}>
          <WalletOutlined style={{ marginRight: 12 }} />
          Quản lý thu nhập
        </Title>
        
        <Row gutter={[24, 24]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-none" style={{ textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", borderRadius: 12 }}>
              <Statistic 
                title={<span className="text-white">Số dư hiện tại</span>} 
                value={wallet?.balance || 0} 
                suffix="đ" 
                valueStyle={{ color: "white", fontWeight: 600, fontSize: 18 }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-none" style={{ textAlign: "center", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white", borderRadius: 12 }}>
              <Statistic 
                title={<span className="text-white">Tổng thu nhập</span>} 
                value={totalEarnings.toLocaleString("vi-VN")} 
                suffix="đ" 
                valueStyle={{ color: "white", fontWeight: 600 }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-none" style={{ textAlign: "center", background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white", borderRadius: 12 }}>
              <Statistic 
                title={<span className="text-white">Đã rút</span>} 
                value={totalWithdrawn.toLocaleString("vi-VN")} 
                suffix="đ" 
                valueStyle={{ color: "white", fontWeight: 600 }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-none" style={{ textAlign: "center", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white", borderRadius: 12 }}>
              <Statistic 
                title={<span className="text-white">Yêu cầu rút tiền</span>} 
                value={totalRequests} 
                valueStyle={{ color: "white", fontWeight: 600 }} 
              />
            </Card>
          </Col>
        </Row>

        <Space size="large">
          <Button 
            type="primary" 
            onClick={() => setIsModalVisible(true)} 
            size="large"
            style={{ 
              borderRadius: 8, 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
              border: "none", 
              fontWeight: 600,
              height: 48,
              fontSize: 16
            }}
          >
            <DollarOutlined style={{ marginRight: 8 }} />
            Rút tiền
          </Button>
          {/* Đã xóa nút Xem hóa đơn dẫn đến /instructor/invoices */}
        </Space>
      </Card>

      {/* Lịch sử giao dịch */}
      <Card 
        style={{ marginBottom: 32, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}
        title={
          <Space>
            <HistoryOutlined style={{ color: "#2563eb" }} />
            <Text strong>Lịch sử giao dịch</Text>
          </Space>
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
          }}
          columns={[
            { 
              title: "Loại", 
              dataIndex: "type", 
              render: (t: string, record: any) => {
                if (t === "earning") {
                  return <Tag color="green" icon={<CheckCircleOutlined />} style={{ padding: "4px 10px", borderRadius: 8, fontWeight: 500, fontSize: 14 }}>Thu nhập</Tag>;
                }
                if (t === "refund") {
                  return <Tag color="#bfbfbf" icon={<CloseCircleOutlined />} style={{ padding: "4px 10px", borderRadius: 8, fontWeight: 500, fontSize: 14 }}>Hoàn tiền</Tag>;
                }
                return <Tag color="red" icon={<CloseCircleOutlined />} style={{ padding: "4px 10px", borderRadius: 8, fontWeight: 500, fontSize: 14 }}>Rút tiền</Tag>;
              }
            },
            { 
              title: "Số tiền", 
              dataIndex: "amount", 
              render: (amount: number, record: any) => (
                <Text strong style={{ color: record.type === "earning" ? "#22c55e" : "#ef4444", fontSize: 16 }}>
                  {amount.toLocaleString("vi-VN")} đ
                </Text>
              ),
              sorter: (a: any, b: any) => (Number(a.amount) || 0) - (Number(b.amount) || 0),
            },
            { 
              title: "Ghi chú", 
              dataIndex: "note",
              render: (note: string) => <Text type="secondary">{note || "Không có ghi chú"}</Text>
            },
            { 
              title: "Ngày", 
              dataIndex: "createdAt", 
              render: (d: string) => <Text type="secondary">{new Date(d).toLocaleString()}</Text>,
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

      {/* Yêu cầu rút tiền */}
      <Card 
        style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}
        title={
          <Space>
            <DollarOutlined style={{ color: "#2563eb" }} />
            <Text strong>Yêu cầu rút tiền của bạn</Text>
          </Space>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: "center", background: "#fff7e6", borderRadius: 8 }}>
              <Statistic title="Chờ duyệt" value={pendingRequests} prefix={<ClockCircleOutlined />} valueStyle={{ color: "#fa8c16" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: "center", background: "#f6ffed", borderRadius: 8 }}>
              <Statistic title="Đã duyệt" value={approvedRequests} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#52c41a" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: "center", background: "#fff2f0", borderRadius: 8 }}>
              <Statistic title="Từ chối" value={rejectedRequests} prefix={<CloseCircleOutlined />} valueStyle={{ color: "#ff4d4f" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: "center", background: "#f5f5f5", borderRadius: 8 }}>
              <Statistic title="Đã hủy" value={cancelledRequests} prefix={<CloseCircleOutlined />} valueStyle={{ color: "#8c8c8c" }} />
            </Card>
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
          }}
          columns={[
            { 
              title: "Số tiền", 
              dataIndex: "amount", 
              render: (amount) => (
                <Text strong style={{ color: "#22c55e", fontSize: 16 }}>
                  {amount.toLocaleString("vi-VN")} đ
                </Text>
              ),
              sorter: (a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0),
            },
            { title: "Ngân hàng", dataIndex: "bank" },
            { title: "Số tài khoản", dataIndex: "account" },
            { title: "Chủ tài khoản", dataIndex: "holder" },
            { 
              title: "Trạng thái", 
              dataIndex: "status", 
              render: (status) => {
                const statusConfig = {
                  approved: { color: "green", text: "Đã duyệt", icon: <CheckCircleOutlined /> },
                  rejected: { color: "red", text: "Từ chối", icon: <CloseCircleOutlined /> },
                  pending: { color: "orange", text: "Chờ duyệt", icon: <ClockCircleOutlined /> },
                  cancelled: { color: "gray", text: "Đã hủy", icon: <CloseCircleOutlined /> }
                } as const;
                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
                return (
                  <Tag color={config.color} icon={config.icon} style={{ padding: "4px 10px", borderRadius: 8, fontWeight: 500, fontSize: 14 }}>
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
                <Text type="danger" style={{ fontSize: 12 }}>{note}</Text>
              ) : null 
            },
            { 
              title: "Ngày yêu cầu", 
              dataIndex: "createdAt", 
              render: (d) => <Text type="secondary">{new Date(d).toLocaleString()}</Text>,
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
                        style={{ borderRadius: 6, fontWeight: 600 }}
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
                      style={{ borderRadius: 6, fontWeight: 600 }}
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

      <style>{`
        .table-row-earning {
          background-color: #f0fdf4 !important;
        }
        .table-row-refund {
          background-color: #f5f5f5 !important;
        }
        .table-row-withdraw {
          background-color: #fef2f2 !important;
        }
        .table-row-approved {
          background-color: #f0fdf4 !important;
        }
        .table-row-rejected {
          background-color: #fef2f2 !important;
        }
        .table-row-pending {
          background-color: #fefce8 !important;
        }
        .table-row-cancelled {
          background-color: #f3f4f6 !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e0e7ff !important;
        }
      `}</style>
    </div>
  );
};

export default MyEarnings;
