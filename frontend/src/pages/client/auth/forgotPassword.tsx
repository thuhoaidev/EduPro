import { config } from "../../../api/axios";
import { Button, Form, Input } from "antd";
import { useState } from "react";
import bgrImage from "../../../assets/images/bgr-login-register.jpg"
import { motion } from "framer-motion";
import { MailOutlined, ArrowLeftOutlined, LockOutlined, SafetyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import AuthNotification from "../../../components/common/AuthNotification";

const ForgotPassword = () => {
      const navigate = useNavigate();
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

      const handleSubmit = async (values: { email: string }) => {
            setLoading(true);
            try {
                  await config.post("/auth/forgot-password", { email: values.email });
                  setNotification({
                    isVisible: true,
                    type: 'success',
                    title: 'Gửi email thành công!',
                    message: 'Kiểm tra email của bạn để biết liên kết đặt lại mật khẩu.'
                  });
            } catch (err) {
                  setNotification({
                    isVisible: true,
                    type: 'error',
                    title: 'Gửi email thất bại!',
                    message: 'Email chưa được đăng ký tài khoản.'
                  });
                  console.error(err);
            } finally {
                  setLoading(false);
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
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5 }
        }
      };

      const buttonVariants = {
        hover: { scale: 1.05, x: -5 },
        tap: { scale: 0.95 }
      };

      return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
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
                                          Quên mật khẩu
                                    </motion.h2>
                                    <motion.p 
                                      className="text-center text-gray-600 mb-8"
                                      variants={itemVariants}
                                    >
                                          Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                                    </motion.p>

                                    <Form layout="vertical" onFinish={handleSubmit} className="space-y-6">
                                          <motion.div variants={itemVariants}>
                                                <Form.Item
                                                      name="email"
                                                      rules={[
                                                            { required: true, message: "Vui lòng nhập email!" },
                                                            { type: "email", message: "Email không hợp lệ" },
                                                      ]}
                                                >
                                                      <Input
                                                            size="large"
                                                            placeholder="Email"
                                                            prefix={<MailOutlined className="text-gray-400" />}
                                                            className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                                            autoComplete="email"
                                                            type="email"
                                                      />
                                                </Form.Item>
                                          </motion.div>

                                          <motion.div variants={itemVariants}>
                                                <Form.Item>
                                                      <Button
                                                            type="primary"
                                                            size="large"
                                                            htmlType="submit"
                                                            loading={loading}
                                                            className="w-full h-12 rounded-lg !bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white !font-semibold hover:opacity-90 border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                                      >
                                                            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                                                      </Button>
                                                </Form.Item>
                                          </motion.div>

                                          <motion.div 
                                            className="text-center text-base mt-6"
                                            variants={itemVariants}
                                          >
                                                <span className="text-gray-600">Nhớ mật khẩu rồi? </span>
                                                <Link 
                                                  to="/login" 
                                                  className="text-cyan-600 hover:text-purple-600 font-medium transition-colors duration-300 hover:underline"
                                                >
                                                      Đăng nhập ngay
                                                </Link>
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
                                  Đặt lại mật khẩu
                                </motion.h3>
                                
                                <div className="grid grid-cols-1 gap-6">
                                  <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className="text-cyan-600 text-2xl flex-shrink-0">
                                        <MailOutlined />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-gray-800 font-semibold text-lg mb-2">
                                          Gửi email xác nhận
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                          Chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến email đã đăng ký của bạn
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
                                        <SafetyOutlined />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-gray-800 font-semibold text-lg mb-2">
                                          Bảo mật tuyệt đối
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                          Liên kết đặt lại mật khẩu có thời hạn và chỉ có thể sử dụng một lần
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
                                        <CheckCircleOutlined />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-gray-800 font-semibold text-lg mb-2">
                                          Đơn giản và nhanh chóng
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                          Chỉ cần vài bước đơn giản để lấy lại quyền truy cập vào tài khoản của bạn
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                </div>
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
                    duration={3000}
                    showProgress={false}
                  />
            </div>
      );
};

export default ForgotPassword;
