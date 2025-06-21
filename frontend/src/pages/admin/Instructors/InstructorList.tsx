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
  Statistic,
  message,
  Rate,
  Modal,
  Select
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
  CloseCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { InstructorProfile } from "../../../interfaces/Admin.interface";
import { config } from "../../../api/axios";

const InstructorList = () => {
  const [searchText, setSearchText] = useState("");
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [selectStatusMap, setSelectStatusMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await config.get("/users/instructors/pending");

        console.log("Fetched instructor data:", res.data);

        const pendingInstructors: InstructorProfile[] = res.data.data.pendingInstructors || [];

        setInstructors(pendingInstructors);

        const map: Record<string, string> = {};
        pendingInstructors.forEach((ins) => {
          map[ins._id] = ins.approval_status;
        });
        setSelectStatusMap(map);
      } catch (error) {
        console.error("Lỗi khi tải danh sách giảng viên:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);



  const handleChangeStatus = (id: string, newStatus: string) => {
    if (newStatus === "rejected") {
      let rejectionReason = "";

      Modal.confirm({
        title: "Nhập lý do từ chối",
        content: (
          <Input.TextArea
            rows={4}
            placeholder="Nhập lý do từ chối..."
            onChange={(e) => {
              rejectionReason = e.target.value;
            }}
          />
        ),
        okText: "Từ chối",
        cancelText: "Hủy",
        async onOk() {
          if (!rejectionReason.trim()) {
            message.warning("Bạn phải nhập lý do từ chối");
            return Promise.reject();
          }

          try {
            await config.put(`/users/instructors/${id}/approval`, {
              status: "rejected",
              rejection_reason: rejectionReason.trim()
            });

            message.success("Đã từ chối hồ sơ");
            setInstructors((prev) => prev.filter((ins) => ins._id !== id));
          } catch (err) {
            message.error("Từ chối hồ sơ thất bại");
          }
        },
        onCancel() {
          // 👇 Reset lại select về trạng thái ban đầu nếu hủy
          setSelectStatusMap((prev) => ({ ...prev, [id]: "pending" }));
        }
      });
    } else if (newStatus === "approved") {
      Modal.confirm({
        title: "Xác nhận duyệt hồ sơ",
        content: "Bạn có chắc chắn muốn duyệt hồ sơ giảng viên này không?",
        okText: "Duyệt",
        cancelText: "Hủy",
        async onOk() {
          try {
            await config.put(`/users/instructors/${id}/approval`, {
              status: "approved"
            });

            message.success("Đã duyệt hồ sơ");
            setInstructors((prev) => prev.filter((ins) => ins._id !== id));
          } catch (err) {
            message.error("Duyệt hồ sơ thất bại");
          }
        },
        onCancel() {
          // 👇 Reset lại select về trạng thái ban đầu nếu hủy
          setSelectStatusMap((prev) => ({ ...prev, [id]: "pending" }));
        }
      });
    }
  };


  const filteredData = instructors.filter((ins) =>
    ins.fullname?.toLowerCase().includes(searchText.toLowerCase())
  );

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
            <div
              className="font-semibold text-base cursor-pointer hover:text-blue-600"
              onClick={() =>
                navigate(`/admin/users/instructor/${record._id}`)
              }
            >
              {record.fullname}
            </div>
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
          <div className="text-xs text-gray-500 mt-1">
            {rating?.toFixed(1) || "Chưa có"}
          </div>
        </div>
      )
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      align: "center",
      render: (date) => (
        <div className="text-sm">
          <div className="font-medium">
            {new Date(date).toLocaleDateString()}
          </div>
          <div className="text-gray-500 text-xs">
            {new Date(date).toLocaleTimeString()}
          </div>
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
        const tag = statusMap[status as keyof typeof statusMap] || { color: "default", label: status };
        return <Tag color={tag.color}>{tag.label}</Tag>;
      }
    },
    {
      title: "Xét duyệt",
      dataIndex: "approval_status",
      align: "center",
      render: (_status, record) => (
        <Select
          value={selectStatusMap[record._id] || "pending"}
          style={{ width: 160 }}
          dropdownStyle={{ minWidth: 160 }}
          onChange={(value) => {
            setSelectStatusMap((prev) => ({ ...prev, [record._id]: value }));
            handleChangeStatus(record._id, value);
          }}
          options={[
            {
              value: "pending",
              label: (
                <span>
                  <ClockCircleOutlined style={{ marginRight: 6 }} />
                  Chờ duyệt
                </span>
              )
            },
            {
              value: "approved",
              label: (
                <span>
                  <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 6 }} />
                  Duyệt
                </span>
              )
            },
            {
              value: "rejected",
              label: (
                <span>
                  <CloseCircleOutlined style={{ color: "#ff4d4f", marginRight: 6 }} />
                  Từ chối
                </span>
              )
            }
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
          onClick={() =>
            navigate(`/admin/users/instructors/pending/${record._id}`)
          }
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title={
                <span>
                  👨‍🏫 Giảng viên <span style={{ color: "#faad14" }}>chờ duyệt</span>
                </span>
              }
              value={instructors.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
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
