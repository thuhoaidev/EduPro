import React, { useState } from "react";
import { Button, Form, Input, Select, Upload, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  TeamOutlined,
  BookOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  ReadOutlined,
  StarOutlined,
  WalletOutlined,
  PhoneOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import AuthNotification from "../../../components/common/AuthNotification";
import bgrImage from "../../../assets/images/bgr-login-register.jpg";

const { TextArea } = Input;
const { Option } = Select;

export function InstructorRegistrationPage() {
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

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNotification({
        isVisible: true,
        type: 'success',
        title: 'Đăng ký thành công!',
        message: 'Hồ sơ giảng viên của bạn đã được gửi. Vui lòng chờ admin phê duyệt.'
      });
      
      setTimeout(() => {
        navigate("/");
      }, 2500);
    } catch (error) {
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Lỗi đăng ký!',
        message: 'Đã xảy ra lỗi. Vui lòng thử lại.'
      });
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

  const features = [
    {
      icon: <BookOutlined className="text-2xl" />,
      title: "Tạo khóa học",
      description: "Thiết kế và xây dựng khóa học chất lượng cao"
    },
    {
      icon: <StarOutlined className="text-2xl" />,
      title: "Kiếm thu nhập",
      description: "Thu nhập từ việc bán khóa học và giảng dạy"
    },
    {
      icon: <TeamOutlined className="text-2xl" />,
      title: "Cộng đồng học viên",
      description: "Kết nối với hàng nghìn học viên tiềm năng"
    },
    {
      icon: <WalletOutlined className="text-2xl" />,
      title: "Thanh toán tự động",
      description: "Hệ thống thanh toán và quản lý doanh thu"
    }
  ];

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
        className="flex bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden w-full max-w-7xl min-h-[700px] border border-white/20"
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
              Đăng Ký Giảng Viên
            </motion.h2>
            <motion.p 
              className="text-center text-gray-600 mb-8"
              variants={itemVariants}
            >
              Trở thành giảng viên và chia sẻ kiến thức của bạn
            </motion.p>

            <Form
              layout="vertical"
              onFinish={onFinish}
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <Form.Item
                  name="fullName"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Họ và tên đầy đủ"
                    prefix={<UserOutlined className="text-gray-400" />}
                    className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
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
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: "Số điện thoại là bắt buộc" },
                    { pattern: /^[0-9+\-\s()]+$/, message: "Số điện thoại không hợp lệ" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Số điện thoại"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
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
                    className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="specialization"
                  rules={[{ required: true, message: "Vui lòng chọn chuyên ngành!" }]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn chuyên ngành"
                    className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  >
                    <Option value="programming">Lập trình</Option>
                    <Option value="design">Thiết kế</Option>
                    <Option value="marketing">Marketing</Option>
                    <Option value="business">Kinh doanh</Option>
                    <Option value="language">Ngoại ngữ</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="experience"
                  rules={[{ required: true, message: "Vui lòng nhập kinh nghiệm!" }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Mô tả kinh nghiệm giảng dạy và chuyên môn của bạn..."
                    className="rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="cv"
                  rules={[{ required: true, message: "Vui lòng tải lên CV!" }]}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept=".pdf,.doc,.docx"
                  >
                    <Button 
                      icon={<UploadOutlined />} 
                      size="large"
                      className="w-full h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500 focus:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    >
                      Tải lên CV (PDF, DOC)
                    </Button>
                  </Upload>
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
                    {loading ? "Đang gửi hồ sơ..." : "Gửi Hồ Sơ"}
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>
          </motion.div>
        </motion.div>

        {/* Right Side - Features Only */}
        <motion.div 
          className="hidden lg:flex flex-col w-1/2 p-8 relative overflow-hidden"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
          
          {/* Features Section */}
          <motion.div 
            className="relative z-10 flex-1 flex flex-col justify-center"
            variants={itemVariants}
          >
            <motion.h3 
              className="text-3xl font-bold text-gray-800 mb-8 text-center"
              variants={itemVariants}
            >
              Trở thành giảng viên chuyên nghiệp!
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
                      Chia sẻ kiến thức
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Tạo khóa học chất lượng cao và chia sẻ kiến thức chuyên môn của bạn với hàng nghìn học viên
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
                      Thu nhập hấp dẫn
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Kiếm thu nhập từ việc giảng dạy với tỷ lệ chia sẻ lợi nhuận hấp dẫn và minh bạch
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
                      Cộng đồng giảng viên
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Tham gia cộng đồng giảng viên chuyên nghiệp, học hỏi và phát triển cùng nhau
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
                      Hỗ trợ toàn diện
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Được hỗ trợ về công nghệ, marketing và phát triển nội dung từ đội ngũ chuyên nghiệp
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
                Bắt đầu hành trình trở thành giảng viên chuyên nghiệp ngay hôm nay!
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

export default InstructorRegistrationPage;
