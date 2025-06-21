import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Row, Col, Card, Button, Typography, Input, Divider, message, Empty, Badge, Tag, Checkbox } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, ShoppingCartOutlined, CreditCardOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

interface CartItem {
    id: string;
    name: string;
    image: string;
    instructor: string;
    price: number;
    originalPrice: number;
    rating: number;
    students: number;
    duration: string;
    level: string;
}

const mockCartItems: CartItem[] = [
    {
        id: '1',
        name: 'Khóa học ReactJS từ cơ bản đến nâng cao',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=120&fit=crop',
        instructor: 'Nguyễn Văn An',
        price: 499000,
        originalPrice: 1299000,
        rating: 4.8,
        students: 15420,
        duration: '25 giờ',
        level: 'Trung cấp'
    },
    {
        id: '2',
        name: 'Thiết kế UI/UX chuyên nghiệp với Figma',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=120&fit=crop',
        instructor: 'Trần Thị Bình',
        price: 599000,
        originalPrice: 1499000,
        rating: 4.9,
        students: 8920,
        duration: '18 giờ',
        level: 'Cơ bản'
    },
    {
        id: '3',
        name: 'Lập trình Node.js và Express.js toàn tập',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=120&fit=crop',
        instructor: 'Lê Minh Cường',
        price: 450000,
        originalPrice: 1199000,
        rating: 4.7,
        students: 12350,
        duration: '32 giờ',
        level: 'Nâng cao'
    },
];

