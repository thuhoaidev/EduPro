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
  Tooltip,
  Avatar,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
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
      const instructors: InstructorApprovalProfile[] = res.data.data || [];

      setData(instructors);

      // Tính số lượng trạng thái
      const approvedCount = instructors.filter(i => i.approval_status === "approved").length;
      const rejectedCount = instructors.filter(i => i.approval_status === "rejected").length;

      setStats({
        total: instructors.length,
        approved: approvedCount,
        rejected: rejectedCount,
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
    const degree = instructor.instructorInfo?.education?.[0]?.degree || "";
    const name = instructor.name || "";
    const email = instructor.email || "";

    const matchSearch =
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      email.toLowerCase().includes(searchText.toLowerCase()) ||
      degree.toLowerCase().includes(searchText.toLowerCase());

    const matchDegree = degreeFilter === "all" || degree === degreeFilter;

    return matchSearch && matchDegree;
  });

  const degreeList = Array.from(
    new Set(
      data
        .map((item) => item.instructorInfo?.education?.[0]?.degree)
        .filter((degree): degree is string => Boolean(degree))
    )
  );

  const columns: ColumnsType<InstructorApprovalProfile> = [
    {
      title: <div className="text-center">Giảng viên</div>,
      dataIndex: "name",
      render: (_, record) => (
        <Space direction="horizontal" size="middle" className="py-2">
          <Avatar
            icon={<UserOutlined />}
            size={48}
            className="bg-blue-100 text-blue-600 border-2 border-gray-100 shadow-sm"
          />
          <div>
            <div className="text-lg font-semibold text-gray-600 hover:text-blue-600 cursor-pointer">
              {record.name}
            </div>
            {/* <div className="text-sm text-gray-500">
              {record.instructorInfo?.education?.[0]?.degree || "Không rõ"}
            </div> */}
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
      align: "center",
      render: (email: string) => (
        <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800">
          {email}
        </a>
      ),
    },
    {
      title: "Trình độ",
      key: "degree",
      align: "center",
      render: (_, record) => {
        const educations = record.instructorInfo?.education || [];
        return educations.length > 0 ? (
          <Space wrap>
            {educations.map((edu, index) => (
              <Tag key={index} color="blue">
                {edu.degree || "Không rõ"}
              </Tag>
            ))}
          </Space>
        ) : (
          <Tag color="default">Không rõ</Tag>
        );
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "approval_status",
      align: "center",
      render: (approval_status: string) => getStatusTag(approval_status),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => {
        console.log("🔍 Log record trong cột Thao tác:", record); // 👈 LOG ở đây

        return (
          <Space size="small">
            <Popconfirm
              title="Duyệt giảng viên"
              description="Bạn có chắc chắn muốn duyệt giảng viên này?"
              onConfirm={() => handleApproveOrReject(record._id, true)}
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
              onConfirm={() => handleApproveOrReject(record._id, false)}
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
              onClick={() => navigate(`/admin/instructor-profile/${record._id}`)}
            >
              Chi tiết
            </Button>
          </Space>
        );
      },
    }

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

      {/* Filters & Degree Tags */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, email hoặc trình độ..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="max-w-sm"
          />
        </div>
        {/* <div className="mb-2 font-medium text-gray-700">Tất cả trình độ:</div>
        <Space wrap>
          {degreeList.map((degree) => (
            <Tag key={degree} color="blue">
              {degree}
            </Tag>
          ))}
        </Space> */}
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 8 }}
          />
        </Spin>
      </Card>
    </div>
  );
}
