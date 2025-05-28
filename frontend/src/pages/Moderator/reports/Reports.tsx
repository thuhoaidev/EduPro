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
} from "antd";
import { SearchOutlined, CheckOutlined, EyeOutlined } from "@ant-design/icons";
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
];

const statusColor = {
  pending: "orange",
  resolved: "green",
};

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>(mockReports);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // State cho modal chi tiết
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(search.toLowerCase())
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

  const columns = [
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
      render: (status: ReportStatus) => (
        <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>
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
      render: (_: any, record: ReportItem) => (
        <Space>
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
              <Button type="primary" icon={<CheckOutlined />} size="small">
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
      <Input
        placeholder="Tìm kiếm tiêu đề hoặc người báo cáo"
        prefix={<SearchOutlined />}
        allowClear
        style={{ width: 300, marginBottom: 16 }}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={paginatedReports}
        pagination={false}
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
    </div>
  );
};

export default ReportsPage;
