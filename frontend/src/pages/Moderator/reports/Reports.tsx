import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Tag,
  Space,
  Button,
  Pagination,
  message,
  Popconfirm,
  Modal,
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  Progress,
} from "antd";
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  EyeOutlined,
  WarningOutlined,
  FilterOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { fetchReports, markReportResolved } from "../../../services/reportModerationService";
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// Interface cho Report từ API
interface ReportItem {
  _id: string;
  title: string;
  content: string;
  status: "pending" | "resolved";
  createdAt: string;
  userId: {
    _id: string;
    name?: string;
    email?: string;
    fullname?: string;
    nickname?: string;
  };
  adminReply?: string;
}

const statusColor = {
  pending: "orange",
  resolved: "green",
};

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const pageSize = 10;

  // State cho modal chi tiết
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // Fetch reports từ API
  useEffect(() => {
    const getReports = async () => {
      setLoading(true);
      try {
        const response = await fetchReports(statusFilter || undefined);
        setReports(response.data.data || []);
      } catch (error) {
        message.error('Lỗi tải danh sách báo cáo');
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    getReports();
  }, [statusFilter]);

  const filteredReports = reports.filter(
    (r) =>
      (r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.userId?.name || r.userId?.fullname || r.userId?.nickname || '').toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter ? r.status === statusFilter : true)
  );

  const paginatedReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const markResolved = async (id: string) => {
    try {
      await markReportResolved(parseInt(id));
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "resolved" } : r))
      );
      message.success("Đã đánh dấu báo cáo là đã xử lý thành công!");
    } catch (error) {
      message.error('Lỗi cập nhật trạng thái báo cáo');
      console.error('Error marking report resolved:', error);
    }
  };

  const openDetailModal = (report: ReportItem) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "resolved":
        return { color: "green", text: "ĐÃ XỬ LÝ", icon: <CheckCircleFilled /> };
      case "pending":
        return { color: "orange", text: "CHỜ XỬ LÝ", icon: <ClockCircleOutlined /> };
      default:
        return { color: "default", text: status.toUpperCase(), icon: <WarningOutlined /> };
    }
  };

  // Calculate statistics
  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
  };

  const columns: ColumnsType<ReportItem> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: any, record: ReportItem, idx: number) => (
        <Badge 
          count={(page - 1) * pageSize + idx + 1} 
          style={{ 
            backgroundColor: '#1890ff',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (text: string) => (
        <div style={{ maxWidth: 200 }}>
          <Text strong style={{ 
            fontSize: '13px', 
            color: '#1e293b',
            lineHeight: '1.4'
          }}>
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: "Người báo cáo",
      dataIndex: "userId",
      key: "userId",
      width: 150,
      render: (userId: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            icon={<UserOutlined />} 
            size="small"
            style={{ backgroundColor: '#1890ff' }}
          />
          <Text strong style={{ fontSize: '13px' }}>
            {userId?.name || userId?.fullname || userId?.nickname || 'Ẩn danh'}
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: 'center' as const,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag 
            color={config.color} 
            icon={config.icon}
            style={{ 
              margin: 0, 
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '11px'
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleDateString("vi-VN")}
          </Text>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      align: 'center' as const,
      render: (_: any, record: ReportItem) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              style={{ color: '#1890ff' }}
              onClick={() => openDetailModal(record)}
            />
          </Tooltip>
          {record.status === "pending" && (
            <Popconfirm
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircleFilled style={{ color: '#52c41a' }} />
                  <span>Đánh dấu báo cáo là đã xử lý</span>
                </div>
              }
              description="Báo cáo này sẽ được đánh dấu là đã xử lý và không còn hiển thị trong danh sách chờ xử lý."
              onConfirm={() => markResolved(record._id)}
              okText="Đồng ý"
              cancelText="Hủy"
              okButtonProps={{ 
                style: { 
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  borderRadius: '6px'
                } 
              }}
            >
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                size="small"
                style={{ 
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  borderRadius: '6px'
                }}
              >
                Đã xử lý
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        borderRadius: '16px', 
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <Title level={2} style={{ 
          marginBottom: '32px', 
          color: '#1e293b',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          🚨 Quản lý báo cáo
        </Title>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={12} sm={8} md={8}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Tổng số báo cáo
                  </Text>
                }
                value={stats.totalReports}
                prefix={<WarningOutlined style={{ color: '#1890ff', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={8}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Chờ xử lý
                  </Text>
                }
                value={stats.pendingReports}
                prefix={<ClockCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#faad14', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={stats.totalReports > 0 ? (stats.pendingReports / stats.totalReports) * 100 : 0} 
                      size="small" 
                      strokeColor="#faad14"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={8}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Đã xử lý
                  </Text>
                }
                value={stats.resolvedReports}
                prefix={<CheckCircleFilled style={{ color: '#52c41a', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={stats.totalReports > 0 ? (stats.resolvedReports / stats.totalReports) * 100 : 0} 
                      size="small" 
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Card 
          style={{ 
            marginBottom: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SearchOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              <Search
                placeholder="🔍 Tìm kiếm báo cáo..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ 
                  width: 320,
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9'
                }}
                allowClear
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              <Select
                placeholder="Lọc theo trạng thái"
                allowClear
                value={statusFilter || undefined}
                onChange={val => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                style={{ 
                  width: 180,
                  borderRadius: '8px'
                }}
              >
                <Option value="pending">Chờ xử lý</Option>
                <Option value="resolved">Đã xử lý</Option>
              </Select>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {filteredReports.length} báo cáo
            </Text>
          </div>
        </Card>

        {/* Table */}
        <Card 
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={paginatedReports}
            pagination={false}
            className="reports-table"
            scroll={{ x: 800 }}
            loading={loading}
          />
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={filteredReports.length}
              onChange={setPage}
              showSizeChanger={true}
              showQuickJumper={true}
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} báo cáo`}
              className="reports-pagination"
            />
          </div>
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WarningOutlined style={{ color: '#1890ff' }} />
              <span>Chi tiết báo cáo</span>
            </div>
          }
          open={modalVisible}
          onCancel={closeModal}
          footer={[
            <Button key="close" onClick={closeModal} style={{ borderRadius: '6px' }}>
              Đóng
            </Button>,
          ]}
          width={600}
        >
          {selectedReport ? (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                  Tiêu đề:
                </Text>
                <div style={{ marginTop: '4px' }}>
                  <Text>{selectedReport.title}</Text>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                  Người báo cáo:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Avatar 
                    icon={<UserOutlined />} 
                    size="small"
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  <Text>{selectedReport.userId?.name || selectedReport.userId?.fullname || selectedReport.userId?.nickname || 'Ẩn danh'}</Text>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                  Trạng thái:
                </Text>
                <div style={{ marginTop: '4px' }}>
                  {(() => {
                    const config = getStatusConfig(selectedReport.status);
                    return (
                      <Tag 
                        color={config.color} 
                        icon={config.icon}
                        style={{ 
                          margin: 0, 
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}
                      >
                        {config.text}
                      </Tag>
                    );
                  })()}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                  Ngày báo cáo:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
                  <Text type="secondary">
                    {new Date(selectedReport.createdAt).toLocaleDateString("vi-VN")}
                  </Text>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                  Nội dung báo cáo:
                </Text>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '12px', 
                  background: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <Text>{selectedReport.content || "Không có"}</Text>
                </div>
              </div>
              
              {selectedReport.adminReply && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Phản hồi từ admin:
                  </Text>
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '12px', 
                    background: '#f0f9ff', 
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}>
                    <Text>{selectedReport.adminReply}</Text>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Không có dữ liệu để hiển thị</p>
          )}
        </Modal>

        <style>{`
          .reports-table .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding: 16px 12px;
          }
          .reports-table .ant-table-tbody > tr:hover > td {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          }
          .reports-table .ant-table-tbody > tr > td {
            padding: 16px 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          .reports-pagination .ant-pagination-item-active {
            background: linear-gradient(135deg, #1890ff, #722ed1);
            border-color: #1890ff;
          }
          .reports-pagination .ant-pagination-item-active a {
            color: white;
          }
          .ant-tag {
            margin: 0;
          }
          .ant-card {
            transition: all 0.3s ease;
          }
          .ant-card:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </div>
  );
};

export default ReportsPage;
