import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import { BookOutlined, UserOutlined, DollarOutlined } from "@ant-design/icons";

const { Title } = Typography;

const InstructorDashboard = () => {
  // Giả lập dữ liệu, bạn nên fetch từ API thực tế
  const [stats, setStats] = useState({
    courses: 5,
    students: 120,
    income: 15000000,
  });

  useEffect(() => {
    // TODO: Fetch dữ liệu thực tế từ API
  }, []);

  return (
    <div>
      <Title level={2}>Chào mừng bạn đến với trang giảng viên!</Title>
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Khóa học của tôi"
              value={stats.courses}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng học viên"
              value={stats.students}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng thu nhập"
              value={stats.income}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
            />
          </Card>
        </Col>
      </Row>
      {/* Thêm các shortcut hoặc thông tin khác nếu muốn */}
    </div>
  );
};

export default InstructorDashboard; 