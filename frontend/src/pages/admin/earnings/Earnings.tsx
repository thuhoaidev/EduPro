import React, { useEffect, useState } from "react";
import { 
  Table, 
  Button, 
  Tag, 
  message, 
  Modal, 
  Input, 
  Card, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Divider, 
  Descriptions, 
  Avatar,
  Badge,
  Tooltip,
  Spin,
} from "antd";
import { 
  DollarOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined, 
  BankOutlined, 
  CalendarOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  SearchOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { invoiceService } from '../../../services/apiService';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// FilterSection component
interface FilterSectionProps {
  searchText: string;
  setSearchText: (value: string) => void;
}

const FilterSection = ({
  searchText,
  setSearchText,
}: FilterSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card 
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px', 
          paddingBottom: '12px', 
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SearchOutlined style={{ color: '#667eea', fontSize: '20px' }} />
            <Text strong style={{ fontSize: '16px', color: '#1a1a1a' }}>Bộ lọc tìm kiếm</Text>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <Search
            placeholder="Tìm theo tên hoặc email giáo viên..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ 
              minWidth: '300px',
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
            allowClear
          />
        </div>
      </Card>
    </motion.div>
  );
};

// StatCards component
interface StatCardsProps {
  stats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    totalAmount: number;
  };
}

const StatCards = ({ stats }: StatCardsProps) => {
  const pendingPercentage = stats.totalRequests > 0 ? (stats.pendingRequests / stats.totalRequests) * 100 : 0;
  const approvedPercentage = stats.totalRequests > 0 ? (stats.approvedRequests / stats.totalRequests) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }} justify="center">
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#1890ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng yêu cầu</Text>} 
                  value={stats.totalRequests} 
                  valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tất cả yêu cầu</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#faad14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClockCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Chờ duyệt</Text>} 
                  value={stats.pendingRequests} 
                  valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#faad14' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{pendingPercentage.toFixed(1)}%</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#52c41a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Đã duyệt</Text>} 
                  value={stats.approvedRequests} 
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{approvedPercentage.toFixed(1)}%</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#722ed1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng tiền đã thanh toán</Text>} 
                  value={stats.totalAmount} 
                  suffix="đ"
                  valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#722ed1' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tổng doanh thu</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

