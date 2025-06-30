import React from "react";
import { Modal } from "antd";
import { motion } from "framer-motion";
import { 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined, 
  ReadOutlined,
  ArrowRightOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./AccountTypeModal.css";

interface AccountTypeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AccountTypeModal: React.FC<AccountTypeModalProps> = ({ isVisible, onClose }) => {
  const navigate = useNavigate();

  const handleAccountTypeSelect = (type: 'student' | 'instructor') => {
    onClose();
    if (type === 'student') {
      navigate('/register');
    } else {
      navigate('/register/instructor');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const cardVariants = {
    hover: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98
    }
  };

  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="account-type-modal"
      styles={{
        body: { padding: 0 },
        content: { borderRadius: '16px', overflow: 'hidden' }
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full opacity-50"></div>

        <div className="p-8 relative z-10">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.4 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <UserOutlined className="text-white text-2xl" />
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold text-gray-800 mb-2"
              variants={itemVariants}
            >
              Chọn loại tài khoản
            </motion.h2>
            <motion.p 
              className="text-gray-600"
              variants={itemVariants}
            >
              Bạn muốn tạo tài khoản để làm gì?
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Account Option */}
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={cardVariants}
              onClick={() => handleAccountTypeSelect('student')}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 h-full transition-all duration-300 hover:border-blue-400 hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <ReadOutlined className="text-white text-xl" />
                  </div>
                  <ArrowRightOutlined className="text-blue-500 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tài khoản học tập</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tạo tài khoản để học tập, theo dõi tiến độ và tham gia các khóa học trực tuyến
                </p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  <span>Bắt đầu học tập</span>
                  <ArrowRightOutlined className="ml-1" />
                </div>
              </div>
            </motion.div>

            {/* Instructor Account Option */}
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={cardVariants}
              onClick={() => handleAccountTypeSelect('instructor')}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 h-full transition-all duration-300 hover:border-purple-400 hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <TeamOutlined className="text-white text-xl" />
                  </div>
                  <ArrowRightOutlined className="text-purple-500 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tài khoản giảng dạy</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tạo tài khoản giảng viên để chia sẻ kiến thức, tạo khóa học và kiếm thu nhập
                </p>
                <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                  <span>Bắt đầu giảng dạy</span>
                  <ArrowRightOutlined className="ml-1" />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="text-center mt-6"
          >
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-300 text-sm"
            >
              Đóng
            </button>
          </motion.div>
        </div>
      </motion.div>
    </Modal>
  );
};

export default AccountTypeModal; 