import {
  Button,
  Form,
  Input,
  Modal,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import useRegister from "../../../hooks/Auths/useRegister";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { motion } from "framer-motion";
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined as UserIcon, LockOutlined, MailOutlined, ReadOutlined, TeamOutlined, BookOutlined, TrophyOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthNotification from "../../../components/common/AuthNotification";

// Custom CSS for reCAPTCHA
const recaptchaStyles = `
  .g-recaptcha {
    border-radius: 12px !important;
    overflow: hidden !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    transition: all 0.3s ease !important;
  }
  
  .g-recaptcha:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    transform: translateY(-2px) !important;
  }
  
  .g-recaptcha iframe {
    border-radius: 12px !important;
  }
`;

export function RegisterPage() {
      const navigate = useNavigate();
      const { mutate } = useRegister({ resource: "register" });
      const [captchaToken, setCaptchaToken] = useState<string | null>(null);
      const [loading, setLoading] = useState(false);
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

      const onFinish = (formData: any) => {
            console.log('Form submit data:', formData);
            if (!captchaToken) {
                  setNotification({
                    isVisible: true,
                    type: 'error',
                    title: 'Lỗi xác thực!',
                    message: 'Vui lòng xác nhận bạn không phải robot!'
                  });
                  return;
            }

            const newObject = {
                  nickname: formData.nickname,
                  email: formData.email,
                  password: formData.password,
                  fullName: formData.fullName,
                  captchaToken,
            };

            setLoading(true);

            mutate(newObject, {
                  onSuccess: () => {
                        setNotification({
                          isVisible: true,
                          type: 'success',
                          title: 'Tạo tài khoản thành công!',
                          message: 'Tài khoản của bạn đã được tạo thành công! Vui lòng xác minh email để đăng nhập.'
                        });
                        
                        // Navigate after notification
                        setTimeout(() => {
                          navigate("/");
                        }, 2500);
                  },
                  onError: (error: any) => {
                        const errorMessage = error?.response?.data?.message || "Đã xảy ra lỗi.";
                        setNotification({
                          isVisible: true,
                          type: 'error',
                          title: 'Lỗi đăng ký!',
                          message: errorMessage
                        });
                  },
                  onSettled: () => {
                        setLoading(false);
                  },
            });
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

      return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 relative">
                  {/* Custom CSS for reCAPTCHA */}
                  <style>{recaptchaStyles}</style>
                  
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
                        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
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
                                          Đăng Ký
                                    </motion.h2>
                                    <motion.p 
                                      className="text-center text-gray-600 mb-8"
                                      variants={itemVariants}
                                    >
                                          Tạo tài khoản mới để bắt đầu học tập
                                    </motion.p>

                                    <Form layout="vertical" onFinish={onFinish} className="space-y-6">
                                          <motion.div variants={itemVariants}>
                                                <Form.Item
                                                      name="fullName"
                                                      rules={[
                                                            {
                                                                  required: true,
                                                                  message: 'Vui lòng nhập họ và tên!',
                                                            },
                                                            {
                                                                  min: 2,
                                                                  message: 'Họ và tên phải có ít nhất 2 ký tự!',
                                                            },
                                                      ]}
                                                >
                                                      <Input
                                                            placeholder="Họ và tên"
                                                            size="large"
                                                            prefix={<UserIcon className="text-gray-400" />}
                                                            className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                                      />
                                                </Form.Item>
                                          </motion.div>

                                          <motion.div variants={itemVariants}>
                                                <Form.Item
                                                      name="nickname"
                                                      rules={[
                                                            { required: true, message: "Tên đăng nhập là bắt buộc" },
                                                            { pattern: /^[a-zA-Z0-9]+$/, message: "Tên đăng nhập chỉ được chứa chữ cái và số" },
                                                      ]}
                                                >
                                                      <Input
                                                            size="large"
                                                            placeholder="Tên đăng nhập (chữ và số)"
                                                            prefix={<UserOutlined className="text-gray-400" />}
                                                            className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                                            autoComplete="username"
                                                      />
                                                </Form.Item>
                                          </motion.div>

                                          <motion.div variants={itemVariants}>
                                                <Form.Item
                                                      name="email"
                                                      rules={[
                                                            { required: true, message: "Email là bắt buộc" },
                                                            { type: "email", message: "Email không hợp lệ" },
                                                      ]}
                                                >
                                                      <Input
                                                            size="large"
                                                            placeholder="Email"
                                                            prefix={<MailOutlined className="text-gray-400" />}
                                                            className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                                            autoComplete="email"
                                                      />
                                                </Form.Item>
                                          </motion.div>

                                          <motion.div variants={itemVariants}>
                                                <Form.Item
                                                      name="password"
                                                      rules={[
                                                            { required: true, message: "Mật khẩu là bắt buộc" },
                                                            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                                                      ]}
                                                >
                                                      <Input.Password
                                                            size="large"
                                                            placeholder="Mật khẩu"
                                                            prefix={<LockOutlined className="text-gray-400" />}
                                                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                                            className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                                            autoComplete="new-password"
                                                      />
                                                </Form.Item>
                                          </motion.div>

                                          <motion.div variants={itemVariants}>
                                                <Form.Item>
                                                      <div className="flex flex-col items-center space-y-3">
                                                            <motion.div
                                                              className="relative"
                                                              whileHover={{ scale: 1.02 }}
                                                              whileTap={{ scale: 0.98 }}
                                                              initial={{ opacity: 0, y: 20 }}
                                                              animate={{ opacity: 1, y: 0 }}
                                                              transition={{ delay: 0.2 }}
                                                            >
                                                                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
                                                                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-lg">
                                                                        <ReCAPTCHA
                                                                              sitekey="6LffdUYrAAAAALJWWmP223n903IMwvy7KFj3exxT"
                                                                              onChange={(token: any) => setCaptchaToken(token)}
                                                                        />
                                                                  </div>
                                                            </motion.div>
                                                            
                                                            {!captchaToken && (
                                                                  <motion.div
                                                                        initial={{ opacity: 0, y: -10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        className="text-center"
                                                                  >
                                                                        <p className="text-sm text-gray-500 bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50">
                                                                              <span className="inline-block mr-1">🔒</span>
                                                                              Vui lòng xác nhận bạn không phải robot
                                                                        </p>
                                                                  </motion.div>
                                                            )}
                                                            
                                                            {captchaToken && (
                                                                  <motion.div
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        className="text-center"
                                                                  >
                                                                        <p className="text-sm text-green-600 bg-green-50/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-200/50">
                                                                              <span className="inline-block mr-1">✅</span>
                                                                              Xác thực thành công!
                                                                        </p>
                                                                  </motion.div>
                                                            )}
                                                      </div>
                                                </Form.Item>
                                          </motion.div>

                                          <motion.div variants={itemVariants}>
                                                <Form.Item>
                                                      <Button
                                                            type="primary"
                                                            size="large"
                                                            htmlType="submit"
                                                            loading={loading}
                                                            disabled={!captchaToken}
                                                            className={`w-full h-12 rounded-lg !font-semibold border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                                                                  captchaToken 
                                                                        ? '!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white hover:opacity-90' 
                                                                        : '!bg-gray-300 !text-gray-500 cursor-not-allowed'
                                                            }`}
                                                      >
                                                            {loading ? "Đang đăng ký..." : "Đăng Ký"}
                                                      </Button>
                                                </Form.Item>
                                          </motion.div>

                                          <motion.div 
                                            className="text-center text-base mt-6"
                                            variants={itemVariants}
                                          >
                                                <span className="text-gray-600">Bạn đã có tài khoản? </span>
                                                <Link 
                                                  to="/login" 
                                                  className="text-cyan-600 hover:text-purple-600 font-medium transition-colors duration-300 hover:underline"
                                                >
                                                      Đăng nhập ngay
                                                </Link>
                                          </motion.div>
                                    </Form>
                              </motion.div>
                        </div>

                        {/* Right Side - Benefits */}
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
                              Bắt đầu hành trình học tập!
                            </motion.h3>
                            
                            <div className="grid grid-cols-1 gap-6">
                              <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="text-cyan-600 text-2xl flex-shrink-0">
                                    <BookOutlined />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-gray-800 font-semibold text-lg mb-2">
                                      Khóa học chất lượng cao
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                      Truy cập hàng nghìn khóa học từ các giảng viên hàng đầu với nội dung cập nhật liên tục
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
                                    <TrophyOutlined />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-gray-800 font-semibold text-lg mb-2">
                                      Chứng chỉ được công nhận
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                      Nhận chứng chỉ hoàn thành khóa học có giá trị và được công nhận bởi các doanh nghiệp
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
                                    <TeamOutlined />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-gray-800 font-semibold text-lg mb-2">
                                      Cộng đồng học tập
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                      Tham gia cộng đồng học viên sôi động, chia sẻ kiến thức và hỗ trợ lẫn nhau
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
                                  <div className="text-orange-600 text-2xl flex-shrink-0">
                                    <SafetyCertificateOutlined />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-gray-800 font-semibold text-lg mb-2">
                                      Học mọi lúc, mọi nơi
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                      Học tập linh hoạt với video chất lượng cao, có thể xem lại và học theo tốc độ của riêng bạn
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
                                Đăng ký ngay để khám phá thế giới học tập trực tuyến!
                              </p>
                            </motion.div>
                          </motion.div>
                        </motion.div>
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
            </div>
      );
}

export default RegisterPage;
