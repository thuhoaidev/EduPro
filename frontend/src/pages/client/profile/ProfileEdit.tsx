import { Form, Input, Button, Upload, message, Card, Row, Col, DatePicker, Select, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined, TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { config } from '../../../api/axios';
import React from 'react';

interface User {
  id: number;
  avatar?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  role_id?: string;
  status?: string;
  email_verified?: boolean;
  approval_status?: string;
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
        
        form.setFieldsValue({
          ...userData,
          dob: userData.dob ? new Date(userData.dob) : undefined,
          gender: userData.gender || undefined,
        });

        setUser({
          id: userData.id,
          avatar: userData.avatar,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          dob: userData.dob,
          gender: userData.gender,
          role_id: userData.role_id,
          status: userData.status,
          email_verified: userData.email_verified,
          approval_status: userData.approval_status,
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

      const formData = new FormData();
      if (values.avatar && Array.isArray(values.avatar) && values.avatar.length > 0) {
        formData.append('avatar', values.avatar[0]);
      }

      // Thêm các trường vào formData
      Object.keys(values).forEach(key => {
        if (key !== 'avatar' && values[key as keyof User] !== undefined) {
          const value = values[key as keyof User];
          if (key === 'dob' && value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value?.toString() || '');
          }
        }
      });

      const response = await config.put(`/auth/update-profile/${user?.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        message.success('Cập nhật thông tin thành công');
        navigate('/profile');
      } else {
        message.error(response.data.message || 'Cập nhật thất bại');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Cập nhật thất bại');
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
    return <Spin />;
  }

  return (
    <Card title="Chỉnh sửa hồ sơ" style={{ width: '100%' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={12}>
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
          <Col span={12}>
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Vui lòng nhập email' }]}
            >
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
            >
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Giới tính"
            >
              <Select
                placeholder="Chọn giới tính"
                options={[
                  { value: 'male', label: 'Nam' },
                  { value: 'female', label: 'Nữ' },
                  { value: 'other', label: 'Khác' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dob"
              label="Ngày sinh"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu thay đổi
          </Button>
          <Button
            className="ml-4"
            onClick={() => navigate('/profile')}
          >
            Hủy bỏ
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProfileEdit;
