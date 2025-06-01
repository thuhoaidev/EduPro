import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Space,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Avatar,
  Tooltip,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { InstructorApprovalProfile } from "../../../interfaces/Admin.interface";
import { approveInstructor, getPendingInstructors } from "../../../services/instructorApi";

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    approved: { color: "success", label: "Đã duyệt", icon: <CheckCircleOutlined /> },
    pending: { color: "warning", label: "Chờ duyệt", icon: <ClockCircleOutlined /> },
    rejected: { color: "error", label: "Từ chối", icon: <CloseCircleOutlined /> },
  };

  const tag = statusMap[status] || { color: "default", label: status, icon: null };
  return (
    <Tag color={tag.color} icon={tag.icon} className="px-2 py-1 rounded-full text-sm font-medium">
      {tag.label}
    </Tag>
  );
};

export default function InstructorPendingListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<InstructorApprovalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [degreeFilter, setDegreeFilter] = useState<string>("all");

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPendingInstructors();
      const instructors: InstructorApprovalProfile[] = res.data;

      setData(instructors);
      setStats({
        total: instructors.length,
        approved: 0,
        rejected: 0,
      });
    } catch (err) {
      message.error("Lỗi khi tải danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveOrReject = async (id: string, approve: boolean) => {
    try {
      await approveInstructor(id, approve);
      message.success(`Đã ${approve ? "duyệt" : "từ chối"} giảng viên`);
      fetchData(); // reload data
    } catch (err) {
      message.error("Thao tác thất bại");
    }
  };

  const filteredData = data.filter((instructor) => {
    const degree = instructor.education?.[0]?.degree || "";

    const matchSearch =
      instructor.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchText.toLowerCase()) ||
      degree.toLowerCase().includes(searchText.toLowerCase());

    const matchDegree = degreeFilter === "all" || degree === degreeFilter;

    return matchSearch && matchDegree;
  });


  const columns: ColumnsType<InstructorApprovalProfile> = [
    {
      title: "Giảng viên",
      dataIndex: "name",
      render: (_, record) => (
        <Space direction="horizontal" size="middle" className="py-2">
          <Avatar
            icon={<UserOutlined />}
            size={48}
            className="bg-blue-100 text-blue-600 border-2 border-gray-100 shadow-sm"
          />
          <div>
            <div className="font-semibold text-base hover:text-blue-600 cursor-pointer">{record.fullName}</div>
            <div className="text-sm text-gray-600">{record.education?.[0]?.degree || "Không rõ"}</div>
            <Space className="mt-2" size="small">
              <Tooltip title="Gửi email">
                <Button type="text" size="small" icon={<MailOutlined />} />
              </Tooltip>
              <Tooltip title="Gọi điện thoại">
                <Button type="text" size="small" icon={<PhoneOutlined />} />
              </Tooltip>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (email: string) => (
        <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800">
          {email}
        </a>
      ),
    },
    {
      title: "Trình độ",
      key: "degree",
      render: (_, record) => {
        const degree = record.education?.[0]?.degree || "Không rõ";
        return <Tag color="blue">{degree}</Tag>;
      },
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Duyệt giảng viên"
            description="Bạn có chắc chắn muốn duyệt giảng viên này?"
            onConfirm={() => handleApproveOrReject(record.id, true)}
            okText="Duyệt"
            cancelText="Hủy"
            okButtonProps={{ type: "primary" }}
          >
            <Button type="primary" icon={<CheckOutlined />} size="small">
              Duyệt
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Từ chối giảng viên"
            description="Bạn có chắc chắn muốn từ chối giảng viên này?"
            onConfirm={() => handleApproveOrReject(record.id, false)}
            okText="Từ chối"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<CloseOutlined />} size="small">
              Từ chối
            </Button>
          </Popconfirm>
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/admin/instructors/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Duyệt giảng viên</h2>
        <p className="text-gray-500 mt-1">Xem xét và phê duyệt hồ sơ giảng viên mới</p>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng chờ duyệt"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã từ chối"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, email hoặc trình độ..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="max-w-sm"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 8 }}
          />
        </Spin>
      </Card>
    </div>
  );
}
