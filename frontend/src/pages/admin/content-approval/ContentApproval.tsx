import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Space,
  Pagination,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FilterOutlined
} from "@ant-design/icons";
import type { ContentItem, ContentStatus } from "../../../interfaces/Admin.interface";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent } from "react";
import { courseService } from '../../../services/apiService';


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
  {
    id: 4,
    title: "Video hướng dẫn Redux",
    authorName: "Phạm Thị D",
    status: "pending",
    createdAt: "2024-05-02",
  },
  {
    id: 5,
    title: "Bài viết về hooks trong React",
    authorName: "Hoàng Văn E",
    status: "pending",
    createdAt: "2024-05-03",
  },
  {
    id: 6,
    title: "Khóa học Node.js nâng cao",
    authorName: "Đặng Thị F",
    status: "approved",
    createdAt: "2024-05-01",
  },
];

const getStatusConfig = (status: ContentStatus) => {
  const config = {
    approved: { color: "success" as const, icon: <CheckCircleOutlined />, text: "Đã duyệt" },
    pending: { color: "warning" as const, icon: <ClockCircleOutlined />, text: "Chờ duyệt" },
    rejected: { color: "error" as const, icon: <CloseCircleOutlined />, text: "Từ chối" },
  };
  return config[status] || { color: "default" as const, icon: null, text: status };
};

const ContentApprovalPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | "all">("pending");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy danh sách khóa học pending từ API
    const fetchCourses = async () => {
      const allCourses = await courseService.getAllCourses();
      setCourses(allCourses.filter((c: any) => c.status === 'pending'));
    };
    fetchCourses();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await courseService.updateCourseStatus(id, newStatus);
      message.success(`Đã cập nhật trạng thái thành ${newStatus === 'published' ? 'Đã duyệt' : 'Từ chối'}`);
      // Cập nhật lại danh sách
      const allCourses = await courseService.getAllCourses();
      setCourses(allCourses.filter((c: any) => c.status === 'pending'));
    } catch (err) {
      message.error('Cập nhật trạng thái thất bại!');
    }
  };

  const handleViewDetails = (id: number) => {
    // Implement navigation to content detail page
    console.log(`Viewing details for content ID: ${id}`);
    navigate(`/admin/content/${id}`); // Example route - Uncomment and adjust as needed
  };

  const filteredCourses = courses.filter(
    (c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.author?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "all" || c.status === filterStatus;
      return matchesSearch && matchesStatus;
    }
  );

  const paginatedCourses = filteredCourses.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Calculate statistics
  const stats = {
    totalPending: courses.filter(t => t.status === 'pending').length,
    totalApproved: 0, // Có thể lấy thêm nếu muốn
    totalRejected: 0,
  };

  useEffect(() => {
    // Reset page to 1 when search or filter changes
    setPage(1);
  }, [search, filterStatus]);

  const columns: ColumnsType<any> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      className: "font-medium text-gray-800",
    },
    {
      title: "Giảng viên",
      dataIndex: ["author", "name"],
      key: "author",
      className: "text-gray-600",
      render: (_: any, record: any) => record.author?.name || 'N/A',
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
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
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleDateString("vi-VN"),
      className: "text-gray-600 text-sm"
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: void, record: any) => (
        <Space size="small">
          <Popconfirm
            title="Phê duyệt khóa học"
            description="Bạn có chắc chắn muốn phê duyệt khóa học này?"
            onConfirm={() => handleUpdateStatus(record.id, "published")}
            okText="Phê duyệt"
            cancelText="Hủy"
            okButtonProps={{ type: "primary" }}
          >
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              className="flex items-center"
            >
              Phê duyệt
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Từ chối khóa học"
            description="Bạn có chắc chắn muốn từ chối khóa học này?"
            onConfirm={() => handleUpdateStatus(record.id, "rejected")}
            okText="Từ chối"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              className="flex items-center"
            >
              Từ chối
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Duyệt nội dung</h2>
          <p className="text-gray-500 mt-1">Quản lý và phê duyệt các khóa học, bài viết, video...</p>
        </div>
      </div>

       {/* Stats Cards */}
       <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng chờ duyệt"
              value={stats.totalPending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã duyệt"
              value={stats.totalApproved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã từ chối"
              value={stats.totalRejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm kiếm tiêu đề hoặc tác giả..."
            className="max-w-sm"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            defaultValue="pending"
            style={{ width: 150 }}
            onChange={(value: string | "all") => setFilterStatus(value)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "pending", label: "Chờ duyệt" },
              { value: "approved", label: "Đã duyệt" },
              { value: "rejected", label: "Từ chối" },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={paginatedCourses}
          pagination={false}
          className="content-approval-table"
        />
         <div className="text-right mt-4 px-4">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={filteredCourses.length}
              onChange={(newPage) => setPage(newPage)}
              showSizeChanger={false}
              showTotal={(total) => `Tổng số ${total} nội dung`}
            />
          </div>
      </Card>

       {/* Custom styles */}
       <style>
        {`
          .content-approval-table .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
            color: #1f2937;
          }
          .content-approval-table .ant-table-tbody > tr:hover > td {
            background: #f5f7fa;
          }
           .content-approval-table .ant-table-tbody > tr > td {
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

export default ContentApprovalPage;
