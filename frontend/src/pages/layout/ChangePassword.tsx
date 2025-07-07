import React from 'react';
import { motion } from 'framer-motion';
import { Form, Input, Button, message, Card, Typography, Divider, Alert } from 'antd';
import { LockOutlined, SafetyOutlined, EyeInvisibleOutlined, EyeTwoTone, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { config } from '../../api/axios';

const { Title, Text } = Typography;

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState(0);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await config.patch('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Mật khẩu đã được thay đổi thành công!');
      navigate('/profile');
    } catch (error: any) {
      message.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi mật khẩu'
      );
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (value && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) {
      return Promise.reject('Mật khẩu phải có ít nhất 8 ký tự và chứa cả chữ và số');
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: any, value: string) => {
    const newPassword = form.getFieldValue('newPassword');
    if (value && value !== newPassword) {
      return Promise.reject('Mật khẩu không khớp');
    }
    return Promise.resolve();
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#ff4d4f';
    if (passwordStrength <= 3) return '#faad14';
    if (passwordStrength <= 4) return '#52c41a';
    return '#1890ff';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Yếu';
    if (passwordStrength <= 3) return 'Trung bình';
    if (passwordStrength <= 4) return 'Mạnh';
    return 'Rất mạnh';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <motion.div
        className="max-w-2xl mx-auto px-4"
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
                <LockOutlined />
                <span>Thông tin mật khẩu</span>
              </div>
            }
          >
            <Form
              form={form}
              name="change_password"
              onFinish={onFinish}
              layout="vertical"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <Form.Item
                  name="currentPassword"
                  label={
                    <Text strong className="text-gray-700">
                      Mật khẩu hiện tại
                    </Text>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Nhập mật khẩu hiện tại"
                    size="large"
                    className="!rounded-lg"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
              </motion.div>

              <Divider />

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="newPassword"
                  label={
                    <Text strong className="text-gray-700">
                      Mật khẩu mới
                    </Text>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { validator: validatePassword },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Nhập mật khẩu mới"
                    size="large"
                    className="!rounded-lg"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    onChange={(e) => checkPasswordStrength(e.target.value)}
                  />
                </Form.Item>

                {/* Password Strength Indicator */}
                {form.getFieldValue('newPassword') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Text type="secondary" className="text-sm">Độ mạnh mật khẩu:</Text>
                      <Text 
                        strong 
                        style={{ color: getPasswordStrengthColor() }}
                        className="text-sm"
                      >
                        {getPasswordStrengthText()}
                      </Text>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <motion.div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength 
                              ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500' 
                              : 'bg-gray-200'
                          }`}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: level * 0.1 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                <Alert
                  message="Yêu cầu mật khẩu"
                  description="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số"
                  type="info"
                  showIcon
                  className="mb-4"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="confirmPassword"
                  label={
                    <Text strong className="text-gray-700">
                      Xác nhận mật khẩu
                    </Text>
                  }
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    { validator: validateConfirmPassword },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Xác nhận mật khẩu"
                    size="large"
                    className="!rounded-lg"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
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
                        icon={<CheckCircleOutlined />}
                      >
                        Đổi mật khẩu
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

        {/* Security Tips */}
        <motion.div 
          variants={itemVariants}
          className="mt-6"
        >
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-start gap-3">
              <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a', marginTop: 2 }} />
              <div>
                <Text strong className="text-green-800">Lời khuyên bảo mật:</Text>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>• Sử dụng mật khẩu dài ít nhất 8 ký tự</li>
                  <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                  <li>• Không sử dụng thông tin cá nhân trong mật khẩu</li>
                  <li>• Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;