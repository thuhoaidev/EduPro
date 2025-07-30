import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Badge,
  Tooltip,
  Divider,
  Spin,
  Select,
  DatePicker,
  Progress,
} from 'antd';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  BookOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  MessageOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { reportService } from '../../../services/reportService';
import styles from '../Users/UserPage.module.css';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

dayjs.locale('vi');

interface Report {
  _id: string;
  userId: string;
  title: string;
  content: string;
  status: string;
  adminReply?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

// FilterSection component
interface FilterSectionProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearch: (value: string) => void;
  selectedStatus: string | undefined;
  setSelectedStatus: (status: string | undefined) => void;
  setDateRange: (dates: any) => void;
  dateRange: any;
  search: string;
}

const FilterSection = ({
  searchInput,
  setSearchInput,
  setSearch,
  selectedStatus,
  setSelectedStatus,
  setDateRange,
  dateRange,
  search,
}: FilterSectionProps) => (
          <Card className={styles.filterCard} variant="borderless">
    <div className={styles.filterGroup}>
      <Input
        placeholder="Tìm kiếm báo cáo..."
        prefix={<SearchOutlined />}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onPressEnter={() => setSearch(searchInput)}
        className={styles.filterInput}
        allowClear
      />
      <Select
        placeholder="Lọc theo trạng thái"
        value={selectedStatus}
        onChange={setSelectedStatus}
        className={styles.filterSelect}
        allowClear
      >
        <Select.Option value="pending">Chờ xử lý</Select.Option>
        <Select.Option value="resolved">Đã xử lý</Select.Option>
      </Select>
      <RangePicker
        placeholder={['Từ ngày', 'Đến ngày']}
        onChange={(dates) => setDateRange(dates)}
        className={styles.filterDateRange}
        format="DD/MM/YYYY"
        value={dateRange}
      />
    </div>
  </Card>
);

// StatCards component
interface StatCardsProps {
  reportStats: {
    total: number;
    pending: number;
    resolved: number;
  };
}

