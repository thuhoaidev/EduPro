// src/pages/client/UserReportRoute.tsx
import React from "react";
import { Card, Typography, Button, Result, Space, Divider, Row, Col } from "antd";
import { UserOutlined, ExclamationCircleOutlined, HomeOutlined, SafetyOutlined, SecurityScanOutlined, ClockCircleOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserReportPage from "./UserReportPage";

const { Title, Text, Paragraph } = Typography;

const UserReportRoute: React.FC = () => {
  const navigate = useNavigate();
  
  // Lấy user từ localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card 
          style={{ 
            borderRadius: '24px', 
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            border: 'none',
            maxWidth: '800px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '0' }}
        >
          {/* Header Section */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '48px 40px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated Background Elements */}
            <div style={{
              position: 'absolute',
              top: '-20%',
              left: '-20%',
              width: '140%',
              height: '140%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)',
              backgroundSize: '30px 30px',
              animation: 'float 8s ease-in-out infinite'
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              animation: 'float 6s ease-in-out infinite reverse'
            }} />
            
            {/* Icon Container */}
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              zIndex: 1,
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <SecurityScanOutlined style={{ fontSize: '56px', color: 'white' }} />
            </div>
            
            <Title level={1} style={{ 
              margin: 0, 
              color: 'white', 
              fontWeight: 800,
              fontSize: '36px',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              letterSpacing: '-0.5px'
            }}>
              Xác thực cần thiết
            </Title>
            
            <Text style={{ 
              color: 'rgba(255,255,255,0.95)', 
              fontSize: '18px',
              display: 'block',
              marginTop: '12px',
              fontWeight: 500
            }}>
              Vui lòng đăng nhập để tiếp tục với báo cáo
            </Text>
          </div>

          {/* Content Section */}
          <div style={{ padding: '48px 40px' }}>
            <Row gutter={[32, 32]}>
              <Col xs={24} lg={16}>
                <div style={{ marginBottom: '40px' }}>
                  <Title level={3} style={{ 
                    margin: '0 0 24px 0', 
                    color: '#1a202c',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <SafetyOutlined style={{ color: '#667eea', fontSize: '28px' }} />
                    Tại sao cần đăng nhập?
                  </Title>
                  
                  <Paragraph style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.7', 
                    color: '#4a5568',
                    margin: '0 0 32px 0',
                    fontWeight: 400
                  }}>
                    Để đảm bảo tính minh bạch và trách nhiệm trong quá trình xử lý báo cáo, 
                    chúng tôi yêu cầu bạn đăng nhập vào hệ thống. Điều này giúp chúng tôi:
                  </Paragraph>

                  {/* Benefits Grid */}
                  <Row gutter={[24, 20]}>
                    <Col xs={24} sm={12}>
                      <div style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        height: '100%',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px'
                          }}>
                            <SecurityScanOutlined style={{ color: 'white', fontSize: '18px' }} />
                          </div>
                          <Text style={{ fontSize: '16px', fontWeight: 600, color: '#2d3748' }}>
                            Xác minh danh tính
                          </Text>
                        </div>
                        <Text style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                          Đảm bảo thông tin báo cáo đến từ người dùng thực tế
                        </Text>
                      </div>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <div style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        height: '100%',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px'
                          }}>
                            <ClockCircleOutlined style={{ color: 'white', fontSize: '18px' }} />
                          </div>
                          <Text style={{ fontSize: '16px', fontWeight: 600, color: '#2d3748' }}>
                            Theo dõi tiến trình
                          </Text>
                        </div>
                        <Text style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                          Cập nhật trạng thái xử lý báo cáo theo thời gian thực
                        </Text>
                      </div>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <div style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        height: '100%',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px'
                          }}>
                            <MessageOutlined style={{ color: 'white', fontSize: '18px' }} />
                          </div>
                          <Text style={{ fontSize: '16px', fontWeight: 600, color: '#2d3748' }}>
                            Liên lạc hai chiều
                          </Text>
                        </div>
                        <Text style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                          Nhận thông báo và phản hồi từ đội ngũ hỗ trợ
                        </Text>
                      </div>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <div style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        height: '100%',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px'
                          }}>
                            <ExclamationCircleOutlined style={{ color: 'white', fontSize: '18px' }} />
                          </div>
                          <Text style={{ fontSize: '16px', fontWeight: 600, color: '#2d3748' }}>
                            Bảo mật thông tin
                          </Text>
                        </div>
                        <Text style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                          Đảm bảo tính riêng tư và bảo mật của dữ liệu báo cáo
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
              
              <Col xs={24} lg={8}>
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderRadius: '20px',
                  padding: '32px',
                  border: '1px solid #e2e8f0',
                  height: 'fit-content'
                }}>
                  <Title level={4} style={{ 
                    margin: '0 0 24px 0', 
                    color: '#2d3748',
                    textAlign: 'center',
                    fontWeight: 700
                  }}>
                    Bắt đầu ngay
                  </Title>
                  
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<UserOutlined />}
                      onClick={() => navigate('/login')}
                      style={{
                        width: '100%',
                        height: '56px',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      Đăng nhập
                    </Button>
                    
                    <Button 
                      size="large"
                      icon={<HomeOutlined />}
                      onClick={() => navigate('/')}
                      style={{
                        width: '100%',
                        height: '56px',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: 500,
                        border: '2px solid #cbd5e0',
                        color: '#4a5568',
                        background: 'white',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#a0aec0';
                        e.currentTarget.style.color = '#2d3748';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#cbd5e0';
                        e.currentTarget.style.color = '#4a5568';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Về trang chủ
                    </Button>
                  </Space>
                  
                  <div style={{ 
                    marginTop: '24px', 
                    padding: '16px', 
                    background: 'rgba(102, 126, 234, 0.1)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)'
                  }}>
                    <Text style={{ 
                      fontSize: '14px', 
                      color: '#4a5568', 
                      textAlign: 'center',
                      display: 'block',
                      lineHeight: '1.5'
                    }}>
                      <strong>Quy trình xử lý:</strong><br />
                      Báo cáo → Xác minh → Xử lý → Thông báo kết quả
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(180deg); }
          }
          
          .ant-card {
            transition: all 0.3s ease;
          }
          
          .ant-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 80px rgba(0,0,0,0.2) !important;
          }
          
          @media (max-width: 768px) {
            .ant-card {
              margin: 10px;
            }
          }
        `}</style>
      </div>
    );
  }

  return <UserReportPage userId={user._id} />;
};

export default UserReportRoute;