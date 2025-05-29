import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Upload,
  Avatar,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const mockUser = {
  id: 1,
  name: "Nguyễn Tiến Nam",
  email: "namnam@urenco.vn",
  avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  status: "active",
  approval_status: "approved",
  email_verified: true,
  phone: "0967092235",
  dob: "1973-02-12",
  address: "73A ngõ 68 Quan Hoa Cầu Giấy HN",
  level: "Cấp 2",
  note: "Quản lý dự án A",
};

const ProfilePage = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      name: mockUser.name,
      email: mockUser.email,
      status: mockUser.status,
      approval_status: mockUser.approval_status,
      dob: dayjs(mockUser.dob),
      phone: mockUser.phone,
      address: mockUser.address,
      level: mockUser.level,
      note: mockUser.note,
    });
  }, [form]);

  const handleSubmit = (values: any) => {
    console.log("Updated values:", values);
    message.success("Cập nhật thông tin thành công!");
  };

  return (
    <Card title="Thông tin cá nhân">
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col span={16}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Họ và tên" name="name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Email" name="email">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Trạng thái" name="status">
                  <Select disabled>
                    <Option value="active">Hoạt động</Option>
                    <Option value="locked">Bị khóa</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Trạng thái duyệt" name="approval_status">
                  <Select disabled>
                    <Option value="pending">Chờ duyệt</Option>
                    <Option value="approved">Đã duyệt</Option>
                    <Option value="rejected">Từ chối</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày sinh" name="dob">
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Địa chỉ liên hệ" name="address">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Cấp bậc" name="level">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ghi chú" name="note">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={8} style={{ textAlign: "center" }}>
            <Form.Item label="Ảnh đại diện">
              <Upload
                name="avatar"
                listType="picture-circle"
                showUploadList={false}
                beforeUpload={() => false}
              >
                <Avatar
                  size={120}
                  src={mockUser.avatar}
                  style={{ marginBottom: 8 }}
                />
                <div style={{ color: "#999" }}>
                  Nhấp vào để thay đổi ảnh
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
          <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
            Lưu thay đổi
          </Button>
          <Button danger>Đóng</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProfilePage;
