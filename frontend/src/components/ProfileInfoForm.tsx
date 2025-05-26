import React, { useEffect, useState } from "react";
import { Form, Input, Button, Upload, message, Avatar } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import userService from "../services/userService";

const ProfileInfoForm = () => {
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await userService.getProfile();
      form.setFieldsValue({ name: data.name });
      setAvatarPreview(data.avatarUrl || "");
    };
    fetchProfile();
  }, [form]);

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ hỗ trợ file ảnh!");
      return Upload.LIST_IGNORE;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    return false;
  };

  const onFinish = async (values: any) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (avatarFile) formData.append("avatar", avatarFile);

    setLoading(true);
    try {
      await userService.updateProfile(formData);
      message.success("Cập nhật thành công!");
    } catch (err) {
      message.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Tên hiển thị"
        name="name"
        rules={[{ required: true, message: "Nhập tên của bạn" }]}
      >
        <Input placeholder="Nhập tên..." />
      </Form.Item>

      <Form.Item label="Ảnh đại diện">
        <Upload beforeUpload={beforeUpload} showUploadList={false} accept="image/*">
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
        <div style={{ marginTop: 16 }}>
          <Avatar
            size={100}
            src={avatarPreview}
            icon={<UserOutlined />}
            style={{ border: "1px solid #ccc" }}
          />
        </div>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Lưu thay đổi
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProfileInfoForm;
