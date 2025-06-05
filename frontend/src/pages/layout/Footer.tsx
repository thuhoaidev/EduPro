import React from 'react';

const AppFooter = () => {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 py-12 px-6 w-full">
      {/* Top section: 4 columns */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Column 1: Về */}
        <div>
          <h4 className="text-white text-lg font-bold mb-6">Về EduPro</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cơ hội nghề nghiệp</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Đối tác</a></li>
          </ul>
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

      {/* Bottom section: Logo, Copyright, Cookie, Language */}
      <div className="w-full max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
        <div className="flex items-center mb-4 md:mb-0">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#1a73e8] to-[#34a853] bg-clip-text text-transparent mr-4">EduPro</span>
          <p>© 2024 EduPro, Inc.</p>
        </div>

        <div className="flex items-center space-x-6">
          <a href="#" className="hover:text-white transition-colors">Cài đặt cookie</a>
          <div className="flex items-center">
            <span className="mr-2">🌍</span>
            <a href="#" className="hover:text-white transition-colors">Tiếng Việt</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;