import { use, useEffect, useState } from 'react';
import { Form, Input, Button, Upload, message, Card, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { config } from '../../../api/axios';

const ProfileEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    config.get('/auth/user-me')
      .then(res => {
        const user = res.data.data;
        console.log("User form", user)
        form.setFieldsValue({
          fullName: user.name,
          email: user.email,
          phone: user.phone || user.instructorInfo?.phone || "",
          address: user.address || user.instructorInfo?.address || "",
        });

        if (user.avatar) {
          const filename = user.avatar.replace(/^uploads\/avatars\//, ''); // bỏ nếu đã bao gồm path
          const url = `http://localhost:5000/uploads/avatars/${filename}`;
          setAvatarUrl(url);
          form.setFieldValue("avatar", filename); // chỉ lưu filename
        }

      })
      .catch(err => {
        message.error("Không thể tải thông tin người dùng");
      });
  }, [form]);

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await config.post('/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const filename = res.data?.data?.avatar;
      const fullUrl = `http://localhost:5000/uploads/avatars/${filename}`;
      setAvatarUrl(fullUrl);
      form.setFieldValue("avatar", filename);
      message.success("Tải ảnh lên thành công");
    } catch (error) {
      message.error("Lỗi tải ảnh lên");
    }

    return false;
  };


  const onFinish = async (values: any) => {
    console.log("Giá trị", values); // <-- để đảm bảo phone và address không bị undefined

    try {
      await config.put('/auth/update-me', {
        name: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        avatar: values.avatar,
      });
      message.success('Cập nhật thành công!');
      navigate('/');
    } catch (err) {
      message.error("Lỗi cập nhật thông tin");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title="Cập nhật thông tin cá nhân" className="max-w-4xl mx-auto">
        <Form
          form={form}
          name="profile-edit"
          onFinish={onFinish}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="avatar" label="Ảnh đại diện">
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        borderRadius: '8px', // hoặc bỏ dòng này nếu muốn vuông hoàn toàn
                        backgroundColor: '#f5f5f5',
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                      }}
                    >
                      <UploadOutlined style={{ fontSize: 24 }} />
                      <div className="ant-upload-text">Tải ảnh lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>


            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
              <Button className="ml-4" onClick={() => navigate('/profile')}>Hủy bỏ</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default ProfileEdit;
