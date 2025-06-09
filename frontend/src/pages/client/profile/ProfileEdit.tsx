import { Form, Input, Button, Upload, message, Card, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    message.success('Cập nhật thông tin thành công!');
    // Sau khi cập nhật thành công, quay lại trang hồ sơ
    navigate('/profile');
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title="Cập nhật thông tin cá nhân" className="max-w-4xl mx-auto">
        <Form
          form={form}
          name="profile-edit"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="avatar"
                label="Ảnh đại diện"
              >
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} đã được tải lên`);
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} tải lên thất bại`);
                    }
                  }}
                >
                  {form.getFieldValue('avatar') ? (
                    <img
                      src={form.getFieldValue('avatar')}
                      alt="avatar"
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div className="ant-upload-text">
                        Tải ảnh lên
                      </div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <Form.Item
                  name="fullname"
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

                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="Địa chỉ"
                >
                  <Input.TextArea placeholder="Nhập địa chỉ" />
                </Form.Item>
              </div>
            </Col>
          </Row>

          <Row>
            <Col span={24} className="text-right">
              <Button type="primary" htmlType="submit">
                Lưu thay đổi
              </Button>
              <Button
                className="ml-4"
                onClick={() => navigate('/profile')}
              >
                Hủy bỏ
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default ProfileEdit;
