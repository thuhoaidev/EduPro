import React from 'react';
import { Modal, Spin, Card, Avatar, Rate, Tag, Typography, Space, Divider, Button, message, Alert } from 'antd';
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
  .ai-recommend-modal {
    .ant-modal-content {
      border-radius: 20px;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
    }
    
    .ant-modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      border-bottom: none;
      padding: 28px 28px 24px;
      position: relative;
      overflow: hidden;
    }
    
    .ant-modal-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }
    
    .ant-modal-title {
      color: white !important;
      font-weight: 700;
      font-size: 18px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .ant-modal-close {
      color: white;
      font-size: 20px;
      transition: all 0.3s ease;
    }
    
    .ant-modal-close:hover {
      color: #f0f0f0;
      transform: scale(1.1);
    }
    
    .ant-modal-body {
      padding: 0;
      background: linear-gradient(135deg, #f8fafc 0%, #e6f7ff 100%);
    }
  }

  .ai-recommend-card {
    border-radius: 16px !important;
    border: 1px solid rgba(102, 126, 234, 0.1) !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    overflow: hidden;
    position: relative;
    backdrop-filter: blur(10px);
  }

  .ai-recommend-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .ai-recommend-card:hover {
    transform: translateY(-8px) scale(1.02) !important;
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2) !important;
    border-color: #667eea !important;
    background: linear-gradient(135deg, #f8fafc 0%, #e6f7ff 100%) !important;
  }

  .ai-recommend-card:hover::before {
    opacity: 1;
  }

  .ai-recommend-card .ant-card-body {
    padding: 24px !important;
  }

  .reason-card {
    border-radius: 12px !important;
    border: 1px solid rgba(24, 144, 255, 0.1) !important;
    background: linear-gradient(135deg, #f0f8ff 0%, #f8fafc 100%) !important;
    transition: all 0.4s ease;
    backdrop-filter: blur(10px);
  }

  .reason-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(24, 144, 255, 0.15);
    border-color: #91d5ff !important;
  }

  .reason-number {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) !important;
    color: white !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .course-thumbnail {
    border-radius: 12px !important;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12) !important;
    transition: transform 0.4s ease;
    border: 2px solid rgba(255, 255, 255, 0.8);
  }

  .ai-recommend-card:hover .course-thumbnail {
    transform: scale(1.08);
  }

  .score-tag {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 50%, #95de64 100%) !important;
    color: white !important;
    font-weight: 700 !important;
    border: none !important;
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4) !important;
    border-radius: 12px !important;
    padding: 6px 16px !important;
  }

  .view-details-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) !important;
    border: none !important;
    font-weight: 700 !important;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    transition: all 0.4s ease !important;
    border-radius: 12px !important;
    height: 44px !important;
    padding: 0 24px !important;
  }

  .view-details-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5) !important;
  }

  .section-header {
    background: linear-gradient(135deg, #f0f8ff 0%, #f8f5ff 100%);
    padding: 24px 28px;
    margin: 0 -24px 28px;
    border-radius: 16px;
    border: 1px solid rgba(102, 126, 234, 0.1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .section-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  }

  .section-header::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 50%;
    transform: translate(25px, -25px);
  }

  .loading-container {
    background: linear-gradient(135deg, #f8fafc 0%, #e6f7ff 100%);
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
    border: 1px solid rgba(24, 144, 255, 0.1);
  }

  .error-container {
    background: linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%);
    border-radius: 16px;
    padding: 60px 40px;
    border: 1px solid #ffccc7;
    text-align: center;
  }

  .course-info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .course-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 16px;
  }

  .course-meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
  }

  .course-description {
    margin-bottom: 20px;
    line-height: 1.6;
    color: #666;
    font-size: 14px;
  }

  .course-tags {
    margin-bottom: 20px;
  }

  .course-price-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
  }

  .price-display {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #52c41a;
    font-weight: 700;
    font-size: 18px;
  }

  .empty-state {
    text-align: center;
    padding: 80px 40px;
    color: #666;
  }

  .empty-state-icon {
    font-size: 80px;
    color: #d9d9d9;
    margin-bottom: 24px;
  }
