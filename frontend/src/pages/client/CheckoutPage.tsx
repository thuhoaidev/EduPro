import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';
import {
  Row, Col, Card, Button, Typography, Divider, message, Form, Input, Select, Spin, Result, Steps
} from 'antd';
import {
  ShoppingCartOutlined, CreditCardOutlined,
  UserOutlined, PhoneOutlined, MailOutlined, WalletOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/Auths/useAuth';
import orderService from '../../services/orderService';
import config from '../../api/axios';
import type { CreateOrderData } from '../../services/orderService';
import { useCart } from '../../contexts/CartContext';
import { Card as AntCard } from 'antd'; // Để tránh trùng tên Card

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormValues {
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay' | 'wallet';
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
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // const [zalopayUrl, setZalopayUrl] = useState(''); // Không dùng

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

  useEffect(() => {
    // Lấy số dư ví
    const fetchWallet = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/wallet', {
          headers: { Authorization: 'Bearer ' + token }
        });
        const json = await res.json();
        if (json.success) setWalletBalance(json.balance);
      } catch {}
    };
    fetchWallet();
  }, [token]);

const handleSubmit = async (values: FormValues) => {
  if (!checkoutData || !token) {
    message.error('Dữ liệu không hợp lệ');
    return;
  }

  setIsSubmitting(true);

  try {
    const orderPayload = {
      items: checkoutData.items.map(item => ({
        courseId: item.courseId,
        quantity: item.quantity
      })),
      voucherCode: checkoutData.voucherCode,
      paymentMethod: values.paymentMethod,
      fullName: values.fullName,
      phone: values.phone,
      email: values.email,
      notes: values.notes
    };

    // ✅ Nếu chọn VNPAY
    if (values.paymentMethod === 'vnpay') {
      localStorage.setItem('pendingOrder', JSON.stringify(orderPayload));

      const { data: res } = await config.get(
        `/create_payment?amount=${checkoutData.total}`
      );

      window.location.href = res.paymentUrl;
      return;
    }

    // ✅ Nếu chọn MOMO
    if (values.paymentMethod === 'momo') {
  localStorage.setItem('pendingOrder', JSON.stringify(orderPayload));

  const { data: res } = await config.post(
    `/payment-momo/create_momo_payment`,
    {
      amount: checkoutData.total,
      name: values.fullName,
      email: values.email
    }
  );

  window.location.href = res.payUrl;
  return;
}

    // ✅ Nếu chọn ZaloPay → chuyển thẳng luôn
    if (values.paymentMethod === 'zalopay') {
      localStorage.setItem('pendingOrder', JSON.stringify(orderPayload));

      const { data: res } = await config.post(
        `/payment-zalo/create_zalopay_payment`,
        {
          amount: checkoutData.total,
          name: values.fullName,
          email: values.email
        }
      );

      window.location.href = res.payUrl;
      return;
    }

    // Thêm xử lý cho ví
    if (values.paymentMethod === 'wallet') {
      if (walletBalance < checkoutData.total) {
        message.error('Số dư ví không đủ để thanh toán!');
        setIsSubmitting(false);
        return;
      }
      // Gọi API tạo đơn hàng với paymentMethod: 'wallet'
      const createOrderPayload: CreateOrderData = {
        items: orderPayload.items,
        voucherCode: orderPayload.voucherCode,
        paymentMethod: 'bank_transfer',
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
      clearCart();
      message.success('Thanh toán bằng ví thành công!');
      setIsSubmitting(false);
      return;
    }

    // ✅ Với các phương thức còn lại
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
        const res = await config.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = res.data.user || res.data;
        if (!userData.role && userData.role_id?.name) {
          userData.role = { name: userData.role_id.name };
        }

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userData.role?.name || userData.role || '');
      }
    } catch {
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

  if (loading) return (
    <div className="checkout-loading-container">
      <Spin size="large" />
    </div>
  );
  if (!checkoutData) return (
    <div className="checkout-error-container">
      <Result status="error" title="Không tìm thấy dữ liệu đơn hàng" />
    </div>
  );
  if (orderSuccess) return (
    <div className="checkout-success-container">
      <Result
        status="success"
        title="Thanh toán thành công!"
        subTitle={`Mã đơn hàng: ${orderId}`}
        extra={[
          <Button key="orders" onClick={handleViewOrders}>Xem đơn hàng</Button>,
          <Button key="home" type="default" onClick={() => navigate('/')}>Về trang chủ</Button>
        ]}
      />
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 checkout-page-background">
      <div className="text-center mb-6">
      <Title level={2} className="text-gray-800"><CreditCardOutlined className="text-blue-600" /> Thanh toán</Title>
      </div>
      <Steps current={0} items={[{ title: 'Thông tin' }, { title: 'Thanh toán' }, { title: 'Hoàn thành' }]} />
      <Row gutter={24} className="mt-6">
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <ShoppingCartOutlined className="text-blue-600" />
                <span className="text-lg font-semibold">Tóm tắt đơn hàng</span>
              </div>
            } 
            className="shadow-lg border-0"
            headStyle={{ 
              borderBottom: '2px solid #f0f0f0',
              padding: '20px 24px',
              backgroundColor: '#fafafa'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div className="space-y-4">
              {checkoutData.items.map(item => (
                <div key={item.courseId} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="relative">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-12 object-cover rounded-lg shadow-sm border border-gray-200"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '/images/no-image.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text strong className="text-gray-800 line-clamp-2 leading-tight">
                      {item.title}
                    </Text>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-gray-500">Khóa học</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className="text-sm text-gray-500">Truy cập vĩnh viễn</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-lg text-blue-600">
                      {formatCurrency(item.price)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
            
            <Divider style={{ margin: '24px 0' }} />
            
            {checkoutData.voucherValidation && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <Text strong className="text-green-700">
                        Mã giảm giá: {checkoutData.voucherValidation.code}
                      </Text>
                      <div className="text-sm text-green-600">
                        Đã áp dụng thành công
                      </div>
                    </div>
                  </div>
                  <Text strong className="text-green-600 text-lg">
                    -{formatCurrency(checkoutData.discount)}
                  </Text>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <Text className="text-gray-600">Tạm tính:</Text>
                <Text className="text-gray-800">{formatCurrency(checkoutData.subtotal)}</Text>
              </div>
              {checkoutData.discount > 0 && (
                <div className="flex justify-between items-center py-2">
                  <Text className="text-gray-600">Giảm giá:</Text>
                  <Text className="text-green-600">-{formatCurrency(checkoutData.discount)}</Text>
                </div>
              )}
              <Divider style={{ margin: '12px 0' }} />
              <div className="flex justify-between items-center py-2">
                <Text strong className="text-lg text-gray-800">Tổng cộng:</Text>
                <Text strong className="text-xl text-blue-600">
                  {formatCurrency(checkoutData.total)}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-blue-600" />
                <span className="text-lg font-semibold">Thông tin thanh toán</span>
              </div>
            } 
            className="shadow-lg border-0"
            headStyle={{ 
              borderBottom: '2px solid #f0f0f0',
              padding: '20px 24px',
              backgroundColor: '#fafafa'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
              {/* Thông tin cá nhân */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <UserOutlined className="text-blue-600" />
                  <Text strong className="text-gray-800">Thông tin cá nhân</Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item 
                    name="fullName" 
                    label={<span className="text-gray-700 font-medium">Họ tên</span>} 
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    className="mb-0"
                  >
                    <Input 
                      prefix={<UserOutlined className="text-gray-400" />} 
                      size="large"
                      className="rounded-lg"
                      placeholder="Nhập họ tên đầy đủ"
                    />
                  </Form.Item>
                  <Form.Item 
                    name="phone" 
                    label={<span className="text-gray-700 font-medium">Số điện thoại</span>} 
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    className="mb-0"
                  >
                    <Input 
                      prefix={<PhoneOutlined className="text-gray-400" />} 
                      size="large"
                      className="rounded-lg"
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>
                </div>
                <Form.Item 
                  name="email" 
                  label={<span className="text-gray-700 font-medium">Email</span>} 
                  rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}
                  className="mb-0"
                >
                  <Input 
                    prefix={<MailOutlined className="text-gray-400" />} 
                    size="large"
                    className="rounded-lg"
                    placeholder="Nhập địa chỉ email"
                  />
                </Form.Item>
              </div>

              {/* Phương thức thanh toán */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCardOutlined className="text-blue-600" />
                  <Text strong className="text-gray-800">Phương thức thanh toán</Text>
                </div>
                <Form.Item
                  name="paymentMethod"
                  rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                  className="mb-0"
                >
                  <div className="space-y-4">
                    {/* Digital Wallets */}
                    <div>
                      <Text className="text-sm font-medium text-gray-600 mb-3 block">Ví điện tử</Text>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* VNPAY */}
                        <div
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg ${
                            form.getFieldValue('paymentMethod') === 'vnpay' 
                              ? 'border-red-500 bg-red-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-md'
                          }`}
                          onClick={() => form.setFieldsValue({ paymentMethod: 'vnpay' })}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 border border-gray-200 shadow-sm">
                              <img 
                                src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg" 
                                alt="VNPAY" 
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              />
                              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{display: 'none'}}>
                                VN
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-800 text-sm">VNPay</div>
                              <div className="text-xs text-gray-500">Tiện lợi, an toàn</div>
                            </div>
                          </div>
                        </div>

                        {/* MoMo */}
                        <div
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg ${
                            form.getFieldValue('paymentMethod') === 'momo' 
                              ? 'border-pink-500 bg-pink-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                          }`}
                          onClick={() => form.setFieldsValue({ paymentMethod: 'momo' })}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 border border-gray-200 shadow-sm">
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" 
                                alt="MoMo" 
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              />
                              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{display: 'none'}}>
                                MM
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-800 text-sm">MoMo</div>
                              <div className="text-xs text-gray-500">Nhanh chóng</div>
                            </div>
                          </div>
                        </div>

                        {/* ZaloPay */}
                        <div
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg ${
                            form.getFieldValue('paymentMethod') === 'zalopay' 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                          }`}
                          onClick={() => form.setFieldsValue({ paymentMethod: 'zalopay' })}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 border border-gray-200 shadow-sm">
                              <img 
                                src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" 
                                alt="ZaloPay" 
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              />
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{display: 'none'}}>
                                ZP
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-800 text-sm">ZaloPay</div>
                              <div className="text-xs text-gray-500">Qua Zalo</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Other Payment Methods */}
                    <div>
                      <Text className="text-sm font-medium text-gray-600 mb-3 block">Phương thức khác</Text>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Wallet */}
                        <div
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg ${
                            form.getFieldValue('paymentMethod') === 'wallet' 
                              ? 'border-green-500 bg-green-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                          }`}
                          onClick={() => form.setFieldsValue({ paymentMethod: 'wallet' })}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                              <WalletOutlined className="text-white text-base" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">Ví của tôi</div>
                              <div className="text-xs text-gray-500">{walletBalance.toLocaleString('vi-VN')}₫</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Form.Item>
              </div>

              {/* Ghi chú */}
              <div>
                <Form.Item 
                  name="notes" 
                  label={<span className="text-gray-700 font-medium">Ghi chú (tùy chọn)</span>}
                  className="mb-0"
                >
                  <TextArea 
                    rows={3} 
                    className="rounded-lg"
                    placeholder="Nhập ghi chú cho đơn hàng..."
                  />
                </Form.Item>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <Button 
                  onClick={handleBackToCart}
                  size="large"
                  className="flex-1 h-14 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all duration-300 font-medium text-base shadow-sm hover:shadow-md"
                  icon={<ShoppingCartOutlined />}
                >
                  Quay lại giỏ hàng
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isSubmitting}
                  size="large"
                  className="flex-1 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base text-white"
                  icon={!isSubmitting && <CreditCardOutlined />}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    'Thanh toán ngay'
                  )}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;
