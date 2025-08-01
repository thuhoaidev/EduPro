import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Spin, message, Space, Typography } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';
import orderService from '../../services/orderService';
import type { Order } from '../../services/orderService';

const { Title, Text } = Typography;

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Vui lòng đăng nhập để xem chi tiết đơn hàng');
          navigate('/login');
          return;
        }

        const response = await orderService.getOrderDetail(id, token);
        setOrder(response.order);
      } catch (error) {
        console.error('Error fetching order detail:', error);
        message.error('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Không tìm thấy đơn hàng</Title>
        <Button type="primary" onClick={() => navigate('/orders')}>
          Quay lại danh sách đơn hàng
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/orders')}
        >
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          Chi tiết đơn hàng #{order.id}
        </Title>
      </Space>

      <Card>
        <Descriptions title="Thông tin đơn hàng" bordered>
          <Descriptions.Item label="Mã đơn hàng" span={3}>
            {order.id}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={3}>
            <Tag color={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={3}>
            {new Date(order.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền" span={3}>
            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
              {order.finalAmount.toLocaleString('vi-VN')} VNĐ
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán" span={3}>
            <Space>
              <CreditCardOutlined />
              {order.paymentMethod === 'wallet' ? 'Ví điện tử' :
               order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
               order.paymentMethod === 'momo' ? 'Ví MoMo' :
               order.paymentMethod}
            </Space>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: '24px' }}>
          <Title level={4}>Khóa học đã mua</Title>
          {order.items.map((item, index) => (
            <Card 
              key={index} 
              size="small" 
              style={{ marginBottom: '12px' }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space>
                <ShoppingCartOutlined />
                <div>
                  <Text strong>{item.course?.title || 'Khóa học'}</Text>
                  <br />
                  <Text type="secondary">
                    Giá: {item.price.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </div>
              </Space>
            </Card>
          ))}
        </div>

        {order.voucher && (
          <div style={{ marginTop: '24px' }}>
            <Title level={4}>Mã giảm giá</Title>
            <Tag color="green">{order.voucher.code}</Tag>
            <Text type="secondary"> - Giảm {order.discountAmount.toLocaleString('vi-VN')} VNĐ</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrderDetailPage; 