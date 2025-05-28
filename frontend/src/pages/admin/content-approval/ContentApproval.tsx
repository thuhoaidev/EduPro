import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Space,
  Pagination,
  message,
  Popconfirm,
} from "antd";
import { SearchOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { ContentItem, ContentStatus } from "../../../interfaces/Admin.interface";


const mockContents: ContentItem[] = [
  {
    id: 1,
    title: "Khóa học React cơ bản",
    authorName: "Nguyễn Văn A",
    status: "pending",
    createdAt: "2024-05-01",
  },
  {
    id: 2,
    title: "Bài viết về TypeScript",
    authorName: "Trần Thị B",
    status: "approved",
    createdAt: "2024-04-25",
  },
  {
    id: 3,
    title: "Hướng dẫn Ant Design",
    authorName: "Lê Văn C",
    status: "rejected",
    createdAt: "2024-04-28",
  },
];

const statusColor = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

const ContentApprovalPage: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>(mockContents);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredContents = contents.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.authorName.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedContents = filteredContents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const updateStatus = (id: number, newStatus: ContentStatus) => {
    setContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    message.success(`Đã cập nhật trạng thái thành ${newStatus.toUpperCase()}`);
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: ContentStatus) => (
        <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: ContentItem) => (
        <Space>
          {record.status === "pending" && (
            <>
              <Popconfirm
                title="Bạn có chắc muốn phê duyệt?"
                onConfirm={() => updateStatus(record.id, "approved")}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  danger={false}
                >
                  Phê duyệt
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Bạn có chắc muốn từ chối?"
                onConfirm={() => updateStatus(record.id, "rejected")}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button
                  type="default"
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                >
                  Từ chối
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status !== "pending" && (
            <Tag color="default">Đã xử lý</Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Tìm kiếm tiêu đề hoặc tác giả"
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
        dataSource={paginatedContents}
        pagination={false}
      />
      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filteredContents.length}
          onChange={setPage}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default ContentApprovalPage;
