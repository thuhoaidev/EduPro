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
  Card,
  Row,
  Col,
  Statistic,
  Tooltip
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  CheckOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ReportItem, ReportStatus } from "../../../interfaces/Admin.interface";

const mockReports: ReportItem[] = [
  {
    id: 1,
    title: "Báo cáo vi phạm nội dung",
    reporterName: "Nguyễn Văn A",
    status: "pending",
    createdAt: "2024-05-20",
    description: "Nội dung vi phạm liên quan đến spam và quảng cáo không đúng quy định.",
  },
  {
    id: 2,
    title: "Báo cáo lỗi kỹ thuật",
    reporterName: "Trần Thị B",
    status: "resolved",
    createdAt: "2024-04-15",
    description: "Người dùng phản ánh lỗi đăng nhập không thành công trên trình duyệt Chrome.",
  },
  {
    id: 3,
    title: "Báo cáo hành vi không phù hợp",
    reporterName: "Lê Văn C",
    status: "pending",
    createdAt: "2024-05-01",
    description: "Báo cáo về hành vi gây mất trật tự trong các bình luận.",
  },
  {
    id: 4,
    title: "Báo cáo nội dung nhạy cảm",
    reporterName: "Phạm Thị D",
    status: "pending",
    createdAt: "2024-05-21",
    description: "Nội dung có chứa ngôn ngữ không phù hợp.",
  },
];

const getStatusConfig = (status: ReportStatus) => {
  const config = {
    resolved: { color: "success" as const, icon: <CheckCircleOutlined />, text: "Đã xử lý" },
    pending: { color: "warning" as const, icon: <ClockCircleOutlined />, text: "Chờ xử lý" },
  };
  return config[status] || { color: "default" as const, icon: null, text: status };
};

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>(mockReports);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8; // Increased pageSize

  // State cho modal chi tiết
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const handleMarkResolved = (id: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
    );
    message.success("Đã đánh dấu báo cáo là đã xử lý");
    // Close modal if it's open and the resolved report was the selected one
    if(selectedReport && selectedReport.id === id) {
      closeModal();
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

  const filteredReports = reports.filter(
    (r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.reporterName.toLowerCase().includes(search.toLowerCase());

      // Status filtering is handled by the table's built-in filter now
      return matchesSearch;
    }
  );

  const paginatedReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Calculate statistics
  const stats = {
    totalPending: reports.filter(r => r.status === 'pending').length,
    totalResolved: reports.filter(r => r.status === 'resolved').length,
  };

  useEffect(() => {
    // Reset page to 1 when search changes
    setPage(1);
  }, [search]);

  const columns: ColumnsType<ReportItem> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      className: "font-medium text-gray-800",
    },
    {
      title: "Người báo cáo",
      dataIndex: "reporterName",
      key: "reporterName",
      className: "text-gray-600",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: ReportStatus) => {
        const statusConfig = getStatusConfig(status);
        return (
          <Tag 
            color={statusConfig.color}
            icon={statusConfig.icon}
            className="px-2 py-1 rounded-full text-sm font-medium"
          >
            {statusConfig.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Chờ xử lý', value: 'pending' },
        { text: 'Đã xử lý', value: 'resolved' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      className: "text-gray-600 text-sm"
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: void, record: ReportItem) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => openDetailModal(record)}
              className="flex items-center"
            >
              Chi tiết
            </Button>
          </Tooltip>
          {record.status === "pending" && (
            <Popconfirm
              title="Đánh dấu báo cáo là đã xử lý?"
              onConfirm={() => handleMarkResolved(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
              okButtonProps={{ type: 'primary' }}
            >
              <Tooltip title="Đánh dấu đã xử lý">
                <Button type="primary" icon={<CheckOutlined />} size="small" className="flex items-center">
                  Đã xử lý
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý báo cáo</h2>
          <p className="text-gray-500 mt-1">Xem xét và xử lý các báo cáo từ người dùng</p>
        </div>
      </div>

       {/* Stats Cards */}
       <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Báo cáo chờ xử lý"
              value={stats.totalPending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Báo cáo đã xử lý"
              value={stats.totalResolved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm kiếm tiêu đề hoặc người báo cáo..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={paginatedReports}
          pagination={false}
          className="reports-table"
        />
         <div className="text-right mt-4 px-4">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={filteredReports.length}
              onChange={setPage}
              showSizeChanger={false}
              showTotal={(total) => `Tổng số ${total} báo cáo`}
            />
          </div>
      </Card>

      {/* Modal Chi tiết Báo cáo */}
      <Modal
        title={<div className="text-xl font-semibold text-gray-800">Chi tiết báo cáo</div>}
        open={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Đóng
          </Button>,
        ]}
        destroyOnClose // Destroy modal content on close
        centered // Center modal on screen
        width={600} // Adjust modal width
      >
        {selectedReport ? (
          <div className="space-y-4 text-gray-700">
            <p><b>Tiêu đề:</b> {selectedReport.title}</p>
            <p><b>Người báo cáo:</b> {selectedReport.reporterName}</p>
            <p>
              <b>Trạng thái:</b>{" "}
              <Tag color={getStatusConfig(selectedReport.status).color} icon={getStatusConfig(selectedReport.status).icon}>
                {getStatusConfig(selectedReport.status).text}
              </Tag>
            </p>
            <p>
              <b>Ngày báo cáo:</b>{" "}
              {new Date(selectedReport.createdAt).toLocaleDateString("vi-VN")}
            </p>
            <p><b>Mô tả chi tiết:</b></p>
            <div className="p-4 bg-gray-100 rounded-md border border-gray-200 leading-relaxed">
              {selectedReport.description || "Không có mô tả"}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Không có dữ liệu để hiển thị</p>
        )}
      </Modal>

       {/* Custom styles */}
       <style>
        {`
          .reports-table .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
            color: #1f2937;
          }
          .reports-table .ant-table-tbody > tr:hover > td {
            background: #f5f7fa;
          }
           .reports-table .ant-table-tbody > tr > td {
            padding: 12px 8px;
          }
          .ant-tag {
            margin: 0;
          }
        `}
      </style>

    </div>
  );
};

export default ReportsPage;
