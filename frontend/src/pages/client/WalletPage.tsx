import React, { useEffect, useState } from "react";
import { Card, Table, Button, InputNumber, Select, message, Tag, Form, Typography, Modal, Statistic, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import WithdrawModal from '../../components/common/WithdrawModal';
import { userWalletService } from '../../services/apiService';
import { EyeOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const WalletPage: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<string>("momo");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [showAllWithdraw, setShowAllWithdraw] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallet();
    fetchWithdrawHistory();
    // eslint-disable-next-line
  }, []);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/wallet", {
        headers: token ? { "Authorization": "Bearer " + token } : {},
      });
      if (res.status === 401) {
        message.error("Bạn cần đăng nhập lại");
        navigate('/login');
        return;
      }
      const json = await res.json();
      if (json.success) {
        setBalance(json.balance);
        setHistory(json.history || []);
      }
    } catch (err) {
      message.error("Lỗi khi lấy số dư ví");
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawHistory = async () => {
    try {
      const res = await userWalletService.getMyWithdrawRequests();
      if (res.success) setWithdrawHistory(res.requests || []);
    } catch (err) {
      // ignore
    }
  };

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return message.error("Nhập số tiền hợp lệ");
    setLoading(true);
    try {
      if (loading) return;
      sessionStorage.setItem('walletDepositInProgress', '1');
      const res = await fetch("http://localhost:5000/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        body: JSON.stringify({ amount, method })
      });
      if (res.status === 401) {
        message.error("Bạn cần đăng nhập lại");
        navigate('/login');
        return;
      }
      const json = await res.json();
      if (json.success && json.payUrl) {
        sessionStorage.removeItem('walletDepositInProgress');
        window.location.href = json.payUrl;
      } else {
        message.error(json.message || "Lỗi tạo yêu cầu nạp tiền");
        sessionStorage.removeItem('walletDepositInProgress');
      }
    } catch (err) {
      message.error("Lỗi tạo yêu cầu nạp tiền");
      sessionStorage.removeItem('walletDepositInProgress');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (values: any) => {
    setWithdrawLoading(true);
    try {
      const res = await userWalletService.requestWithdraw({
        amount: values.amount,
        bank: values.bank,
        account: values.account,
        holder: values.holder,
      });
      if (res.success) {
        message.success("Đã gửi yêu cầu rút tiền!");
        setWithdrawModalOpen(false);
        fetchWallet();
        fetchWithdrawHistory();
      } else {
        message.error(res.message || "Lỗi gửi yêu cầu rút tiền");
      }
    } catch (err) {
      message.error("Lỗi gửi yêu cầu rút tiền");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const showDetail = (record: any) => {
    setDetailModal({ open: true, data: record });
  };

  const withdrawColumns = [
    { title: "Số tiền", dataIndex: "amount", key: "amount", render: (v: number) => <b style={{ color: "#22c55e" }}>{v.toLocaleString()}₫</b> },
    { title: "Ngân hàng", dataIndex: "bank", key: "bank" },
    { title: "Số tài khoản", dataIndex: "account", key: "account", render: (v: string) => <span style={{ fontFamily: "monospace" }}>{v}</span> },
    { title: "Chủ tài khoản", dataIndex: "holder", key: "holder" },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (status: string) => {
      if (status === "pending") return <Tag color="orange" style={{ fontWeight: 600 }}>Chờ duyệt</Tag>;
      if (status === "approved") return <Tag color="green" style={{ fontWeight: 600 }}>Đã duyệt</Tag>;
      if (status === "rejected") return <Tag color="red" style={{ fontWeight: 600 }}>Từ chối</Tag>;
      if (status === "cancelled") return <Tag color="gray" style={{ fontWeight: 600 }}>Đã hủy</Tag>;
      return status;
    }},
    { title: "Thời gian", dataIndex: "createdAt", key: "createdAt", render: (v: string) => new Date(v).toLocaleString() },
    {
      title: "Chi tiết",
      key: "actions",
      render: (_: any, record: any) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
          Xem
        </Button>
      ),
    },
  ];

  const columns = [
    { title: "Loại giao dịch", dataIndex: "type", key: "type", render: (type: string) => {
      if (type === "deposit") return <Tag color="green">Nạp tiền</Tag>;
      if (type === "withdraw") return <Tag color="orange">Rút tiền</Tag>;
      if (type === "payment") return <Tag color="blue">Thanh toán</Tag>;
      return type;
    }},
    { title: "Số tiền", dataIndex: "amount", key: "amount", render: (v: number) => v.toLocaleString() + "₫" },
    { title: "Phương thức", dataIndex: "method", key: "method" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    { title: "Thời gian", dataIndex: "createdAt", key: "createdAt", render: (v: string) => new Date(v).toLocaleString() },
  ];

  // Thống kê
  const sortedWithdrawHistory = [...withdrawHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalRequests = withdrawHistory.length;
  const pendingRequests = withdrawHistory.filter(r => r.status === "pending").length;
  const approvedRequests = withdrawHistory.filter(r => r.status === "approved").length;
  const rejectedRequests = withdrawHistory.filter(r => r.status === "rejected").length;
  const totalAmount = withdrawHistory.filter(r => r.status === "approved").reduce((sum, r) => sum + (r.amount || 0), 0);
  const displayWithdrawHistory = showAllWithdraw ? sortedWithdrawHistory : sortedWithdrawHistory.slice(0, 5);

  // Thống kê ví tiền
  const totalDeposit = history.filter(h => h.type === "deposit").reduce((sum, h) => sum + (h.amount || 0), 0);
  const totalWithdraw = history.filter(h => h.type === "withdraw" && h.status === "approved").reduce((sum, h) => sum + Math.abs(h.amount || 0), 0);

  return (
    <Card style={{ marginBottom: 32, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <Title level={3} style={{ marginBottom: 24 }}>Ví của tôi</Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Statistic title={<span className="text-blue-700">Số dư hiện tại</span>} value={balance.toLocaleString("vi-VN")} suffix="₫" valueStyle={{ color: "#2563eb", fontWeight: 600, fontSize: 18 }} />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic title={<span className="text-green-700">Tổng nạp</span>} value={totalDeposit.toLocaleString("vi-VN")} suffix="₫" valueStyle={{ color: "#22c55e", fontWeight: 600 }} />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic title={<span className="text-orange-700">Tổng đã rút</span>} value={totalWithdraw.toLocaleString("vi-VN")} suffix="₫" valueStyle={{ color: "#fa8c16", fontWeight: 600 }} />
        </Col>
      </Row>
      <Form layout="inline" style={{ marginBottom: 24 }}>
        <Form.Item label="Số tiền">
          <InputNumber min={10000} step={10000} value={amount || undefined} onChange={setAmount} placeholder="Nhập số tiền" />
        </Form.Item>
        <Form.Item label="Phương thức">
          <Select value={method} onChange={setMethod} style={{ width: 120 }}>
            <Option value="momo">Momo</Option>
            <Option value="vnpay">VNPAY</Option>
            <Option value="zalopay">ZaloPay</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleDeposit} loading={loading}>Nạp tiền</Button>
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={() => setWithdrawModalOpen(true)} disabled={balance < 50000}>Rút tiền</Button>
        </Form.Item>
      </Form>
      <Table columns={columns} dataSource={history} rowKey={(r) => r.createdAt + r.amount + r.type} pagination={false} style={{ marginBottom: 32 }} />
      <Card title={<b>Lịch sử yêu cầu rút tiền</b>} style={{ marginTop: 24 }}>
        <Row gutter={[24, 24]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Statistic title={<span className="text-blue-700">Tổng yêu cầu</span>} value={totalRequests} valueStyle={{ color: "#2563eb", fontWeight: 600 }} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title={<span className="text-pink-600">Chờ duyệt</span>} value={pendingRequests} valueStyle={{ color: "#f5576c", fontWeight: 600 }} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title={<span className="text-cyan-600">Đã duyệt</span>} value={approvedRequests} valueStyle={{ color: "#00f2fe", fontWeight: 600 }} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title={<span className="text-yellow-600">Tổng tiền đã thanh toán</span>} value={totalAmount.toLocaleString("vi-VN")} suffix="₫" valueStyle={{ color: "#fa709a", fontWeight: 600, fontSize: 18 }} />
          </Col>
        </Row>
        <Table
          columns={withdrawColumns}
          dataSource={displayWithdrawHistory}
          rowKey={(r) => r._id}
          pagination={false}
          rowClassName={(record) => {
            if (record.status === "approved") return "table-row-approved";
            if (record.status === "rejected") return "table-row-rejected";
            if (record.status === "cancelled") return "table-row-cancelled";
            return "table-row-pending";
          }}
        />
        {sortedWithdrawHistory.length > 5 && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Button type="link" onClick={() => setShowAllWithdraw(v => !v)}>
              {showAllWithdraw ? "Ẩn bớt" : "Xem tất cả"}
            </Button>
          </div>
        )}
        <Modal
          title="Chi tiết yêu cầu rút tiền"
          open={detailModal.open}
          onCancel={() => setDetailModal({ open: false })}
          footer={null}
          width={500}
        >
          {detailModal.data && (
            <div>
              <p><b>Số tiền:</b> <span style={{ color: "#22c55e" }}>{detailModal.data.amount?.toLocaleString()}₫</span></p>
              <p><b>Ngân hàng:</b> {detailModal.data.bank}</p>
              <p><b>Số tài khoản:</b> <span style={{ fontFamily: "monospace" }}>{detailModal.data.account}</span></p>
              <p><b>Chủ tài khoản:</b> {detailModal.data.holder}</p>
              <p><b>Trạng thái:</b> <Tag color={
                detailModal.data.status === "approved" ? "green" :
                detailModal.data.status === "pending" ? "orange" :
                detailModal.data.status === "rejected" ? "red" : "gray"
              }>{detailModal.data.status === "approved" ? "Đã duyệt" : detailModal.data.status === "pending" ? "Chờ duyệt" : detailModal.data.status === "rejected" ? "Từ chối" : "Đã hủy"}</Tag></p>
              <p><b>Thời gian:</b> {new Date(detailModal.data.createdAt).toLocaleString()}</p>
              {detailModal.data.note && (
                <p style={{ color: "#ff4d4f" }}><b>Lý do/Ghi chú:</b> {detailModal.data.note}</p>
              )}
            </div>
          )}
        </Modal>
        <style>{`
          .table-row-approved { background-color: #f0fdf4 !important; }
          .table-row-rejected { background-color: #fef2f2 !important; }
          .table-row-pending { background-color: #fefce8 !important; }
          .table-row-cancelled { background-color: #f3f4f6 !important; }
          .ant-table-tbody > tr:hover > td { background-color: #e0e7ff !important; }
        `}</style>
      </Card>
      <WithdrawModal
        visible={withdrawModalOpen}
        onCancel={() => setWithdrawModalOpen(false)}
        onSubmit={handleWithdraw}
        walletBalance={balance}
        loading={withdrawLoading}
      />
    </Card>
  );
};

export default WalletPage; 