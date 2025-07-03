import React from 'react';
import { Card, Steps, Alert } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  TrophyOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Step } = Steps;

export const InstructorRegistrationInfo: React.FC = () => {
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mb-8"
    >
      <motion.div variants={itemVariants}>
        <Card 
          title={
            <div className="flex items-center gap-2">
              <TrophyOutlined className="text-cyan-500" />
              <span className="text-lg font-semibold">Quy trình đăng ký giảng viên</span>
            </div>
          }
          className="shadow-lg border-0 bg-white/80 backdrop-blur-sm"
        >
          <Steps
            direction="vertical"
            size="small"
            className="mt-4"
          >
            <Step
              status="process"
              title="Điền thông tin"
              description="Hoàn thành form đăng ký với thông tin cá nhân, học vấn và chuyên môn"
              icon={<UserOutlined className="text-cyan-500" />}
            />
            <Step
              status="wait"
              title="Xác minh email"
              description="Kiểm tra email và click vào link xác minh để kích hoạt tài khoản"
              icon={<MailOutlined className="text-gray-400" />}
            />
            <Step
              status="wait"
              title="Admin xét duyệt"
              description="Hồ sơ sẽ được admin xét duyệt trong 3-5 ngày làm việc"
              icon={<ClockCircleOutlined className="text-gray-400" />}
            />
            <Step
              status="wait"
              title="Bắt đầu giảng dạy"
              description="Sau khi được duyệt, bạn có thể tạo khóa học và bắt đầu giảng dạy"
              icon={<CheckCircleOutlined className="text-gray-400" />}
            />
          </Steps>

          <Alert
            message="Lưu ý quan trọng"
            description={
              <div className="mt-2 space-y-2">
                <p>📧 <strong>Email xác minh:</strong> Sẽ được gửi ngay sau khi đăng ký thành công</p>
                <p>⏳ <strong>Thời gian xét duyệt:</strong> 3-5 ngày làm việc</p>
                <p>📋 <strong>Hồ sơ cần thiết:</strong> CV, chứng chỉ, demo video (tùy chọn)</p>
                <p>🔐 <strong>Bảo mật:</strong> Thông tin cá nhân được bảo vệ an toàn</p>
              </div>
            }
            type="info"
            showIcon
            className="mt-6"
          />
        </Card>
      </motion.div>
    </motion.div>
  );
}; 