import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import useLogin from "../../../hooks/Auths/useLogin";
import { config } from "../../../api/axios";
import { motion } from "framer-motion";
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined, MailOutlined, ReadOutlined, TeamOutlined, BookOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthNotification from "../../../components/common/AuthNotification";
import AccountTypeModal from "../../../components/common/AccountTypeModal";

export default function LoginPage(): React.ReactElement {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate } = useLogin({ resource: "login" });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [accountTypeModalVisible, setAccountTypeModalVisible] = useState(false);
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  const onFinish = (values: { identifier: string; password: string }) => {
    setIsLoading(true);
    mutate(values, {
      onSuccess: (data) => {
        console.log('Login response:', data);
        if (data?.user?.isEmailVerified === false) {
          setVerificationEmail(values.identifier);
          setShowVerificationModal(true);
        } else {
          if (data?.token) {
            localStorage.setItem('token', data.token);
          }
          if (data?.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          setNotification({
            isVisible: true,
            type: 'success',
            title: 'Đăng nhập thành công!',
            message: 'Chào mừng bạn trở lại!'
          });

          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
        setIsLoading(false);
      },
      onError: (error: { response?: { data?: { message?: string } } }) => {
        const errorMessage = error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
        setNotification({
          isVisible: true,
          type: 'error',
          title: 'Lỗi đăng nhập!',
          message: errorMessage
        });
        setIsLoading(false);
      }
    });
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await config.post("/auth/resend-verification", { email: verificationEmail });
      setNotification({
        isVisible: true,
        type: 'success',
        title: 'Gửi lại email thành công!',
        message: 'Vui lòng kiểm tra hộp thư của bạn.'
      });
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Không thể gửi lại email. Vui lòng thử lại.";
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Lỗi gửi email!',
        message: errorMessage
      });
    } finally {
      setResendingVerification(false);
    }
  };

  const handleRegisterClick = () => {
    setAccountTypeModalVisible(true);
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const storedUser = localStorage.getItem('user');
  // console.log('User từ localStorage:', storedUser);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 relative">
      {/* Back to Home Button */}
      <motion.div
        className="absolute top-6 left-6 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-cyan-600"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div
            className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
            whileHover={{ rotate: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeftOutlined className="text-xs" />
          </motion.div>
          <span className="font-medium text-sm">Trang chủ</span>
          <motion.div
            className="w-2 h-2 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          />
        </motion.button>
      </motion.div>

      <motion.div
        className="flex bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden w-full max-w-6xl min-h-[600px] border border-white/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side - Form */}
        <motion.div
          className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative"
          variants={itemVariants}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>

          <motion.div
            variants={itemVariants}
            className="relative z-10"
          >
            <motion.h2
              className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600"
              variants={itemVariants}
            >
              Đăng Nhập
            </motion.h2>
            <motion.p
              className="text-center text-gray-600 mb-8"
              variants={itemVariants}
            >
              Đăng nhập vào tài khoản của bạn
            </motion.p>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              initialValues={{ remember: true }}
              autoComplete="off"
              layout="vertical"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <Form.Item
                  name="identifier"
                  rules={[
                    { required: true, message: "Vui lòng nhập email hoặc tên đăng nhập!" },
                    { min: 3, message: "Phải có ít nhất 3 ký tự" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Email hoặc tên đăng nhập"
                    prefix={<UserOutlined className="text-gray-400" />}
                    className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    autoComplete="username"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Mật khẩu"
                    prefix={<LockOutlined className="text-gray-400" />}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    autoComplete="current-password"
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                className="flex justify-between items-center"
                variants={itemVariants}
              >
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-gray-600 hover:text-cyan-600 transition-colors">
                    Lưu cho lần đăng nhập sau
                  </Checkbox>
                </Form.Item>
                <Link
                  to="/forgot-password"
                  className="text-cyan-600 hover:text-purple-600 text-sm font-medium transition-colors duration-300 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={isLoading}
                    className="w-full h-12 rounded-lg !bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white !font-semibold hover:opacity-90 border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
                  </Button>
                </Form.Item>
              </motion.div>

              <motion.div
                className="text-center text-base mt-6"
                variants={itemVariants}
              >
                <span className="text-gray-600">Bạn chưa có tài khoản? </span>
                <button
                  onClick={handleRegisterClick}
                  className="text-cyan-600 hover:text-purple-600 font-medium transition-colors duration-300 hover:underline"
                >
                  Đăng ký ngay
                </button>
              </motion.div>
            </Form>
          </motion.div>
        </motion.div>

        {/* Right Side - Features & Info */}
        <motion.div
          className="hidden lg:flex flex-col w-1/2 p-8 relative overflow-hidden"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>

          {/* Welcome Section */}
          <motion.div
            className="relative z-10 flex-1 flex flex-col justify-center"
            variants={itemVariants}
          >
            <motion.h3
              className="text-3xl font-bold text-gray-800 mb-8 text-center"
              variants={itemVariants}
            >
              Chào mừng trở lại!
            </motion.h3>

            <div className="grid grid-cols-1 gap-6">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-cyan-600 text-2xl flex-shrink-0">
                    <ReadOutlined />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-800 font-semibold text-lg mb-2">
                      Tiếp tục học tập
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Truy cập vào các khóa học đã đăng ký và theo dõi tiến độ học tập của bạn
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-purple-600 text-2xl flex-shrink-0">
                    <TeamOutlined />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-800 font-semibold text-lg mb-2">
                      Kết nối cộng đồng
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Tương tác với giảng viên và học viên khác trong cộng đồng học tập
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-green-600 text-2xl flex-shrink-0">
                    <BookOutlined />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-800 font-semibold text-lg mb-2">
                      Khám phá khóa học mới
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Khám phá hàng nghìn khóa học chất lượng cao từ các giảng viên hàng đầu
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Text */}
            <motion.div
              className="relative z-10 text-center text-gray-700 mt-8"
              variants={itemVariants}
            >
              <p className="text-base font-medium">
                Đăng nhập để bắt đầu hành trình học tập của bạn!
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <MailOutlined className="text-cyan-500" />
              <span>Xác thực email</span>
            </div>
          }
          open={showVerificationModal}
          onCancel={() => setShowVerificationModal(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setShowVerificationModal(false)}
              className="hover:border-cyan-500 hover:text-cyan-500"
            >
              Đóng
            </Button>,
            <Button
              key="resend"
              type="primary"
              loading={resendingVerification}
              onClick={handleResendVerification}
              className="!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white !font-semibold hover:opacity-90 border-none"
            >
              Gửi lại email xác thực
            </Button>,
          ]}
          className="rounded-lg"
        >
          <div className="space-y-3">
            <p className="text-gray-700">Vui lòng xác thực email của bạn trước khi đăng nhập.</p>
            <p className="text-sm text-gray-600">Email: <span className="font-medium text-cyan-600">{verificationEmail}</span></p>
            <p className="text-gray-700">Bạn có thể nhấn nút bên dưới để gửi lại email xác thực.</p>
          </div>
        </Modal>
      </motion.div>

      {/* Shared Auth Notification */}
      <AuthNotification
        isVisible={notification.isVisible}
        onComplete={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={true}
        duration={2500}
        showProgress={notification.type === 'success'}
      />

      {/* Account Type Modal */}
      <AccountTypeModal
        isVisible={accountTypeModalVisible}
        onClose={() => setAccountTypeModalVisible(false)}
      />
    </div>
  );
}
