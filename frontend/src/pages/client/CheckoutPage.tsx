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
  EnvironmentOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import type { CreateOrderData } from '../../services/orderService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CheckoutData {
  items: Array<{
    courseId: string;
    quantity: number;
  }>;
  voucherCode?: string;
  voucherValidation?: any;
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
  const location = useLocation();
  const [form] = Form.useForm();

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
        
        // Pre-fill form với thông tin user nếu có
        if (user) {
          form.setFieldsValue({
            fullName: user.fullName || user.name,
            phone: user.phone,
            email: user.email
          });
        }
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
  }, [user, form, navigate]);

  const handleSubmit = async (values: any) => {
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
        shippingAddress: {
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
          city: values.city,
          district: values.district,
          ward: values.ward
        },
        notes: values.notes
      };

      const response = await orderService.createOrder(orderData, token);
      
      setOrderId(response.order.id);
      setOrderSuccess(true);
      
      // Xóa dữ liệu checkout khỏi localStorage
      localStorage.removeItem('checkoutData');
      
      message.success('Đặt hàng thành công!');
      
    } catch (error: any) {
      console.error('Create order error:', error);
      message.error(error.message || 'Lỗi khi tạo đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCart = () => {
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
            title="Đặt hàng thành công!"
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
              Hoàn tất thông tin để đặt hàng
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
                            Mã giảm giá: {checkoutData.voucherValidation.voucher.code}
                          </Text>
                        </div>
                        <Text className="text-sm text-blue-600">
                          {checkoutData.voucherValidation.voucher.title}
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
                      paymentMethod: 'cod'
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
                      name="address"
                      label="Địa chỉ"
                      rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                      <Input 
                        prefix={<EnvironmentOutlined />} 
                        placeholder="Nhập địa chỉ chi tiết"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="city"
                          label="Tỉnh/Thành phố"
                          rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
                        >
                          <Select placeholder="Chọn tỉnh/thành phố">
                            <Option value="hanoi">Hà Nội</Option>
                            <Option value="hcm">TP. Hồ Chí Minh</Option>
                            <Option value="danang">Đà Nẵng</Option>
                            <Option value="cantho">Cần Thơ</Option>
                            <Option value="haiphong">Hải Phòng</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="district"
                          label="Quận/Huyện"
                          rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
                        >
                          <Select placeholder="Chọn quận/huyện">
                            <Option value="district1">Quận 1</Option>
                            <Option value="district2">Quận 2</Option>
                            <Option value="district3">Quận 3</Option>
                            <Option value="district4">Quận 4</Option>
                            <Option value="district5">Quận 5</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="ward"
                          label="Phường/Xã"
                          rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
                        >
                          <Select placeholder="Chọn phường/xã">
                            <Option value="ward1">Phường 1</Option>
                            <Option value="ward2">Phường 2</Option>
                            <Option value="ward3">Phường 3</Option>
                            <Option value="ward4">Phường 4</Option>
                            <Option value="ward5">Phường 5</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="paymentMethod"
                      label="Phương thức thanh toán"
                      rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                    >
                      <Select>
                        <Option value="cod">Thanh toán khi nhận hàng (COD)</Option>
                        <Option value="bank_transfer">Chuyển khoản ngân hàng</Option>
                        <Option value="credit_card">Thẻ tín dụng/Ghi nợ</Option>
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
                        {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
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