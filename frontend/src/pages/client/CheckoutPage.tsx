import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Button, Typography, Divider, message, Form, Input, Select, Spin, Result, Steps
} from 'antd';
import {
  ShoppingCartOutlined, CreditCardOutlined, CheckCircleOutlined,
  UserOutlined, PhoneOutlined, MailOutlined, BankOutlined, WalletOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/Auths/useAuth';
import orderService from '../../services/orderService';
import axios from 'axios';
import type { CreateOrderData } from '../../services/orderService';
import { useCart } from '../../contexts/CartContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormValues {
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay';
  notes?: string;
}

interface CheckoutItem {
  courseId: string;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
}

interface CheckoutData {
  items: CheckoutItem[];
  voucherCode?: string;
  voucherValidation?: {
    discountAmount: number;
    code: string;
  };
  subtotal: number;
  discount: number;
  total: number;
}

const CheckoutPage: React.FC = () => {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { user, token } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  useEffect(() => {
    const saved = localStorage.getItem('checkoutData');
    if (!saved) {
      message.error('Không tìm thấy dữ liệu đơn hàng');
      navigate('/cart');
      return;
    }
    try {
      setCheckoutData(JSON.parse(saved));
    } catch {
      message.error('Dữ liệu đơn hàng không hợp lệ');
      navigate('/cart');
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullname,
        phone: user.phone || '',
        email: user.email,
      });
    }
  }, [user, form]);

const handleSubmit = async (values: FormValues) => {
  if (!checkoutData || !token) {
    message.error('Dữ liệu không hợp lệ');
    return;
  }

  setIsSubmitting(true);

  try {
    // Dữ liệu đơn hàng sẽ gửi lên backend hoặc lưu localStorage
    const orderPayload = {
      items: checkoutData.items.map(item => ({
        courseId: item.courseId, // item.courseId đã được lưu đúng từ CartPage
        quantity: item.quantity
      })),
      voucherCode: checkoutData.voucherCode,
      paymentMethod: values.paymentMethod,
      fullName: values.fullName,
      phone: values.phone,
      email: values.email,
      notes: values.notes
    };

    // Nếu chọn VNPAY
    if (values.paymentMethod === 'vnpay') {
      localStorage.setItem('pendingOrder', JSON.stringify(orderPayload));

      const { data: res } = await axios.get(
        `http://localhost:5000/create_payment?amount=${checkoutData.total}`
      );

      window.location.href = res.paymentUrl;
      return;
    }

    // Nếu chọn MOMO
    if (values.paymentMethod === 'momo') {
      localStorage.setItem('pendingOrder', JSON.stringify(orderPayload));

      const { data: res } = await axios.post(
        `http://localhost:5000/create_momo_payment`,
        {
          amount: checkoutData.total,
          name: values.fullName,
          email: values.email
        }
      );

      window.location.href = res.payUrl;
      return;
    }
    // Nếu chọn ZaloPay
    if (values.paymentMethod === 'zalopay') {
       localStorage.setItem('pendingOrder', JSON.stringify(orderPayload));

    const { data: res } = await axios.post(
       `http://localhost:5000/create_zalopay_payment`,
    {
      amount: checkoutData.total,
      name: values.fullName,
      email: values.email
    }
    );

  window.location.href = res.payUrl;
  return;
}


    // Với các phương thức còn lại (nội bộ)
    const createOrderPayload: CreateOrderData = {
      items: orderPayload.items,
      voucherCode: orderPayload.voucherCode,
      paymentMethod: values.paymentMethod,
      shippingInfo: {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email
      },
      notes: values.notes
    };

    const response = await orderService.createOrder(createOrderPayload, token);

    setOrderId(response.order.id);
    setOrderSuccess(true);
    localStorage.removeItem('checkoutData');
    clearCart(); // Xóa giỏ hàng ở context sau khi thanh toán thành công
    // Cập nhật lại user sau khi thanh toán
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        let userData = res.data.user || res.data;
        // Đảm bảo luôn có user.role.name
        if (!userData.role && userData.role_id && userData.role_id.name) {
          userData.role = { name: userData.role_id.name };
        }
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.role && userData.role.name) {
          localStorage.setItem('role', userData.role.name);
        } else if (typeof userData.role === 'string') {
          localStorage.setItem('role', userData.role);
        }
        // Reload lại trang để context/layout nhận diện quyền mới nhất
        window.location.reload();
      }
    } catch (err) {
      // Không cần xử lý lỗi ở đây
    }
    message.success('Thanh toán thành công!');
  } catch (error) {
    console.error('Create order error:', error);
    message.error('Có lỗi khi thanh toán');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleBackToCart = () => {
    if (checkoutData?.voucherValidation) {
      localStorage.setItem('cartVoucherData', JSON.stringify({
        voucher: checkoutData.voucherCode,
        voucherValidation: checkoutData.voucherValidation
      }));
    }
    navigate('/cart');
  };

  const handleViewOrders = () => navigate('/profile/orders');

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;
  if (!checkoutData) return <Result status="error" title="Không tìm thấy dữ liệu đơn hàng" />;
  if (orderSuccess) return (
    <Result
      status="success"
      title="Thanh toán thành công!"
      subTitle={`Mã đơn hàng: ${orderId}`}
      extra={[
        <Button key="orders" onClick={handleViewOrders}>Xem đơn hàng</Button>,
        <Button key="home" type="default" onClick={() => navigate('/')}>Về trang chủ</Button>
      ]}
    />
  );

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <Title level={2}><CreditCardOutlined /> Thanh toán</Title>
      <Steps current={0} items={[{ title: 'Thông tin' }, { title: 'Thanh toán' }, { title: 'Hoàn thành' }]} />
      <Row gutter={24} className="mt-6">
        <Col xs={24} lg={12}>
          <Card title={<><ShoppingCartOutlined /> Tóm tắt đơn hàng</>} className="shadow-md">
            {checkoutData.items.map(item => (
              <div key={item.courseId} className="flex items-center gap-4 mb-4">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-20 h-16 object-cover rounded border shadow-sm"
                />
                <div className="flex-1">
                  <Text strong>{item.title}</Text>
                  <div className="text-xs text-gray-500">Số lượng: {item.quantity}</div>
                </div>
                <Text>{formatCurrency(item.price)}</Text>
              </div>
            ))}
            <Divider />
            {checkoutData.voucherValidation && (
              <div className="bg-blue-50 p-2 rounded text-sm mb-2 text-blue-700">
                Mã giảm giá <strong>{checkoutData.voucherValidation.code}</strong> đã áp dụng: 
                <span className="text-green-600"> -{formatCurrency(checkoutData.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <Text strong>Tổng cộng:</Text>
              <Text strong className="text-red-500">{formatCurrency(checkoutData.total)}</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<><UserOutlined /> Thông tin thanh toán</>} className="shadow-md">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} />
              </Form.Item>
              <Form.Item name="paymentMethod" label="Phương thức thanh toán" rules={[{ required: true }]}>
                <Select>
                  <Option value="momo"><WalletOutlined /> MoMo</Option>
                  <Option value="vnpay"><WalletOutlined /> VNPAY</Option>
                  <Option value="zalopay"><WalletOutlined /> ZaloPay</Option>
                </Select>
              </Form.Item>
              <Form.Item name="notes" label="Ghi chú">
                <TextArea rows={3} />
              </Form.Item>
              <div className="flex gap-4">
                <Button onClick={handleBackToCart}>Quay lại</Button>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>Thanh toán</Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;
