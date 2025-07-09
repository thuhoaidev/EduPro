import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, Tag, Button, Modal, Form, InputNumber, Input, message, Popconfirm } from "antd";
import axios from "axios";

const MyEarnings = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [withdrawForm] = Form.useForm();
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/teacher-wallet/wallet", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWallet(res.data.wallet);
    setLoading(false);
  };

  const fetchWithdrawRequests = async () => {
    setLoadingRequests(true);
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/teacher-wallet/my-withdraw-requests", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWithdrawRequests(res.data.requests || []);
    setLoadingRequests(false);
  };

  useEffect(() => {
    fetchWallet();
    fetchWithdrawRequests();
    (window as any).fetchWallet = fetchWallet;
  }, []);

  const handleWithdraw = async (values: any) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/teacher-wallet/withdraw", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đã gửi yêu cầu rút tiền!");
      setIsModalVisible(false);
      await fetchWallet();
      await fetchWithdrawRequests();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi rút tiền");
    }
  };

  const handleCancelWithdraw = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/teacher-wallet/withdraw/${id}/cancel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đã hủy yêu cầu rút tiền!");
      await fetchWallet();
      await fetchWithdrawRequests();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi hủy yêu cầu rút tiền");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Statistic title="Số dư ví" value={wallet?.balance || 0} suffix="đ" />
        <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginTop: 16 }}>
          Rút tiền
        </Button>
      </Card>
      <Table
        dataSource={wallet?.history || []}
        loading={loading}
        rowKey={(r) => r._id}
        columns={[
          { title: "Loại", dataIndex: "type", render: (t) => t === "earning" ? <Tag color="green">Cộng</Tag> : <Tag color="red">Trừ</Tag> },
          { title: "Số tiền", dataIndex: "amount", render: (a) => a.toLocaleString("vi-VN") + " đ" },
          { title: "Ghi chú", dataIndex: "note" },
          { title: "Ngày", dataIndex: "createdAt", render: (d) => new Date(d).toLocaleString() },
        ]}
        style={{ marginTop: 24 }}
      />
      <Card title="Yêu cầu rút tiền của bạn" style={{ marginTop: 32 }}>
        <Table
          dataSource={withdrawRequests}
          loading={loadingRequests}
          rowKey={(r: any) => r._id}
          columns={[
            { title: "Số tiền", dataIndex: "amount", render: (a) => a.toLocaleString("vi-VN") + " đ" },
            { title: "Ngân hàng", dataIndex: "bank" },
            { title: "Số tài khoản", dataIndex: "account" },
            { title: "Chủ tài khoản", dataIndex: "holder" },
            { title: "Trạng thái", dataIndex: "status", render: (s) => s === "pending" ? <Tag color="orange">Chờ duyệt</Tag> : s === "approved" ? <Tag color="green">Đã duyệt</Tag> : <Tag color="red">Từ chối</Tag> },
            { title: "Lý do từ chối", dataIndex: "note", render: (n, r) => r.status === "rejected" ? n : null },
            { title: "Ngày yêu cầu", dataIndex: "createdAt", render: (d) => new Date(d).toLocaleString() },
            {
              title: "Thao tác",
              dataIndex: "_id",
              render: (_id: string, record: any) => record.status === "pending" ? (
                <Popconfirm title="Bạn chắc chắn muốn hủy?" onConfirm={() => handleCancelWithdraw(_id)} okText="Đồng ý" cancelText="Hủy">
                  <Button danger size="small">Hủy</Button>
                </Popconfirm>
              ) : null,
            },
          ]}
        />
      </Card>
      <Modal
        title="Yêu cầu rút tiền"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => withdrawForm.submit()}
        okText="Gửi yêu cầu"
      >
        <Form form={withdrawForm} layout="vertical" onFinish={handleWithdraw}>
          <Form.Item label="Số tiền muốn rút" name="amount" rules={[{ required: true, message: "Nhập số tiền!" }]}> <InputNumber min={10000} style={{ width: "100%" }} placeholder="Nhập số tiền" /> </Form.Item>
          <Form.Item label="Ngân hàng" name="bank" rules={[{ required: true, message: "Nhập tên ngân hàng!" }]}> <Input placeholder="VD: Vietcombank" /> </Form.Item>
          <Form.Item label="Số tài khoản" name="account" rules={[{ required: true, message: "Nhập số tài khoản!" }]}> <Input placeholder="Nhập số tài khoản" /> </Form.Item>
          <Form.Item label="Chủ tài khoản" name="holder" rules={[{ required: true, message: "Nhập tên chủ tài khoản!" }]}> <Input placeholder="Nhập tên chủ tài khoản" /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyEarnings;
