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
import { motion } from 'framer-motion';
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
      variant="borderless"
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
          <FilterOutlined style={{ color: '#667eea', fontSize: '20px' }} />
          <Text strong style={{ fontSize: '16px', color: '#1a1a1a' }}>Bộ lọc tìm kiếm</Text>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <Input
          placeholder="Tìm kiếm báo cáo..."
          prefix={<SearchOutlined />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={() => setSearch(searchInput)}
          style={{ 
            minWidth: '300px',
            borderRadius: '10px',
            height: '44px',
            border: '1px solid #d9d9d9',
            fontSize: '14px'
          }}
          allowClear
        />
        <Select
          placeholder="Lọc theo trạng thái"
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ 
            minWidth: '200px',
            borderRadius: '10px',
            height: '44px',
            border: '1px solid #d9d9d9',
            fontSize: '14px'
          }}
          allowClear
        >
          <Select.Option value="pending">Chờ xử lý</Select.Option>
          <Select.Option value="resolved">Đã xử lý</Select.Option>
        </Select>
        <RangePicker
          placeholder={['Từ ngày', 'Đến ngày']}
          onChange={(dates) => setDateRange(dates)}
          style={{ 
            borderRadius: '10px',
            height: '44px',
            border: '1px solid #d9d9d9'
          }}
          format="DD/MM/YYYY"
          value={dateRange}
        />
      </div>
    </Card>
  </motion.div>
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
            variant="borderless"
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
                <FileTextOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng số báo cáo</Text>} 
                  value={reportStats.total} 
                  valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tất cả báo cáo</Text>
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
            variant="borderless"
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
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Chờ xử lý</Text>} 
                  value={reportStats.pending} 
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
            variant="borderless"
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
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Đã xử lý</Text>} 
                  value={reportStats.resolved} 
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{resolvedPercentage.toFixed(1)}%</Text>
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
            variant="borderless"
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
                <MessageOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tỷ lệ xử lý</Text>} 
                  value={resolvedPercentage} 
                  suffix="%" 
                  precision={1}
                  valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 600 }}
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
    </motion.div>
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
                  Quản lý báo cáo
                </Title>
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
                  Quản lý và xử lý các báo cáo từ người dùng trong hệ thống
                </Paragraph>
              </div>
            </div>
          </Card>
        </motion.div>

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
            variant="borderless"
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
                <BookOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                  Danh sách báo cáo
                </Title>
                <Badge count={reports.length} style={{ 
                  backgroundColor: '#1890ff',
                  borderRadius: '8px'
                }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
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
              style={{ 
                borderRadius: '12px',
                overflow: 'hidden'
              }}
              scroll={{ x: 900 }}
              size="small"
            />
          </Card>
        </motion.div>

        {/* Reply Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageOutlined style={{ color: '#667eea', fontSize: '20px' }} />
              <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                Trả lời báo cáo
              </Text>
            </div>
          }
          open={replyModalVisible}
          onCancel={() => setReplyModalVisible(false)}
          footer={null}
          width={700}
          style={{ borderRadius: '16px' }}
        >
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <Title level={3} style={{ margin: 0 }}>
                  {selectedReport.title}
                </Title>
                {getStatusTag(selectedReport.status)}
              </div>
              
              <Divider />
              
              <Card 
                style={{ 
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef',
                  marginBottom: '16px'
                }}
                variant="borderless"
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    minWidth: '120px'
                  }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Người báo cáo:</Text>
                  </div>
                  <div>
                    <Text type="secondary">
                      {selectedReport.user?.name || 'Không xác định'} ({selectedReport.user?.email || 'N/A'})
                    </Text>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    minWidth: '120px'
                  }}>
                    <FileTextOutlined style={{ color: '#52c41a' }} />
                    <Text strong>Nội dung báo cáo:</Text>
                  </div>
                  <div>
                    <Text type="secondary">
                      {selectedReport.content}
                    </Text>
                  </div>
                </div>
                
                {selectedReport.adminReply && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      minWidth: '120px'
                    }}>
                      <MessageOutlined style={{ color: '#faad14' }} />
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
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '20px',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  minWidth: '120px'
                }}>
                  <CalendarOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Ngày tạo:</Text>
                </div>
                <Text>{dayjs(selectedReport.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </div>
              
              <Divider />
              
              <Form form={form} onFinish={handleReply}>
                <Form.Item
                  name="adminReply"
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Phản hồi của admin</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập phản hồi' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder="Nhập phản hồi cho người dùng..." 
                    style={{ 
                      borderRadius: '10px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px',
                      resize: 'none'
                    }}
                  />
                </Form.Item>
                
                <Form.Item style={{ marginBottom: 0 }}>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button 
                      onClick={() => setReplyModalVisible(false)}
                      style={{ 
                        borderRadius: '8px',
                        height: '40px',
                        padding: '0 20px'
                      }}
                    >
                      Hủy
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      style={{ 
                        borderRadius: '8px',
                        height: '40px',
                        padding: '0 20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      Gửi phản hồi
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </motion.div>
          )}
        </Modal>
      </div>
    </motion.div>
  );
};

export default ReportsPage;