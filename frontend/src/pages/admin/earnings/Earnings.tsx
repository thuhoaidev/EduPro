import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message } from "antd";
import axios from "axios";

const WithdrawRequestsAdmin = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
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
        { title: "Trạng thái", dataIndex: "status", render: (s) => s === "approved" ? <Tag color="green">Đã duyệt</Tag> : <Tag color="orange">Chờ duyệt</Tag> },
        { title: "Ngày yêu cầu", dataIndex: "createdAt", render: (d) => new Date(d).toLocaleString() },
        {
          title: "",
          render: (_, record) =>
            record.status === "pending" ? (
              <Button type="primary" onClick={() => handleApprove(record._id)}>
                Duyệt
              </Button>
            ) : null,
        },
      ]}
    />
  );
};

export default WithdrawRequestsAdmin;