`;

const AIRecommendationModal: React.FC<Props> = ({ visible, onClose, loading, recommendations, reasons, error }) => {
  const navigate = useNavigate();

  const handleCourseClick = (course: any) => {
    // Ưu tiên sử dụng slug nếu có, nếu không thì dùng id
    const coursePath = course.slug ? `/courses/${course.slug}` : `/courses/id/${course._id}`;
    navigate(coursePath);
    onClose();
    message.success('Chuyển đến trang chi tiết khóa học');
  };

  const handleRetry = () => {
    // Trigger reload by closing and reopening modal
    onClose();
    setTimeout(() => {
      // This will trigger the useEffect in the hook to reload
    }, 100);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      className="ai-recommend-modal"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <RobotOutlined style={{ color: 'white', fontSize: 24 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: 'white', fontWeight: 700 }}>
              AI Gợi Ý Khóa Học 
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, fontWeight: 400 }}>
              Dựa trên sở thích và hành vi học tập của bạn. Giúp bạn có một trải nghiệm học tuyệt vời hơn!
            </Text>
          </div>
        </div>
      }
    >
      <AIRecommendationModalGlobalStyle />
      {loading ? (
        <div className="loading-container">
          <div style={{ marginBottom: 24 }}>
            <Spin size="large" />
          </div>
          <Title level={5} style={{ color: '#1890ff', marginBottom: 12, fontWeight: 600 }}>
            <RobotOutlined style={{ marginRight: 12, fontSize: 20 }} />
            AI đang phân tích dữ liệu...
          </Title>
          <Text type="secondary" style={{ fontSize: 15, display: 'block' }}>
            Đang tìm kiếm khóa học phù hợp nhất với bạn
          </Text>
        </div>
      ) : error ? (
        <div className="error-container">
          <ExclamationCircleOutlined style={{ fontSize: 56, color: '#ff4d4f', marginBottom: 20 }} />
          <Title level={5} style={{ color: '#ff4d4f', marginBottom: 20, fontWeight: 600 }}>
            Có lỗi xảy ra
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 15 }}>
            {error}
          </Text>
          <Button 
            type="primary" 
            onClick={handleRetry}
            size="large"
            style={{ 
              borderRadius: 12,
              height: 44,
              paddingLeft: 32,
              paddingRight: 32,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Thử lại
          </Button>
        </div>
      ) : (
        <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '24px' }}>
          {/* Phần khóa học được gợi Ý */}
          <div>
            <div className="section-header">
              <Title level={5} style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16,
                color: '#1a1a1a',
                fontWeight: 700,
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 50%, #ffa39e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(255, 77, 79, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <FireOutlined style={{ color: 'white', fontSize: 22 }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>
                    Khóa Học Được Gợi Ý
                  </div>
                  <div style={{ fontSize: 14, color: '#666', fontWeight: 400 }}>
                    Những khóa học phù hợp nhất với bạn
                  </div>
                </div>
                <Tag 
                  color="red" 
                  style={{ 
                    marginLeft: 'auto',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '6px 16px',
                    background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 50%, #ffa39e 100%)',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.4)'
                  }}
                >
                  {recommendations.length} khóa học
                </Tag>
              </Title>
            </div>
            
            {recommendations.length === 0 ? (
              <div className="empty-state">
                <BookOutlined className="empty-state-icon" />
                <Title level={5} style={{ color: '#666', marginBottom: 16, fontWeight: 600 }}>
                  Chưa có khóa học phù hợp
                </Title>
                <Text type="secondary" style={{ fontSize: 15, display: 'block', lineHeight: 1.6 }}>
                  Hãy thử học thêm một số khóa học để chúng tôi có thể gợi Ý tốt hơn
                </Text>
              </div>
            ) : (
              <div className="course-info-grid">
                {recommendations.map((course, index) => (
                  <Card 
                    key={course._id} 
                    hoverable 
                    className="ai-recommend-card"
                    onClick={() => handleCourseClick(course)}
                  >
                    <div style={{ display: 'flex', gap: 24 }}>
                      <Avatar 
                        src={course.thumbnail} 
                        shape="square" 
                        size={120} 
                        icon={<BookOutlined />}
                        className="course-thumbnail"
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <Title level={4} style={{ margin: 0, flex: 1, lineHeight: 1.3, fontWeight: 700 }}>
                            {course.title}
                          </Title>
                          <Tag className="score-tag" style={{ marginLeft: 16, fontSize: 15, padding: '6px 16px' }}>
                            {course.recommendScore?.toFixed(1) || 'N/A'} điểm
                          </Tag>
                        </div>
                        
                        <div className="course-meta">
                          <div className="course-meta-item">
                            <UserOutlined style={{ color: '#666', fontSize: 16 }} />
                            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
                              {course.instructor?.fullname || 'Chưa có thông tin'}
                            </Text>
                          </div>
                          <div className="course-meta-item">
                            <StarOutlined style={{ color: '#faad14', fontSize: 16 }} />
                            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
                              {course.rating?.toFixed(1) || '0'} ({course.rating || 0} đánh giá)
                            </Text>
                          </div>
                        </div>

                        {course.description && (
                          <div className="course-description">
                            <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                              {course.description.length > 140 
                                ? `${course.description.substring(0, 140)}...` 
                                : course.description
                              }
                            </Text>
                          </div>
                        )}

                        <div className="course-tags">
                          <Space size={8}>
                            <Tag color="blue" style={{ borderRadius: 10, fontWeight: 600, padding: '6px 14px', fontSize: 13 }}>
                              {course.level}
                            </Tag>
                            <Tag color="purple" style={{ borderRadius: 10, fontWeight: 600, padding: '6px 14px', fontSize: 13 }}>
                              {course.category?.name}
                            </Tag>
                          </Space>
                        </div>

                        <div className="course-price-section">
                          <div className="price-display">
                            <DollarOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                            <Text strong style={{ color: '#52c41a', fontSize: 20, fontWeight: 800 }}>
                              {course.price?.toLocaleString('vi-VN')} VNĐ
                            </Text>
                          </div>
                          <Button 
                            type="primary" 
                            size="large" 
                            className="view-details-btn"
                            style={{ borderRadius: 12, fontWeight: 700, height: 44, paddingLeft: 24, paddingRight: 24 }}
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

          {/* Phần lý do gợi Ý */}
          {reasons.length > 0 && (
            <>
              <Divider style={{ margin: '40px 0' }} />
              <div style={{ marginBottom: 32 }}>
                <div className="section-header">
                  <Title level={5} style={{ 
                    margin: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16,
                    color: '#1a1a1a',
                    fontWeight: 700,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 50%, #ffd666 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(250, 173, 20, 0.4)',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <CrownOutlined style={{ color: 'white', fontSize: 22 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>
                        Lý Do Gợi Ý
                      </div>
                      <div style={{ fontSize: 14, color: '#666', fontWeight: 400 }}>
                        Tại sao AI chọn những khóa học này cho bạn
                      </div>
                    </div>
                    <Tag 
                      color="gold" 
                      style={{ 
                        marginLeft: 'auto',
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 13,
                        padding: '6px 16px',
                        background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 50%, #ffd666 100%)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(250, 173, 20, 0.4)'
                      }}
                    >
                      {reasons.length} lý do
                    </Tag>
                  </Title>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {reasons.map((reason, index) => (
                    <Card 
                      key={reason.id} 
                      size="small" 
                      className="reason-card"
                      bodyStyle={{ padding: 20 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                        <div className="reason-number" style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: 16, color: '#1890ff', display: 'block', marginBottom: 8, fontWeight: 700 }}>
                            {reason.title}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 400 }}>
                            {reason.description}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AIRecommendationModal; 