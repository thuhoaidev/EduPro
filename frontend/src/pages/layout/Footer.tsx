import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaYoutube, 
  FaGithub,
  FaInstagram,
  FaTiktok
} from 'react-icons/fa';
import { 
  RocketOutlined,
  BookOutlined,
  TeamOutlined,
  GiftOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  HeartOutlined
} from '@ant-design/icons';
import './Footer.css';

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <motion.li
    whileHover={{ x: 5 }}
    transition={{ duration: 0.2 }}
    className="footer-link-item"
  >
    <NavLink to={to} className="footer-link">
      {children}
    </NavLink>
  </motion.li>
);

const SocialLink = ({ href, icon, color }: { href: string, icon: React.ReactNode, color: string }) => (
  <motion.a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="social-link"
    style={{ '--social-color': color } as React.CSSProperties}
    whileHover={{ 
      scale: 1.2,
      rotate: 5,
      y: -4,
      transition: { duration: 0.3 }
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
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const socialLinks = [
    { href: "https://facebook.com", icon: <FaFacebookF size={20} />, color: '#1877f2' },
    { href: "https://twitter.com", icon: <FaTwitter size={20} />, color: '#1da1f2' },
    { href: "https://instagram.com", icon: <FaInstagram size={20} />, color: '#e4405f' },
    { href: "https://linkedin.com", icon: <FaLinkedinIn size={20} />, color: '#0077b5' },
    { href: "https://youtube.com", icon: <FaYoutube size={20} />, color: '#ff0000' },
    { href: "https://tiktok.com", icon: <FaTiktok size={20} />, color: '#000000' },
    { href: "https://github.com", icon: <FaGithub size={20} />, color: '#333333' },
  ];

  return (
    <motion.footer 
      className="modern-footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="footer-background">
        <div className="footer-pattern"></div>
      </div>
      
      <div className="footer-content">
        <div className="footer-grid">
          
          {/* Column 1: About */}
          <motion.div 
            className="footer-column about-column"
            variants={columnVariants}
          >
            <motion.div 
              className="footer-logo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <RocketOutlined className="logo-icon" />
              <h3 className="logo-text">EduPro</h3>
            </motion.div>
            <p className="footer-description">
              Nền tảng học tập trực tuyến hàng đầu, trang bị cho bạn những kỹ năng cần thiết cho tương lai số. 
              Chúng tôi cam kết mang đến trải nghiệm học tập chất lượng cao với đội ngũ giảng viên chuyên môn.
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Học viên</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Khóa học</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Giảng viên</span>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Khóa học */}
          <motion.div className="footer-column" variants={columnVariants}>
            <h4 className="footer-title">
              <BookOutlined className="title-icon" />
              Khóa học
            </h4>
            <ul className="footer-links">
              <FooterLink to="/courses">Tất cả khóa học</FooterLink>
              <FooterLink to="/courses/web-development">Phát triển Web</FooterLink>
              <FooterLink to="/courses/mobile-development">Phát triển Mobile</FooterLink>
              <FooterLink to="/courses/data-science">Khoa học dữ liệu</FooterLink>
              <FooterLink to="/courses/ai-ml">AI & Machine Learning</FooterLink>
              <FooterLink to="/courses/design">Thiết kế & UI/UX</FooterLink>
            </ul>
          </motion.div>

          {/* Column 3: Về EduPro */}
          <motion.div className="footer-column" variants={columnVariants}>
            <h4 className="footer-title">
              <TeamOutlined className="title-icon" />
              Về EduPro
            </h4>
            <ul className="footer-links">
              <FooterLink to="/about">Về chúng tôi</FooterLink>
              <FooterLink to="/blog">Blog & Tin tức</FooterLink>
              <FooterLink to="/instructors">Đội ngũ giảng viên</FooterLink>
              <FooterLink to="/careers">Tuyển dụng</FooterLink>
              <FooterLink to="/contact">Liên hệ</FooterLink>
              <FooterLink to="/partners">Đối tác</FooterLink>
            </ul>
          </motion.div>

          {/* Column 4: Hỗ trợ */}
          <motion.div className="footer-column" variants={columnVariants}>
            <h4 className="footer-title">
              <CustomerServiceOutlined className="title-icon" />
              Hỗ trợ
            </h4>
            <ul className="footer-links">
              <FooterLink to="/help-center">Trung tâm hỗ trợ</FooterLink>
              <FooterLink to="/faq">Câu hỏi thường gặp</FooterLink>
              <FooterLink to="/community">Cộng đồng học viên</FooterLink>
              <FooterLink to="/feedback">Góp ý & Phản hồi</FooterLink>
              <FooterLink to="/tutorials">Hướng dẫn sử dụng</FooterLink>
              <FooterLink to="/contact-support">Liên hệ hỗ trợ</FooterLink>
            </ul>
          </motion.div>

          {/* Column 5: Pháp lý & Chính sách */}
          <motion.div className="footer-column" variants={columnVariants}>
            <h4 className="footer-title">
              <SafetyCertificateOutlined className="title-icon" />
              Pháp lý
            </h4>
            <ul className="footer-links">
              <FooterLink to="/terms">Điều khoản dịch vụ</FooterLink>
              <FooterLink to="/privacy">Chính sách bảo mật</FooterLink>
              <FooterLink to="/cookies">Chính sách Cookie</FooterLink>
              <FooterLink to="/refund">Chính sách hoàn tiền</FooterLink>
              <FooterLink to="/accessibility">Khả năng tiếp cận</FooterLink>
              <FooterLink to="/compliance">Tuân thủ pháp luật</FooterLink>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div 
          className="newsletter-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3 className="newsletter-title">
                <GiftOutlined className="newsletter-icon" />
                Đăng ký nhận ưu đãi
              </h3>
              <p className="newsletter-description">
                Nhận thông báo về khóa học mới, ưu đãi đặc biệt và tips học tập hữu ích
              </p>
            </div>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Nhập email của bạn..."
                className="newsletter-input"
              />
              <motion.button 
                className="newsletter-button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <RocketOutlined className="button-icon" />
                Đăng ký
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Footer Bottom */}
        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="footer-bottom-content">
            <div className="copyright-section">
              <p className="copyright-text">
                © {new Date().getFullYear()} EduPro, Inc. All rights reserved.
              </p>
              <p className="made-with-love">
                Made with <HeartOutlined className="heart-icon" /> in Vietnam
              </p>
            </div>
            
            <motion.div 
              className="social-links"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {socialLinks.map((social, index) => (
                <SocialLink 
                  key={index}
                  href={social.href} 
                  icon={social.icon} 
                  color={social.color}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default AppFooter;