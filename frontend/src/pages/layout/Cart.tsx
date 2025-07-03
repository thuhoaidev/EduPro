import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Col, 
  Divider, 
  Empty, 
  InputNumber, 
  Row, 
  Space, 
  Table, 
  Tag, 
  Typography,
  Badge,
  message 
} from 'antd';
import { 
  DeleteOutlined, 
  MinusOutlined, 
  PlusOutlined, 
  ShoppingCartOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

interface CartItem {
  id: string;
  name: string;
  instructor: string;
  price: number;
  discountedPrice: number;
  thumbnail: string;
  quantity: number;
}

const CartPage: React.FC = () => {
  // Dữ liệu giỏ hàng mẫu
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'JavaScript Nâng Cao',
      instructor: 'Dương Đức Phương',
      price: 999000,
      discountedPrice: 499000,
      thumbnail: 'https://via.placeholder.com/80x60?text=JS+Course',
      quantity: 1
    },
    {
      id: '2',
      name: 'ReactJS Cơ Bản',
      instructor: 'Dương Đức Phương',
      price: 799000,
      discountedPrice: 799000,
      thumbnail: 'https://via.placeholder.com/80x60?text=React',
      quantity: 1
    }
  ]);

  // Định dạng tiền tệ VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.discountedPrice * item.quantity);
    }, 0);
  };

  // Thay đổi số lượng
  const handleQuantityChange = (id: string, value: number) => {
    if (value < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: value } : item
    ));
  };

  // Xóa sản phẩm
  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    message.success('Đã xóa khóa học khỏi giỏ hàng');
  };

  // Cột cho bảng giỏ hàng
  const columns = [
    {
      title: 'Khóa học',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, item: CartItem) => (
        <Space>
          <img 
            src={item.thumbnail} 
            alt={item.name}
            style={{ 
              width: 80, 
              height: 60, 
              objectFit: 'cover',
              borderRadius: 4
            }}
          />
          <div>
            <Text strong>{item.name}</Text>
            <br />
            <Text type="secondary">{item.instructor}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      key: 'price',
      render: (_: any, item: CartItem) => (
        <div>
          {item.discountedPrice < item.price && (
            <Text delete type="secondary" style={{ fontSize: 12 }}>
              {formatCurrency(item.price)}
            </Text>
          )}
          <Text 
            strong 
            style={{ 
              color: item.discountedPrice < item.price ? '#ff4d4f' : 'inherit',
              display: 'block'
            }}
          >
            {formatCurrency(item.discountedPrice)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_: any, item: CartItem) => (
        <Space>
          <Button 
            icon={<MinusOutlined />} 
            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
          />
          <InputNumber 
            min={1} 
            value={item.quantity} 
            onChange={(value) => handleQuantityChange(item.id, value as number)}
            style={{ width: 60 }}
          />
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_: any, item: CartItem) => (
        <Text strong>
          {formatCurrency(item.discountedPrice * item.quantity)}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, item: CartItem) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeItem(item.id)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <ShoppingCartOutlined /> Giỏ hàng của bạn
      </Title>

      {cartItems.length === 0 ? (
        <Card>
          <Empty
            description={
              <Text type="secondary">Giỏ hàng của bạn đang trống</Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to="/courses">
              <Button type="primary" icon={<ArrowLeftOutlined />}>
                Quay lại trang khóa học
              </Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card variant="outlined">
              <Table 
                columns={columns} 
                dataSource={cartItems} 
                pagination={false}
                rowKey="id"
                size="middle"
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card title="Tổng thanh toán" variant="borderless">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Tạm tính ({cartItems.length} khóa học):</Text>
                  <Text>{formatCurrency(calculateTotal())}</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Giảm giá:</Text>
                  <Text type="success">-{formatCurrency(0)}</Text>
                </div>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                  <Text strong style={{ fontSize: 20, color: '#ff4d4f' }}>
                    {formatCurrency(calculateTotal())}
                  </Text>
                </div>
                
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  style={{ 
                    height: 48,
                    marginTop: 24,
                    fontWeight: 500
                  }}
                >
                  Tiến hành thanh toán
                </Button>
                
                <Link to="/courses">
                  <Button 
                    type="text" 
                    block
                    icon={<ArrowLeftOutlined />}
                    style={{ marginTop: 8 }}
                  >
                    Tiếp tục mua hàng
                  </Button>
                </Link>
                
                <Text type="secondary" style={{ marginTop: 16 }}>
                  <Tag color="blue">Ưu đãi</Tag> Miễn phí vận chuyển cho mọi đơn hàng
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default CartPage;