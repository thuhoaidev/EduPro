import { Form, Input, Button, Upload, message, Card, Row, Col, DatePicker, Select, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined, TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { config } from '../../../api/axios';
import React from 'react';

interface User {
  id: number;
  avatar?: string;
  fullname: string;
  email: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  bio?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
}

const ProfileEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await config.get('/auth/me');
        const userData = response.data;
        
        // Đặt giá trị mặc định cho form
        form.setFieldsValue({
          ...userData,
          avatar: userData.avatar || undefined,
          birthdate: userData.birthdate ? new Date(userData.birthdate) : undefined,
          gender: userData.gender || undefined,
        });

        // Cập nhật state
        setUser({
          id: userData.id,
          avatar: userData.avatar,
          fullname: userData.fullname || '',
          email: userData.email,
          phone: userData.phone || '',
          birthdate: userData.birthdate || '',
          gender: userData.gender || '',
          address: userData.address || '',
          bio: userData.bio || '',
          facebook: userData.facebook || '',
          linkedin: userData.linkedin || '',
          twitter: userData.twitter || '',
        });

      } catch (error) {
        console.error('Error fetching user data:', error);
        message.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, form]);

  const onFinish = async (values: User) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Xử lý avatar
      const formData = new FormData();
      if (values.avatar && Array.isArray(values.avatar) && values.avatar.length > 0) {
        formData.append('avatar', values.avatar[0]);
      }

      // Thêm các trường khác vào formData
      Object.keys(values).forEach(key => {
        if (key !== 'avatar' && values[key as keyof User] !== undefined) {
          formData.append(key, values[key as keyof User]?.toString() || '');
        }
      });

      const response = await config.put('/auth/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success('Cập nhật thông tin thành công!');
      // Cập nhật lại thông tin người dùng trong localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">
      <Card title="Cập nhật thông tin cá nhân" className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <Spin size="large" />
        </div>
      </Card>
    </div>;
  }

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
                valuePropName="fileList"
                getValueFromEvent={normFile}
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
                  {form.getFieldValue('avatar') && form.getFieldValue('avatar').length > 0 ? (
                    <img
                      src={form.getFieldValue('avatar')[0].url || form.getFieldValue('avatar')[0].thumbUrl}
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
                {/* Hiển thị thông tin hiện tại */}
                {user && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Thông tin hiện tại</h3>
                    <div className="space-y-2">
                      <p><strong>Họ và tên:</strong> {user.fullname || 'Chưa cập nhật'}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Số điện thoại:</strong> {user.phone || 'Chưa cập nhật'}</p>
                      <p><strong>Ngày sinh:</strong> {user.birthdate ? new Date(user.birthdate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                      <p><strong>Giới tính:</strong> {user.gender || 'Chưa cập nhật'}</p>
                      <p><strong>Địa chỉ:</strong> {user.address || 'Chưa cập nhật'}</p>
                      <p><strong>Giới thiệu bản thân:</strong> {user.bio || 'Chưa cập nhật'}</p>
                      <p><strong>Facebook:</strong> {user.facebook ? (
                        <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {user.facebook}
                        </a>
                      ) : 'Chưa cập nhật'}</p>
                      <p><strong>LinkedIn:</strong> {user.linkedin ? (
                        <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {user.linkedin}
                        </a>
                      ) : 'Chưa cập nhật'}</p>
                      <p><strong>Twitter:</strong> {user.twitter ? (
                        <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {user.twitter}
                        </a>
                      ) : 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                )}
                <Form.Item
                  name="fullname"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập họ và tên"
                    defaultValue={user?.fullname}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập email"
                    defaultValue={user?.email}
                    disabled
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Nhập số điện thoại"
                    defaultValue={user?.phone}
                  />
                </Form.Item>

                <Form.Item
                  name="birthdate"
                  label="Ngày sinh"
                >
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    defaultValue={user?.birthdate ? new Date(user.birthdate) : undefined}
                  />
                </Form.Item>

                <Form.Item
                  name="gender"
                  label="Giới tính"
                >
                  <Select
                    placeholder="Chọn giới tính"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'male', label: 'Nam' },
                      { value: 'female', label: 'Nữ' },
                      { value: 'other', label: 'Khác' }
                    ]}
                    defaultValue={user?.gender}
                  />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="Địa chỉ"
                >
                  <Input.TextArea
                    placeholder="Nhập địa chỉ"
                    defaultValue={user?.address}
                  />
                </Form.Item>

                <Form.Item
                  name="bio"
                  label="Giới thiệu bản thân"
                >
                  <Input.TextArea
                    placeholder="Viết một vài dòng giới thiệu về bản thân..."
                    defaultValue={user?.bio}
                  />
                </Form.Item>

                <Form.Item
                  name="facebook"
                  label="Facebook"
                >
                  <Input
                    prefix={<TagOutlined />}
                    placeholder="Nhập link Facebook"
                    defaultValue={user?.facebook}
                  />
                </Form.Item>

                <Form.Item
                  name="linkedin"
                  label="LinkedIn"
                >
                  <Input
                    prefix={<TagOutlined />}
                    placeholder="Nhập link LinkedIn"
                    defaultValue={user?.linkedin}
                  />
                </Form.Item>

                <Form.Item
                  name="twitter"
                  label="Twitter"
                >
                  <Input
                    prefix={<TagOutlined />}
                    placeholder="Nhập link Twitter"
                    defaultValue={user?.twitter}
                  />
                </Form.Item>
              </div>
            </Col>
          </Row>

          <Row justify="center">
            <Col span={24} className="text-center">
              <Button type="primary" htmlType="submit" loading={loading}>
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
