import React, { useEffect, useState } from "react";
import { Card, Table, Button, InputNumber, Select, message, Tag, Form, Typography, Modal, Statistic, Row, Col, Divider, Space } from "antd";
import { useNavigate } from "react-router-dom";
import WithdrawModal from '../../components/common/WithdrawModal';
import { userWalletService } from '../../services/apiService';
import { EyeOutlined, WalletOutlined, PlusOutlined, MinusOutlined, HistoryOutlined, DollarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
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

  const handleAmountChange = (value: number | string | null) => {
    if (typeof value === 'number') {
      setAmount(value);
    } else {
      setAmount(null);
    }
  };

  const withdrawColumns = [
    { 
      title: "Số tiền", 
      dataIndex: "amount", 
      key: "amount", 
      render: (v: number) => (
        <Text strong style={{ color: "#22c55e", fontSize: '16px' }}>
          {v.toLocaleString()}₫
        </Text>
      ) 
    },
    { title: "Ngân hàng", dataIndex: "bank", key: "bank" },
    { 
      title: "Số tài khoản", 
      dataIndex: "account", 
      key: "account", 
      render: (v: string) => (
        <Text code style={{ fontSize: '14px' }}>{v}</Text>
      ) 
    },
    { title: "Chủ tài khoản", dataIndex: "holder", key: "holder" },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      key: "status", 
      render: (status: string) => {
        if (status === "pending") return <Tag color="orange" style={{ fontWeight: 600, borderRadius: '6px' }}>Chờ duyệt</Tag>;
        if (status === "approved") return <Tag color="green" style={{ fontWeight: 600, borderRadius: '6px' }}>Đã duyệt</Tag>;
        if (status === "rejected") return <Tag color="red" style={{ fontWeight: 600, borderRadius: '6px' }}>Từ chối</Tag>;
        if (status === "cancelled") return <Tag color="gray" style={{ fontWeight: 600, borderRadius: '6px' }}>Đã hủy</Tag>;
        return status;
      }
    },
    { 
      title: "Thời gian", 
      dataIndex: "createdAt", 
      key: "createdAt", 
      render: (v: string) => (
        <Text type="secondary">{new Date(v).toLocaleString()}</Text>
      ) 
    },
    {
      title: "Chi tiết",
      key: "actions",
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          size="small"
          icon={<EyeOutlined />} 
          onClick={() => showDetail(record)}
          style={{ borderRadius: '6px' }}
        >
          Xem
        </Button>
      ),
    },
  ];

  const columns = [
    { 
      title: "Loại giao dịch", 
      dataIndex: "type", 
      key: "type", 
      render: (type: string) => {
        if (type === "deposit") return <Tag color="green" style={{ borderRadius: '6px' }}>Nạp tiền</Tag>;
        if (type === "withdraw") return <Tag color="orange" style={{ borderRadius: '6px' }}>Rút tiền</Tag>;
        if (type === "payment") return <Tag color="blue" style={{ borderRadius: '6px' }}>Thanh toán</Tag>;
        return type;
      }
    },
    { 
      title: "Số tiền", 
      dataIndex: "amount", 
      key: "amount", 
      render: (v: number) => (
        <Text strong style={{ fontSize: '16px' }}>
          {v.toLocaleString()}₫
        </Text>
      ) 
    },
    { 
      title: "Phương thức", 
      dataIndex: "method", 
      key: "method",
      render: (method: string) => {
        const getMethodLogo = (methodName: string) => {
          switch (methodName.toLowerCase()) {
            case 'momo':
              return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png"
                    alt="Momo"
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      marginRight: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>Momo</span>
                </div>
              );
            case 'vnpay':
              return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                    alt="VNPAY"
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      marginRight: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>VNPAY</span>
                </div>
              );
            case 'zalopay':
              return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"
                    alt="ZaloPay"
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      marginRight: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>ZaloPay</span>
                </div>
              );
            case 'wallet':
              return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Custom Wallet Icon */}
                  <div style={{
                    width: '20px',
                    height: '16px',
                    marginRight: '8px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '12px',
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      borderRadius: '3px 3px 0 0',
                      position: 'relative',
                      boxShadow: '0 1px 3px rgba(24, 144, 255, 0.3)'
                    }}>
                      {/* Wallet flap */}
                      <div style={{
                        position: 'absolute',
                        top: '-3px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '8px',
                        height: '3px',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        borderRadius: '2px 2px 0 0',
                        border: '1px solid #ffffff',
                        borderBottom: 'none'
                      }} />
                      
                      {/* Wallet body */}
                      <div style={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid #ffffff',
                        borderRadius: '2px 2px 0 0',
                        boxSizing: 'border-box'
                      }} />
                      
                      {/* Money symbol */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#ffffff',
                        fontSize: '6px',
                        fontWeight: 'bold',
                        textShadow: '0 1px 1px rgba(0,0,0,0.3)'
                      }}>
                        ₫
                      </div>
                    </div>
                    
                    {/* Wallet bottom part */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '14px',
                      height: '3px',
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      borderRadius: '0 0 3px 3px',
                      border: '1px solid #ffffff',
                      borderTop: 'none'
                    }} />
                  </div>
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>Ví</span>
                </div>
              );
            default:
              return <span style={{ fontWeight: 500 }}>{methodName}</span>;
          }
        };
        
        return getMethodLogo(method);
      }
    },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    { 
      title: "Thời gian", 
      dataIndex: "createdAt", 
      key: "createdAt", 
      render: (v: string) => (
        <Text type="secondary">{new Date(v).toLocaleString()}</Text>
      ) 
    },
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
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        style={{ 
          borderRadius: 16, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: 'none'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Custom Wallet Icon */}
            <div style={{
              width: '60px',
              height: '40px',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: '8px 8px 0 0',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
            }}>
              {/* Wallet flap */}
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '8px',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                borderRadius: '4px 4px 0 0',
                border: '2px solid #ffffff',
                borderBottom: 'none'
              }} />
              
              {/* Wallet body */}
              <div style={{
                width: '100%',
                height: '100%',
                border: '2px solid #ffffff',
                borderRadius: '6px 6px 0 0',
                boxSizing: 'border-box'
              }} />
              
              {/* Money symbol */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                ₫
              </div>
            </div>
            
            {/* Wallet bottom part */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50px',
              height: '8px',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: '0 0 8px 8px',
              border: '2px solid #ffffff',
              borderTop: 'none'
            }} />
          </div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>Ví của tôi</Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>Quản lý tài chính của bạn</Text>
        </div>

        {/* Balance Overview */}
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 16,
            marginBottom: 32,
            border: 'none'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <div style={{ color: 'white' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Số dư hiện tại</Text>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px' }}>
                  {balance.toLocaleString("vi-VN")}₫
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic 
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Tổng nạp</span>} 
                    value={totalDeposit.toLocaleString("vi-VN")} 
                    suffix="₫" 
                    valueStyle={{ color: "#ffffff", fontWeight: 600, fontSize: '18px' }} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Tổng đã rút</span>} 
                    value={totalWithdraw.toLocaleString("vi-VN")} 
                    suffix="₫" 
                    valueStyle={{ color: "#ffffff", fontWeight: 600, fontSize: '18px' }} 
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Action Buttons */}
        <Card 
          style={{ 
            borderRadius: 16, 
            marginBottom: 32,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={3} style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>
              <PlusOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
              Thao tác ví
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Nạp tiền hoặc rút tiền từ ví của bạn
            </Text>
          </div>

          <Row gutter={[32, 24]} justify="center" align="middle">
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}>
                  <PlusOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <Title level={4} style={{ margin: '0 0 8px 0', color: '#22c55e' }}>Nạp tiền</Title>
                <Text type="secondary">Thêm tiền vào ví của bạn</Text>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <Card 
                style={{ 
                  borderRadius: 12,
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Form layout="vertical" size="large">
                  <Form.Item label="Số tiền" style={{ marginBottom: '16px' }}>
                    <InputNumber 
                      min={10000} 
                      step={10000} 
                      value={amount || undefined} 
                      onChange={handleAmountChange} 
                      placeholder="Nhập số tiền" 
                      style={{ width: '100%', height: '48px' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="₫"
                    />
                  </Form.Item>
                  
                  <Form.Item label="Phương thức thanh toán" style={{ marginBottom: '20px' }}>
                    <Select 
                      value={method} 
                      onChange={setMethod} 
                      style={{ width: '100%', height: '48px' }}
                      size="large"
                    >
                      <Option value="momo">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img 
                            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png"
                            alt="Momo"
                            style={{ 
                              width: '24px', 
                              height: '24px', 
                              marginRight: '12px',
                              borderRadius: '4px'
                            }}
                          />
                          <span style={{ fontWeight: 500 }}>Momo</span>
                        </div>
                      </Option>
                      <Option value="vnpay">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img 
                            src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                            alt="VNPAY"
                            style={{ 
                              width: '24px', 
                              height: '24px', 
                              marginRight: '12px',
                              borderRadius: '4px'
                            }}
                          />
                          <span style={{ fontWeight: 500 }}>VNPAY</span>
                        </div>
                      </Option>
                      <Option value="zalopay">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img 
                            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"
                            alt="ZaloPay"
                            style={{ 
                              width: '24px', 
                              height: '24px', 
                              marginRight: '12px',
                              borderRadius: '4px'
                            }}
                          />
                          <span style={{ fontWeight: 500 }}>ZaloPay</span>
                        </div>
                      </Option>
                    </Select>
                  </Form.Item>

                  <Button 
                    type="primary" 
                    onClick={handleDeposit} 
                    loading={loading}
                    icon={<PlusOutlined />}
                    size="large"
                    style={{ 
                      width: '100%', 
                      height: '48px', 
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    Nạp tiền ngay
                  </Button>
                </Form>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  <MinusOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <Title level={4} style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>Rút tiền</Title>
                <Text type="secondary">Rút tiền về tài khoản ngân hàng</Text>
                <div style={{ marginTop: '16px' }}>
                  <Button 
                    type="default" 
                    onClick={() => setWithdrawModalOpen(true)} 
                    disabled={balance < 50000}
                    icon={<MinusOutlined />}
                    size="large"
                    style={{ 
                      borderRadius: '8px', 
                      height: '48px',
                      border: '2px solid #f59e0b',
                      color: '#f59e0b',
                      fontSize: '16px',
                      fontWeight: 600,
                      background: 'white'
                    }}
                  >
                    Rút tiền
                  </Button>
                </div>
                {balance < 50000 && (
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Cần ít nhất 50,000₫ để rút tiền
                    </Text>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div style={{ 
            marginTop: '32px', 
            padding: '16px', 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
            borderRadius: '12px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: '#0ea5e9', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>ℹ</span>
              </div>
              <div>
                <Text strong style={{ color: '#0c4a6e' }}>Thông tin quan trọng:</Text>
                <div style={{ color: '#0369a1', fontSize: '14px', marginTop: '4px' }}>
                  • Số tiền tối thiểu nạp: 10,000₫ • Số tiền tối thiểu rút: 50,000₫ • Thời gian xử lý rút tiền: 1-3 ngày làm việc
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <Card 
          style={{ 
            borderRadius: 16, 
            marginBottom: 32,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Title level={4} style={{ marginBottom: '24px', color: '#374151' }}>
            <HistoryOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Lịch sử giao dịch
          </Title>
          <Table 
            columns={columns} 
            dataSource={history} 
            rowKey={(r) => r.createdAt + r.amount + r.type} 
            pagination={false} 
            style={{ marginBottom: 32 }}
            size="middle"
          />
        </Card>

        {/* Withdraw History */}
        <Card 
          style={{ 
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Title level={4} style={{ marginBottom: '24px', color: '#374151' }}>
            <DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Lịch sử yêu cầu rút tiền
          </Title>
          
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card 
                size="small" 
                style={{ 
                  borderRadius: 12, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
                bodyStyle={{ padding: '16px', textAlign: 'center' }}
              >
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng yêu cầu</span>} 
                  value={totalRequests} 
                  valueStyle={{ color: "#ffffff", fontWeight: 600, fontSize: '20px' }} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                size="small" 
                style={{ 
                  borderRadius: 12, 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none'
                }}
                bodyStyle={{ padding: '16px', textAlign: 'center' }}
              >
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Chờ duyệt</span>} 
                  value={pendingRequests} 
                  valueStyle={{ color: "#ffffff", fontWeight: 600, fontSize: '20px' }} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                size="small" 
                style={{ 
                  borderRadius: 12, 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  border: 'none'
                }}
                bodyStyle={{ padding: '16px', textAlign: 'center' }}
              >
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đã duyệt</span>} 
                  value={approvedRequests} 
                  valueStyle={{ color: "#ffffff", fontWeight: 600, fontSize: '20px' }} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                size="small" 
                style={{ 
                  borderRadius: 12, 
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  border: 'none'
                }}
                bodyStyle={{ padding: '16px', textAlign: 'center' }}
              >
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng tiền đã thanh toán</span>} 
                  value={totalAmount.toLocaleString("vi-VN")} 
                  suffix="₫" 
                  valueStyle={{ color: "#ffffff", fontWeight: 600, fontSize: '16px' }} 
                />
              </Card>
            </Col>
          </Row>

          <Table
            columns={withdrawColumns}
            dataSource={displayWithdrawHistory}
            rowKey={(r) => r._id}
            pagination={false}
            size="middle"
            rowClassName={(record) => {
              if (record.status === "approved") return "table-row-approved";
              if (record.status === "rejected") return "table-row-rejected";
              if (record.status === "cancelled") return "table-row-cancelled";
              return "table-row-pending";
            }}
          />
          
          {sortedWithdrawHistory.length > 5 && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button 
                type="link" 
                onClick={() => setShowAllWithdraw(v => !v)}
                style={{ fontSize: '16px', fontWeight: 500 }}
              >
                {showAllWithdraw ? "Ẩn bớt" : "Xem tất cả"}
              </Button>
            </div>
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <EyeOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Chi tiết yêu cầu rút tiền
            </div>
          }
          open={detailModal.open}
          onCancel={() => setDetailModal({ open: false })}
          footer={null}
          width={500}
          style={{ borderRadius: '12px' }}
        >
          {detailModal.data && (
            <div style={{ padding: '16px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Số tiền:</Text>
                  <div style={{ color: "#22c55e", fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>
                    {detailModal.data.amount?.toLocaleString()}₫
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Ngân hàng:</Text>
                  <div style={{ marginTop: '4px' }}>{detailModal.data.bank}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Số tài khoản:</Text>
                  <div style={{ fontFamily: "monospace", marginTop: '4px' }}>{detailModal.data.account}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Chủ tài khoản:</Text>
                  <div style={{ marginTop: '4px' }}>{detailModal.data.holder}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Trạng thái:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Tag color={
                      detailModal.data.status === "approved" ? "green" :
                      detailModal.data.status === "pending" ? "orange" :
                      detailModal.data.status === "rejected" ? "red" : "gray"
                    } style={{ borderRadius: '6px' }}>
                      {detailModal.data.status === "approved" ? "Đã duyệt" : 
                       detailModal.data.status === "pending" ? "Chờ duyệt" : 
                       detailModal.data.status === "rejected" ? "Từ chối" : "Đã hủy"}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Thời gian:</Text>
                  <div style={{ marginTop: '4px' }}>{new Date(detailModal.data.createdAt).toLocaleString()}</div>
                </Col>
                {detailModal.data.note && (
                  <Col span={24}>
                    <Text strong style={{ color: "#ff4d4f" }}>Lý do/Ghi chú:</Text>
                    <div style={{ color: "#ff4d4f", marginTop: '4px' }}>{detailModal.data.note}</div>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal>

        <WithdrawModal
          visible={withdrawModalOpen}
          onCancel={() => setWithdrawModalOpen(false)}
          onSubmit={handleWithdraw}
          walletBalance={balance}
          loading={withdrawLoading}
        />

        <style>{`
          .table-row-approved { 
            background-color: #f0fdf4 !important; 
            border-left: 4px solid #22c55e !important;
          }
          .table-row-rejected { 
            background-color: #fef2f2 !important; 
            border-left: 4px solid #ef4444 !important;
          }
          .table-row-pending { 
            background-color: #fefce8 !important; 
            border-left: 4px solid #f59e0b !important;
          }
          .table-row-cancelled { 
            background-color: #f3f4f6 !important; 
            border-left: 4px solid #6b7280 !important;
          }
          .ant-table-tbody > tr:hover > td { 
            background-color: #e0e7ff !important; 
          }
          .ant-card {
            transition: all 0.3s ease;
          }
          .ant-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.12) !important;
          }
          .ant-btn {
            transition: all 0.3s ease;
          }
          .ant-btn:hover {
            transform: translateY(-1px);
          }
        `}</style>
      </Card>
    </div>
  );
};

export default WalletPage; 