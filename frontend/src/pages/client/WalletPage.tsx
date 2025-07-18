import React, { useEffect, useState } from "react";
import { Card, Table, Button, InputNumber, Select, message, Tag, Form, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const WalletPage: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<string>("momo");
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallet();
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

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return message.error("Nhập số tiền hợp lệ");
    setLoading(true);
    try {
      // Chặn double submit: disable nút khi loading
      if (loading) return;
      // Lưu trạng thái đang nạp tiền vào sessionStorage
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
        // Xóa flag khi chuyển hướng
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

  return (
    <Card title={<Title level={3}>Ví của tôi</Title>} loading={loading}>
      <div style={{ marginBottom: 24 }}>
        <b>Số dư:</b> <span style={{ fontSize: 20, color: '#1890ff' }}>{balance.toLocaleString()}₫</span>
      </div>
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
      </Form>
      <Table columns={columns} dataSource={history} rowKey={(r) => r.createdAt + r.amount + r.type} pagination={false} />
    </Card>
  );
};

export default WalletPage; 