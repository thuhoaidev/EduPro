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

interface FileWithOriginFileObj {
  originFileObj?: File;
}

const ProfileEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
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
        const file = values.avatar[0] instanceof File ? values.avatar[0] : (values.avatar[0] as FileWithOriginFileObj).originFileObj;
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

    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Cập nhật thất bại';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e: unknown) => {
    if (Array.isArray(e)) {
      return e;
    }
    return (e as { fileList?: unknown })?.fileList;
  };

  const handleAvatarChange = (info: { file: UploadFile }) => {
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <motion.div
        className="max-w-4xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        <motion.div variants={itemVariants}>
          <Card 
            className="shadow-xl border-0"
            headStyle={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px 8px 0 0'
            }}
            title={
              <div className="flex items-center gap-2">
                <UserOutlined />
                <span>Thông tin cá nhân</span>
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              {/* Avatar Section */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex flex-col items-center">
                  <Form.Item
                    name="avatar"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    className="!mb-4"
                  >
                    <Upload
                      name="avatar"
                      listType="picture-circle"
                      className="avatar-uploader"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleAvatarChange}
                    >
                      {avatarUrl ? (
                        <div className="relative">
                          <Avatar 
                            src={avatarUrl} 
                            size={120}
                            className="!border-4 !border-white !shadow-lg"
                          />
                          <motion.div
                            className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <CameraOutlined />
                          </motion.div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <UploadOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                          <div className="mt-2 text-sm text-gray-600">
                            Tải ảnh lên
                          </div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                  <Text type="secondary" className="text-center">
                    Nhấp vào ảnh để thay đổi ảnh đại diện
                  </Text>
                </div>
              </motion.div>

              <Divider />

              {/* Personal Information */}
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      name="fullname"
                      label={
                        <Text strong className="text-gray-700">
                          Họ và tên
                        </Text>
                      }
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                    >
                      <Input 
                        prefix={<UserOutlined className="text-gray-400" />} 
                        size="large"
                        className="!rounded-lg"
                        placeholder="Nhập họ và tên"
                      />
                    </Form.Item>
                  </motion.div>
                </Col>
                <Col xs={24} md={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      name="email"
                      label={
                        <Text strong className="text-gray-700">
                          Email
                        </Text>
                      }
                      rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                    >
                      <Input 
                        prefix={<MailOutlined className="text-gray-400" />} 
                        disabled 
                        size="large"
                        className="!rounded-lg !bg-gray-50"
                      />
                    </Form.Item>
                  </motion.div>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      name="phone"
                      label={
                        <Text strong className="text-gray-700">
                          Số điện thoại
                        </Text>
                      }
                    >
                      <Input 
                        prefix={<PhoneOutlined className="text-gray-400" />} 
                        size="large"
                        className="!rounded-lg"
                        placeholder="Nhập số điện thoại"
                      />
                    </Form.Item>
                  </motion.div>
                </Col>
                <Col xs={24} md={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      name="gender"
                      label={
                        <Text strong className="text-gray-700">
                          Giới tính
                        </Text>
                      }
                    >
                      <Select
                        placeholder="Chọn giới tính"
                        size="large"
                        className="!rounded-lg"
                        options={[
                          { value: 'Nam', label: 'Nam' },
                          { value: 'Nữ', label: 'Nữ' },
                          { value: 'Khác', label: 'Khác' }
                        ]}
                      />
                    </Form.Item>
                  </motion.div>
                </Col>
              </Row>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="dob"
                  label={
                    <Text strong className="text-gray-700">
                      Ngày sinh
                    </Text>
                  }
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY" 
                    size="large"
                    className="!rounded-lg"
                    placeholder="Chọn ngày sinh"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="address"
                  label={
                    <Text strong className="text-gray-700">
                      Địa chỉ
                    </Text>
                  }
                >
                  <Input.TextArea 
                    rows={3} 
                    size="large"
                    className="!rounded-lg"
                    placeholder="Nhập địa chỉ của bạn"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="bio"
                  label={
                    <Text strong className="text-gray-700">
                      Giới thiệu
                    </Text>
                  }
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder="Giới thiệu về bản thân..." 
                    size="large"
                    className="!rounded-lg"
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item className="!mb-0">
                  <div className="flex gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        size="large"
                        className="!h-12 !text-base !font-semibold !rounded-lg"
                        icon={<SaveOutlined />}
                      >
                        Lưu thay đổi
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        size="large"
                        className="!h-12 !px-6 !rounded-lg"
                        onClick={() => navigate('/profile')}
                        icon={<ArrowLeftOutlined />}
                      >
                        Hủy bỏ
                      </Button>
                    </motion.div>
                  </div>
                </Form.Item>
              </motion.div>
            </Form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileEdit;
