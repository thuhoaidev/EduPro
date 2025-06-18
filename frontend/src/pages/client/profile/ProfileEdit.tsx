import { Form, Input, Button, Upload, message, Card, Row, Col, DatePicker, Select, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { config } from '../../../api/axios';
import React from 'react';
import moment from 'moment';

interface User {
  id: number;
  avatar?: string;
  fullname?: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  role_id?: string;
  status?: string;
  email_verified?: boolean;
  approval_status?: string;
  nickname?: string;
  bio?: string;
}

interface FormValues {
  avatar?: any[];
  fullname?: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: any;
  gender?: string;
  nickname?: string;
  bio?: string;
}

const ProfileEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string>('');

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await config.get('/users/me');
        const userData = response.data.data;
        console.log('User data from API:', userData);
        
        // Set avatar URL for display
        if (userData.avatar) {
          setAvatarUrl(userData.avatar);
        }

        // Map backend fields to form fields
        const formData = {
          fullname: userData.fullname || userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          dob: userData.dob ? moment(userData.dob) : undefined,
          gender: userData.gender || undefined,
          bio: userData.bio,
        };
        console.log('Form data mapped for setFieldsValue:', formData);
        form.setFieldsValue(formData);

        setUser({
          id: userData._id || userData.id,
          avatar: userData.avatar,
          fullname: userData.fullname,
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
          nickname: userData.nickname,
          bio: userData.bio,
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

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      
      // Handle avatar upload
      if (values.avatar && Array.isArray(values.avatar) && values.avatar.length > 0) {
        const file = values.avatar[0].originFileObj || values.avatar[0];
        if (file) {
          formData.append('avatar', file);
        }
      }

      // Add other fields to formData
      Object.keys(values).forEach(key => {
        if (key !== 'avatar' && values[key as keyof FormValues] !== undefined) {
          const value = values[key as keyof FormValues];
          if (key === 'dob' && value && typeof value === 'object' && 'toISOString' in value) {
            // Handle moment object
            formData.append(key, value.toISOString());
          } else if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await config.put('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        message.success('Cập nhật thông tin thành công');
        // Update localStorage with new user data
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        navigate('/profile');
      } else {
        message.error(response.data.message || 'Cập nhật thất bại');
      }

    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Cập nhật thất bại';
      message.error(errorMessage);
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

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} đã được tải lên`);
      // Update avatar display
      if (info.file.response?.data?.avatarInfo?.url) {
        setAvatarUrl(info.file.response.data.avatarInfo.url);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại`);
    }
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
                onChange={handleAvatarChange}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
              name="fullname"
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
                  { value: 'Nam', label: 'Nam' },
                  { value: 'Nữ', label: 'Nữ' },
                  { value: 'Khác', label: 'Khác' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dob"
              label="Ngày sinh"
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item
          name="bio"
          label="Giới thiệu"
        >
          <Input.TextArea rows={3} placeholder="Giới thiệu về bản thân..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu thay đổi
          </Button>
          <Button
            style={{ marginLeft: 8 }}
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
