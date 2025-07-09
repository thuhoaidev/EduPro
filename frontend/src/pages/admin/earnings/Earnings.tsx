import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message, Modal, Input } from "antd";
import axios from "axios";

const WithdrawRequestsAdmin = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

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

  return (
    <>
      <Table
        dataSource={requests}
        rowKey="_id"
        loading={loading}
        columns={[
          { title: "Giáo viên", dataIndex: ["teacherId", "fullname"] },
          { title: "Email", dataIndex: ["teacherId", "email"] },
          { title: "Số tiền", dataIndex: "amount", render: (a) => a.toLocaleString("vi-VN") + " đ" },
          { title: "Ngân hàng", dataIndex: "bank" },
          { title: "Số tài khoản", dataIndex: "account" },
          { title: "Chủ tài khoản", dataIndex: "holder" },
          { title: "Trạng thái", dataIndex: "status", render: (s) => s === "approved" ? <Tag color="green">Đã duyệt</Tag> : s === "rejected" ? <Tag color="red">Từ chối</Tag> : <Tag color="orange">Chờ duyệt</Tag> },
          { title: "Lý do từ chối", dataIndex: "note", render: (n, r) => r.status === "rejected" ? n : null },
          { title: "Ngày yêu cầu", dataIndex: "createdAt", render: (d) => new Date(d).toLocaleString() },
          {
            title: "",
            render: (_, record) =>
              record.status === "pending" ? (
                <>
                  <Button type="primary" onClick={() => handleApprove(record._id)} style={{ marginRight: 8 }}>
                    Duyệt
                  </Button>
                  <Button danger onClick={() => setRejectModal({ open: true, id: record._id })}>
                    Từ chối
                  </Button>
                </>
              ) : null,
          },
        ]}
      />
      <Modal
        title="Lý do từ chối yêu cầu rút tiền"
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false })}
        onOk={handleReject}
        okText="Xác nhận từ chối"
        confirmLoading={rejecting}
      >
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>
    </>
  );
};

export default WithdrawRequestsAdmin;