import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import {
  BookOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Thông tin về EduPro */}
          <div>
            <h3 className="text-xl font-bold mb-4">EDUPRO</h3>
            <p className="text-gray-300">
              Nền tảng học trực tuyến hàng đầu Việt Nam, cung cấp các khóa học chất lượng cao
              từ các giảng viên uy tín.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-xl font-bold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-gray-300 hover:text-white flex items-center">
                  <BookOutlined className="mr-2" />
                  Khóa học
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white flex items-center">
                  <TeamOutlined className="mr-2" />
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="text-gray-300 flex items-center">
                <MailOutlined className="mr-2" />
                contact@edupro.vn
              </li>
              <li className="text-gray-300 flex items-center">
                <PhoneOutlined className="mr-2" />
                1900 1234
              </li>
              <li className="text-gray-300 flex items-center">
                <EnvironmentOutlined className="mr-2" />
                123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
              </li>
            </ul>
          </div>

          {/* Đăng ký nhận tin */}
          <div>
            <h3 className="text-xl font-bold mb-4">Đăng ký nhận tin</h3>
            <p className="text-gray-300 mb-4">
              Nhận thông tin về các khóa học mới và ưu đãi đặc biệt
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2 rounded-l focus:outline-none"
              />
              <button className="bg-blue-600 px-4 py-2 rounded-r hover:bg-blue-700">
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>© {currentYear} EduPro. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer; 