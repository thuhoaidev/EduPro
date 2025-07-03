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
  Empty, 
  Badge, 
  Tag, 
  Checkbox,
  Spin,
  Input,
  Popconfirm
} from 'antd';
import { 
  DeleteOutlined, 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  CreditCardOutlined, 
  SafetyOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { config as apiClient } from '../../api/axios';
import { useCart } from '../../contexts/CartContext';
import voucherService from '../../services/voucher.service';
import type { ValidateVoucherResponse } from '../../services/voucher.service';

const { Title, Text } = Typography;

interface CartItem {
  id: string;
  course: {
    id: string;
    title: string;
    price: number;
    thumbnail: string;
    discount?: number;
    instructor?: {
      name?: string;
    };
    slug: string;
    rating?: number;
    students?: number;
    duration?: string;
    level?: string;
  };
  priceAtAddition: number;
  addedAt: string;
  quantity: number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [voucher, setVoucher] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherValidation, setVoucherValidation] = useState<ValidateVoucherResponse | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { updateCartCount } = useCart();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Không có token, không thể tải giỏ hàng');
        setCartItems([]);
        return;
      }
      
      const res = await apiClient.get('/carts');
      const items = res.data.items.map((item: { _id: string, course: any, addedAt: string }) => {
        const course = item.course;
        const discount = course.discount || 0;
        const finalPrice = Math.round(course.price * (1 - discount / 100));

        return {
          id: item._id,
          course: {
            ...course,
            rating: course.rating || 4.5,
            students: course.students || 1000,
            duration: course.duration || '10 giờ',
            level: course.level || 'Trung cấp'
          },
          priceAtAddition: finalPrice,
          addedAt: item.addedAt,
          quantity: 1,
        };
      });
      setCartItems(items);
      setSelectedItems(items.map((item: { id: any; }) => item.id));
    } catch (error) {
      console.error('Error fetching cart:', error);
      message.error('Lỗi khi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();

    // Kiểm tra và áp dụng voucher đã lưu
    const savedVoucherData = localStorage.getItem('cartVoucherData');
    if (savedVoucherData) {
      try {
        const { voucher: savedVoucher, voucherValidation: savedValidation } = JSON.parse(savedVoucherData);
        setVoucher(savedVoucher);
        setVoucherValidation(savedValidation);
        // Xóa dữ liệu voucher đã lưu sau khi đã áp dụng
        localStorage.removeItem('cartVoucherData');
      } catch (error) {
        console.error('Error parsing saved voucher data:', error);
      }
    }
  }, []);

  const removeItem = async (itemId: string) => {
    try {
      await apiClient.delete(`/carts/${itemId}`);
      message.success('Đã xóa khóa học khỏi giỏ hàng');
      fetchCart();
      updateCartCount();
    } catch (error) {
      console.error('Error removing item:', error);
      message.error('Lỗi khi xóa khóa học');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucher.trim()) {
      message.warning('Vui lòng nhập mã giảm giá!');
      return;
    }

    if (!localStorage.getItem('token')) {
      message.error('Vui lòng đăng nhập để sử dụng voucher!');
      return;
    }

    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một khóa học để áp dụng voucher!');
      return;
    }
    
    setIsApplyingVoucher(true);
    setVoucherError('');
    setVoucherValidation(null);

    try {
      // Tính tổng tiền đơn hàng
      const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
      const orderAmount = selectedCartItems.reduce((acc, item) => acc + item.priceAtAddition * item.quantity, 0);

      // Validate voucher
      const validationResult = await voucherService.validate(
        { code: voucher.trim(), orderAmount },
        (localStorage.getItem('token') || '') as string
      );

      setVoucherValidation(validationResult);
      message.success('Áp dụng mã giảm giá thành công!');
      
    } catch (error: any) {
      console.error('Voucher validation error:', error);
      setVoucherError(error.response?.data?.message || 'Mã giảm giá không hợp lệ!');
      message.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ!');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucher('');
    setVoucherValidation(null);
    setVoucherError('');
    message.info('Đã xóa mã giảm giá');
  };

  const handleCheckout = async () => {
    if (!localStorage.getItem('token')) {
      message.error('Vui lòng đăng nhập để thanh toán!');
      return;
    }

    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một khóa học để thanh toán!');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Chuẩn bị dữ liệu đơn hàng, lưu đầy đủ thông tin khóa học
      const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
      
      // Lưu thông tin đơn hàng vào localStorage để checkout page sử dụng
      const checkoutData = {
        items: selectedCartItems.map(item => ({
          courseId: item.course.id,
          title: item.course.title,
          thumbnail: item.course.thumbnail,
          price: item.priceAtAddition,
          quantity: item.quantity
        })),
        voucherCode: voucherValidation ? voucherValidation.voucher.code : undefined,
        voucherValidation: voucherValidation,
        subtotal: selectedCartItems.reduce((acc, item) => acc + item.priceAtAddition * item.quantity, 0),
        discount: voucherValidation ? voucherValidation.discountAmount : 0,
        total: selectedCartItems.reduce((acc, item) => acc + item.priceAtAddition * item.quantity, 0) - (voucherValidation ? voucherValidation.discountAmount : 0)
      };

      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      // Chuyển đến trang checkout
      navigate('/checkout');
      
    } catch (error) {
      console.error('Checkout error:', error);
      message.error('Lỗi khi chuẩn bị thanh toán');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Thêm hàm xóa tất cả mục đã chọn
  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một mục để xóa!');
      return;
    }
    try {
      await Promise.all(selectedItems.map(id => apiClient.delete(`/carts/${id}`)));
      message.success('Đã xóa các mục đã chọn khỏi giỏ hàng');
      fetchCart();
      updateCartCount();
    } catch (error) {
      message.error('Lỗi khi xóa các mục đã chọn');
    }
  };

  // Tính toán các giá trị
  const selectedCartItems = cartItems.filter((item: CartItem) => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((acc, item) => acc + item.priceAtAddition * item.quantity, 0);
  const discount = voucherValidation ? voucherValidation.discountAmount : 0;
  const total = subtotal - discount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 lg:p-12 max-w-2xl w-full"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ShoppingCartOutlined className="text-7xl lg:text-8xl text-cyan-400 drop-shadow-lg" />
          </motion.div>

          <Title level={2} className="!mt-8 !mb-3 !text-gray-800 font-bold">
            Giỏ hàng của bạn đang trống
          </Title>
          <Text className="text-gray-600 text-lg max-w-md mx-auto block">
            Có vẻ như bạn chưa chọn khóa học nào. Hãy bắt đầu khám phá ngay thôi!
          </Text>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10"
          >
            <Link to="/courses">
              <Button
                type="primary"
                size="large"
                icon={<ArrowLeftOutlined />}
                className="!h-14 !px-8 !text-lg !font-semibold !bg-gradient-to-r !from-cyan-500 !to-purple-500 hover:!from-cyan-600 hover:!to-purple-600 !border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
              >
                Khám phá khóa học
              </Button>
            </Link>
          </motion.div>
        </motion.div>
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
          {/* Header Gradient */}
          <div className="flex items-center justify-between bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <ShoppingCartOutlined className="text-4xl text-white drop-shadow-lg" />
              <Title level={2} className="!mb-0 !text-white drop-shadow-lg">Giỏ hàng</Title>
              <Badge count={cartItems.length} showZero style={{ background: '#fff', color: '#7c3aed', fontWeight: 700, boxShadow: '0 2px 8px rgba(56,189,248,0.10)' }} />
            </div>
          </div>

          <Row gutter={24}>
            {/* Cart Items Column */}
            <Col xs={24} lg={16}>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <Title level={4} className="!mb-0 text-cyan-700">Khóa học trong giỏ</Title>
                  <div className="flex items-center gap-4">
                    <Checkbox 
                      checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                      indeterminate={selectedItems.length > 0 && selectedItems.length < cartItems.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    >
                      Chọn tất cả ({selectedItems.length})
                    </Checkbox>
                    <Popconfirm
                      title="Bạn có chắc muốn xóa các mục đã chọn?"
                      onConfirm={handleRemoveSelected}
                      okText="Xóa"
                      cancelText="Hủy"
                      disabled={selectedItems.length === 0}
                    >
                      <Button 
                        type="primary"
                        danger 
                        disabled={selectedItems.length === 0} 
                        icon={<DeleteOutlined />} 
                        className="transition-all duration-300"
                      >
                        Xóa mục đã chọn
                      </Button>
                    </Popconfirm>
                  </div>
                </div>

                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.9 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="grid grid-cols-12 items-center gap-6 mb-6 p-4 rounded-xl hover:shadow-lg hover:bg-cyan-50 transition-all duration-300 border"
                    >
                      {/* Checkbox & Image */}
                      <div className="col-span-3 flex items-center gap-4">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="self-start mt-2"
                        />
                        <img 
                          src={item.course.thumbnail} 
                          alt={item.course.title}
                          className="w-32 h-20 object-cover rounded-lg shadow-md"
                        />
                      </div>
                      
                      {/* Course Info */}
                      <div className="col-span-5">
                        <Link to={`/courses/${item.course.slug}`} className="hover:underline">
                          <Title level={5} className="!mb-2 !text-gray-800 font-semibold truncate">
                            {item.course.title}
                          </Title>
                        </Link>
                        <Text type="secondary" className="text-sm">
                          Bởi {item.course.instructor?.name || 'EduPro'}
                        </Text>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <Tag color="yellow">⭐ {item.course.rating}</Tag>
                          <Tag color="blue">👥 {item.course.students?.toLocaleString()}</Tag>
                          <Tag color="purple">⏱️ {item.course.duration}</Tag>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-3 text-right">
                        <Text strong className="text-xl text-red-600 block">
                          {formatCurrency(item.priceAtAddition)}
                        </Text>
                        {item.course.discount && (
                          <Text delete type="secondary" className="block">
                            {formatCurrency(item.course.price)}
                          </Text>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-1 text-center">
                        <Popconfirm
                          title="Xóa khóa học này?"
                          onConfirm={() => removeItem(item.id)}
                          okText="Xóa"
                          cancelText="Không"
                        >
                          <Button 
                            type="text" 
                            danger 
                            shape="circle" 
                            icon={<DeleteOutlined className="text-xl" />} 
                            className="hover:bg-red-100 transition-colors"
                          />
                        </Popconfirm>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Col>
            
            {/* Order Summary Column */}
            <Col xs={24} lg={8}>
              <motion.div variants={itemVariants}>
                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <CreditCardOutlined style={{ color: '#1890ff' }} />
                      <span>Tóm tắt đơn hàng</span>
                    </div>
                  } 
                  className="shadow-xl border-0 sticky top-24"
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
                      <Text>Tạm tính ({selectedItems.length} khóa học):</Text>
                      <Text strong className="text-lg">{formatCurrency(subtotal)}</Text>
                    </div>
                    
                    {discount > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-between items-center bg-green-50 p-3 rounded-lg"
                      >
                        <Text className="text-green-600">Giảm giá:</Text>
                        <Text strong className="text-green-600 text-lg">-{formatCurrency(discount)}</Text>
                      </motion.div>
                    )}
                    
                    <Divider className="my-4" />
                    
                    <div className="flex justify-between items-baseline">
                      <Title level={4} className="!mb-0">Tổng cộng:</Title>
                      <Title level={2} className="!mb-0 text-red-500">{formatCurrency(total)}</Title>
                    </div>
                    
                    {/* Voucher Section */}
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <Text strong>Mã giảm giá</Text>
                      </div>
                      
                      {voucherValidation ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-green-50 p-3 rounded-lg border border-green-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Text strong className="text-green-600">
                              {voucherValidation.voucher.code}
                            </Text>
                            <Button 
                              type="text" 
                              size="small" 
                              onClick={handleRemoveVoucher}
                              className="text-red-500"
                            >
                              Xóa
                            </Button>
                          </div>
                          <Text className="text-sm text-green-600">
                            {voucherValidation.voucher.title}
                          </Text>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Nhập mã giảm giá"
                              value={voucher}
                              onChange={(e) => setVoucher(e.target.value)}
                              onPressEnter={handleApplyVoucher}
                              disabled={isApplyingVoucher}
                            />
                            <Button 
                              type="primary"
                              onClick={handleApplyVoucher}
                              loading={isApplyingVoucher}
                              disabled={!voucher.trim() || selectedItems.length === 0}
                            >
                              Áp dụng
                            </Button>
                          </div>
                          {voucherError && (
                            <Text type="danger" className="text-sm">
                              {voucherError}
                            </Text>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="primary" 
                        size="large" 
                        block 
                        className="!h-14 !text-lg !font-semibold"
                        icon={<SafetyOutlined />}
                        disabled={selectedItems.length === 0 || isCheckingOut}
                        loading={isCheckingOut}
                        onClick={handleCheckout}
                      >
                        {isCheckingOut ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                      </Button>
                    </motion.div>
                    
                    <Link to="/courses">
                      <motion.div
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          type="link" 
                          block 
                          icon={<ArrowLeftOutlined />}
                          className="!h-10"
                        >
                          Tiếp tục mua sắm
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default CartPage;