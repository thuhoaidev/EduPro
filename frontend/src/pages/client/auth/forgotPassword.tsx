import { config } from "../../../api/axios";
import { Button, Form, Input } from "antd";
import { useState } from "react";
import bgrImage from "../../../assets/images/bgr-login-register.jpg"
import { motion } from "framer-motion";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import AuthNotification from "../../../components/common/AuthNotification";

const ForgotPassword = () => {
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

      return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
                  <motion.div 
                    className="flex bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden w-full max-w-6xl min-h-[600px] border border-white/20"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                        <motion.div 
                          className="hidden md:flex items-center justify-center w-1/2 p-8 relative overflow-hidden"
                          variants={itemVariants}
                        >
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20"></div>
                              <motion.img
                                src={bgrImage}
                                alt="Forgot Password Illustration"
                                className="relative z-10 max-h-[90%] max-w-full object-contain rounded-lg shadow-lg"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                              />
                              <div className="absolute bottom-8 left-8 right-8 text-center text-white/80">
                                    <h3 className="text-xl font-semibold mb-2">Quên mật khẩu?</h3>
                                    <p className="text-sm">Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại mật khẩu</p>
                              </div>
                        </motion.div>

                        <motion.div 
                          className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative"
                          variants={itemVariants}
                        >
                              {/* Background decoration */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>

                              <motion.div
                                variants={itemVariants}
                                className="relative z-10"
                              >
                                    <motion.div 
                                      className="mb-6"
                                      variants={itemVariants}
                                    >
                                          <Link 
                                            to="/login" 
                                            className="inline-flex items-center gap-2 text-cyan-600 hover:text-purple-600 transition-colors duration-300 mb-4"
                                          >
                                                <ArrowLeftOutlined />
                                                <span>Quay lại đăng nhập</span>
                                          </Link>
                                    </motion.div>

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
