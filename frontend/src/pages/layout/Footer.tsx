import React from 'react';

const AppFooter = () => {
  return (
    <footer className="bg-[#212529] text-white py-12 px-6 w-full">
  <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {/* Cột 1 */}
    <div>
      <h4 className="text-xl font-semibold mb-4">Liên hệ với chúng tôi</h4>
      <p className="text-gray-400">+0123456789</p>
      <p className="text-gray-400">email.com</p>
      <p className="text-gray-400">9AM - 5PM, Monday - Friday</p>
      <p className="text-gray-400">Nhà số 10, 379 Xuân Phương, Nam Từ Liêm, Hà Nội</p>
    </div>

    {/* Cột 2 */}
    <div>
      <h4 className="text-xl font-semibold mb-4">Các liên kết khác</h4>
      <ul className="space-y-2">
        <li><a href="#" className="text-gray-400 hover:text-white">Start here</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">Blogs</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">About us</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">Career</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">Courses</a></li>
      </ul>
    </div>

    {/* Cột 3 */}
    <div>
      <h4 className="text-xl font-semibold mb-4">Sản phẩm</h4>
      <ul className="space-y-2">
        <li><a href="#" className="text-gray-400 hover:text-white">Start here</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">Blogs</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">About us</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">Career</a></li>
        <li><a href="#" className="text-gray-400 hover:text-white">Courses</a></li>
      </ul>
    </div>

    {/* Cột 4 */}
    <div>
      <h4 className="text-xl font-semibold mb-4">Mạng xã hội</h4>
      <p className="text-gray-400">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut odit magniem officiis sequi laudae corporis dolorem beatae? Dolore parahur illo odio nulla atque quibusdam ut voluptate ut sumus, suscipit est.
      </p>
    </div>
  </div>
</footer>

  );
};

export default AppFooter;