const WithdrawRequestsAdmin = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [detailModal, setDetailModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/teacher-wallet/withdraw-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const requestsWithNumber = res.data.requests.map((request: any, index: number) => ({
        ...request,
        number: index + 1,
      }));
      setRequests(requestsWithNumber);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  // Lọc dữ liệu theo search text
  const filteredRequests = requests.filter(request => {
    if (!searchText) return true;
    const teacherName = request.teacherId?.fullname?.toLowerCase() || "";
    const teacherEmail = request.teacherId?.email?.toLowerCase() || "";
    const searchLower = searchText.toLowerCase();
    return teacherName.includes(searchLower) || teacherEmail.includes(searchLower);
  });

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`http://localhost:5000/api/teacher-wallet/withdraw/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.invoice) {
        message.success("Đã duyệt rút tiền và tạo hóa đơn!");
      } else {
        message.success("Đã duyệt rút tiền!");
      }
      
      setRequests((prev) => prev.map(r => r._id === id ? { ...r, status: "approved", invoice: response.data.invoice } : r));
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi duyệt rút tiền");
    }
  };

  const handleReject = async () => {
    if (!rejectModal.id) return;
    setRejecting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/teacher-wallet/withdraw/${rejectModal.id}/reject`, { reason: rejectReason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đã từ chối yêu cầu!");
      setRequests((prev) => prev.map(r => r._id === rejectModal.id ? { ...r, status: "rejected", note: rejectReason } : r));
      setRejectModal({ open: false });
      setRejectReason("");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi từ chối yêu cầu");
    } finally {
      setRejecting(false);
    }
  };

  const showDetail = (record: any) => {
    setDetailModal({ open: true, data: record });
  };

  const handleDownloadInvoice = async (fileName: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/invoices/download/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Đã tải hóa đơn thành công!');
    } catch (error) {
      message.error('Lỗi tải hóa đơn!');
    }
  };

  // Tính toán thống kê
  const stats = {
    totalRequests: filteredRequests.length,
    pendingRequests: filteredRequests.filter(r => r.status === "pending").length,
    approvedRequests: filteredRequests.filter(r => r.status === "approved").length,
    totalAmount: filteredRequests.filter(r => r.status === "approved").reduce((sum, r) => sum + (r.amount || 0), 0),
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'number',
      key: 'number',
      width: 70,
      align: 'center' as const,
      render: (number: number) => (
        <Badge count={number} showZero style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: "Giáo viên",
      dataIndex: ["teacherId", "fullname"],
      width: 250,
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={40} 
            src={record.teacherId?.avatar}
            icon={<UserOutlined />}
            style={{ border: "2px solid #e5e7eb" }}
          />
          <div>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.teacherId?.email}
            </Text>
            {record.teacherId?.phone && (
              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                <PhoneOutlined /> {record.teacherId.phone}
              </Text>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      width: 150,
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong style={{ color: "#22c55e", fontSize: 16 }}>{amount?.toLocaleString("vi-VN")} đ</Text>
      ),
      sorter: (a: any, b: any) => (Number(a.amount) || 0) - (Number(b.amount) || 0),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      width: 150,
      align: 'center' as const,
      render: (d: string) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
            {new Date(d).toLocaleDateString('vi-VN')}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {new Date(d).toLocaleTimeString('vi-VN')}
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => new Date(String(a.createdAt)).getTime() - new Date(String(b.createdAt)).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      align: 'center' as const,
      render: (status: string) => {
        const statusConfig = {
          approved: { color: "green", text: "Đã duyệt", icon: <CheckCircleOutlined /> },
          rejected: { color: "red", text: "Từ chối", icon: <CloseCircleOutlined /> },
          pending: { color: "orange", text: "Chờ duyệt", icon: <ClockCircleOutlined /> },
          cancelled: { color: "gray", text: "Đã hủy", icon: <CloseCircleOutlined /> }
        } as const;
        type StatusKey = keyof typeof statusConfig;
        const config = statusConfig[(status as StatusKey)] || statusConfig.pending;
        return (
          <Tag color={config.color} icon={config.icon} style={{ padding: "4px 10px", borderRadius: 8, fontWeight: 500, fontSize: 14 }}>{config.text}</Tag>
        );
      },
      filters: [
        { text: "Chờ duyệt", value: "pending" },
        { text: "Đã duyệt", value: "approved" },
        { text: "Từ chối", value: "rejected" },
        { text: "Đã hủy", value: "cancelled" }
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Hóa đơn",
      key: "invoice",
      width: 120,
      align: 'center' as const,
      render: (_: any, record: any) => {
        if (record.status === "approved" && record.invoice) {
          return (
            <Tooltip title="Tải hóa đơn">
              <Button 
                type="primary" 
                onClick={() => handleDownloadInvoice(record.invoice.file)} 
                icon={<DownloadOutlined />} 
                style={{ borderRadius: 8, background: "#52c41a", border: "none", fontWeight: 600 }}
                size="small"
              >
                Tải HĐ
              </Button>
            </Tooltip>
          );
        }
        return (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.status === "approved" ? "Đã tạo" : "-"}
          </Text>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              onClick={() => showDetail(record)} 
              icon={<EyeOutlined />} 
              style={{ color: "#2563eb", fontWeight: 600 }}
              size="small"
            >
              Chi tiết
            </Button>
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Duyệt yêu cầu">
                <Button 
                  type="primary" 
                  onClick={() => handleApprove(record._id)} 
                  icon={<CheckCircleOutlined />} 
                  style={{ borderRadius: 8, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", fontWeight: 600 }}
                  size="small"
                >
                  Duyệt
                </Button>
              </Tooltip>
              <Tooltip title="Từ chối yêu cầu">
                <Button 
                  danger 
                  onClick={() => setRejectModal({ open: true, id: record._id })} 
                  icon={<CloseCircleOutlined />} 
                  style={{ borderRadius: 8, fontWeight: 600 }}
                  size="small"
                >
                  Từ chối
                </Button>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (loading && requests.length === 0) {
    return (
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              padding: '80px 24px'
            }}
          >
            <Spin size="large" />
            <Text style={{ marginTop: 16, fontSize: '16px' }}>Đang tải dữ liệu...</Text>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: '32px' }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                  <TrophyOutlined style={{ marginRight: '12px', color: '#667eea' }} />
                  Quản lý yêu cầu rút tiền
                </Title>
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
                  Quản lý và duyệt các yêu cầu rút tiền từ giáo viên
                </Paragraph>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <StatCards stats={stats} />

        {/* Filter Section */}
        <FilterSection
          searchText={searchText}
          setSearchText={setSearchText}
        />

        {/* Withdraw Requests Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              paddingBottom: '12px', 
              borderBottom: '1px solid #f0f0f0',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DollarOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                  Danh sách yêu cầu rút tiền
                </Title>
                <Badge count={filteredRequests.length} showZero style={{ 
                  backgroundColor: '#1890ff',
                  borderRadius: '8px'
                }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Hiển thị {filteredRequests.length} yêu cầu rút tiền
                </Text>
              </div>
            </div>
            
            <Table
              dataSource={filteredRequests.slice().sort((a, b) => {
                const dateA = new Date(String(a.createdAt)).getTime();
                const dateB = new Date(String(b.createdAt)).getTime();
                return dateB - dateA;
              })}
              rowKey="_id"
              loading={loading}
              columns={columns}
              pagination={{
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
                pageSizeOptions: ['10', '20', '50', '100'],
                size: 'small',
              }}
              style={{ 
                borderRadius: '12px',
                overflow: 'hidden'
              }}
              scroll={{ x: 1200 }}
              size="small"
              rowClassName={(record) => {
                if (record.status === "approved") return "table-row-approved";
                if (record.status === "rejected") return "table-row-rejected";
                if (record.status === "cancelled") return "table-row-cancelled";
                return "table-row-pending";
              }}
            />
          </Card>
        </motion.div>

        {/* Modal Chi tiết */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <EyeOutlined style={{ color: '#667eea', fontSize: '20px' }} />
              <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                Chi tiết yêu cầu rút tiền
              </Text>
            </div>
          }
          open={detailModal.open}
          onCancel={() => setDetailModal({ open: false })}
          footer={null}
          width={800}
          style={{ borderRadius: '16px' }}
        >
          {detailModal.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ padding: "16px 0" }}
            >
              {/* Thông tin giáo viên */}
              <Card 
                title={
                  <Space>
                    <UserOutlined style={{ color: "#2563eb" }} />
                    <Text strong>Thông tin giáo viên</Text>
                  </Space>
                }
                style={{ marginBottom: 16, borderRadius: 12 }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col>
                    <Avatar 
                      size={64} 
                      src={detailModal.data.teacherId?.avatar}
                      icon={<UserOutlined />}
                      style={{ border: "2px solid #e5e7eb" }}
                    />
                    {!detailModal.data.teacherId?.avatar && (
                      <div style={{ textAlign: "center", marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Chưa có ảnh</Text>
                      </div>
                    )}
                  </Col>
                  <Col flex="1">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Họ tên">
                        <Text strong>{detailModal.data.teacherId?.fullname || "Chưa cập nhật"}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        <Space>
                          <MailOutlined />
                          <Text>{detailModal.data.teacherId?.email || "Chưa cập nhật"}</Text>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        <Space>
                          <PhoneOutlined />
                          <Text>{detailModal.data.teacherId?.phone || "Chưa cập nhật"}</Text>
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </Card>

              {/* Thông tin rút tiền */}
              <Card 
                title={
                  <Space>
                    <BankOutlined style={{ color: "#52c41a" }} />
                    <Text strong>Thông tin rút tiền</Text>
                  </Space>
                }
                style={{ marginBottom: 16, borderRadius: 12 }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Số tiền yêu cầu"
                      value={detailModal.data.amount?.toLocaleString("vi-VN")}
                      suffix="đ"
                      valueStyle={{ color: "#52c41a", fontSize: 24, fontWeight: 600 }}
                    />
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: "right" }}>
                      {(() => {
                        const statusConfig = {
                          approved: { color: "green", text: "Đã duyệt", icon: <CheckCircleOutlined /> },
                          rejected: { color: "red", text: "Từ chối", icon: <CloseCircleOutlined /> },
                          pending: { color: "orange", text: "Chờ duyệt", icon: <ClockCircleOutlined /> },
                          cancelled: { color: "gray", text: "Đã hủy", icon: <CloseCircleOutlined /> }
                        } as const;
                        const config = statusConfig[detailModal.data.status as keyof typeof statusConfig] || statusConfig.pending;
                        return (
                          <Tag color={config.color} icon={config.icon} style={{ padding: "8px 12px", fontSize: 14, fontWeight: 500 }}>
                            {config.text}
                          </Tag>
                        );
                      })()}
                    </div>
                  </Col>
                </Row>
                
                <Divider />
                
                <Descriptions title="Thông tin ngân hàng" column={1} size="small">
                  <Descriptions.Item label="Ngân hàng">
                    <Text strong>{detailModal.data.bank}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số tài khoản">
                    <Text copyable style={{ fontFamily: "monospace", fontSize: 16 }}>
                      {detailModal.data.account}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Chủ tài khoản">
                    <Text strong>{detailModal.data.holder}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Thông tin thời gian */}
              <Card 
                title={
                  <Space>
                    <CalendarOutlined style={{ color: "#722ed1" }} />
                    <Text strong>Thông tin thời gian</Text>
                  </Space>
                }
                style={{ marginBottom: 16, borderRadius: 12 }}
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Ngày tạo yêu cầu">
                    <Text>{new Date(detailModal.data.createdAt).toLocaleDateString("vi-VN")}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian tạo">
                    <Text>{new Date(detailModal.data.createdAt).toLocaleTimeString("vi-VN")}</Text>
                  </Descriptions.Item>
                  {detailModal.data.updatedAt && detailModal.data.updatedAt !== detailModal.data.createdAt && (
                    <>
                      <Descriptions.Item label="Ngày cập nhật">
                        <Text>{new Date(detailModal.data.updatedAt).toLocaleDateString("vi-VN")}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian cập nhật">
                        <Text>{new Date(detailModal.data.updatedAt).toLocaleTimeString("vi-VN")}</Text>
                      </Descriptions.Item>
                    </>
                  )}
                  {detailModal.data.cancelledAt && (
                    <>
                      <Descriptions.Item label="Ngày hủy">
                        <Text>{new Date(detailModal.data.cancelledAt).toLocaleDateString("vi-VN")}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian hủy">
                        <Text>{new Date(detailModal.data.cancelledAt).toLocaleTimeString("vi-VN")}</Text>
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </Card>

              {/* Lý do từ chối (nếu có) */}
              {detailModal.data.status === "rejected" && detailModal.data.note && (
                <Card 
                  title={
                    <Space>
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                      <Text strong>Lý do từ chối</Text>
                    </Space>
                  }
                  style={{ borderRadius: 12 }}
                >
                  <Text type="danger" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    {detailModal.data.note}
                  </Text>
                </Card>
              )}
            </motion.div>
          )}
        </Modal>

        {/* Modal Từ chối */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
              <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                Lý do từ chối yêu cầu rút tiền
              </Text>
            </div>
          }
          open={rejectModal.open}
          onCancel={() => setRejectModal({ open: false })}
          onOk={handleReject}
          okText="Xác nhận từ chối"
          cancelText="Hủy"
          confirmLoading={rejecting}
          okButtonProps={{ 
            danger: true,
            style: { borderRadius: 8, fontWeight: 600 }
          }}
          cancelButtonProps={{ 
            style: { borderRadius: 8, fontWeight: 600 }
          }}
          style={{ borderRadius: '16px' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ marginTop: 16 }}
          >
            <Text type="secondary" style={{ marginBottom: 8, display: "block" }}>
              Vui lòng nhập lý do từ chối yêu cầu rút tiền này:
            </Text>
            <Input.TextArea
              rows={4}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              style={{ borderRadius: 8 }}
            />
          </motion.div>
        </Modal>

        </div>

      <style>{`
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
    </motion.div>
  );
};

export default WithdrawRequestsAdmin;