const CartPage = () => {
    const [cartItems, setCartItems] = useState(mockCartItems);
    const [selectedItems, setSelectedItems] = useState<string[]>(cartItems.map(item => item.id)); // Mặc định chọn tất cả
    const [voucher, setVoucher] = useState('');
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

    const handleRemoveItem = (id: string) => {
        setCartItems(cartItems.filter(item => item.id !== id));
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        message.success('Đã xóa khóa học khỏi giỏ hàng!');
    };

    const handleSelectItem = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(cartItems.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleRemoveSelected = () => {
        if (selectedItems.length === 0) {
            message.warning('Vui lòng chọn ít nhất một khóa học để xóa!');
            return;
        }
        setCartItems(cartItems.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        message.success(`Đã xóa ${selectedItems.length} khóa học khỏi giỏ hàng!`);
    };
    
    const handleApplyVoucher = async () => {
        if (!voucher.trim()) {
            message.warning('Vui lòng nhập mã giảm giá!');
            return;
        }
        
        setIsApplyingVoucher(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (voucher === 'WELCOME50') {
            message.success('Áp dụng mã giảm giá thành công! Giảm 50% tổng đơn hàng');
        } else {
            message.error('Mã giảm giá không hợp lệ!');
        }
        setIsApplyingVoucher(false);
    };

    // Tính toán dựa trên các item được chọn
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
    const subtotal = selectedCartItems.reduce((acc, item) => acc + item.price, 0);
    const discount = voucher === 'WELCOME50' ? subtotal * 0.5 : 0;
    const total = subtotal - discount;
    const savings = selectedCartItems.reduce((acc, item) => acc + (item.originalPrice - item.price), 0);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { 
                duration: 0.6,
                staggerChildren: 0.1 
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -30, scale: 0.95 },
        visible: { 
            opacity: 1, 
            x: 0, 
            scale: 1,
            transition: { duration: 0.5 }
        },
        exit: { 
            opacity: 0, 
            x: 30, 
            scale: 0.95,
            transition: { duration: 0.3 }
        }
    };

    const cardVariants = {
        hover: { 
            y: -5, 
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            transition: { duration: 0.3 }
        }
    };

    if (cartItems.length === 0) {
        return (
            <motion.div 
                className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <Empty
                        image={<ShoppingCartOutlined style={{ fontSize: 80, color: '#1890ff' }} />}
                        description={
                            <Title level={4} type="secondary" className="!mt-4">
                                Giỏ hàng của bạn đang trống
                            </Title>
                        }
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link to="/courses">
                                <Button type="primary" size="large" className="!h-12 !px-8">
                                    Tiếp tục mua sắm
                                </Button>
                            </Link>
                        </motion.div>
                    </Empty>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <motion.div
                className="max-w-screen-xl mx-auto p-4 md:p-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge count={cartItems.length} size="small">
                                <ShoppingCartOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                            </Badge>
                        </motion.div>
                        <div>
                            <Title level={2} className="!mb-1 !text-gray-800">Giỏ hàng của bạn</Title>
                            <Text className="text-gray-600">{cartItems.length} khóa học trong giỏ hàng</Text>
                        </div>
                    </div>
                    
                    {/* Selection Controls */}
                    <Card className="mb-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Checkbox 
                                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                    indeterminate={selectedItems.length > 0 && selectedItems.length < cartItems.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                >
                                    <Text strong>Chọn tất cả ({cartItems.length})</Text>
                                </Checkbox>
                                <Text type="secondary">
                                    Đã chọn {selectedItems.length} khóa học
                                </Text>
                            </div>
                            {selectedItems.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Button 
                                        danger 
                                        icon={<DeleteOutlined />}
                                        onClick={handleRemoveSelected}
                                        size="small"
                                    >
                                        Xóa đã chọn ({selectedItems.length})
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </Card>
                    
                    {/* Savings Banner */}
                    {savings > 0 && selectedItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg mb-6"
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircleOutlined style={{ fontSize: 24 }} />
                                <div>
                                    <Text strong className="text-white">Tiết kiệm được {savings.toLocaleString()}đ</Text>
                                    <br />
                                    <Text className="text-green-100">Bạn đã tiết kiệm được {(savings / selectedCartItems.reduce((acc, item) => acc + item.originalPrice, 0) * 100).toFixed(0)}% so với giá gốc!</Text>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                <Row gutter={[32, 32]}>
                    {/* Cart Items Column */}
                    <Col xs={24} lg={16}>
                        <motion.div variants={itemVariants}>
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        layout
                                    >
                                        <motion.div
                                            variants={cardVariants}
                                            whileHover="hover"
                                            className="mb-6"
                                        >
                                            <Card 
                                                className={`shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ${
                                                    selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
                                                }`}
                                                bodyStyle={{ padding: 0 }}
                                            >
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="relative">
                                                        <div className="absolute top-2 left-2 z-10">
                                                            <Checkbox 
                                                                checked={selectedItems.includes(item.id)}
                                                                onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                                                                className="!bg-white !rounded-full"
                                                            />
                                                        </div>
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name}
                                                            className="w-full md:w-48 h-32 md:h-40 object-cover"
                                                        />
                                                        <div className="absolute top-2 right-2">
                                                            <Tag color="red" className="!border-0">
                                                                {item.level}
                                                            </Tag>
                                                        </div>
                                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                                            {item.duration}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 p-6">
                                                        <div className="flex flex-col h-full justify-between">
                                                            <div>
                                                                <Title level={4} className="!mb-2 !text-gray-800 line-clamp-2">
                                                                    {item.name}
                                                                </Title>
                                                                <Text type="secondary" className="text-sm mb-2">
                                                                    bởi <Text strong>{item.instructor}</Text>
                                                                </Text>
                                                                
                                                                <div className="flex items-center gap-4 mb-3">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-yellow-500">★</span>
                                                                        <Text strong>{item.rating}</Text>
                                                                        <Text type="secondary">({item.students.toLocaleString()} học viên)</Text>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-baseline gap-2">
                                                                    <Text strong className="text-xl text-red-500">
                                                                        {item.price.toLocaleString()}đ
                                                                    </Text>
                                                                    <Text delete type="secondary">
                                                                        {item.originalPrice.toLocaleString()}đ
                                                                    </Text>
                                                                </div>
                                                                
                                                                <motion.div
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <Button 
                                                                        type="text" 
                                                                        danger 
                                                                        icon={<DeleteOutlined />} 
                                                                        onClick={() => handleRemoveItem(item.id)}
                                                                        className="!h-10 !px-4"
                                                                    >
                                                                        Xóa
                                                                    </Button>
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
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
                                headStyle={{ 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Text>Tạm tính ({selectedItems.length} khóa học):</Text>
                                        <Text strong className="text-lg">{subtotal.toLocaleString()}đ</Text>
                                    </div>
                                    
                                    {discount > 0 && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex justify-between items-center bg-green-50 p-3 rounded-lg"
                                        >
                                            <Text className="text-green-600">Giảm giá:</Text>
                                            <Text strong className="text-green-600 text-lg">-{discount.toLocaleString()}đ</Text>
                                        </motion.div>
                                    )}
                                    
                                    <Divider className="my-4" />
                                    
                                    <div className="flex justify-between items-baseline">
                                        <Title level={4} className="!mb-0">Tổng cộng:</Title>
                                        <Title level={2} className="!mb-0 text-red-500">{total.toLocaleString()}đ</Title>
                                    </div>
                                    
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex gap-2 mb-3">
                                            <Input 
                                                placeholder="Nhập mã giảm giá" 
                                                value={voucher}
                                                onChange={(e) => setVoucher(e.target.value.toUpperCase())}
                                                className="flex-1"
                                            />
                                            <Button 
                                                onClick={handleApplyVoucher}
                                                loading={isApplyingVoucher}
                                                type="primary"
                                            >
                                                Áp dụng
                                            </Button>
                                        </div>
                                        <Text type="secondary" className="text-xs">
                                            Thử mã: <Text code>WELCOME50</Text> để giảm 50%
                                        </Text>
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
                                            disabled={selectedItems.length === 0}
                                        >
                                            Tiến hành thanh toán
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
    );
};

export default CartPage;
