import React, { useState, useEffect } from 'react';
import { Form, Input, Button, List, message, Card, Typography, Tag, Space, Divider, Row, Col, Empty, Spin } from 'antd';
import { 
  SendOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  MessageOutlined,
  PlusOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { reportService } from '../../services/reportService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Report {
  _id: string;
  title: string;
  content: string;
  status: string;
  adminReply?: string;
  createdAt?: string;
}

interface UserReportPageProps {
  userId: string;
}

const UserReportPage: React.FC<UserReportPageProps> = ({ userId }) => {
  const [form] = Form.useForm();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await reportService.getUserReports(userId);
      setReports(res.data.data);
    } catch (error) {
      message.error('Không thể tải lịch sử báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { title: string; content: string }) => {
    setSubmitting(true);
    try {
      await reportService.create({ ...values, userId });
      message.success('Báo cáo đã được gửi thành công!');
      form.resetFields();
      fetchReports();
    } catch (error) {
      message.error('Gửi báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'resolved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'resolved':
        return 'Đã giải quyết';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <ClockCircleOutlined />;
      case 'processing':
        return <ExclamationCircleOutlined />;
      case 'resolved':
        return <CheckCircleOutlined />;
      case 'rejected':
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [userId]);

  if (!userId) return <div>Vui lòng đăng nhập để gửi báo cáo.</div>;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          {/* Form Section */}
          <Col xs={24} lg={12}>
            <Card
              style={{
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                }}>
                  <FileTextOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <Title level={2} style={{ 
                  margin: 0, 
                  color: '#1a202c',
                  fontWeight: 700
                }}>
                  Tạo báo cáo mới
                </Title>
                <Text style={{ 
                  color: '#718096', 
                  fontSize: '16px',
                  display: 'block',
                  marginTop: '8px'
                }}>
                  Mô tả chi tiết vấn đề bạn gặp phải
                </Text>
              </div>

              <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSubmit}
                size="large"
              >
                <Form.Item 
                  name="title" 
                  label={
                    <Text style={{ fontWeight: 600, color: '#2d3748' }}>
                      Tiêu đề báo cáo
                    </Text>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề báo cáo' }]}
                > 
                  <Input 
                    placeholder="Nhập tiêu đề ngắn gọn và rõ ràng"
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      padding: '12px 16px',
                      fontSize: '16px'
                    }}
                  />
        </Form.Item>
                
                <Form.Item 
                  name="content" 
                  label={
                    <Text style={{ fontWeight: 600, color: '#2d3748' }}>
                      Nội dung chi tiết
                    </Text>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung báo cáo' }]}
                > 
                  <TextArea 
                    rows={6}
                    placeholder="Mô tả chi tiết vấn đề, bao gồm các bước để tái hiện lỗi (nếu có)..."
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      padding: '16px',
                      fontSize: '16px',
                      resize: 'none'
                    }}
                  />
        </Form.Item>
                
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={submitting}
                  icon={<SendOutlined />}
                  style={{
                    width: '100%',
                    height: '56px',
                    borderRadius: '16px',
                    fontSize: '16px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                </Button>
      </Form>

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
                  <strong>💡 Mẹo:</strong> Mô tả càng chi tiết càng giúp chúng tôi xử lý nhanh chóng
                </Text>
              </div>
            </Card>
          </Col>

          {/* History Section */}
          <Col xs={24} lg={12}>
            <Card
              style={{
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                height: 'fit-content'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(72, 187, 120, 0.3)'
                }}>
                  <HistoryOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <Title level={2} style={{ 
                  margin: 0, 
                  color: '#1a202c',
                  fontWeight: 700
                }}>
                  Lịch sử báo cáo
                </Title>
                <Text style={{ 
                  color: '#718096', 
                  fontSize: '16px',
                  display: 'block',
                  marginTop: '8px'
                }}>
                  Theo dõi trạng thái các báo cáo của bạn
                </Text>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px', color: '#718096' }}>
                    Đang tải lịch sử báo cáo...
                  </div>
                </div>
              ) : reports.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text style={{ color: '#718096' }}>
                      Chưa có báo cáo nào
                    </Text>
                  }
                  style={{ padding: '40px 0' }}
                />
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {reports.map((report, index) => (
                    <div key={report._id}>
                      <Card
                        style={{
                          marginBottom: '16px',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          transition: 'all 0.3s ease'
                        }}
                        bodyStyle={{ padding: '20px' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <Title level={4} style={{ 
                            margin: 0, 
                            color: '#1a202c',
                            fontWeight: 600,
                            fontSize: '16px'
                          }}>
                            {report.title}
                          </Title>
                          <Tag
                            color={getStatusColor(report.status)}
                            icon={getStatusIcon(report.status)}
                            style={{
                              borderRadius: '8px',
                              padding: '4px 12px',
                              fontWeight: 600,
                              fontSize: '12px'
                            }}
                          >
                            {getStatusText(report.status)}
                          </Tag>
                        </div>
                        
                        <Paragraph style={{ 
                          color: '#4a5568', 
                          margin: '12px 0',
                          lineHeight: '1.6',
                          fontSize: '14px'
                        }}>
                          {report.content}
                        </Paragraph>

                        {report.adminReply && (
                          <div style={{
                            marginTop: '16px',
                            padding: '16px',
                            background: 'rgba(102, 126, 234, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <MessageOutlined style={{ 
                                color: '#667eea', 
                                marginRight: '8px',
                                fontSize: '16px'
                              }} />
                              <Text style={{ 
                                fontWeight: 600, 
                                color: '#2d3748',
                                fontSize: '14px'
                              }}>
                                Phản hồi từ admin:
                              </Text>
                            </div>
                            <Text style={{ 
                              color: '#4a5568', 
                              fontSize: '14px',
                              lineHeight: '1.6'
                            }}>
                              {report.adminReply}
                            </Text>
                          </div>
                        )}

                        {report.createdAt && (
                          <div style={{ 
                            marginTop: '12px', 
                            textAlign: 'right'
                          }}>
                            <Text style={{ 
                              color: '#a0aec0', 
                              fontSize: '12px'
                            }}>
                              {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                            </Text>
                          </div>
                        )}
                      </Card>
                      {index < reports.length - 1 && (
                        <Divider style={{ margin: '16px 0' }} />
                      )}
                    </div>
                  ))}
            </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .ant-card {
          transition: all 0.3s ease;
        }
        
        .ant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
        }
        
        .ant-input:focus,
        .ant-input-focused {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
        }
        
        .ant-input:hover {
          border-color: #667eea !important;
        }
        
        .ant-form-item-label > label {
          font-weight: 600 !important;
        }
        
        @media (max-width: 768px) {
          .ant-card {
            margin: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserReportPage;