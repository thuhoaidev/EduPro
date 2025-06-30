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
  message,
  Modal,
  Form,
  InputNumber,
  Input,
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
const { Option } = Select;

const EarningsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    totalWithdrawn: 0,
    balance: 0,
  });
  const [filterType, setFilterType] = useState<"all" | "earning" | "withdrawal">("all");
  const [filterDateRange, setFilterDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [withdrawForm] = Form.useForm();

  useEffect(() => {
    const fetchMockData = async () => {
      await new Promise((res) => setTimeout(res, 200));
      const mockData: Transaction[] = [
        {
          id: 1,
          date: "2025-05-20",
          course: { id: 101, title: "React từ A-Z" },
          amount: 990000,
          type: "earning",
          status: "completed",
        },
        {
          id: 2,
          date: "2025-05-21",
          course: { id: 102, title: "NodeJS nâng cao" },
          amount: 499000,
          type: "earning",
          status: "completed",
        },
        {
          id: 3,
          date: "2025-05-22",
          course: { id: 0, title: "Rút tiền" },
          amount: 800000,
          type: "withdrawal",
          status: "completed",
          bank: "Vietcombank",
          account: "0123456789",
          holder: "Nguyễn Văn A",
        },
        {
          id: 4,
          date: "2025-05-23",
          course: { id: 0, title: "Rút tiền" },
          amount: 300000,
          type: "withdrawal",
          status: "pending",
          bank: "Techcombank",
          account: "0987654321",
          holder: "Nguyễn Văn A",
        },
      ];
      setTransactions(mockData);
      recalcSummary(mockData);
    };
    fetchMockData();
  }, []);

  const recalcSummary = (txs: Transaction[]) => {
    const totalEarnings = txs
      .filter((t) => t.type === "earning" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawn = txs
      .filter((t) => t.type === "withdrawal" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    setSummary({ totalEarnings, totalWithdrawn, balance: totalEarnings - totalWithdrawn });
  };

  const columns: ColumnsType<Transaction> = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Doanh thu", value: "earning" },
        { text: "Rút tiền", value: "withdrawal" },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) =>
        type === "earning" ? <Tag color="green">Doanh thu</Tag> : <Tag color="blue">Rút tiền</Tag>,
      width: 120,
    },
    { title: "Khóa học / Giao dịch", dataIndex: "course", key: "course", render: (c) => c.title },
    {
      title: "Ngân hàng",
      dataIndex: "bank",
      key: "bank",
      render: (bank, record) => (record.type === "withdrawal" ? bank || "-" : "-"),
    },
    {
      title: "Số tài khoản",
      dataIndex: "account",
      key: "account",
      render: (acc, record) => (record.type === "withdrawal" ? acc || "-" : "-"),
    },
    {
      title: "Chủ tài khoản",
      dataIndex: "holder",
      key: "holder",
      render: (h, record) => (record.type === "withdrawal" ? h || "-" : "-"),
    },
    {
      title: "Số tiền (VNĐ)",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => amount.toLocaleString("vi-VN"),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Đang chờ", value: "pending" },
        { text: "Thất bại", value: "failed" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) =>
        status === "completed" ? (
          <Tag color="green">Hoàn thành</Tag>
        ) : status === "pending" ? (
          <Tag color="orange">Đang chờ</Tag>
        ) : (
          <Tag color="red">Thất bại</Tag>
        ),
      width: 120,
    },
  ];

  const showWithdrawModal = () => {
    withdrawForm.resetFields();
    setIsModalVisible(true);
  };

  const handleWithdraw = (values: {
    amount: number;
    bank: string;
    account: string;
    holder: string;
  }) => {
    const { amount, bank, account, holder } = values;
    if (amount > summary.balance) {
      message.error("Số tiền rút không thể lớn hơn số dư!");
      return;
    }
    const newTx: Transaction = {
      id: transactions.length + 1,
      date: dayjs().format("YYYY-MM-DD"),
      course: { id: 0, title: "Rút tiền" },
      amount,
      type: "withdrawal",
      status: "pending",
      bank,
      account,
      holder,
    };
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    recalcSummary(updatedTxs);
    setIsModalVisible(false);
    message.success("Yêu cầu rút tiền đã tạo, đang chờ xử lý.");
  };

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    if (!dates) {
      setFilterDateRange(null);
      return;
    }
    const [start, end] = dates;
    if (start && end) {
      setFilterDateRange([start, end]);
    } else {
      setFilterDateRange(null);
    }
  };

  const filteredData = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterDateRange) {
      const date = dayjs(t.date);
      const [start, end] = filterDateRange;
      if (date.isBefore(start.startOf("day")) || date.isAfter(end.endOf("day")))
        return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Card variant="outlined" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Tổng doanh thu"
              value={summary.totalEarnings.toLocaleString("vi-VN")}
              suffix="VNĐ"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Đã rút"
              value={summary.totalWithdrawn.toLocaleString("vi-VN")}
              suffix="VNĐ"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Số dư hiện tại"
              value={summary.balance.toLocaleString("vi-VN")}
              suffix="VNĐ"
            />
          </Col>
        </Row>
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button type="primary" onClick={showWithdrawModal}>
            Yêu cầu rút tiền
          </Button>
        </div>
      </Card>

      <Card variant="outlined" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Select defaultValue="all" style={{ width: 160 }} onChange={setFilterType}>
              <Option value="all">Tất cả</Option>
              <Option value="earning">Doanh thu</Option>
              <Option value="withdrawal">Rút tiền</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker onChange={handleDateRangeChange} />
          </Col>
          <Col>
            <Button onClick={() => message.info("Đã áp dụng bộ lọc!")}>Lọc</Button>
          </Col>
        </Row>
      </Card>

      <Card variant="outlined">
        <Table<Transaction>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title="Yêu cầu rút tiền"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={withdrawForm} layout="vertical" onFinish={handleWithdraw}>
          <Form.Item
            label="Số tiền cần rút (VNĐ)"
            name="amount"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền!" },
              {
                validator: (_, value) =>
                  value <= 0 ? Promise.reject("Số tiền phải lớn hơn 0!") : Promise.resolve(),
              },
            ]}
          >
            <InputNumber<number>
              style={{ width: "100%" }}
              min={1}
              formatter={(v) => (v ? v.toLocaleString("vi-VN") : "")}
              parser={(dv) => (dv ? parseInt(dv.replace(/\D/g, ""), 10) : 0)}
            />
          </Form.Item>

          <Form.Item label="Ngân hàng" name="bank" rules={[{ required: true, message: "Chọn ngân hàng!" }]}>
            <Select placeholder="Chọn ngân hàng">
              <Option value="Vietcombank">Vietcombank</Option>
              <Option value="Techcombank">Techcombank</Option>
              <Option value="BIDV">BIDV</Option>
              <Option value="ACB">ACB</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Số tài khoản"
            name="account"
            rules={[
              { required: true, message: "Nhập số tài khoản!" },
              { pattern: /^\d+$/, message: "Chỉ được nhập chữ số!" },
            ]}
          >
            <Input placeholder="Nhập số tài khoản (chỉ chữ số)" />
          </Form.Item>

          <Form.Item
            label="Chủ tài khoản"
            name="holder"
            rules={[{ required: true, message: "Nhập tên chủ tài khoản!" }]}
          >
            <Input placeholder="Nhập tên chủ tài khoản" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EarningsPage;
