import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const AppFooter = () => {
  return (
    <footer className="bg-gradient-to-b from-[#1a1a1a] to-[#151515] text-gray-400 py-16 px-6 w-full">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-[#2a2a2a] rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-white text-2xl font-bold mb-2">Đăng ký nhận bản tin</h3>
              <p className="text-gray-400">Nhận thông tin mới nhất về khóa học và ưu đãi đặc biệt</p>
            </div>
            <div className="w-full md:w-1/2">
              <form className="flex flex-col md:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="flex-1 px-4 py-2 rounded-lg bg-[#3a3a3a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {/* Column 1: About */}
        <div className="space-y-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#1a73e8] to-[#34a853] bg-clip-text text-transparent mr-4">EduPro</span>
            <p className="text-sm text-gray-400">© 2024 EduPro, Inc.</p>
          </div>
          <p className="text-gray-400">
            EduPro là nền tảng học trực tuyến hàng đầu, cung cấp các khóa học chất lượng cao từ các chuyên gia hàng đầu.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaFacebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaTwitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaInstagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaLinkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaYoutube className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Column 2: Khám phá */}
        <div>
          <h4 className="text-white text-lg font-bold mb-6">Khám phá</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Tải ứng dụng</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Trở thành giảng viên</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Gói thành viên</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Liên kết</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Trợ giúp</a></li>
          </ul>
        </div>

        {/* Column 3: Doanh nghiệp */}
        <div>
          <h4 className="text-white text-lg font-bold mb-6">EduPro Business</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Đào tạo nhân viên</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Giải pháp doanh nghiệp</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Đối tác chiến lược</a></li>
          </ul>
        </div>

        {/* Column 4: Pháp lý */}
        <div>
          <h4 className="text-white text-lg font-bold mb-6">Pháp lý</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sơ đồ trang web</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Khả năng truy cập</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
        <p className="text-gray-400 mb-4 md:mb-0">© 2024 EduPro, Inc. All rights reserved.</p>
        <div className="flex items-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Chính sách cookie</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Tiếng Việt</a>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;