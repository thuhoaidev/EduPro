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
    _id: any;
    id: string;
    title: string;
    price: number;
    thumbnail: string;
    discount?: number;
    instructor?: {
      name?: string;
      avatar?: string;
      bio?: string;
      expertise?: string[];
      rating?: number;
      totalReviews?: number;
      totalStudents?: number;
    };
    author?: {
      name?: string;
      avatar?: string;
      bio?: string;
      expertise?: string[];
    };
    slug: string;
    rating?: number;
    students?: number;
    duration?: string;
    level?: string;
    language?: string;
    views?: number;
    totalReviews?: number;
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
      console.log('Cart API response:', res.data.items);
      console.log('First course data structure:', res.data.items[0]?.course);

      const items = res.data.items.map((item: { _id: string, course: any, addedAt: string }) => {
        const course = item.course;
        const discount = course.discount || 0;
        const finalPrice = Math.round(course.price * (1 - discount / 100));

        // Sử dụng thông tin chính xác từ API
        const processedCourse = {
          ...course,
          // Sử dụng rating thực tế từ database
          rating: course.rating || 0,
          // Sử dụng số học viên thực tế từ database
          students: course.students || 0,
          // Sử dụng thời gian thực tế từ database
          duration: course.duration || '0 phút',
        };

        // Xử lý author data từ instructor thực tế
        if (course.instructor) {
          processedCourse.author = {
            name: course.instructor.name || 'EduPro',
            avatar: course.instructor.avatar || null,
            bio: course.instructor.bio || '',
            expertise: course.instructor.expertise || []
          };
          console.log('Using real instructor data:', course.instructor);
        } else {
          // Fallback nếu không có instructor
          processedCourse.author = {
            name: 'EduPro',
            avatar: null,
            bio: '',
            expertise: []
          };
          console.log('Using fallback instructor data');
        }

        return {
          id: item._id,
          course: processedCourse,
          priceAtAddition: finalPrice,
          addedAt: item.addedAt,
          quantity: 1,
        };
      });
      console.log('Mapped cart items:', items);
      console.log('First mapped course author:', items[0]?.course?.author);
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
          courseId: item.course._id,
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-purple-100">
      <div className="container mx-auto px-2 md:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header Gradient */}
          <Row gutter={32}>
            {/* Cart Items Column */}
            <Col xs={24} lg={16}>
              <div className="bg-white/90 rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b">
                  <Title level={4} className="!mb-0 text-cyan-700 font-bold text-xl">Khóa học trong giỏ</Title>
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                      indeterminate={selectedItems.length > 0 && selectedItems.length < cartItems.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="text-lg font-semibold"
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
                        className="transition-all duration-300 rounded-full px-5 py-2 font-semibold text-base"
                      >
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
                      className="relative group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden mb-6"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/0 to-purple-50/0 group-hover:from-cyan-50/30 group-hover:to-purple-50/30 transition-all duration-500 pointer-events-none"></div>

                      <div className="relative p-6">
                        <div className="flex items-start gap-6">
                          {/* Checkbox */}
                          <div className="flex-shrink-0 pt-2">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                              className="scale-125"
                            />
                          </div>

                          {/* Course Image */}
                          <div className="flex-shrink-0">
                            <div className="relative group">
                              <img
                                src={item.course.thumbnail}
                                alt={item.course.title}
                                className="w-40 h-28 object-cover rounded-2xl shadow-xl border-2 border-white group-hover:border-cyan-200 transition-all duration-300"
                              />
                              {/* Overlay on image hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-all duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Course Info */}
                          <div className="flex-1 min-w-0">
                            <Link to={`/courses/${item.course.slug}`} className="block group">
                              <Title level={4} className="!mb-3 !text-gray-800 font-bold text-xl group-hover:text-cyan-600 transition-colors duration-300 line-clamp-2">
                                {item.course.title}
                              </Title>
                            </Link>

                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex items-center gap-2">
                                {item.course.author?.avatar ? (
                                  <img
                                    src={item.course.author.avatar}
                                    alt={item.course.author.name}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                      {item.course.author?.name?.charAt(0) || 'E'}
                                    </span>
                                  </div>
                                )}
                                <Text className="text-gray-600 font-medium">
                                  {item.course.author?.name || 'EduPro'}
                                </Text>
                              </div>
                            </div>

                            {/* Course Stats */}
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full">
                                <span className="text-yellow-600 text-lg">⭐</span>
                                <span className="text-yellow-700 font-semibold text-sm">
                                  {item.course.rating > 0 ? item.course.rating.toFixed(1) : 'Chưa có đánh giá'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                                <span className="text-blue-600 text-lg">👥</span>
                                <span className="text-blue-700 font-semibold text-sm">
                                  {item.course.students > 0 ? item.course.students.toLocaleString() : 'Chưa có học viên'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
                                <span className="text-purple-600 text-lg">⏱️</span>
                                <span className="text-purple-700 font-semibold text-sm">
                                  {item.course.duration !== '0 phút' ? item.course.duration : 'Chưa có nội dung'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Price and Actions */}
                          <div className="flex-shrink-0 flex flex-col items-end gap-4">
                            {/* Price Section */}
                            <div className="text-right">
                              <Text strong className="text-3xl text-red-600 block font-bold">
                                {formatCurrency(item.priceAtAddition)}
                              </Text>
                            </div>

                            {/* Delete Button */}
                            <div>
                              <Popconfirm
                                title="Xóa khóa học này?"
                                description="Bạn có chắc muốn xóa khóa học này khỏi giỏ hàng?"
                                onConfirm={() => removeItem(item.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  type="text"
                                  danger
                                  shape="circle"
                                  size="large"
                                  icon={<DeleteOutlined className="text-xl" />}
                                  className="hover:bg-red-50 hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md"
                                />
                              </Popconfirm>
                            </div>
                          </div>
                        </div>
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
                    <div className="flex items-center gap-3">
                      <CreditCardOutlined style={{ color: '#1890ff', fontSize: 28 }} />
                      <span className="font-bold text-lg">Tóm tắt đơn hàng</span>
                    </div>
                  }
                  className="shadow-2xl border-0 sticky top-24 bg-white/80 rounded-3xl backdrop-blur-md"
                  styles={{
                    header: {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '1.5rem 1.5rem 0 0',
                      fontWeight: 700
                    }
                  }}
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <Text className="text-base">Tạm tính ({selectedItems.length} khóa học):</Text>
                      <Text strong className="text-xl">{formatCurrency(subtotal)}</Text>
                    </div>
                    {discount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-between items-center bg-green-50 p-4 rounded-xl"
                      >
                        <Text className="text-green-600 text-base">Giảm giá:</Text>
                        <Text strong className="text-green-600 text-xl">-{formatCurrency(discount)}</Text>
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
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} />
                        <Text strong className="text-base">Mã giảm giá</Text>
                      </div>
                      {voucherValidation ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-green-50 p-4 rounded-xl border border-green-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Text strong className="text-green-600 text-lg">
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
                          <Text className="text-base text-green-600">
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
                              className="rounded-xl text-base px-4 py-2 shadow-sm"
                            />
                            <Button
                              type="primary"
                              onClick={handleApplyVoucher}
                              loading={isApplyingVoucher}
                              disabled={!voucher.trim() || selectedItems.length === 0}
                              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl px-5 py-2 shadow-md border-0 hover:scale-105 hover:shadow-lg transition-all"
                            >
                              Áp dụng
                            </Button>
                          </div>
                          {voucherError && (
                            <Text type="danger" className="text-base">
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
                        className="!h-16 !text-xl !font-bold bg-gradient-to-r from-cyan-500 to-purple-500 border-0 shadow-xl rounded-2xl hover:scale-105 hover:shadow-2xl transition-all"
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
                          className="!h-12 !text-base font-semibold text-cyan-700 hover:text-purple-700"
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