import React, { useEffect, useState } from 'react';
import { Card, Button, Result, Spin, Typography, Space, Divider } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, WalletOutlined, HomeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface PaymentResult {
  success: boolean;
  message: string;
  orderId?: string;
  amount?: number;
  method?: string;
}

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Lấy các tham số từ URL
        const resultCode = searchParams.get('resultCode');
        const message = searchParams.get('message');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');
        const method = searchParams.get('paymentMethod') || 'momo';
        const transId = searchParams.get('transId');

        console.log('Payment result params:', {
          resultCode,
          message,
          orderId,
          amount,
          method,
          transId
        });

        // Nếu không có resultCode (F5 hoặc truy cập trực tiếp), redirect về wallet
        if (!resultCode && !orderId) {
          console.log('No payment result params found, redirecting to wallet');
          navigate('/wallet');
          return;
        }

        // Xử lý kết quả thanh toán
        if (resultCode === '0') {
          // Thành công
          setResult({
            success: true,
            message: message || 'Thanh toán thành công!',
            orderId: orderId || undefined,
            amount: amount ? parseInt(amount) : undefined,
            method
          });
        } else {
          // Thất bại
          setResult({
            success: false,
            message: message || 'Thanh toán thất bại hoặc bị hủy',
            orderId: orderId || undefined,
            amount: amount ? parseInt(amount) : undefined,
            method
          });
        }

        // Gửi thông báo về server để cập nhật trạng thái
        if (orderId) {
          try {
            const token = localStorage.getItem('token');
            
            // Xác định endpoint dựa trên phương thức thanh toán
            let endpoint = 'wallet/payment-callback';
            if (method === 'momo') {
              // Kiểm tra xem có phải thanh toán đơn hàng không
              const pendingOrder = localStorage.getItem('pendingOrder');
              if (pendingOrder) {
                endpoint = 'orders/momo-callback';
              } else {
                endpoint = 'wallet/momo-callback';
              }
            }
            
            const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                orderId,
                resultCode,
                message,
                amount,
                method,
                transId
              })
            });
            
            const responseData = await response.json();
            console.log('Payment callback response:', responseData);
            
            if (responseData.success) {
              console.log('Payment status updated successfully');
              
              // Nếu thành công và là thanh toán đơn hàng, xóa pendingOrder
              if (resultCode === '0' && method === 'momo') {
                localStorage.removeItem('pendingOrder');
                localStorage.removeItem('checkoutData');
                
                // Cập nhật lại user data
                try {
                  const res = await config.get('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const userData = res.data.user || res.data;
                  if (!userData.role && userData.role_id?.name) {
                    userData.role = { name: userData.role_id.name };
                  }
                  localStorage.setItem('user', JSON.stringify(userData));
                  localStorage.setItem('role', userData.role?.name || userData.role || '');
                } catch (error) {
                  console.log('Refresh user data failed:', error);
                }
              }
            } else {
              console.error('Failed to update payment status:', responseData.message);
            }
          } catch (error) {
            console.error('Error updating payment status:', error);
          }
        }

      } catch (error) {
        console.error('Error processing payment result:', error);
        setResult({
          success: false,
          message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán',
          method: 'unknown'
        });
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [searchParams, navigate]);

  const handleBackToWallet = () => {
    navigate('/wallet?fromPayment=true');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRetryPayment = () => {
    navigate('/wallet');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card style={{ 
          borderRadius: 16, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: 'none',
          background: 'white'
        }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 16, color: '#666' }}>
                Đang xử lý kết quả thanh toán...
              </Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card style={{ 
          borderRadius: 16, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: 'none',
          background: 'white'
        }}>
          <Result
            status="error"
            title="Không thể xử lý kết quả thanh toán"
            subTitle="Vui lòng thử lại hoặc liên hệ hỗ trợ"
            extra={[
              <Button type="primary" key="retry" onClick={handleRetryPayment}>
                Thử lại
              </Button>,
              <Button key="home" onClick={handleBackToHome}>
                Về trang chủ
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card style={{ 
          borderRadius: 16, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: 'none',
          background: 'white',
          maxWidth: 500,
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: result.success 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: result.success 
                  ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                  : '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              {result.success ? (
                <CheckCircleOutlined style={{ fontSize: 40, color: 'white' }} />
              ) : (
                <CloseCircleOutlined style={{ fontSize: 40, color: 'white' }} />
              )}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Title level={2} style={{ 
                margin: '0 0 16px 0',
                color: result.success ? '#22c55e' : '#ef4444'
              }}>
                {result.success ? 'Nạp tiền thành công!' : 'Nạp tiền thất bại'}
              </Title>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Text style={{ 
                fontSize: 16, 
                color: '#666',
                lineHeight: 1.6
              }}>
                {result.message}
              </Text>
            </motion.div>

            {/* Payment Details */}
            {(result.orderId || result.amount) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: 24 }}
              >
                <Card 
                  size="small" 
                  style={{ 
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {result.orderId && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>Mã giao dịch:</Text>
                        <Text code style={{ fontSize: 12 }}>{result.orderId}</Text>
                      </div>
                    )}
                    {result.amount && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>Số tiền:</Text>
                        <Text strong style={{ color: '#22c55e', fontSize: 16 }}>
                          {result.amount.toLocaleString()}₫
                        </Text>
                      </div>
                    )}
                    {result.method && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>Phương thức:</Text>
                        <Text style={{ textTransform: 'uppercase' }}>{result.method}</Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </motion.div>
            )}

            <Divider style={{ margin: '32px 0' }} />

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {result.success ? (
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<WalletOutlined />}
                    onClick={handleBackToWallet}
                    style={{ 
                      width: '100%', 
                      height: 48,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      border: 'none',
                      fontSize: 16,
                      fontWeight: 600
                    }}
                  >
                    Về trang ví
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<WalletOutlined />}
                    onClick={handleRetryPayment}
                    style={{ 
                      width: '100%', 
                      height: 48,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      border: 'none',
                      fontSize: 16,
                      fontWeight: 600
                    }}
                  >
                    Thử lại
                  </Button>
                )}
                
                <Button 
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={handleBackToHome}
                  style={{ 
                    width: '100%', 
                    height: 48,
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  Về trang chủ
                </Button>
              </Space>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ marginTop: 24 }}
            >
              <div style={{ 
                padding: 12, 
                background: '#f0f9ff', 
                borderRadius: 8,
                border: '1px solid #bae6fd'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ExclamationCircleOutlined style={{ 
                    color: '#0ea5e9', 
                    marginRight: 8,
                    fontSize: 16
                  }} />
                  <Text style={{ color: '#0369a1', fontSize: 14 }}>
                    {result.success 
                      ? 'Tiền sẽ được cộng vào ví ngay lập tức'
                      : 'Nếu bạn đã thanh toán, vui lòng liên hệ hỗ trợ'
                    }
                  </Text>
                </div>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentResultPage; 