import { Form, Input, Button, Upload, message, Card, Row, Col, DatePicker, Select, Spin, Typography, Divider, Avatar, Space, Tag } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined, CameraOutlined, SaveOutlined, ArrowLeftOutlined, EditOutlined, UserSwitchOutlined, CalendarOutlined, EnvironmentOutlined, IdcardOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { config } from '../../../api/axios';
import React from 'react';
import moment from 'moment';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

interface FormValues {
  avatar?: any[];
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
  const [saving, setSaving] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string>('');
  const [avatarFileList, setAvatarFileList] = React.useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

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
          setPreviewUrl(''); // reset preview URL
        } else {
          setAvatarUrl('');
          setAvatarFileList([]);
          setPreviewUrl('');
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
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
        navigate('/login');
        return;
      }

      // Tạo FormData để gửi cả thông tin và avatar
      const formData = new FormData();

      // Thêm thông tin cơ bản
      formData.append('fullname', values.fullname || '');
      formData.append('email', values.email);
      formData.append('phone', values.phone || '');
      formData.append('address', values.address || '');
      formData.append('dob', values.dob ? values.dob.format('YYYY-MM-DD') : '');
      formData.append('gender', values.gender || '');
      formData.append('bio', values.bio || '');
      formData.append('nickname', values.nickname || '');

      // Nếu có file avatar mới
      if (values.avatar && Array.isArray(values.avatar) && values.avatar.length > 0) {
        const fileObj = values.avatar[0]?.originFileObj;
        if (fileObj instanceof File) {
          formData.append('avatar', fileObj);
          console.log('Avatar file added to form data:', fileObj.name, fileObj.size);
        }
      }

      console.log('Sending form data with avatar:', formData);

      const response = await config.put('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response:', response);

      if (response.data && response.data.success) {
        message.success('Cập nhật thông tin thành công!');

        // Cập nhật avatar URL nếu có avatar mới
        if (response.data.avatarInfo) {
          setAvatarUrl(response.data.avatarInfo.url);
          setPreviewUrl(''); // Reset preview URL sau khi upload thành công
        }

        // Cập nhật user data trong localStorage
        const updatedUserData = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUserData));

        // Emit custom event để cập nhật header
        const userUpdateEvent = new CustomEvent('user-updated', {
          detail: { user: updatedUserData }
        });
        window.dispatchEvent(userUpdateEvent);

        // Không navigate ngay, để user thấy thông báo thành công
        setTimeout(() => {
          navigate('/profile?refresh=1');
        }, 1500);
      } else {
        const errorMessage = response.data?.message || 'Cập nhật thông tin thất bại!';
        message.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);

      // Kiểm tra lỗi cụ thể
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 401) {
          message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
          localStorage.removeItem('token');
          setPreviewUrl(''); // Reset preview URL
          navigate('/login');
          return;
        } else if (status === 400) {
          const errorMessage = errorData?.message || 'Dữ liệu không hợp lệ!';
          message.error(errorMessage);
          setPreviewUrl(''); // Reset preview URL
        } else if (status === 413) {
          message.error('File ảnh quá lớn, vui lòng chọn file nhỏ hơn 10MB!');
          setPreviewUrl(''); // Reset preview URL
        } else if (status === 415) {
          message.error('Định dạng file không được hỗ trợ, vui lòng chọn file ảnh!');
          setPreviewUrl(''); // Reset preview URL
        } else if (status === 500) {
          message.error('Lỗi server, vui lòng thử lại sau!');
          setPreviewUrl(''); // Reset preview URL
        } else {
          const errorMessage = errorData?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
          message.error(errorMessage);
          setPreviewUrl(''); // Reset preview URL
        }
      } else if (error.request) {
        message.error('Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng!');
        setPreviewUrl(''); // Reset preview URL
      } else {
        message.error('Có lỗi xảy ra khi cập nhật thông tin');
        setPreviewUrl(''); // Reset preview URL
      }
    } finally {
      setSaving(false);
      // Reset preview URL nếu có lỗi
      if (avatarFileList.length === 0) {
        setPreviewUrl('');
      }
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleAvatarChange = (info: { file: UploadFile; fileList: UploadFile[] }) => {
    setAvatarFileList(info.fileList.slice(-1));

    // Tạo preview URL cho file mới
    if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
      const url = URL.createObjectURL(info.fileList[0].originFileObj);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  // Cleanup URL objects when component unmounts
  React.useEffect(() => {
    return () => {
      // Cleanup preview URL to prevent memory leaks
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: '24px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}
    >
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: 'none'
        }}
      >
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
              <EditOutlined style={{ marginRight: '8px', color: '#667eea' }} />
              Chỉnh sửa thông tin cá nhân
            </Title>
            <Text type="secondary">Cập nhật thông tin cá nhân của bạn</Text>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            gender: 'other'
          }}
        >
          {/* Avatar Section */}
          <Row gutter={24} style={{ marginBottom: '32px' }}>
            <Col span={24}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: 'none',
                  borderRadius: '12px'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ marginBottom: '16px', color: '#1a1a1a' }}>
                    <CameraOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                    Ảnh đại diện
                  </Title>
                  <Form.Item
                    name="avatar"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[
                      {
                        validator: (_, fileList) => {
                          if (fileList && fileList.length > 0) {
                            const file = fileList[0];
                            const isImage = file.type?.startsWith('image/');
                            const isLt10M = file.size / 1024 / 1024 < 10;

                            if (!isImage) {
                              return Promise.reject(new Error('Chỉ cho phép upload file ảnh!'));
                            }
                            if (!isLt10M) {
                              return Promise.reject(new Error('File phải nhỏ hơn 10MB!'));
                            }
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <Upload
                      name="avatar"
                      listType="picture-circle"
                      className="avatar-uploader"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleAvatarChange}
                      fileList={avatarFileList}
                      style={{ marginBottom: '16px' }}
                    >
                      {avatarUrl || avatarFileList.length > 0 ? (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={avatarUrl || previewUrl || avatarFileList[0]?.thumbUrl || avatarFileList[0]?.url}
                            alt="avatar"
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '4px solid white',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            background: '#667eea',
                            color: 'white',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}>
                            <EditOutlined />
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          border: '2px dashed #d9d9d9',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}>
                          <CameraOutlined style={{ fontSize: '24px', color: '#667eea', marginBottom: '8px' }} />
                          <Text style={{ fontSize: '12px', color: '#666' }}>Tải ảnh</Text>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>

                  {/* Hiển thị thông tin file đã chọn */}
                  {avatarFileList.length > 0 && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#f0f8ff',
                      borderRadius: '8px',
                      border: '1px solid #d1e7ff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: '12px', color: '#1890ff' }}>
                            {avatarFileList[0]?.name}
                          </Text>
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                            {(avatarFileList[0]?.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setAvatarFileList([]);
                            setPreviewUrl('');
                          }}
                          style={{ color: '#ff4d4f' }}
                        />
                      </div>
                    </div>
                  )}

                  <Text type="secondary">Nhấp để thay đổi ảnh đại diện</Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Personal Information */}
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: '#667eea' }} />
                <span>Thông tin cá nhân</span>
              </Space>
            }
            style={{ marginBottom: '24px', borderRadius: '12px' }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fullname"
                  label={
                    <Space>
                      <UserOutlined style={{ color: '#667eea' }} />
                      <span>Họ và tên</span>
                    </Space>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input
                    placeholder="Nhập họ và tên"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label={
                    <Space>
                      <MailOutlined style={{ color: '#667eea' }} />
                      <span>Email</span>
                    </Space>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input
                    placeholder="Nhập email"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label={
                    <Space>
                      <PhoneOutlined style={{ color: '#667eea' }} />
                      <span>Số điện thoại</span>
                    </Space>
                  }
                >
                  <Input
                    placeholder="Nhập số điện thoại"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="gender"
                  label={
                    <Space>
                      <UserSwitchOutlined style={{ color: '#667eea' }} />
                      <span>Giới tính</span>
                    </Space>
                  }
                >
                  <Select
                    placeholder="Chọn giới tính"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  >
                    <Select.Option value="male">
                      <Space>
                        <span>👨</span>
                        <span>Nam</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="female">
                      <Space>
                        <span>👩</span>
                        <span>Nữ</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="other">
                      <Space>
                        <span>🌈</span>
                        <span>Khác</span>
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="dob"
                  label={
                    <Space>
                      <CalendarOutlined style={{ color: '#667eea' }} />
                      <span>Ngày sinh</span>
                    </Space>
                  }
                >
                  <DatePicker
                    style={{ width: '100%', borderRadius: '8px' }}
                    placeholder="Chọn ngày sinh"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="nickname"
                  label={
                    <Space>
                      <IdcardOutlined style={{ color: '#667eea' }} />
                      <span>Biệt danh</span>
                    </Space>
                  }
                >
                  <Input
                    placeholder="Nhập biệt danh"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label={
                <Space>
                  <EnvironmentOutlined style={{ color: '#667eea' }} />
                  <span>Địa chỉ</span>
                </Space>
              }
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập địa chỉ"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="bio"
              label={
                <Space>
                  <UserOutlined style={{ color: '#667eea' }} />
                  <span>Giới thiệu</span>
                </Space>
              }
            >
              <Input.TextArea
                rows={4}
                placeholder="Viết gì đó về bản thân..."
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Card>

          {/* Action Buttons */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Space size="large">
              <Button
                onClick={() => navigate('/profile')}
                size="large"
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  paddingLeft: '32px',
                  paddingRight: '32px'
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
                size="large"
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  paddingLeft: '32px',
                  paddingRight: '32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </motion.div>
  );
};

export default ProfileEdit; 