import React from 'react';
import { Modal, Spin, Card, Avatar, Rate, Tag, Typography, Space, Divider, Button, message, Alert, Progress } from 'antd';
import { RobotOutlined, BookOutlined, StarOutlined, UserOutlined, DollarOutlined, TrophyOutlined, ExclamationCircleOutlined, FireOutlined, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

const { Title, Text, Paragraph } = Typography;

interface Props {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  recommendations: any[];
  reasons: { id: string; title: string; description: string }[];
  error?: string | null;
}

const AIRecommendationModalGlobalStyle = createGlobalStyle`
  .ai-recommendation-modal {
    .ant-modal-content {
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    
    .ant-modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: none;
      padding: 24px 24px 20px;
      
      .ant-modal-title {
        color: white;
        font-weight: 600;
        font-size: 18px;
      }
    }
    
    .ant-modal-body {
      padding: 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #e6f7ff 100%);
    }
  }

  .ai-recommend-card {
    position: relative;
    overflow: hidden;
    border: none !important;
    border-radius: 16px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-8px) scale(1.02) !important;
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15) !important;
      border-color: #667eea !important;
      
      &::before {
        transform: scaleX(1);
      }
      
      .course-avatar {
        transform: scale(1.05);
      }
      
      .view-details-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3) !important;
      }
    }
  }

  .reason-card {
    border: none !important;
    border-radius: 12px !important;
    background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%) !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
    transition: all 0.3s ease !important;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
    }
  }

  .score-badge {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%) !important;
    border: none !important;
    color: white !important;
    font-weight: 600 !important;
    border-radius: 20px !important;
    padding: 4px 12px !important;
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3) !important;
  }

  .course-avatar {
    transition: transform 0.3s ease;
    border-radius: 12px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  }

  .view-details-btn {
    border-radius: 20px !important;
    font-weight: 600 !important;
    height: 36px !important;
    padding: 0 20px !important;
    background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%) !important;
    border: none !important;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3) !important;
    transition: all 0.3s ease !important;
  }

  .loading-container {
    background: linear-gradient(135deg, #f8fafc 0%, #e6f7ff 100%);
    border-radius: 16px;
    padding: 60px 40px;
  }

  .error-container {
    background: linear-gradient(135deg, #fff2f0 0%, #ffebee 100%);
    border-radius: 16px;
    padding: 40px;
    border: 1px solid #ffccc7;
  }

  .empty-state {
    background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
    border-radius: 16px;
    padding: 60px 40px;
    border: 2px dashed #d9d9d9;
  }
`;

const AIRecommendationModal: React.FC<Props> = ({ visible, onClose, loading, recommendations, reasons, error }) => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
    onClose();
    message.success('Chuyển đến trang chi tiết khóa học');
  };

  const handleRetry = () => {
    onClose();
    setTimeout(() => {
      // This will trigger the useEffect in the hook to reload
    }, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#52c41a';
    if (score >= 6) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      className="ai-recommendation-modal"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <RobotOutlined style={{ color: 'white', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: 'white', fontWeight: 600 }}>
              AI Gợi Ý Khóa Học
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13 }}>
              Dựa trên hành vi học tập của bạn
            </Text>
          </div>
        </div>
      }
    >
      <AIRecommendationModalGlobalStyle />
      {loading ? (
        <div className="loading-container" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <RobotOutlined style={{ color: 'white', fontSize: 32 }} />
            </div>
            <Progress 
              type="circle" 
              percent={75} 
              size={60}
              strokeColor={{
                '0%': '#667eea',
                '100%': '#764ba2',
              }}
              format={() => <Spin size="small" />}
            />
          </div>
          <Title level={5} style={{ color: '#1890ff', marginBottom: 8 }}>
            AI đang phân tích dữ liệu...
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Đang tìm kiếm khóa học phù hợp nhất với bạn
          </Text>
        </div>
      ) : error ? (
        <div className="error-container" style={{ textAlign: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <ExclamationCircleOutlined style={{ color: 'white', fontSize: 32 }} />
          </div>
          <Title level={5} style={{ color: '#ff4d4f', marginBottom: 16 }}>
            Có lỗi xảy ra
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 14 }}>
            {error}
          </Text>
          <Button 
            type="primary" 
            onClick={handleRetry}
            size="large"
            style={{
              borderRadius: 20,
              height: 40,
              padding: '0 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Thử lại
          </Button>
        </div>
      ) : (
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Phần lý do gợi Ý */}
          {reasons.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                marginBottom: 20,
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
                borderRadius: 12,
                border: '1px solid #b7eb8f'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CrownOutlined style={{ color: 'white', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
                    Lý Do Gợi Ý
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Dựa trên phân tích hành vi học tập của bạn
                  </Text>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                {reasons.map((reason, index) => (
                  <Card 
                    key={reason.id} 
                    size="small" 
                    className="reason-card"
                    bodyStyle={{ padding: 20 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        background: `linear-gradient(135deg, ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32'} 0%, ${index === 0 ? '#ffed4e' : index === 1 ? '#e0e0e0' : '#daa520'} 100%)`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 15, color: '#1890ff', display: 'block', marginBottom: 8 }}>
                          {reason.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                          {reason.description}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Divider style={{ 
            margin: '32px 0', 
            borderColor: '#e6f7ff',
            borderWidth: 2,
            background: 'linear-gradient(90deg, transparent 0%, #1890ff 50%, transparent 100%)'
          }} />

          {/* Phần khóa học được gợi Ý */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 24,
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%)',
              borderRadius: 12,
              border: '1px solid #91d5ff'
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FireOutlined style={{ color: 'white', fontSize: 18 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: '#722ed1' }}>
                  Khóa Học Được Gợi Ý
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {recommendations.length} khóa học phù hợp với bạn
                </Text>
              </div>
            </div>
            
            {recommendations.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center' }}>
                <BookOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                <Title level={5} style={{ color: '#666', marginBottom: 8 }}>
                  Chưa có khóa học phù hợp
                </Title>
                <Text type="secondary" style={{ fontSize: 14, display: 'block' }}>
                  Hãy thử học thêm một số khóa học để chúng tôi có thể gợi Ý tốt hơn
                </Text>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                {recommendations.map((course, index) => (
                  <Card 
                    key={course._id} 
                    hoverable 
                    className="ai-recommend-card"
                    bodyStyle={{ padding: 20 }}
                    onClick={() => handleCourseClick(course._id)}
                  >
                    <div style={{ display: 'flex', gap: 20 }}>
                      <Avatar 
                        src={course.thumbnail} 
                        shape="square" 
                        size={100} 
                        icon={<BookOutlined />}
                        className="course-avatar"
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <Title level={4} style={{ margin: 0, flex: 1, lineHeight: 1.3 }}>
                            {course.title}
                          </Title>
                          <Tag className="score-badge" style={{ marginLeft: 12 }}>
                            {course.recommendScore?.toFixed(1) || 'N/A'} điểm
                          </Tag>
                        </div>
                        
                        <div style={{ marginBottom: 12 }}>
                          <Space size={20}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <UserOutlined style={{ color: '#666' }} />
                              <Text type="secondary" style={{ fontSize: 14 }}>
                                {course.instructor?.fullname || 'Chưa có thông tin'}
                              </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <StarOutlined style={{ color: '#faad14' }} />
                              <Text type="secondary" style={{ fontSize: 14 }}>
                                {course.rating?.toFixed(1) || '0'} ({course.rating || 0} đánh giá)
                              </Text>
                            </div>
                          </Space>
                        </div>

                        {course.description && (
                          <div style={{ marginBottom: 16 }}>
                            <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                              {course.description.length > 120 
                                ? `${course.description.substring(0, 120)}...` 
                                : course.description
                              }
                            </Text>
                          </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                          <Space size={8}>
                            <Tag color="blue" style={{ borderRadius: 8, fontWeight: 500, padding: '4px 12px' }}>
                              {course.level}
                            </Tag>
                            <Tag color="purple" style={{ borderRadius: 8, fontWeight: 500, padding: '4px 12px' }}>
                              {course.category?.name}
                            </Tag>
                          </Space>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <DollarOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                            <Text strong style={{ color: '#52c41a', fontSize: 18 }}>
                              {course.price?.toLocaleString('vi-VN')} VNĐ
                            </Text>
                          </div>
                          <Button 
                            type="primary" 
                            size="middle" 
                            className="view-details-btn"
                          >
                            Xem Chi Tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AIRecommendationModal; 