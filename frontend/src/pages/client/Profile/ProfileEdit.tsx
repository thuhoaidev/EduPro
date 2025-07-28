import { Form, Input, Button, Upload, message, Card, Row, Col, DatePicker, Select, Spin, Typography, Divider, Avatar } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined, CameraOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { config } from '../../../api/axios';
import React from 'react';
import moment from 'moment';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface FormValues {
  avatar?: File[];
  fullname?: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: moment.Moment;
  gender?: string;
  nickname?: string;
  bio?: string;
}

const ProfileEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = React.useState<string>('');
  const [avatarFileList, setAvatarFileList] = React.useState<UploadFile[]>([]);

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
          setAvatarFileList([]); // reset fileList nếu có avatar từ backend
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
          nickname: userData.nickname,
        };
        console.log('Form data mapped for setFieldsValue:', formData);
        form.setFieldsValue(formData);

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
    console.log('values.avatar:', values.avatar);
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();

      // Nếu có file mới, chỉ gửi file
      if (values.avatar && Array.isArray(values.avatar) && values.avatar.length > 0) {
        const fileObj = values.avatar[0] && typeof values.avatar[0] === 'object' && 'originFileObj' in values.avatar[0] ? values.avatar[0].originFileObj : null;
        if (fileObj instanceof File) {
          formData.append('avatar', fileObj);
        }
      }

      // Thêm các trường khác
      formData.append('fullname', values.fullname || '');
      formData.append('email', values.email);
      formData.append('phone', values.phone || '');
      formData.append('address', values.address || '');
      formData.append('dob', values.dob ? values.dob.format('YYYY-MM-DD') : '');
      formData.append('gender', values.gender || '');
      formData.append('bio', values.bio || '');
      formData.append('nickname', values.nickname || '');

      const response = await config.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        message.success('Cập nhật thông tin thành công!');
        navigate('/profile');
      } else {
        message.error(response.data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e: unknown) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleAvatarChange = (info: { file: UploadFile; fileList: UploadFile[] }) => {
    setAvatarFileList(info.fileList);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}
    >
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/profile')}
            style={{ marginRight: '16px' }}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>Chỉnh sửa thông tin cá nhân</Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            gender: 'other'
          }}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="Ảnh đại diện">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleAvatarChange}
                  fileList={avatarFileList}
                >
                  {avatarUrl || avatarFileList.length > 0 ? (
                    <img 
                      src={avatarUrl || (avatarFileList[0]?.thumbUrl || avatarFileList[0]?.url)} 
                      alt="avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div>
                      <CameraOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="fullname"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="male">Nam</Select.Option>
                  <Select.Option value="female">Nữ</Select.Option>
                  <Select.Option value="other">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="dob"
                label="Ngày sinh"
              >
                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nickname"
                label="Biệt danh"
              >
                <Input placeholder="Nhập biệt danh" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Giới thiệu"
          >
            <Input.TextArea rows={4} placeholder="Viết gì đó về bản thân..." />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              style={{ width: '100%' }}
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  );
};

export default ProfileEdit; 