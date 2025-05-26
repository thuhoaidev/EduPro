import React from "react";
import { Card, Col, Row, Typography } from "antd";
import ProfileInfoForm from "../../components/ProfileInfoForm";
import ChangePasswordForm from "../../components/ChangePasswordForm";

const { Title } = Typography;

const UserProfilePage = () => {
  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: 24,
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        borderRadius: 16,
      }}
    >
      <Title level={2} style={{ textAlign: "center", color: "#1890ff", marginBottom: 40 }}>
        Hồ sơ cá nhân
      </Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ color: "#595959", fontWeight: 600 }}>Thông tin cá nhân</span>}
            bordered={false}
            style={{
              borderRadius: 16,
              background: "#fafafa",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <ProfileInfoForm />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ color: "#595959", fontWeight: 600 }}>Đổi mật khẩu</span>}
            bordered={false}
            style={{
              borderRadius: 16,
              background: "#fafafa",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <ChangePasswordForm />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfilePage;
