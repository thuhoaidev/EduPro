import React, { useState } from "react";
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
} from "antd";
import { SearchOutlined, CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import type { ReportItem, ReportStatus } from "../../../interfaces/Admin.interface";
import type { ColumnsType } from 'antd/es/table';

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
];

const statusColor = {
  pending: "orange",
  resolved: "green",
};

const Option = Select.Option;

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>(mockReports);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const pageSize = 5;

  // State cho modal chi tiết
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const filteredReports = reports.filter(
    (r) =>
      (r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.reporterName.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter ? r.status === statusFilter : true)
  );

  const paginatedReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const markResolved = (id: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
    );
    message.success("Đã đánh dấu báo cáo là đã xử lý");
  };

  const openDetailModal = (report: ReportItem) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  const columns: ColumnsType<ReportItem> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Người báo cáo",
      dataIndex: "reporterName",
      key: "reporterName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: 'center',
      render: (status: ReportStatus) => (
        <Tag color={statusColor[status]} style={{ margin: 0 }}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: 'center',
      render: (_: any, record: ReportItem) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openDetailModal(record)}
          >
            Xem chi tiết
          </Button>
          {record.status === "pending" && (
            <Popconfirm
              title="Đánh dấu báo cáo là đã xử lý?"
              onConfirm={() => markResolved(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button type="primary" icon={<CheckCircleOutlined />} size="small">
                Đã xử lý
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
        <Input
          placeholder="Tìm kiếm tiêu đề..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ width: 240 }}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          value={statusFilter || undefined}
          onChange={val => {
            setStatusFilter(val);
            setPage(1);
          }}
          style={{ width: 180 }}
        >
          <Option value="pending">Chờ xử lý</Option>
          <Option value="resolved">Đã xử lý</Option>
        </Select>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={paginatedReports}
        pagination={false}
        className="users-table"
      />
      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filteredReports.length}
          onChange={setPage}
          showSizeChanger={false}
        />
      </div>

      <Modal
        title="Chi tiết báo cáo"
        visible={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Đóng
          </Button>,
        ]}
      >
        {selectedReport ? (
          <>
            <p><b>Tiêu đề:</b> {selectedReport.title}</p>
            <p><b>Người báo cáo:</b> {selectedReport.reporterName}</p>
            <p>
              <b>Trạng thái:</b>{" "}
              <Tag color={statusColor[selectedReport.status]}>
                {selectedReport.status.toUpperCase()}
              </Tag>
            </p>
            <p>
              <b>Ngày báo cáo:</b>{" "}
              {new Date(selectedReport.createdAt).toLocaleDateString("vi-VN")}
            </p>
            <p><b>Mô tả chi tiết:</b> {selectedReport.description || "Không có"}</p>
          </>
        ) : (
          <p>Không có dữ liệu để hiển thị</p>
        )}
      </Modal>

      <style>{`
        .users-table .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          color: #1f2937;
        }
        .users-table .ant-table-tbody > tr:hover > td {
          background: #f5f7fa;
        }
        .users-table .ant-table-tbody > tr > td {
          padding: 12px 8px;
        }
        .ant-tag {
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
