import React from 'react';

const AppFooter = () => {
  return (
    <footer className="bg-[#212529] text-gray-400 py-8 px-6 w-full">
      {/* Top section: 4 columns */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Column 1: Về */}
        <div>
          <h4 className="text-white text-base font-bold mb-4">Về</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Về chúng tôi</a></li>
            <li><a href="#" className="hover:underline">Nghề nghiệp</a></li>
            <li><a href="#" className="hover:underline">Liên hệ với chúng tôi</a></li>
            <li><a href="#" className="hover:underline">Blog</a></li>
            <li><a href="#" className="hover:underline">Nhà đầu tư</a></li>
          </ul>
        </div>

        {/* Column 2: Khám phá Udemy */}
        <div>
          <h4 className="text-white text-base font-bold mb-4">Khám phá Udemy</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Tải ứng dụng</a></li>
            <li><a href="#" className="hover:underline">Dạy trên Udemy</a></li>
            <li><a href="#" className="hover:underline">Kế hoạch và giá cả</a></li>
            <li><a href="#" className="hover:underline">Liên kết</a></li>
            <li><a href="#" className="hover:underline">Trợ giúp và Hỗ trợ</a></li>
          </ul>
        </div>

        {/* Column 3: Udemy dành cho doanh nghiệp */}
        <div>
          <h4 className="text-white text-base font-bold mb-4">Udemy dành cho doanh nghiệp</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Kinh doanh Udemy</a></li>
          </ul>
        </div>

        {/* Column 4: Pháp lý & Khả năng tiếp cận */}
        <div>
          <h4 className="text-white text-base font-bold mb-4">Pháp lý & Khả năng tiếp cận</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Tuyên bố về khả năng truy cập</a></li>
            <li><a href="#" className="hover:underline">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:underline">Sơ đồ trang web</a></li>
            <li><a href="#" className="hover:underline">Điều khoản</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom section: Logo, Copyright, Cookie, Language */}
      <div className="w-full max-w-7xl mx-auto border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
        <div className="flex items-center mb-4 md:mb-0">
          {/* Replace with actual Udemy logo */}
          <img src="https://www.udemy.com/staticx/udemy/images/v7/logo-udemy-inverted.svg" alt="Udemy Logo" className="h-8 mr-4" />
          <p>© 2025 Udemy, Inc.</p>
        </div>

        <div className="flex items-center space-x-4">
           <a href="#" className="hover:underline">Cài đặt cookie</a>
           {/* Language selector - Placeholder */}
           <div className="flex items-center">
              <span>🌍</span> {/* Globe icon placeholder */}
             <a href="#" className="ml-1 hover:underline">Tiếng Anh</a>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;