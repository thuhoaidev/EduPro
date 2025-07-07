import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Tag,
  Select,
  DatePicker,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

interface Transaction {
  id: number;
  date: string;
  course: { id: number; title: string };
  amount: number;
  type: "earning" | "withdrawal";
  status: "completed" | "pending" | "failed";
  bank?: string;
  account?: string;
  holder?: string;
}

interface EarningsSummary {
  totalEarnings: number;
  totalWithdrawn: number;
  balance: number;
}

const { RangePicker } = DatePicker;

const MyEarnings: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({ totalEarnings: 0, totalWithdrawn: 0, balance: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [withdrawForm] = Form.useForm();

  useEffect(() => {
    const mockData: Transaction[] = [
      { id: 1, date: "2025-05-20", course: { id: 101, title: "React từ A-Z" }, amount: 990000, type: "earning", status: "completed" },
      { id: 2, date: "2025-05-21", course: { id: 102, title: "NodeJS nâng cao" }, amount: 499000, type: "earning", status: "completed" },
      { id: 3, date: "2025-05-22", course: { id: 0, title: "Rút tiền" }, amount: 800000, type: "withdrawal", status: "completed", bank: "Vietcombank", account: "0123456789", holder: "Nguyễn Văn A" },
      { id: 4, date: "2025-05-23", course: { id: 0, title: "Rút tiền" }, amount: 300000, type: "withdrawal", status: "pending", bank: "Techcombank", account: "0987654321", holder: "Nguyễn Văn A" },
    ];
    setTransactions(mockData);
    recalcSummary(mockData);
  }, []);

  const recalcSummary = (txs: Transaction[]) => {
    const totalEarnings = txs.filter((t) => t.type === "earning" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawn = txs.filter((t) => t.type === "withdrawal" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
    setSummary({ totalEarnings, totalWithdrawn, balance: totalEarnings - totalWithdrawn });
  };

  const columns: ColumnsType<Transaction> = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Ngày", dataIndex: "date", key: "date", render: (date) => dayjs(date).format("DD/MM/YYYY") },
    { title: "Loại", dataIndex: "type", key: "type", render: (type) => type === "earning" ? <Tag color="green">Doanh thu</Tag> : <Tag color="blue">Rút tiền</Tag>, width: 120 },
    { title: "Khóa học / Giao dịch", dataIndex: ["course", "title"], key: "course" },
    { title: "Ngân hàng", dataIndex: "bank", key: "bank", render: (bank, record) => (record.type === "withdrawal" ? bank || "-" : "-") },
    { title: "Số tài khoản", dataIndex: "account", key: "account", render: (acc, record) => (record.type === "withdrawal" ? acc || "-" : "-") },
    { title: "Chủ tài khoản", dataIndex: "holder", key: "holder", render: (h, record) => (record.type === "withdrawal" ? h || "-" : "-") },
    { title: "Số tiền (VNĐ)", dataIndex: "amount", key: "amount", render: (amount) => amount.toLocaleString("vi-VN") },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (status) => status === "completed" ? (<Tag color="green">Hoàn thành</Tag>) : status === "pending" ? (<Tag color="orange">Đang chờ</Tag>) : (<Tag color="red">Thất bại</Tag>), width: 120 },
  ];

  const showWithdrawModal = () => {
    withdrawForm.resetFields();
    setIsModalVisible(true);
  };

  const handleWithdraw = (values: { amount: number; bank: string; account: string; holder: string; }) => {
    if (values.amount > summary.balance) {
      message.error("Số tiền rút không thể lớn hơn số dư!");
      return;
    }
    setIsModalVisible(false);
    message.success("Yêu cầu rút tiền đã được gửi!");
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Tổng thu nhập" value={summary.totalEarnings} suffix="đ" valueStyle={{ color: '#1a73e8' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Đã rút" value={summary.totalWithdrawn} suffix="đ" valueStyle={{ color: '#34a853' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Số dư" value={summary.balance} suffix="đ" valueStyle={{ color: '#fbbc05' }} /></Card>
        </Col>
      </Row>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={showWithdrawModal}>Rút tiền</Button>
      </Card>
      <Table columns={columns} dataSource={transactions} rowKey="id" pagination={{ pageSize: 8 }} />
      <Modal
        title="Yêu cầu rút tiền"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => withdrawForm.submit()}
        okText="Gửi yêu cầu"
      >
        <Form form={withdrawForm} layout="vertical" onFinish={handleWithdraw}>
          <Form.Item label="Số tiền muốn rút" name="amount" rules={[{ required: true, message: "Nhập số tiền!" }]}> <InputNumber min={10000} style={{ width: '100%' }} placeholder="Nhập số tiền" /> </Form.Item>
          <Form.Item label="Ngân hàng" name="bank" rules={[{ required: true, message: "Nhập tên ngân hàng!" }]}> <Input placeholder="VD: Vietcombank" /> </Form.Item>
          <Form.Item label="Số tài khoản" name="account" rules={[{ required: true, message: "Nhập số tài khoản!" }]}> <Input placeholder="Nhập số tài khoản" /> </Form.Item>
          <Form.Item label="Chủ tài khoản" name="holder" rules={[{ required: true, message: "Nhập tên chủ tài khoản!" }]}> <Input placeholder="Nhập tên chủ tài khoản" /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyEarnings; 