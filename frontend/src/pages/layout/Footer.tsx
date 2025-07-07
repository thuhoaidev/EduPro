import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube, FaGithub } from 'react-icons/fa';

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <motion.li
    whileHover={{ x: 5 }}
    transition={{ duration: 0.2 }}
  >
    <NavLink to={to} className="text-gray-600 hover:text-[#1677ff] transition-colors duration-300">
      {children}
    </NavLink>
  </motion.li>
);

const SocialLink = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
  <motion.a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-gray-500 hover:text-[#1677ff] transition-colors duration-300"
    whileHover={{ 
      scale: 1.2,
      rotate: 5,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.9 }}
  >
    {icon}
  </motion.a>
);

const AppFooter = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.footer 
      className="bg-white border-t border-gray-200"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Column 1: About */}
          <motion.div 
            className="col-span-2 lg:col-span-1"
            variants={columnVariants}
          >
            <motion.h3 
              className="text-2xl font-bold text-gray-800 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              EduPro
            </motion.h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Nền tảng học tập trực tuyến, trang bị cho bạn những kỹ năng cho tương lai.
            </p>
          </motion.div>

          {/* Column 2: Khóa học */}
          <motion.div variants={columnVariants}>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Khóa học</h4>
            <ul className="space-y-3">
              <FooterLink to="/courses">Tất cả khóa học</FooterLink>
              <FooterLink to="/courses/web-development">Phát triển Web</FooterLink>
              <FooterLink to="/courses/mobile-development">Phát triển Mobile</FooterLink>
              <FooterLink to="/courses/data-science">Khoa học dữ liệu</FooterLink>
            </ul>
          </motion.div>

          {/* Column 3: Về EduPro */}
          <motion.div variants={columnVariants}>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Về EduPro</h4>
            <ul className="space-y-3">
              <FooterLink to="/about">Về chúng tôi</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
              <FooterLink to="/instructors">Giảng viên</FooterLink>
              <FooterLink to="/contact">Liên hệ</FooterLink>
            </ul>
          </motion.div>

          {/* Column 4: Hỗ trợ */}
          <motion.div variants={columnVariants}>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Hỗ trợ</h4>
            <ul className="space-y-3">
              <FooterLink to="/help-center">Trung tâm hỗ trợ</FooterLink>
              <FooterLink to="/faq">Câu hỏi thường gặp</FooterLink>
              <FooterLink to="/community">Cộng đồng</FooterLink>
            </ul>
          </motion.div>

          {/* Column 5: Pháp lý */}
          <motion.div variants={columnVariants}>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Pháp lý</h4>
            <ul className="space-y-3">
              <FooterLink to="/terms">Điều khoản dịch vụ</FooterLink>
              <FooterLink to="/privacy">Chính sách bảo mật</FooterLink>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="mt-12 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">
            © {new Date().getFullYear()} EduPro, Inc. All rights reserved.
          </p>
          <motion.div 
            className="flex space-x-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SocialLink href="https://twitter.com" icon={<FaTwitter size={20} />} />
            <SocialLink href="https://facebook.com" icon={<FaFacebookF size={20} />} />
            <SocialLink href="https://linkedin.com" icon={<FaLinkedinIn size={20} />} />
            <SocialLink href="https://youtube.com" icon={<FaYoutube size={20} />} />
            <SocialLink href="https://github.com" icon={<FaGithub size={20} />} />
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default AppFooter;