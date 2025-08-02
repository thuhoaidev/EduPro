import React, { useState, useEffect } from "react";
import { Form, Input, Button, Checkbox, Modal, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import useLogin from "../../../hooks/Auths/useLogin";
import { config } from "../../../api/axios";
import { motion } from "framer-motion";
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined, MailOutlined, ReadOutlined, TeamOutlined, BookOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthNotification from "../../../components/common/AuthNotification";
import ToastNotification from "../../../components/common/ToastNotification";
import AccountTypeModal from "../../../components/common/AccountTypeModal";
import { useNotification } from "../../../hooks/useNotification";
import { useAuth } from "../../../contexts/AuthContext";
import socket from '../../../services/socket';

export default function LoginPage(): React.ReactElement {
  console.log('🔍 LoginPage component is rendering...');
  
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate } = useLogin({ resource: "login" });
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [accountTypeModalVisible, setAccountTypeModalVisible] = useState(false);
  
  // Sử dụng hook notification mới
  const { 
    notification, 
    toast,
    showLoginSuccess, 
    showLoginError, 
    showVerificationRequired,
    showSuccessToast,
    hideNotification, 
    hideToast 
  } = useNotification();

  const onFinish = (values: { identifier: string; password: string }) => {
    console.log('🔍 Form submitted:', values);
    setIsLoading(true);
    mutate(values, {
      onSuccess: (data) => {
        console.log('Login response:', data);
        localStorage.removeItem('token');
        // Thử lấy token ở nhiều vị trí khác nhau
        let token = null;
        if (data?.data?.token) {
          token = data.data.token;
        } else if (data?.token) {
          token = data.token;
        } else if (data?.access_token) {
          token = data.access_token;
        } else if (data?.data?.access_token) {
          token = data.data.access_token;
        }
        
        if (token) {
          localStorage.setItem('token', token);
          console.log('Token after login:', localStorage.getItem('token'));
          
          // Lưu user info nếu có
          const userData = data?.user || data?.data?.user;
          if (userData) {
            // Chuyển đổi format để phù hợp với frontend
            const formattedUserData = {
              ...userData,
              role_id: {
                name: userData.role || userData.role_id?.name || 'student'
              }
            };
            localStorage.setItem('user', JSON.stringify(formattedUserData));
            // Cập nhật AuthContext
            authLogin(token, formattedUserData);
            // Emit realtime event
            socket.connect();
            socket.emit('auth-event', { type: 'login', user: formattedUserData });
          }
          
          // Hiển thị thông báo thành công với giao diện mới
          showLoginSuccess();
          
          // Chuyển hướng dựa trên role
          console.log('Full response data:', data);
          console.log('User data extracted:', userData);
          if (userData) {
            // Backend trả về role là string, không phải object
            const roleName = userData.role || userData.role_id?.name || userData.role?.name;
            console.log('User role after login:', roleName);
            
            // Chuyển hướng dựa trên role
            if (roleName === 'admin' || roleName === 'quản trị viên') {
              setTimeout(() => navigate('/admin'), 1500);
            } else if (roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
              setTimeout(() => navigate('/moderator'), 1500);
            } else {
              // Instructor, Student hoặc role khác - chuyển về trang chủ
              setTimeout(() => navigate('/'), 1500);
            }
          } else {
            // Không có user data - chuyển về trang chủ
            setTimeout(() => navigate('/'), 1500);
          }
        } else {
          console.warn('Không tìm thấy token trong response!', data);
          // Nếu không có token, vẫn hiển thị thông báo thành công
          showLoginSuccess();
          // Chuyển về trang chủ nếu không có token
          setTimeout(() => navigate('/'), 1500);
        }
        
        // Kiểm tra email verification nếu cần
        if (data?.user?.isEmailVerified === false) {
          setVerificationEmail(values.identifier);
          setShowVerificationModal(true);
        }
        
        setIsLoading(false);
      },
      onError: (error: { response?: { data?: { message?: string } } }) => {
        // Luôn hiển thị thông báo chung khi đăng nhập sai
        showLoginError();
        setIsLoading(false);
        // Không chuyển hướng khi lỗi, để user có thể thử lại
      }
    });
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await config.post("/auth/resend-verification", { email: verificationEmail });
      showSuccessToast('Gửi lại email thành công!', 'Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Không thể gửi lại email. Vui lòng thử lại.";
      showSuccessToast('Lỗi gửi email!', errorMessage, { type: 'error' });
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

  useEffect(() => {
    if (notification.isVisible && notification.type === 'success' && notification.title.includes('Đăng nhập thành công')) {
      // Lấy user từ localStorage
      const storedUser = localStorage.getItem('user');
      let role = '';
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          // Có thể là user.role hoặc user.role.name hoặc user.role_id.name
          if (typeof userObj.role === 'string') {
            role = userObj.role;
          } else if (userObj.role && userObj.role.name) {
            role = userObj.role.name;
          } else if (userObj.role_id && userObj.role_id.name) {
            role = userObj.role_id.name;
          }
        } catch (e) {
          // fallback
        }
      }
      let redirectPath = '/';
      if (role === 'admin') {
        redirectPath = '/admin';
      } else if (role === 'moderator') {
        redirectPath = '/moderator';
      }
      const timer = setTimeout(() => {
        navigate(redirectPath);
      }, 1200); // Đợi animation hoặc thông báo hoàn thành
      return () => clearTimeout(timer);
    }
  }, [notification, navigate]);

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
                <motion.div
                  className="mb-6"
                  variants={itemVariants}
                >
                  <Button
                    size="large"
                    onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                    className="w-full h-12 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div className="flex items-center justify-center w-6 h-6">
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Đăng nhập với Google</span>
                  </Button>
                </motion.div>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: '100%' }}
                    loading={isLoading}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {/* Xóa đoạn code nút Đăng nhập với Google ở phần bên phải (giao diện chào mừng) */}
            </div>

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
        onComplete={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={notification.autoClose}
        duration={notification.duration}
        showProgress={notification.showProgress}
      />

      {/* Toast Notification */}
      <ToastNotification
        isVisible={toast.isVisible}
        onComplete={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        autoClose={toast.autoClose}
        duration={toast.duration}
        position={toast.position}
      />

      {/* Account Type Modal */}
      <AccountTypeModal
        isVisible={accountTypeModalVisible}
        onClose={() => setAccountTypeModalVisible(false)}
      />
    </div>
  );
}
