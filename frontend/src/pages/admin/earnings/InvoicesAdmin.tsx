import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Typography,
  Space,
  Button,
  message,
  Badge,
  Tooltip,
  Spin,
  Row,
  Col,
  Statistic,
  Tag,
  Input,
  Avatar,
  Modal,
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { invoiceService } from '../../../services/apiService';
import styles from '../Users/UserPage.module.css';

const { Title, Text } = Typography;
const { Search } = Input;

const InvoicesAdmin = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [detailModal, setDetailModal] = useState<{ open: boolean; data?: any }>({ open: false });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAllInvoices();
      const invoicesWithNumber = (response.invoices || []).map((invoice: any, index: number) => ({
        ...invoice,
        number: index + 1,
      }));
      setInvoices(invoicesWithNumber);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (fileName: string) => {
    try {
      const blob = await invoiceService.downloadInvoice(fileName);
      const url = window.URL.createObjectURL(blob);
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

  const showDetail = (record: any) => {
    setDetailModal({ open: true, data: record });
  };

  // Lọc dữ liệu theo search text
  const filteredInvoices = invoices.filter(invoice => {
    if (!searchText) return true;
    const teacherName = invoice.teacherId?.fullname?.toLowerCase() || '';
    const teacherEmail = invoice.teacherId?.email?.toLowerCase() || '';
    const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
    const searchLower = searchText.toLowerCase();
    return teacherName.includes(searchLower) || 
           teacherEmail.includes(searchLower) || 
           invoiceNumber.includes(searchLower);
  });

  // Tính toán thống kê
  const stats = {
    totalInvoices: filteredInvoices.length,
    totalAmount: filteredInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
    thisMonth: filteredInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.issuedAt);
      const now = new Date();
      return invoiceDate.getMonth() === now.getMonth() && 
             invoiceDate.getFullYear() === now.getFullYear();
    }).length,
    totalTeachers: new Set(filteredInvoices.map(invoice => invoice.teacherId?._id)).size,
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
      title: 'Giảng viên',
      dataIndex: ['teacherId', 'fullname'],
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
          </div>
        </div>
      )
    },
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      render: (text: string) => (
        <Text strong style={{ color: '#1890ff' }}>{text}</Text>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong style={{ color: '#22c55e', fontSize: 16 }}>
          {amount?.toLocaleString('vi-VN')} đ
        </Text>
      ),
      sorter: (a: any, b: any) => (Number(a.amount) || 0) - (Number(b.amount) || 0),
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bank',
      key: 'bank',
      width: 120,
      render: (text: string) => (
        <Text>{text}</Text>
      ),
    },
    {
      title: 'Ngày xuất',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      width: 150,
      align: 'center' as const,
      render: (date: string) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
            {new Date(date).toLocaleDateString('vi-VN')}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {new Date(date).toLocaleTimeString('vi-VN')}
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => new Date(String(a.issuedAt)).getTime() - new Date(String(b.issuedAt)).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (status: string) => {
        const statusConfig = {
          issued: { color: 'green', text: 'Đã xuất', icon: <CheckCircleOutlined /> },
          cancelled: { color: 'red', text: 'Đã hủy', icon: <CheckCircleOutlined /> },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.issued;
        return (
          <Tag color={config.color} icon={config.icon} style={{ padding: '4px 10px', borderRadius: 8, fontWeight: 500, fontSize: 14 }}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
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
          <Tooltip title="Tải hóa đơn">
            <Button
              type="primary"
              onClick={() => handleDownloadInvoice(record.file)}
              icon={<DownloadOutlined />}
              style={{ borderRadius: 8, background: '#52c41a', border: 'none', fontWeight: 600 }}
              size="small"
            >
              Tải HĐ
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading && invoices.length === 0) {
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
            <FileTextOutlined className={styles.titleIcon} />
            Quản lý hóa đơn rút tiền
          </Title>
          <Text className={styles.pageSubtitle}>
            Quản lý tất cả hóa đơn rút tiền của giảng viên
          </Text>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard} bordered={false}>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ backgroundColor: '#1890ff' }}>
                <FileTextOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div className={styles.statInfo}>
                <Statistic 
                  title="Tổng hóa đơn" 
                  value={stats.totalInvoices} 
                  valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard} bordered={false}>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ backgroundColor: '#22c55e' }}>
                <DollarOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div className={styles.statInfo}>
                <Statistic 
                  title="Tổng tiền rút" 
                  value={stats.totalAmount} 
                  formatter={(value) => `${value?.toLocaleString('vi-VN')} đ`}
                  valueStyle={{ color: '#22c55e', fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard} bordered={false}>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ backgroundColor: '#fa8c16' }}>
                <CalendarOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div className={styles.statInfo}>
                <Statistic 
                  title="Hóa đơn tháng này" 
                  value={stats.thisMonth} 
                  valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard} bordered={false}>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ backgroundColor: '#722ed1' }}>
                <UserOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div className={styles.statInfo}>
                <Statistic 
                  title="Giảng viên" 
                  value={stats.totalTeachers} 
                  valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card className={styles.filterCard} bordered={false}>
        <div className={styles.filterGroup}>
          <Search
            placeholder="Tìm theo tên, email giảng viên hoặc số hóa đơn..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={styles.filterInput}
            allowClear
          />
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className={styles.userTableCard} bordered={false}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitleSection}>
            <FileTextOutlined className={styles.tableIcon} />
            <Title level={4} className={styles.tableTitle}>
              Danh sách hóa đơn
            </Title>
            <Badge count={filteredInvoices.length} className={styles.userCountBadge} />
          </div>
          <div className={styles.tableActions}>
            <Text type="secondary">
              Hiển thị {filteredInvoices.length} hóa đơn
            </Text>
          </div>
        </div>

        <Table
          dataSource={filteredInvoices}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} hóa đơn`,
            pageSizeOptions: ['10', '20', '50', '100'],
            size: 'small',
          }}
          className={styles.userTable}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* Modal Chi tiết */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <FileTextOutlined className={styles.modalIcon} />
            Chi tiết hóa đơn
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
            {/* Thông tin giảng viên */}
            <Card 
              title={
                <Space>
                  <UserOutlined style={{ color: "#2563eb" }} />
                  <Text strong>Thông tin giảng viên</Text>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Họ và tên:</Text>
                  <br />
                  <Text>{detailModal.data.teacherId?.fullname}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Email:</Text>
                  <br />
                  <Text>{detailModal.data.teacherId?.email}</Text>
                </Col>
              </Row>
            </Card>

            {/* Thông tin hóa đơn */}
            <Card 
              title={
                <Space>
                  <FileTextOutlined style={{ color: "#52c41a" }} />
                  <Text strong>Thông tin hóa đơn</Text>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Số hóa đơn:</Text>
                  <br />
                  <Text code>{detailModal.data.invoiceNumber}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Số tiền:</Text>
                  <br />
                  <Text strong style={{ color: "#22c55e", fontSize: 16 }}>
                    {detailModal.data.amount?.toLocaleString('vi-VN')} đ
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Ngân hàng:</Text>
                  <br />
                  <Text>{detailModal.data.bank}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Số tài khoản:</Text>
                  <br />
                  <Text code>{detailModal.data.account}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Chủ tài khoản:</Text>
                  <br />
                  <Text>{detailModal.data.holder}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Ngày xuất:</Text>
                  <br />
                  <Text>{new Date(detailModal.data.issuedAt).toLocaleString('vi-VN')}</Text>
                </Col>
              </Row>
            </Card>

            {/* Thông tin yêu cầu rút tiền */}
            {detailModal.data.withdrawRequestId && (
              <Card 
                title={
                  <Space>
                    <DollarOutlined style={{ color: "#fa8c16" }} />
                    <Text strong>Thông tin yêu cầu rút tiền</Text>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Mã yêu cầu:</Text>
                    <br />
                    <Text code>{detailModal.data.withdrawRequestId._id}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Ngày yêu cầu:</Text>
                    <br />
                    <Text>{new Date(detailModal.data.withdrawRequestId.createdAt).toLocaleString('vi-VN')}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Ngày duyệt:</Text>
                    <br />
                    <Text>{new Date(detailModal.data.withdrawRequestId.approvedAt).toLocaleString('vi-VN')}</Text>
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesAdmin; 