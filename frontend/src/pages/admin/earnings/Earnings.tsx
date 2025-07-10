import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message, Modal, Input, Card, Typography, Space, Row, Col, Statistic, Divider, Descriptions, Avatar } from "antd";
import { DollarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, BankOutlined, CalendarOutlined, PhoneOutlined, MailOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Search } = Input;

const WithdrawRequestsAdmin = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [detailModal, setDetailModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/teacher-wallet/withdraw-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  // Lọc dữ liệu theo search text
  const filteredRequests = requests.filter(request => {
    if (!searchText) return true;
    const teacherName = request.teacherId?.fullname?.toLowerCase() || "";
    const teacherEmail = request.teacherId?.email?.toLowerCase() || "";
    const searchLower = searchText.toLowerCase();
    return teacherName.includes(searchLower) || teacherEmail.includes(searchLower);
  });

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/teacher-wallet/withdraw/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đã duyệt rút tiền!");
      setRequests((prev) => prev.map(r => r._id === id ? { ...r, status: "approved" } : r));
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi duyệt rút tiền");
    }
  };

  const handleReject = async () => {
    if (!rejectModal.id) return;
    setRejecting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/teacher-wallet/withdraw/${rejectModal.id}/reject`, { reason: rejectReason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đã từ chối yêu cầu!");
      setRequests((prev) => prev.map(r => r._id === rejectModal.id ? { ...r, status: "rejected", note: rejectReason } : r));
      setRejectModal({ open: false });
      setRejectReason("");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi từ chối yêu cầu");
    } finally {
      setRejecting(false);
    }
  };

  const showDetail = (record: any) => {
    setDetailModal({ open: true, data: record });
  };

  // Tính toán thống kê
  const totalRequests = filteredRequests.length;
  const pendingRequests = filteredRequests.filter(r => r.status === "pending").length;
  const approvedRequests = filteredRequests.filter(r => r.status === "approved").length;
  const rejectedRequests = filteredRequests.filter(r => r.status === "rejected").length;
  const totalAmount = filteredRequests.filter(r => r.status === "approved").reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div >
      <Card style={{ marginBottom: 32, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <Title level={2} style={{ marginBottom: 32, color: "#2563eb", fontWeight: 700, letterSpacing: 1 }}>
          <DollarOutlined style={{ marginRight: 12 }} />
          Quản lý yêu cầu rút tiền
        </Title>
        <Row gutter={[24, 24]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-none" style={{ textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", borderRadius: 12 }}>
              <Statistic title={<span className="text-white">Tổng yêu cầu</span>} value={totalRequests} prefix={<UserOutlined />} valueStyle={{ color: "white", fontWeight: 600 }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-none" style={{ textAlign: "center", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white", borderRadius: 12 }}>
              <Statistic title={<span className="text-white">Chờ duyệt</span>} value={pendingRequests} prefix={<ClockCircleOutlined />} valueStyle={{ color: "white", fontWeight: 600 }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-none" style={{ textAlign: "center", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white", borderRadius: 12 }}>
              <Statistic title={<span className="text-white">Đã duyệt</span>} value={approvedRequests} prefix={<CheckCircleOutlined />} valueStyle={{ color: "white", fontWeight: 600 }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-none" style={{ textAlign: "center", background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white", borderRadius: 12 }}>
              <Statistic title={<span className="text-white">Tổng tiền đã thanh toán</span>} value={totalAmount.toLocaleString("vi-VN")} suffix="đ" valueStyle={{ color: "white", fontWeight: 600, fontSize: 18 }} />
            </Card>
          </Col>
        </Row>
      </Card>
      <Card style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}
        title={<Space><DollarOutlined style={{ color: "#2563eb" }} /><Text strong>Danh sách yêu cầu rút tiền</Text></Space>}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Tìm theo tên hoặc email giáo viên..."
              prefix={<SearchOutlined />}
              style={{ borderRadius: 8 }}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
        <Table
          dataSource={filteredRequests.slice().sort((a, b) => {
            const dateA = new Date(String(a.createdAt)).getTime();
            const dateB = new Date(String(b.createdAt)).getTime();
            return dateB - dateA;
          })}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
          }}
          scroll={{ x: 1200 }}
          columns={[
            {
              title: "Giáo viên",
              dataIndex: ["teacherId", "fullname"],
              render: (text, record) => (
                <Space direction="vertical" size={0}>
                  <Text strong className="text-base">{text}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{record.teacherId?.email}</Text>
                  {record.teacherId?.phone && (
                    <Text type="secondary" style={{ fontSize: 12 }}><PhoneOutlined /> {record.teacherId.phone}</Text>
                  )}
                </Space>
              )
            },
            {
              title: "Số tiền",
              dataIndex: "amount",
              render: (amount) => (
                <Text strong style={{ color: "#22c55e", fontSize: 16 }}>{amount?.toLocaleString("vi-VN")} đ</Text>
              ),
              sorter: (a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0),
            },
            {
              title: "Ngày yêu cầu",
              dataIndex: "createdAt",
              render: (d) => <Text type="secondary">{new Date(d).toLocaleString()}</Text>,
              sorter: (a, b) => new Date(String(a.createdAt)).getTime() - new Date(String(b.createdAt)).getTime(),
              defaultSortOrder: 'descend',
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (status) => {
                const statusConfig = {
                  approved: { color: "green", text: "Đã duyệt", icon: <CheckCircleOutlined /> },
                  rejected: { color: "red", text: "Từ chối", icon: <CloseCircleOutlined /> },
                  pending: { color: "orange", text: "Chờ duyệt", icon: <ClockCircleOutlined /> },
                  cancelled: { color: "gray", text: "Đã hủy", icon: <CloseCircleOutlined /> }
                } as const;
                type StatusKey = keyof typeof statusConfig;
                const config = statusConfig[(status as StatusKey)] || statusConfig.pending;
                return (
                  <Tag color={config.color} icon={config.icon} style={{ padding: "4px 10px", borderRadius: 8, fontWeight: 500, fontSize: 14 }}>{config.text}</Tag>
                );
              },
              filters: [
                { text: "Chờ duyệt", value: "pending" },
                { text: "Đã duyệt", value: "approved" },
                { text: "Từ chối", value: "rejected" },
                { text: "Đã hủy", value: "cancelled" }
              ],
              onFilter: (value, record) => record.status === value,
            },
            {
              title: "Thao tác",
              key: "actions",
              render: (_, record) => (
                <Space>
                  <Button type="text" onClick={() => showDetail(record)} icon={<EyeOutlined />} style={{ color: "#2563eb", fontWeight: 600 }}>Chi tiết</Button>
                  {record.status === "pending" && (
                    <>
                      <Button type="primary" onClick={() => handleApprove(record._id)} icon={<CheckCircleOutlined />} style={{ borderRadius: 8, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", fontWeight: 600 }}>Duyệt</Button>
                      <Button danger onClick={() => setRejectModal({ open: true, id: record._id })} icon={<CloseCircleOutlined />} style={{ borderRadius: 8, fontWeight: 600 }}>Từ chối</Button>
                    </>
                  )}
                </Space>
              ),
            },
          ]}
          rowClassName={(record) => {
            if (record.status === "approved") return "table-row-approved";
            if (record.status === "rejected") return "table-row-rejected";
            if (record.status === "cancelled") return "table-row-cancelled";
            return "table-row-pending";
          }}
        />
      </Card>

      {/* Modal Chi tiết */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: "#2563eb" }} />
            <Text strong>Chi tiết yêu cầu rút tiền</Text>
          </Space>
        }
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false })}
        footer={null}
        width={800}
        style={{ borderRadius: 16 }}
      >
        {detailModal.data && (
          <div style={{ padding: "16px 0" }}>
            {/* Thông tin giáo viên */}
            <Card 
              title={
                <Space>
                  <UserOutlined style={{ color: "#2563eb" }} />
                  <Text strong>Thông tin giáo viên</Text>
                </Space>
              }
              style={{ marginBottom: 16, borderRadius: 12 }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  <Avatar 
                    size={64} 
                    src={detailModal.data.teacherId?.avatar}
                    icon={<UserOutlined />}
                    style={{ border: "2px solid #e5e7eb" }}
                  />
                  {!detailModal.data.teacherId?.avatar && (
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Chưa có ảnh</Text>
                    </div>
                  )}
                </Col>
                <Col flex="1">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Họ tên">
                      <Text strong>{detailModal.data.teacherId?.fullname || "Chưa cập nhật"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <Space>
                        <MailOutlined />
                        <Text>{detailModal.data.teacherId?.email || "Chưa cập nhật"}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <Space>
                        <PhoneOutlined />
                        <Text>{detailModal.data.teacherId?.phone || "Chưa cập nhật"}</Text>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Thông tin rút tiền */}
            <Card 
              title={
                <Space>
                  <BankOutlined style={{ color: "#52c41a" }} />
                  <Text strong>Thông tin rút tiền</Text>
                </Space>
              }
              style={{ marginBottom: 16, borderRadius: 12 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Số tiền yêu cầu"
                    value={detailModal.data.amount?.toLocaleString("vi-VN")}
                    suffix="đ"
                    valueStyle={{ color: "#52c41a", fontSize: 24, fontWeight: 600 }}
                  />
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: "right" }}>
                    {(() => {
                      const statusConfig = {
                        approved: { color: "green", text: "Đã duyệt", icon: <CheckCircleOutlined /> },
                        rejected: { color: "red", text: "Từ chối", icon: <CloseCircleOutlined /> },
                        pending: { color: "orange", text: "Chờ duyệt", icon: <ClockCircleOutlined /> },
                        cancelled: { color: "gray", text: "Đã hủy", icon: <CloseCircleOutlined /> }
                      } as const;
                      const config = statusConfig[detailModal.data.status as keyof typeof statusConfig] || statusConfig.pending;
                      return (
                        <Tag color={config.color} icon={config.icon} style={{ padding: "8px 12px", fontSize: 14, fontWeight: 500 }}>
                          {config.text}
                        </Tag>
                      );
                    })()}
                  </div>
                </Col>
              </Row>
              
              <Divider />
              
              <Descriptions title="Thông tin ngân hàng" column={1} size="small">
                <Descriptions.Item label="Ngân hàng">
                  <Text strong>{detailModal.data.bank}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số tài khoản">
                  <Text copyable style={{ fontFamily: "monospace", fontSize: 16 }}>
                    {detailModal.data.account}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Chủ tài khoản">
                  <Text strong>{detailModal.data.holder}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Thông tin thời gian */}
            <Card 
              title={
                <Space>
                  <CalendarOutlined style={{ color: "#722ed1" }} />
                  <Text strong>Thông tin thời gian</Text>
                </Space>
              }
              style={{ marginBottom: 16, borderRadius: 12 }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Ngày tạo yêu cầu">
                  <Text>{new Date(detailModal.data.createdAt).toLocaleDateString("vi-VN")}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian tạo">
                  <Text>{new Date(detailModal.data.createdAt).toLocaleTimeString("vi-VN")}</Text>
                </Descriptions.Item>
                {detailModal.data.updatedAt && detailModal.data.updatedAt !== detailModal.data.createdAt && (
                  <>
                    <Descriptions.Item label="Ngày cập nhật">
                      <Text>{new Date(detailModal.data.updatedAt).toLocaleDateString("vi-VN")}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian cập nhật">
                      <Text>{new Date(detailModal.data.updatedAt).toLocaleTimeString("vi-VN")}</Text>
                    </Descriptions.Item>
                  </>
                )}
                {detailModal.data.cancelledAt && (
                  <>
                    <Descriptions.Item label="Ngày hủy">
                      <Text>{new Date(detailModal.data.cancelledAt).toLocaleDateString("vi-VN")}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian hủy">
                      <Text>{new Date(detailModal.data.cancelledAt).toLocaleTimeString("vi-VN")}</Text>
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            {/* Lý do từ chối (nếu có) */}
            {detailModal.data.status === "rejected" && detailModal.data.note && (
              <Card 
                title={
                  <Space>
                    <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    <Text strong>Lý do từ chối</Text>
                  </Space>
                }
                style={{ borderRadius: 12 }}
              >
                <Text type="danger" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  {detailModal.data.note}
                </Text>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Từ chối */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
            <Text strong>Lý do từ chối yêu cầu rút tiền</Text>
          </Space>
        }
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false })}
        onOk={handleReject}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        confirmLoading={rejecting}
        okButtonProps={{ 
          danger: true,
          style: { borderRadius: 8, fontWeight: 600 }
        }}
        cancelButtonProps={{ 
          style: { borderRadius: 8, fontWeight: 600 }
        }}
        style={{ borderRadius: 16 }}
      >
        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ marginBottom: 8, display: "block" }}>
            Vui lòng nhập lý do từ chối yêu cầu rút tiền này:
          </Text>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            style={{ borderRadius: 8 }}
          />
        </div>
      </Modal>

      <style>{`
        .table-row-approved {
          background-color: #f0fdf4 !important;
        }
        .table-row-rejected {
          background-color: #fef2f2 !important;
        }
        .table-row-pending {
          background-color: #fefce8 !important;
        }
        .table-row-cancelled {
          background-color: #f3f4f6 !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e0e7ff !important;
        }
      `}</style>
    </div>
  );
};

export default WithdrawRequestsAdmin;