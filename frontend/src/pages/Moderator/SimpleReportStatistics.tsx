import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  WarningOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  BarChartOutlined 
} from '@ant-design/icons';

const SimpleReportStatistics: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px', color: '#1e293b' }}>
        Thống kê Báo cáo
      </h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số báo cáo"
              value={134}
              prefix={<BarChartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã xử lý"
              value={85}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={49}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Báo cáo mới hôm nay"
              value={7}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Tổng quan hoạt động">
            <p>Thống kê chi tiết về các báo cáo vi phạm và hoạt động kiểm duyệt.</p>
            <ul>
              <li>Tổng số báo cáo: 134</li>
              <li>Đã xử lý: 85 (63.4%)</li>
              <li>Chờ xử lý: 49 (36.6%)</li>
              <li>Báo cáo mới hôm nay: 7</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SimpleReportStatistics; 