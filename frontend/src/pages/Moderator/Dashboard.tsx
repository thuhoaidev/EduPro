import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  FileSearchOutlined, 
  CommentOutlined, 
  WarningOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';

const ModeratorDashboard: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px', color: '#1e293b' }}>
        Bảng điều khiển Kiểm duyệt viên
      </h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Báo cáo chờ xử lý"
              value={15}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Blog cần duyệt"
              value={8}
              prefix={<FileSearchOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bình luận cần kiểm tra"
              value={23}
              prefix={<CommentOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã xử lý hôm nay"
              value={12}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Hoạt động gần đây">
            <p>Chào mừng bạn đến với bảng điều khiển kiểm duyệt!</p>
            <p>Ở đây bạn có thể:</p>
            <ul>
              <li>Xem và xử lý các báo cáo vi phạm</li>
              <li>Duyệt các bài viết blog</li>
              <li>Kiểm tra và quản lý bình luận</li>
              <li>Duyệt các khóa học mới</li>
              <li>Xem thống kê hoạt động</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ModeratorDashboard; 