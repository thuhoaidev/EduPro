import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Typography, Space, Divider } from "antd";
import { DollarOutlined, BankOutlined, CalculatorOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

interface WithdrawModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  walletBalance: number;
  loading: boolean;
}

// Danh sách ngân hàng Việt Nam
const vietnameseBanks = [
  { value: "Vietcombank", label: "Vietcombank" },
  { value: "BIDV", label: "BIDV" },
  { value: "Agribank", label: "Agribank" },
  { value: "VietinBank", label: "VietinBank" },
  { value: "Techcombank", label: "Techcombank" },
  { value: "MB Bank", label: "MB Bank" },
  { value: "ACB", label: "ACB" },
  { value: "Sacombank", label: "Sacombank" },
  { value: "VPBank", label: "VPBank" },
  { value: "TPBank", label: "TPBank" },
  { value: "HDBank", label: "HDBank" },
  { value: "SHB", label: "SHB" },
  { value: "VIB", label: "VIB" },
  { value: "MSB", label: "MSB" },
  { value: "SeABank", label: "SeABank" },
  { value: "OCB", label: "OCB" },
  { value: "BacABank", label: "BacABank" },
  { value: "SCB", label: "SCB" },
  { value: "Eximbank", label: "Eximbank" },
  { value: "LienVietPostBank", label: "LienVietPostBank" },
  { value: "KienLongBank", label: "KienLongBank" },
  { value: "NamABank", label: "NamABank" },
  { value: "VIB", label: "VIB" },
  { value: "Other", label: "Ngân hàng khác" }
];

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  walletBalance,
  loading,
}) => {
  const [form] = Form.useForm();
  const [amount, setAmount] = useState<number>(0);

  const handleAmountChange = (value: number | null) => {
    setAmount(value || 0);
  };

  const calculateTax = (amount: number) => {
    return amount * 0.03; // 3% thuế
  };

  const calculateNetAmount = (amount: number) => {
    return amount - calculateTax(amount);
  };

  const handleSubmit = (values: any) => {
    const netAmount = calculateNetAmount(values.amount);
    onSubmit({
      ...values,
      amount: values.amount,
      netAmount: netAmount,
      tax: calculateTax(values.amount)
    });
  };

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined style={{ color: "#2563eb" }} />
          <span className="text-lg font-bold text-blue-600">Yêu cầu rút tiền</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Gửi yêu cầu"
      cancelText="Hủy"
      confirmLoading={loading}
      className="rounded-xl"
      width={600}
      okButtonProps={{
        style: { 
          borderRadius: 8, 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
          border: "none", 
          fontWeight: 600 
        }
      }}
      cancelButtonProps={{
        style: { borderRadius: 8, fontWeight: 600 }
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
        <Form.Item
          label={<span className="font-medium">Số tiền muốn rút</span>}
          name="amount"
          rules={[
            { required: true, message: "Vui lòng nhập số tiền!" },
            { 
              type: "number", 
              min: 50000, 
              message: "Số tiền tối thiểu là 50.000đ!" 
            },
            { 
              type: "number", 
              max: walletBalance, 
              message: `Số tiền không được vượt quá số dư hiện tại (${walletBalance.toLocaleString("vi-VN")}đ)!` 
            },
          ]}
        >
          <InputNumber
            className="w-full border rounded-md px-3 py-2"
            placeholder="Nhập số tiền (tối thiểu 50.000đ)"
            min={50000}
            max={walletBalance}
            onChange={handleAmountChange}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Thông tin tính toán */}
        {amount > 0 && (
          <div style={{ 
            background: "#f8f9fa", 
            padding: "16px", 
            borderRadius: "8px", 
            border: "1px solid #e9ecef" 
          }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Số tiền yêu cầu:</Text>
                <Text strong>{amount.toLocaleString("vi-VN")}đ</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Thuế (3%):</Text>
                <Text type="danger">-{calculateTax(amount).toLocaleString("vi-VN")}đ</Text>
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong>Số tiền thực nhận:</Text>
                <Text strong style={{ color: "#22c55e", fontSize: "16px" }}>
                  {calculateNetAmount(amount).toLocaleString("vi-VN")}đ
                </Text>
              </div>
            </Space>
          </div>
        )}

        <Form.Item 
          label={<span className="font-medium">Ngân hàng</span>} 
          name="bank" 
          rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
        >
          <Select
            placeholder="Chọn ngân hàng"
            className="w-full"
            showSearch
            filterOption={(input, option) => {
              const label = option?.label;
              if (typeof label === 'string') {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
          >
            {vietnameseBanks.map(bank => (
              <Option key={bank.value} value={bank.value} label={bank.label}>
                <Space>
                  <BankOutlined />
                  {bank.label}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          label={<span className="font-medium">Số tài khoản</span>} 
          name="account" 
          rules={[
            { required: true, message: "Vui lòng nhập số tài khoản!" },
            { pattern: /^\d+$/, message: "Số tài khoản chỉ được chứa số!" }
          ]}
        >
          <Input 
            className="w-full border rounded-md px-3 py-2" 
            placeholder="Nhập số tài khoản (chỉ số)" 
            maxLength={20}
          />
        </Form.Item>

        <Form.Item 
          label={<span className="font-medium">Chủ tài khoản</span>} 
          name="holder" 
          rules={[
            { required: true, message: "Vui lòng nhập tên chủ tài khoản!" },
            { min: 2, message: "Tên chủ tài khoản phải có ít nhất 2 ký tự!" }
          ]}
        >
          <Input 
            className="w-full border rounded-md px-3 py-2" 
            placeholder="Nhập tên chủ tài khoản (viết hoa)" 
            maxLength={50}
          />
        </Form.Item>

        <div style={{ 
          background: "#fff7e6", 
          padding: "12px", 
          borderRadius: "6px", 
          border: "1px solid #ffd591" 
        }}>
          <Text type="warning" style={{ fontSize: "12px" }}>
            <CalculatorOutlined style={{ marginRight: "4px" }} />
            Lưu ý: Số tiền thực nhận sẽ bị trừ 3% thuế phí giao dịch.
          </Text>
        </div>
      </Form>
    </Modal>
  );
};

export default WithdrawModal; 