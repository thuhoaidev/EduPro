import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import userService from "../services/userService";

const ChangePasswordForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    const { currentPassword, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (currentPassword === newPassword) {
      message.warning("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      message.success("Đổi mật khẩu thành công!");
      form.resetFields();
    } catch (err: any) {
      if (err?.response?.status === 400 || err?.response?.data?.message === "Invalid current password") {
        message.error("Mật khẩu hiện tại không đúng.");
      } else {
        message.error("Lỗi khi đổi mật khẩu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: 400, margin: "0 auto" }}
    >
      <Form.Item
        label="Mật khẩu hiện tại"
        name="currentPassword"
        rules={[{ required: true, message: "Nhập mật khẩu hiện tại" }]}
      >
        <Input.Password placeholder="Mật khẩu hiện tại" />
      </Form.Item>

      <Form.Item
        label="Mật khẩu mới"
        name="newPassword"
        rules={[{ required: true, message: "Nhập mật khẩu mới" }]}
      >
        <Input.Password placeholder="Mật khẩu mới" />
      </Form.Item>

      <Form.Item
        label="Xác nhận mật khẩu mới"
        name="confirmPassword"
        rules={[{ required: true, message: "Xác nhận lại mật khẩu mới" }]}
      >
        <Input.Password placeholder="Xác nhận mật khẩu mới" />
      </Form.Item>

      <Form.Item style={{ textAlign: "center" }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Đổi mật khẩu
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChangePasswordForm;
