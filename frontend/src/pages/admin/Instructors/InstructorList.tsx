import {
  Table,
  Tag,
  Avatar,
  Space,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  Statistic,
  message,
  Rate
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useEffect } from "react";
import {
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  // CheckCircleOutlined,
  // ClockCircleOutlined,
  // CloseCircleOutlined,
  // FilterOutlined,
  // EyeOutlined,
  // MailOutlined,
  // PhoneOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { InstructorProfile } from "../../../interfaces/Admin.interface";
import { config } from "../../../api/axios";

const InstructorList = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await config.get("/admin/users/instructors");
        setInstructors(res.data.data.instructors);
      } catch (error) {
        console.error("Lỗi khi tải danh sách giảng viên:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      await config.put(`/admin/users/instructors/${id}/approval`, {
        status
      });
      message.success(`Đã cập nhật trạng thái giảng viên`);
      setInstructors((prev) =>
        prev.map((ins) =>
          ins._id === id ? { ...ins, approval_status: status } : ins
        )
      );
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      message.error("Cập nhật trạng thái thất bại");
    }
  };



  const filteredData = instructors.filter((ins) => {
    const fullname = ins.fullname || "";
    return (
      (statusFilter === "all" || ins.approval_status === statusFilter) &&
      fullname.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const stats = {
    total: instructors.length,
    approved: instructors.filter((ins) => ins.approval_status === "approved").length,
    pending: instructors.filter((ins) => ins.approval_status === "pending").length,
    rejected: instructors.filter((ins) => ins.approval_status === "rejected").length
  };

  const columns: ColumnsType<InstructorProfile> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_text, _record, index) => index + 1
    },
    {
      title: "Giảng viên",
      dataIndex: "fullname",
      render: (_, record) => (
        <Space direction="horizontal" size="middle">
          <Avatar
            src={record.avatar || undefined}
            icon={<UserOutlined />}
            size={48}
          />
          <div>
            <div className="font-semibold text-base cursor-pointer hover:text-blue-600" onClick={() => navigate(`/admin/users/instructor/${record._id}`)}>{record.fullname}</div>
            <div className="text-sm text-gray-600">{record.email}</div>
            <div className="text-xs text-gray-500">{record.nickname}</div>
          </div>
        </Space>
      )
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      align: "center",
      render: (rating: number) => (
        <div>
          <Rate disabled defaultValue={Math.round(rating)} allowHalf />
          <div className="text-xs text-gray-500 mt-1">{rating?.toFixed(1) || "Chưa có"}</div>
        </div>
      )
    },

    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      align: "center",
      render: (date) => (
        <div className="text-sm">
          <div className="font-medium">{new Date(date).toLocaleDateString()}</div>
          <div className="text-gray-500 text-xs">{new Date(date).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status) => {
        const statusMap = {
          active: { color: "green", label: "Hoạt động" },
          inactive: { color: "red", label: "Không hoạt động" }
        };
        const tag = statusMap[status] || { color: "default", label: status };
        return <Tag color={tag.color}>{tag.label}</Tag>;
      }
    },
    {
      title: "Xét duyệt",
      dataIndex: "approval_status",
      align: "center",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(value) => handleChangeStatus(record._id, value)}
          options={[
            { value: "approved", label: "✅ Duyệt" },
            { value: "pending", label: "⏳ Chờ duyệt" },
            { value: "rejected", label: "❌ Từ chối" }
          ]}
        />
      )
    },
    {
      title: "Chi tiết",
      key: "details",
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/users/instructor/${record._id}`)}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng giảng viên"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng chờ duyệt"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
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


      <Row gutter={[16, 16]} className="mb-4" align="middle">
        <Col xs={24} sm={16}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên giảng viên..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Select
            defaultValue="all"
            style={{ width: "100%" }}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "approved", label: "Đã duyệt" },
              { value: "pending", label: "Chờ duyệt" },
              { value: "rejected", label: "Từ chối" }
            ]}
          />
        </Col>
      </Row>


      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
};

export default InstructorList;
