import React from 'react';
import { Modal, Spin, Card, Avatar, Rate, Tag, Typography, Space, Divider, Button, message, Alert } from 'antd';
import { RobotOutlined, BookOutlined, StarOutlined, UserOutlined, DollarOutlined, TrophyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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
  .ai-recommend-card:hover {
    box-shadow: 0 8px 24px rgba(24,144,255,0.15) !important;
    transform: translateY(-2px) scale(1.02);
    border-color: #91d5ff !important;
    background: linear-gradient(135deg, #e6f7ff 80%, #f0f5ff 100%) !important;
    transition: box-shadow 0.3s, transform 0.2s, background 0.2s;
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
      width={800}
      centered
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ color: '#1890ff', fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>Edu Pro Gợi Ý Khóa Học Cho Bạn</Title>
        </div>
      }
    >
      <AIRecommendationModalGlobalStyle />
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>Đang phân tích và tìm kiếm khóa học phù hợp...</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
          <Title level={5} style={{ color: '#ff4d4f', marginBottom: 16 }}>Có lỗi xảy ra</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </Text>
          <Button type="primary" onClick={handleRetry}>
            Thử lại
          </Button>
        </div>
      ) : (
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Phần lý do gợi Ý */}
          {reasons.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrophyOutlined style={{ color: '#52c41a' }} />
                Lý Do Gợi Ý
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reasons.map((reason, index) => (
                  <Card 
                    key={reason.id} 
                    size="small" 
                    style={{ 
                      borderRadius: 8, 
                      border: '1px solid #f0f0f0',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: '#1890ff', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                          {reason.title}
                        </Text>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {reason.description}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Divider />

          {/* Phần khóa học được gợi Ý */}
          <div>
            <Title level={5} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOutlined style={{ color: '#722ed1' }} />
              Khóa Học Được Gợi Ý ({recommendations.length})
            </Title>
            
            {recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                <BookOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <div>Chưa có khóa học phù hợp</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Hãy thử học thêm một số khóa học để chúng tôi có thể gợi Ý tốt hơn
                </Text>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                {recommendations.map((course, index) => (
                  <Card 
                    key={course._id} 
                    hoverable 
                    style={{ 
                      borderRadius: 12, 
                      border: '1px solid #f0f0f0',
                      transition: 'box-shadow 0.3s, transform 0.2s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      background: 'linear-gradient(135deg, #f8fafc 80%, #e6f7ff 100%)',
                    }}
                    bodyStyle={{ padding: 16 }}
                    onClick={() => handleCourseClick(course._id)}
                    className="ai-recommend-card"
                  >
                    <div style={{ display: 'flex', gap: 16 }}>
                      <Avatar 
                        src={course.thumbnail} 
                        shape="square" 
                        size={80} 
                        icon={<BookOutlined />}
                        style={{ borderRadius: 8, boxShadow: '0 2px 8px #d6e4ff' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <Title level={5} style={{ margin: 0, flex: 1 }}>
                            {course.title}
                          </Title>
                          <Tag color="green" style={{ marginLeft: 8, fontWeight: 600, fontSize: 13, borderRadius: 6, background: '#f6ffed', color: '#389e0d' }}>
                            Điểm: {course.recommendScore?.toFixed(1) || 'N/A'}
                          </Tag>
                        </div>
                        
                        <div style={{ marginBottom: 8 }}>
                          <Space size={16}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <UserOutlined style={{ color: '#666' }} />
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                {course.instructor?.fullname || 'Chưa có thông tin'}
                              </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <StarOutlined style={{ color: '#faad14' }} />
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                {course.rating?.toFixed(1) || '0'} ({course.rating || 0})
                              </Text>
                            </div>
                          </Space>
                        </div>

                        {course.description && (
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>
                              {course.description.length > 100 
                                ? `${course.description.substring(0, 100)}...` 
                                : course.description
                              }
                            </Text>
                          </div>
                        )}

                        <div style={{ marginBottom: 12 }}>
                          <Space size={8}>
                            <Tag color="blue" style={{ borderRadius: 6, fontWeight: 500 }}>{course.level}</Tag>
                            <Tag color="purple" style={{ borderRadius: 6, fontWeight: 500 }}>{course.category?.name}</Tag>
                          </Space>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <DollarOutlined style={{ color: '#52c41a' }} />
                            <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                              {course.price?.toLocaleString('vi-VN')} VNĐ
                            </Text>
                          </div>
                          <Button type="primary" size="small" style={{ borderRadius: 6, fontWeight: 600, boxShadow: '0 2px 8px #bae7ff', transition: 'background 0.2s' }}>
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