import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Statistic, Tabs } from 'antd';
import { DollarOutlined, HistoryOutlined, WalletOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'withdrawal' | 'course_income';
  status: 'pending' | 'completed' | 'rejected';
  description: string;
}

const Earnings: React.FC = () => {
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - Thay thế bằng data thực tế từ API
  const totalEarnings = 2500000; // 2.5 triệu VND
  const pendingWithdrawals = 500000; // 500k VND
  const availableBalance = totalEarnings - pendingWithdrawals;

  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-03-15',
      amount: 500000,
      type: 'withdrawal',
      status: 'completed',
      description: 'Rút tiền về tài khoản ngân hàng'
    },
    {
      id: '2',
      date: '2024-03-10',
      amount: 300000,
      type: 'course_income',
      status: 'completed',
      description: 'Thu nhập từ khóa học React cơ bản'
    },
    // Thêm các giao dịch khác...
  ];

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type === 'withdrawal' ? 'Rút tiền' : 'Thu nhập khóa học',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { text: 'Đang xử lý', color: 'warning' },
          completed: { text: 'Thành công', color: 'success' },
          rejected: { text: 'Từ chối', color: 'error' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <span style={{ color: config.color }}>{config.text}</span>;
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const handleWithdraw = async (values: any) => {
    try {
      // Gọi API rút tiền ở đây
      console.log('Withdraw values:', values);
      message.success('Yêu cầu rút tiền đã được gửi thành công!');
      setIsWithdrawModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi gửi yêu cầu rút tiền!');
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Tổng quan',
      children: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <Statistic
              title="Tổng thu nhập"
              value={totalEarnings}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="VND"
            />
          </Card>
          <Card>
            <Statistic
              title="Số dư khả dụng"
              value={availableBalance}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<WalletOutlined />}
              suffix="VND"
            />
          </Card>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={pendingWithdrawals}
              precision={0}
              valueStyle={{ color: '#faad14' }}
              prefix={<HistoryOutlined />}
              suffix="VND"
            />
          </Card>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Lịch sử giao dịch',
      children: (
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thu nhập</h1>
        <Button
          type="primary"
          size="large"
          onClick={() => setIsWithdrawModalVisible(true)}
          disabled={availableBalance <= 0}
        >
          Rút tiền
        </Button>
      </div>

      <Tabs defaultActiveKey="1" items={items} />

      <Modal
        title="Yêu cầu rút tiền"
        open={isWithdrawModalVisible}
        onCancel={() => setIsWithdrawModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleWithdraw}
        >
          <Form.Item
            label="Số tiền muốn rút"
            name="amount"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền!' },
              { type: 'number', min: 100000, message: 'Số tiền tối thiểu là 100,000 VND!' },
              { type: 'number', max: availableBalance, message: 'Số tiền không được vượt quá số dư khả dụng!' },
            ]}
          >
            <Input
              type="number"
              prefix="VND"
              placeholder="Nhập số tiền muốn rút"
            />
          </Form.Item>

          <Form.Item
            label="Số tài khoản ngân hàng"
            name="bankAccount"
            rules={[
              { required: true, message: 'Vui lòng nhập số tài khoản!' },
              { pattern: /^\d+$/, message: 'Số tài khoản chỉ được chứa số!' },
            ]}
          >
            <Input placeholder="Nhập số tài khoản ngân hàng" />
          </Form.Item>

          <Form.Item
            label="Tên ngân hàng"
            name="bankName"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng!' }]}
          >
            <Input placeholder="Nhập tên ngân hàng" />
          </Form.Item>

          <Form.Item
            label="Chủ tài khoản"
            name="accountHolder"
            rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản!' }]}
          >
            <Input placeholder="Nhập tên chủ tài khoản" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsWithdrawModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Xác nhận rút tiền
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Earnings; 