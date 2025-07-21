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
      // Nếu không có file mới, KHÔNG gửi trường avatar (để backend giữ nguyên avatar cũ)

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
        // Refetch user mới nhất và cập nhật localStorage
        const userRes = await config.get('/users/me');
        if (userRes.data && userRes.data.data) {
          localStorage.setItem('user', JSON.stringify(userRes.data.data));
          window.dispatchEvent(new Event('user-updated'));
        }
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

  const handleAvatarChange = (info: { file: UploadFile; fileList: UploadFile[] }) => {
    setAvatarFileList(info.fileList);
    form.setFieldsValue({ avatar: info.fileList }); // Đảm bảo form nhận file
    // Lấy file cuối cùng trong fileList (nếu có)
    const latestFile = info.fileList.length > 0 ? info.fileList[info.fileList.length - 1] : null;
    if (latestFile && latestFile.originFileObj) {
      setAvatarUrl(URL.createObjectURL(latestFile.originFileObj));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 flex items-center justify-center">
      <motion.div
        className="w-full max-w-5xl px-2 md:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Card */}
            <motion.div
              variants={itemVariants}
              className="md:w-1/3 w-full flex flex-col items-center"
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Form.Item
                  name="avatar"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  label={<Text strong className="text-gray-700 text-base">Ảnh đại diện</Text>}
                  className="!mb-4"
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 200,
                    position: 'relative'
                  }}>
                    <Upload
                      name="avatar"
                      listType="picture-circle"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleAvatarChange}
                      fileList={avatarFileList}
                      accept="image/*"
                      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <div style={{
                        position: 'relative',
                        width: 160,
                        height: 160,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1 0%, #a21caf 100%)',
                          zIndex: 1,
                          filter: 'blur(8px)',
                          opacity: 0.7
                        }} />
                        <Avatar
                          src={avatarUrl}
                          size={140}
                          style={{
                            border: '4px solid #fff',
                            boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.18)',
                            background: '#f0f0f0',
                            zIndex: 2
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          background: 'linear-gradient(135deg, #6366f1 0%, #a21caf 100%)',
                          borderRadius: '50%',
                          padding: 10,
                          zIndex: 3,
                          border: '2px solid #fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                          <UploadOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </div>
                      </div>
                    </Upload>
                  </div>
                </Form.Item>
              </Form>
            </motion.div>

            {/* Info Card */}
            <motion.div variants={itemVariants} className="md:w-2/3 w-full">
              <Card
                className="shadow-2xl border-0 glass-card bg-white/70 backdrop-blur-lg"
                style={{ borderRadius: 24 }}
                bodyStyle={{ padding: '2rem' }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  className="space-y-2"
                >
                  <Title level={3} className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold mb-6 text-2xl md:text-3xl">
                    Chỉnh sửa thông tin cá nhân
                  </Title>
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="fullname"
                        label={<Text strong className="text-gray-700 text-base">Họ và tên</Text>}
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                      >
                        <Input
                          prefix={<UserOutlined className="text-gray-400" />}
                          size="large"
                          className="!rounded-xl !bg-white/80"
                          placeholder="Nhập họ và tên"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label={<Text strong className="text-gray-700 text-base">Email</Text>}
                        rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                      >
                        <Input
                          prefix={<MailOutlined className="text-gray-400" />}
                          disabled
                          size="large"
                          className="!rounded-xl !bg-gray-100"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="nickname"
                        label={<Text strong className="text-gray-700 text-base">Tên đăng nhập</Text>}
                      >
                        <Input
                          disabled
                          size="large"
                          className="!rounded-xl !bg-gray-100"
                          placeholder="Nickname"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label={<Text strong className="text-gray-700 text-base">Số điện thoại</Text>}
                      >
                        <Input
                          prefix={<PhoneOutlined className="text-gray-400" />}
                          size="large"
                          className="!rounded-xl !bg-white/80"
                          placeholder="Nhập số điện thoại"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="gender"
                        label={<Text strong className="text-gray-700 text-base">Giới tính</Text>}
                      >
                        <Select
                          placeholder="Chọn giới tính"
                          size="large"
                          className="!rounded-xl"
                          options={[
                            { value: 'Nam', label: 'Nam' },
                            { value: 'Nữ', label: 'Nữ' },
                            { value: 'Khác', label: 'Khác' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="dob"
                        label={<Text strong className="text-gray-700 text-base">Ngày sinh</Text>}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                          size="large"
                          className="!rounded-xl"
                          placeholder="Chọn ngày sinh"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="address"
                    label={<Text strong className="text-gray-700 text-base">Địa chỉ</Text>}
                  >
                    <Input.TextArea
                      rows={3}
                      size="large"
                      className="!rounded-xl !bg-white/80"
                      placeholder="Nhập địa chỉ của bạn"
                    />
                  </Form.Item>
                  <Form.Item
                    name="bio"
                    label={<Text strong className="text-gray-700 text-base">Giới thiệu</Text>}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Giới thiệu về bản thân..."
                      size="large"
                      className="!rounded-xl !bg-white/80"
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                  <Form.Item className="!mb-0 mt-8">
                    <div className="flex gap-4 justify-end">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex-1"
                      >
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          size="large"
                          className="!h-14 !text-lg !font-semibold !rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 border-0 shadow-lg"
                          icon={<SaveOutlined />}
                        >
                          Lưu thay đổi
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button
                          size="large"
                          className="!h-14 !px-8 !rounded-xl shadow-md"
                          onClick={() => navigate('/profile')}
                          icon={<ArrowLeftOutlined />}
                        >
                          Hủy bỏ
                        </Button>
                      </motion.div>
                    </div>
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </div>
        </motion.div>
        <style>{`
          .glass-card {
            background: rgba(255,255,255,0.7);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
            backdrop-filter: blur(8px);
            border-radius: 24px;
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default ProfileEdit;