const StatCards = ({ reportStats }: StatCardsProps) => {
  const pendingPercentage = reportStats.total > 0 ? (reportStats.pending / reportStats.total) * 100 : 0;
  const resolvedPercentage = reportStats.total > 0 ? (reportStats.resolved / reportStats.total) * 100 : 0;

  return (
    <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} variant="borderless">
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#1890ff' }}>
              <FileTextOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tổng số báo cáo" 
                value={reportStats.total} 
                valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">Tất cả báo cáo</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} variant="borderless">
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#faad14' }}>
              <ClockCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Chờ xử lý" 
                value={reportStats.pending} 
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
        <Card className={styles.statCard} variant="borderless">
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#52c41a' }}>
              <CheckCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Đã xử lý" 
                value={reportStats.resolved} 
                valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">{resolvedPercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} variant="borderless">
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#722ed1' }}>
              <MessageOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tỷ lệ xử lý" 
                value={resolvedPercentage} 
                suffix="%" 
                precision={1}
                valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
              />
              <Progress 
                percent={resolvedPercentage} 
                size="small" 
                strokeColor="#722ed1"
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [form] = Form.useForm();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  const [reportStats, setReportStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });

  const fetchReports = useCallback(async (page = 1, limit = 15) => {
    setLoading(true);
    try {
      const res = await reportService.getAll();
      const reportsData = res.data.data || [];
      
      // Sort reports by creation date
      const sortedReports = [...reportsData].sort((a: Report, b: Report) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // Map and add sequence number
      const mappedReports = sortedReports.map((report: Report, index: number) => ({
        ...report,
        number: (page - 1) * limit + index + 1,
      }));
      
      setAllReports(mappedReports);
      setReports(mappedReports);
      setPagination({
        ...pagination,
        current: page,
        pageSize: limit,
        total: reportsData.length,
      });
      
      // Update report stats
      const stats = {
        total: reportsData.length,
        pending: reportsData.filter((report: Report) => report.status === 'pending').length,
        resolved: reportsData.filter((report: Report) => report.status === 'resolved').length,
      };
      setReportStats(stats);
    } catch (error) {
      message.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, dateRange, pagination.pageSize]);

  // Initial fetch and realtime updates
  useEffect(() => {
    fetchReports();
    
    // Set up realtime updates every 30 seconds
    const interval = setInterval(() => {
      fetchReports();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchReports]);

  // Filter reports when searchInput or selectedStatus changes
  useEffect(() => {
    const filtered = allReports.filter(report => {
      const matchTitle = report.title.toLowerCase().includes(searchInput.toLowerCase());
      const matchContent = report.content.toLowerCase().includes(searchInput.toLowerCase());
      const matchStatus = selectedStatus ? report.status === selectedStatus : true;
      return (matchTitle || matchContent) && matchStatus;
    });
    setReports(filtered);
  }, [searchInput, selectedStatus, allReports]);

  // Fetch reports when search or filters change
  useEffect(() => {
    fetchReports();
  }, [search, selectedStatus, dateRange]);

  const handleReply = async (values: { adminReply: string }) => {
    if (!selectedReport) return;
    
    try {
      await reportService.reply(selectedReport._id, values.adminReply);
      message.success('Đã trả lời báo cáo');
      setReplyModalVisible(false);
      form.resetFields();
      fetchReports();
    } catch (error) {
      message.error('Trả lời báo cáo thất bại');
    }
  };

  const showReplyModal = (report: Report) => {
    setSelectedReport(report);
    setReplyModalVisible(true);
  };

  const getStatusTag = (status: string) => {
    return status === 'pending' ? (
      <Tag color="orange" icon={<ClockCircleOutlined />}>
        Chờ xử lý
      </Tag>
    ) : (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Đã xử lý
      </Tag>
    );
  };

  const columns: ColumnsType<Report> = [
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
      title: 'Báo cáo',
      key: 'report',
      width: 300,
      render: (_, record: Report) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '8px', 
            backgroundColor: '#fff2e8', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #ffd591'
          }}>
            <ExclamationCircleOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
          </div>
          <div>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
              {record.title}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.user?.name || 'Người dùng'} • {record.user?.email || 'N/A'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 250,
      render: (content: string) => (
        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {content}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      align: 'center' as const,
      render: (date: string) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
            {dayjs(date).format('DD/MM/YYYY')}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {dayjs(date).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_, record: Report) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                showReplyModal(record);
              }}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Trả lời báo cáo">
            <Button
              type="primary"
              size="small"
              icon={<MessageOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                showReplyModal(record);
              }}
            >
              Trả lời
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading && reports.length === 0) {
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
            Quản lý báo cáo
          </Title>
          <Paragraph className={styles.pageSubtitle}>
            Quản lý và xử lý các báo cáo từ người dùng trong hệ thống
          </Paragraph>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatCards reportStats={reportStats} />

      {/* Filter Section */}
      <FilterSection
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearch={setSearch}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        setDateRange={setDateRange}
        dateRange={dateRange}
        search={search}
      />

      {/* Reports Table */}
      <Card className={styles.userTableCard} variant="borderless">
        <div className={styles.tableHeader}>
          <div className={styles.tableTitleSection}>
            <BookOutlined className={styles.tableIcon} />
            <Title level={4} className={styles.tableTitle}>
              Danh sách báo cáo
            </Title>
            <Badge count={reports.length} className={styles.userCountBadge} />
          </div>
          <div className={styles.tableActions}>
            <Text type="secondary">
              Hiển thị {((pagination.current - 1) * pagination.pageSize) + 1} - {Math.min(pagination.current * pagination.pageSize, reports.length)} của {reports.length} báo cáo
            </Text>
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={reports}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} báo cáo`,
            pageSizeOptions: ['10', '20', '50', '100'],
            size: 'small',
          }}
          onChange={(pagination) => fetchReports(pagination.current, pagination.pageSize)}
          rowKey="_id"
          className={styles.userTable}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>

      {/* Reply Modal */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <MessageOutlined className={styles.modalIcon} />
            Trả lời báo cáo
          </div>
        }
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        footer={null}
        width={700}
        className={styles.userModal}
      >
        {selectedReport && (
          <div>
            <div className={styles.userDetailHeaderBox}>
              <Title level={3} style={{ margin: 0 }}>
                {selectedReport.title}
              </Title>
              {getStatusTag(selectedReport.status)}
            </div>
            
            <Divider />
            
            <Card className={styles.userDetailCard} variant="borderless">
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  <Text strong>Người báo cáo:</Text>
                </div>
                <div>
                  <Text type="secondary">
                    {selectedReport.user?.name || 'Không xác định'} ({selectedReport.user?.email || 'N/A'})
                  </Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <FileTextOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  <Text strong>Nội dung báo cáo:</Text>
                </div>
                <div>
                  <Text type="secondary">
                    {selectedReport.content}
                  </Text>
                </div>
              </div>
              
              {selectedReport.adminReply && (
                <div className={styles.userDetailRow}>
                  <div className={styles.userDetailLabel}>
                    <MessageOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                    <Text strong>Phản hồi trước:</Text>
                  </div>
                  <div>
                    <Text type="secondary">
                      {selectedReport.adminReply}
                    </Text>
                  </div>
                </div>
              )}
            </Card>
            
            <Divider />
            
            <div className={styles.userDetailRow}>
              <div className={styles.userDetailLabel}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                <Text strong>Ngày tạo:</Text>
              </div>
              <Text>{dayjs(selectedReport.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
            
            <Divider />
            
            <Form form={form} onFinish={handleReply} className={styles.userForm}>
              <Form.Item
                name="adminReply"
                label="Phản hồi của admin"
                rules={[{ required: true, message: 'Vui lòng nhập phản hồi' }]}
                className={styles.formItem}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Nhập phản hồi cho người dùng..." 
                  className={styles.input}
                />
              </Form.Item>
              
              <Form.Item className="mb-0">
                <Space className="w-full justify-end">
                  <Button onClick={() => setReplyModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Gửi phản hồi
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsPage;