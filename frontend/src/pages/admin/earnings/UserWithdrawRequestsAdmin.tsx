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
  FileTextOutlined, 
  BankOutlined, 
  CalendarOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  SearchOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { userWalletService } from '../../../services/apiService';
import styles from '../Users/UserPage.module.css';

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
    <Card className={styles.filterCard} bordered={false}>
      <div className={styles.filterGroup}>
        <Search
          placeholder="Tìm theo tên hoặc email học viên..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={styles.filterInput}
          allowClear
        />
      </div>
    </Card>
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
    <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#1890ff' }}>
              <UserOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tổng yêu cầu" 
                value={stats.totalRequests} 
                valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">Tất cả yêu cầu</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#faad14' }}>
              <ClockCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Chờ duyệt" 
                value={stats.pendingRequests} 
                valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#faad14' }} />
                <Text type="secondary">{pendingPercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#52c41a' }}>
              <CheckCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Đã duyệt" 
                value={stats.approvedRequests} 
                valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">{approvedPercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#722ed1' }}>
              <DollarOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tổng tiền đã thanh toán" 
                value={stats.totalAmount} 
                suffix="đ"
                valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#722ed1' }} />
                <Text type="secondary">Tổng doanh thu</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

const UserWithdrawRequestsAdmin = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [detailModal, setDetailModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await userWalletService.getAllWithdrawRequests();
    const requestsWithNumber = (res.requests || []).map((request: any, index: number) => ({
      ...request,
      number: index + 1,
    }));
    setRequests(requestsWithNumber);
    setLoading(false);
  };

  // Lọc dữ liệu theo search text
  const filteredRequests = requests.filter(request => {
    if (!searchText) return true;
    const userName = request.userId?.fullname?.toLowerCase() || "";
    const userEmail = request.userId?.email?.toLowerCase() || "";
    const searchLower = searchText.toLowerCase();
    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });

  const handleApprove = async (id: string) => {
    try {
      await userWalletService.approveWithdraw(id);
      message.success("Đã duyệt rút tiền!");
      setRequests((prev) => prev.map(r => r._id === id ? { ...r, status: "approved" } : r));
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi duyệt rút tiền");
    }
  };

  const handleReject = async () => {
    if (!rejectModal.id) return;
    setRejecting(true);
    try {
      await userWalletService.rejectWithdraw(rejectModal.id, rejectReason);
      message.success("Đã từ chối yêu cầu!");
      setRequests((prev) => prev.map(r => r._id === rejectModal.id ? { ...r, status: "rejected", note: rejectReason } : r));
      setRejectModal({ open: false });
      setRejectReason("");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi từ chối yêu cầu");
    } finally {
      setRejecting(false);
    }
  };

  const showDetail = (record: any) => {
    setDetailModal({ open: true, data: record });
  };

  // Thống kê
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
      title: "Học viên",
      dataIndex: ["userId", "fullname"],
      width: 250,
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={40} 
            src={record.userId?.avatar}
            icon={<UserOutlined />}
            style={{ border: "2px solid #e5e7eb" }}
          />
          <div>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userId?.email}
            </Text>
            {record.userId?.phone && (
              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                <PhoneOutlined /> {record.userId.phone}
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
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Xem hóa đơn">
            <Button 
              type="text" 
              onClick={() => showDetail(record)} 
              icon={<FileTextOutlined />} 
              style={{ color: "#2563eb", fontWeight: 600 }}
              size="small"
            >
              Hóa đơn
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
      <div className={styles.userPageContainer}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <Text style={{ marginTop: 16 }}>Đang tải dữ liệu...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userPageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Title level={2} className={styles.pageTitle}>
            <TrophyOutlined className={styles.titleIcon} />
            Quản lý yêu cầu rút tiền học viên
          </Title>
          <Paragraph className={styles.pageSubtitle}>
            Quản lý và duyệt các yêu cầu rút tiền từ học viên
          </Paragraph>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Filter Section */}
      <FilterSection
        searchText={searchText}
        setSearchText={setSearchText}
      />

      {/* Withdraw Requests Table */}
      <Card className={styles.userTableCard} bordered={false}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitleSection}>
            <DollarOutlined className={styles.tableIcon} />
            <Title level={4} className={styles.tableTitle}>
              Danh sách yêu cầu rút tiền
            </Title>
            <Badge count={filteredRequests.length} className={styles.userCountBadge} />
          </div>
          <div className={styles.tableActions}>
            <Text type="secondary">
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
          className={styles.userTable}
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

      {/* Modal Hóa đơn */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <FileTextOutlined className={styles.modalIcon} />
            Hóa đơn yêu cầu rút tiền
          </div>
        }
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false })}
        footer={null}
        width={800}
        className={styles.userModal}
      >
        {detailModal.data && (
          <div style={{ padding: "16px 0" }}>
            {/* Thông tin học viên */}
            <Card 
              title={
                <Space>
                  <UserOutlined style={{ color: "#2563eb" }} />
                  <Text strong>Thông tin học viên</Text>
                </Space>
              }
              style={{ marginBottom: 16, borderRadius: 12 }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  <Avatar 
                    size={64} 
                    src={detailModal.data.userId?.avatar}
                    icon={<UserOutlined />}
                    style={{ border: "2px solid #e5e7eb" }}
                  />
                  {!detailModal.data.userId?.avatar && (
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Chưa có ảnh</Text>
                    </div>
                  )}
                </Col>
                <Col flex="1">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Họ tên">
                      <Text strong>{detailModal.data.userId?.fullname || "Chưa cập nhật"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <Space>
                        <MailOutlined />
                        <Text>{detailModal.data.userId?.email || "Chưa cập nhật"}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <Space>
                        <PhoneOutlined />
                        <Text>{detailModal.data.userId?.phone || "Chưa cập nhật"}</Text>
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
          </div>
        )}
      </Modal>

      {/* Modal Từ chối */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <CloseCircleOutlined className={styles.modalIcon} />
            Lý do từ chối yêu cầu rút tiền
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
        className={styles.userModal}
      >
        <div style={{ marginTop: 16 }}>
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
        </div>
      </Modal>

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
    </div>
  );
};

export default UserWithdrawRequestsAdmin; 