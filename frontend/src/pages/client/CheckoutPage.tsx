import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Typography, 
  Divider, 
  message, 
  Form, 
  Input, 
  Select, 
  Space,
  Spin,
  Result,
  Steps
} from 'antd';
import { 
  ShoppingCartOutlined, 
  CreditCardOutlined, 
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  BankOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/Auths/useAuth';
import orderService from '../../services/orderService';
import type { CreateOrderData } from '../../services/orderService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormValues {
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: 'bank_transfer' | 'momo' | 'vnpay';
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
  const [orderId, setOrderId] = useState<string>('');
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);

  useEffect(() => {
    // Lấy dữ liệu checkout từ localStorage
    const savedCheckoutData = localStorage.getItem('checkoutData');
    if (savedCheckoutData) {
      try {
        const data = JSON.parse(savedCheckoutData);
        setCheckoutData(data);
      } catch (error) {
        console.error('Error parsing checkout data:', error);
        message.error('Dữ liệu đơn hàng không hợp lệ');
        navigate('/cart');
        return;
      }
    } else {
      message.error('Không tìm thấy dữ liệu đơn hàng');
      navigate('/cart');
      return;
    }
    setLoading(false);
  }, [navigate]);

  // Effect để cập nhật form khi có thông tin user
  useEffect(() => {
    if (user) {
      console.log('User data in CheckoutPage:', {
        fullname: user.fullname,
        phone: user.phone,
        email: user.email,
        rawUser: user
      });
      
      const formValues = {
        fullName: user.fullname,
        phone: user.phone || '',  // Use empty string if phone is null/undefined
        email: user.email,
      };
      
      console.log('Setting form values:', formValues);
      form.setFieldsValue(formValues);
      
      setTimeout(() => {
        console.log('Current form values:', form.getFieldsValue());
      }, 0);
    }
  }, [user, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!checkoutData || !token) {
      message.error('Dữ liệu không hợp lệ');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: CreateOrderData = {
        items: checkoutData.items,
        voucherCode: checkoutData.voucherCode,
        paymentMethod: values.paymentMethod,
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        notes: values.notes
      };

      const response = await orderService.createOrder(orderData, token);
      
      setOrderId(response.order.id);
      setOrderSuccess(true);
      
      // Xóa dữ liệu checkout khỏi localStorage
      localStorage.removeItem('checkoutData');
      
      message.success('Thanh toán thành công!');
      
    } catch (error) {
      console.error('Create order error:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Lỗi khi tạo đơn hàng');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCart = () => {
    // Lưu thông tin voucher vào localStorage trước khi quay lại giỏ hàng
    if (checkoutData?.voucherValidation) {
      localStorage.setItem('cartVoucherData', JSON.stringify({
        voucher: checkoutData.voucherCode,
        voucherValidation: checkoutData.voucherValidation
      }));
    }
    navigate('/cart');
  };

  const handleViewOrders = () => {
    navigate('/profile/orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Result
          status="error"
          title="Không tìm thấy dữ liệu đơn hàng"
          subTitle="Vui lòng quay lại giỏ hàng để tiếp tục"
          extra={[
            <Button type="primary" key="cart" onClick={handleBackToCart}>
              Quay lại giỏ hàng
            </Button>
          ]}
        />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Result
            status="success"
            icon={<CheckCircleOutlined />}
            title="Thanh toán thành công!"
            subTitle={`Mã đơn hàng: ${orderId}`}
            extra={[
              <Button type="primary" key="orders" onClick={handleViewOrders}>
                Xem đơn hàng của tôi
              </Button>,
              <Button key="home" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <Title level={2} className="!mb-2">
              <CreditCardOutlined className="text-blue-600 mr-2" />
              Thanh toán
            </Title>
            <Text type="secondary">
              Hoàn tất thông tin để thanh toán
            </Text>
          </div>

          {/* Steps */}
          <Card className="shadow-sm">
            <Steps
              current={0}
              items={[
                {
                  title: 'Thông tin đơn hàng',
                  description: 'Kiểm tra sản phẩm'
                },
                {
                  title: 'Thông tin thanh toán',
                  description: 'Nhập thông tin'
                },
                {
                  title: 'Hoàn thành',
                  description: 'Xác nhận đơn hàng'
                }
              ]}
            />
          </Card>

          <Row gutter={24}>
            {/* Order Summary */}
            <Col xs={24} lg={12}>
              <motion.div variants={itemVariants}>
                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <ShoppingCartOutlined style={{ color: '#1890ff' }} />
                      <span>Tóm tắt đơn hàng</span>
                    </div>
                  }
                  className="shadow-lg border-0"
                  styles={{
                    header: {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none'
                    }
                  }}
                >
                  <div className="space-y-4">
                    {/* Course List */}
                    <div className="space-y-3">
                      {checkoutData.items.map(item => (
                        <motion.div key={item.courseId} layout>
                          <Card size="small" className="hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                              <img src={item.thumbnail} alt={item.title} className="w-24 h-16 object-cover rounded" />
                              <div className="flex-1">
                                <Text strong className="line-clamp-2">{item.title}</Text>
                                <Text type="secondary" className="text-xs">Số lượng: {item.quantity}</Text>
                              </div>
                              <Text strong className="text-base">{formatCurrency(item.price)}</Text>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <Divider />

                    <div className="flex justify-between items-center">
                      <Text>Tạm tính ({checkoutData.items.length} khóa học):</Text>
                      <Text strong className="text-lg">{formatCurrency(checkoutData.subtotal)}</Text>
                    </div>
                    
                    {checkoutData.discount > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-between items-center bg-green-50 p-3 rounded-lg"
                      >
                        <Text className="text-green-600">Giảm giá:</Text>
                        <Text strong className="text-green-600 text-lg">-{formatCurrency(checkoutData.discount)}</Text>
                      </motion.div>
                    )}
                    
                    <Divider className="my-4" />
                    
                    <div className="flex justify-between items-baseline">
                      <Title level={4} className="!mb-0">Tổng cộng:</Title>
                      <Title level={2} className="!mb-0 text-red-500">{formatCurrency(checkoutData.total)}</Title>
                    </div>

                    {checkoutData.voucherValidation && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <Text strong className="text-blue-600">
                            Mã giảm giá: {checkoutData.voucherValidation.code}
                          </Text>
                        </div>
                        <Text className="text-sm text-blue-600">
                          {checkoutData.voucherValidation.discountAmount}
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Checkout Form */}
            <Col xs={24} lg={12}>
              <motion.div variants={itemVariants}>
                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <UserOutlined style={{ color: '#1890ff' }} />
                      <span>Thông tin thanh toán</span>
                    </div>
                  }
                  className="shadow-lg border-0"
                  styles={{
                    header: {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none'
                    }
                  }}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                      paymentMethod: 'bank_transfer',
                      fullName: user?.fullname || '',
                      phone: user?.phone || '',
                      email: user?.email || '',
                    }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="fullName"
                          label="Họ và tên"
                          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                          <Input 
                            prefix={<UserOutlined />} 
                            placeholder="Nhập họ và tên"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="phone"
                          label="Số điện thoại"
                          rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                          ]}
                        >
                          <Input 
                            prefix={<PhoneOutlined />} 
                            placeholder="Nhập số điện thoại"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined />} 
                        placeholder="Nhập email liên lạc"
                      />
                    </Form.Item>

                    <Form.Item
                      name="paymentMethod"
                      label="Phương thức thanh toán"
                      rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                    >
                      <Select>
                        <Option value="bank_transfer">
                          <div className="flex items-center gap-2">
                            <BankOutlined />
                            <span>Chuyển khoản ngân hàng</span>
                          </div>
                        </Option>
                        <Option value="momo">
                          <div className="flex items-center gap-2">
                            <WalletOutlined />
                            <span>Ví điện tử MoMo</span>
                          </div>
                        </Option>
                        <Option value="vnpay">
                          <div className="flex items-center gap-2">
                            <WalletOutlined />
                            <span>Ví điện tử VNPAY</span>
                          </div>
                        </Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="notes"
                      label="Ghi chú"
                    >
                      <TextArea 
                        rows={3}
                        placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
                      />
                    </Form.Item>

                    <div className="flex gap-4">
                      <Button 
                        size="large" 
                        onClick={handleBackToCart}
                        className="flex-1"
                      >
                        Quay lại giỏ hàng
                      </Button>
                      <Button 
                        type="primary" 
                        size="large" 
                        htmlType="submit"
                        loading={isSubmitting}
                        className="flex-1"
                        icon={<CheckCircleOutlined />}
                      >
                        {isSubmitting ? 'Đang xử lý...' : 'Thanh toán'}
                      </Button>
                    </div>
                  </Form>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </div>
    </div>
  );
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default CheckoutPage; 