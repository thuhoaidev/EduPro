import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, Tag, Button, Modal, Form, InputNumber, Input, message } from "antd";
import axios from "axios";

const MyEarnings = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [withdrawForm] = Form.useForm();

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/teacher-wallet/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallet(res.data.wallet);
      setLoading(false);
    };
    fetchWallet();
  }, []);

  const handleWithdraw = async (values: any) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/teacher-wallet/withdraw", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đã gửi yêu cầu rút tiền!");
      setIsModalVisible(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi rút tiền");
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
      <Modal
        title="Yêu cầu rút tiền"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => withdrawForm.submit()}
        okText="Gửi yêu cầu"
      >
        <Form form={withdrawForm} layout="vertical" onFinish={handleWithdraw}>
          <Form.Item label="Số tiền muốn rút" name="amount" rules={[{ required: true, message: "Nhập số tiền!" }]}>
            <InputNumber min={10000} style={{ width: "100%" }} placeholder="Nhập số tiền" />
          </Form.Item>
          <Form.Item label="Ngân hàng" name="bank" rules={[{ required: true, message: "Nhập tên ngân hàng!" }]}>
            <Input placeholder="VD: Vietcombank" />
          </Form.Item>
          <Form.Item label="Số tài khoản" name="account" rules={[{ required: true, message: "Nhập số tài khoản!" }]}>
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>
          <Form.Item label="Chủ tài khoản" name="holder" rules={[{ required: true, message: "Nhập tên chủ tài khoản!" }]}>
            <Input placeholder="Nhập tên chủ tài khoản" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyEarnings;
