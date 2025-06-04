import React, { useState } from 'react';
import { X, User, Lock, ChevronRight, Camera, Globe, Github, Linkedin, Facebook, Youtube, Eye, EyeOff, Shield, Mail, Key } from 'lucide-react';

const PersonalInfoPage = () => {
  const [activeTab, setActiveTab] = useState('personal-info');
  const [activeModal, setActiveModal] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [formData, setFormData] = useState({
    fullName: 'Doanh Phạm Đức (PH48812)',
    username: 'phamducph48812doanh',
    bio: 'Chưa cập nhật',
    website: 'Chưa cập nhật',
    github: 'Chưa cập nhật',
    linkedin: 'Chưa cập nhật',
    facebook: 'Chưa cập nhật',
    youtube: 'Chưa cập nhật',
    tiktok: 'Chưa cập nhật',
    email: 'doanhdph48812@gmail.com',
    avatar: 'Chưa cập nhật'
  });

  const [editData, setEditData] = useState('');

  const sidebarItems = [
    { key: 'personal-info', icon: User, label: 'Thông tin cá nhân', active: activeTab === 'personal-info' },
    { key: 'security', icon: Lock, label: 'Mật khẩu và bảo mật', active: activeTab === 'security' }
  ];

  const openModal = (field) => {
    if (field === 'avatar') {
      // Mở file picker để chọn ảnh
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // Xử lý file ảnh ở đây
          console.log('Selected file:', file);
          // Có thể preview ảnh hoặc upload
          const reader = new FileReader();
          reader.onload = (event) => {
            console.log('Image data:', event.target.result);
            // Cập nhật avatar
            setFormData({
              ...formData,
              avatar: file.name
            });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }
    
    setActiveModal(field);
    if (field === 'email') {
      setEditData(formData[field]);
    } else {
      setEditData(formData[field] === 'Chưa cập nhật' ? '' : formData[field]);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditData('');
    setVerificationCode('');
    setCurrentPassword('');
    setShowPassword(false);
  };

  const saveChanges = () => {
    setFormData({
      ...formData,
      [activeModal]: editData || 'Chưa cập nhật'
    });
    closeModal();
  };

  const sendVerificationCode = () => {
    // Simulate sending verification code
    console.log('Sending verification code to:', editData);
  };

  const verifyEmail = () => {
    // Simulate email verification
    console.log('Verifying email with code:', verificationCode);
    saveChanges();
  };

  const verifyPassword = () => {
    // Simulate password verification
    console.log('Verifying current password:', currentPassword);
    closeModal();
  };

  const getFieldTitle = (field) => {
    const titles = {
      fullName: 'Cập nhật tên của bạn',
      username: 'Cập nhật tên người dùng',
      bio: 'Cập nhật giới thiệu',
      website: 'Cập nhật trang web cá nhân',
      github: 'Cập nhật GitHub',
      linkedin: 'Cập nhật LinkedIn',
      facebook: 'Cập nhật Facebook',
      youtube: 'Cập nhật YouTube',
      tiktok: 'Cập nhật TikTok',
      email: 'Xác minh email',
      password: 'Xác nhận mật khẩu'
    };
    return titles[field] || 'Cập nhật thông tin';
  };

  const getFieldDescription = (field) => {
    const descriptions = {
      fullName: 'Tên sẽ được hiển thị trên trang cá nhân, trong các bình luận và bài viết của bạn.',
      username: 'Tên người dùng sẽ được sử dụng để tạo đường dẫn tới trang cá nhân của bạn.',
      bio: 'Mô tả ngắn về bản thân bạn để mọi người hiểu rõ hơn về bạn.',
      website: 'Đường dẫn tới trang web cá nhân hoặc blog của bạn.',
      github: 'Đường dẫn tới trang GitHub của bạn.',
      linkedin: 'Đường dẫn tới trang LinkedIn của bạn.',
      facebook: 'Đường dẫn tới trang Facebook của bạn.',
      youtube: 'Đường dẫn tới kênh YouTube của bạn.',
      tiktok: 'Đường dẫn tới trang TikTok của bạn.',
      email: 'Để tạo mật khẩu, hãy xác minh email của bạn trước.',
      password: 'Để chắc chắn rằng bạn là chủ sở hữu tài khoản, vui lòng nhập mật khẩu hiện tại của bạn.'
    };
    return descriptions[field] || '';
  };

  const getFieldLabel = (field) => {
    const labels = {
      fullName: 'Họ và tên',
      username: 'Tên người dùng',
      bio: 'Giới thiệu',
      website: 'Trang web cá nhân',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      email: 'Email',
      password: 'Mật khẩu hiện tại'
    };
    return labels[field] || '';
  };

  const getFieldPlaceholder = (field) => {
    const placeholders = {
      fullName: 'Nhập họ và tên của bạn',
      username: 'Nhập tên người dùng',
      bio: 'Mô tả ngắn về bản thân bạn',
      website: 'https://yourwebsite.com',
      github: 'https://github.com/yourusername',
      linkedin: 'https://linkedin.com/in/yourusername',
      facebook: 'https://facebook.com/yourusername',
      youtube: 'https://youtube.com/@yourusername',
      tiktok: 'https://tiktok.com/@yourusername',
      email: 'your.email@example.com',
      password: 'Nhập mật khẩu hiện tại của bạn'
    };
    return placeholders[field] || '';
  };

  const InfoField = ({ label, value, field, showIcon = false }) => (
    <div 
      className="flex justify-between items-center py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-4 -mx-4 rounded-lg transition-colors"
      onClick={() => openModal(field)}
    >
      <div className="flex-1">
        <div className="text-gray-900 font-medium text-sm mb-1">{label}</div>
        <div className="text-gray-600 text-sm">{value}</div>
      </div>
      <div className="flex items-center space-x-3">
        {showIcon && (
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  const SecurityField = ({ label, value, field, icon: IconComponent }) => (
    <div 
      className="flex justify-between items-center py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-4 -mx-4 rounded-lg transition-colors"
      onClick={() => openModal(field)}
    >
      <div className="flex items-center flex-1">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
          <IconComponent className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <div className="text-gray-900 font-medium text-sm mb-1">{label}</div>
          <div className="text-gray-600 text-sm">{value}</div>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cài đặt tài khoản</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Quản lý cài đặt tài khoản của bạn như thông tin cá nhân, cài đặt bảo mật, quản lý thông báo, v.v.
            </p>
          </div>

          <div className="space-y-1">
            {sidebarItems.map(item => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all ${
                    item.active 
                      ? 'bg-gray-800 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl">
            {activeTab === 'personal-info' ? (
              // Personal Info Tab
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
                  <p className="text-gray-600">Quản lý thông tin cá nhân của bạn.</p>
                </div>

                {/* Personal Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin cơ bản</h3>
                    <p className="text-gray-600 text-sm">
                      Quản lý tên hiển thị, tên người dùng, bio và avatar của bạn.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <InfoField 
                      label="Họ và tên" 
                      value={formData.fullName} 
                      field="fullName"
                    />
                    <InfoField 
                      label="Tên người dùng" 
                      value={formData.username} 
                      field="username"
                    />
                    <InfoField 
                      label="Giới thiệu" 
                      value={formData.bio} 
                      field="bio"
                    />
                    <InfoField 
                      label="Ảnh đại diện" 
                      value="Chưa cập nhật" 
                      field="avatar"
                      showIcon={true}
                    />
                  </div>
                </div>

                {/* Social Media Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin mạng xã hội</h3>
                    <p className="text-gray-600 text-sm">
                      Quản lý liên kết tới các trang mạng xã hội của bạn.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <InfoField 
                      label="Trang web cá nhân" 
                      value={formData.website} 
                      field="website"
                    />
                    <InfoField 
                      label="GitHub" 
                      value={formData.github} 
                      field="github"
                    />
                    <InfoField 
                      label="LinkedIn" 
                      value={formData.linkedin} 
                      field="linkedin"
                    />
                    <InfoField 
                      label="Facebook" 
                      value={formData.facebook} 
                      field="facebook"
                    />
                    <InfoField 
                      label="YouTube" 
                      value={formData.youtube} 
                      field="youtube"
                    />
                    <InfoField 
                      label="TikTok" 
                      value={formData.tiktok} 
                      field="tiktok"
                    />
                  </div>
                </div>
              </>
            ) : (
              // Security Tab
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Mật khẩu và bảo mật</h1>
                  <p className="text-gray-600">Quản lý mật khẩu và cài đặt bảo mật.</p>
                </div>

                {/* Login & Recovery Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Đăng nhập & khôi phục</h3>
                    <p className="text-gray-600 text-sm">
                      Quản lý mật khẩu và xác minh 2 bước.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <SecurityField 
                      label="Tạo mật khẩu" 
                      value="Chưa đổi mật khẩu" 
                      field="password"
                      icon={Key}
                    />
                    <SecurityField 
                      label="Xác minh 2 bước" 
                      value="Đang tắt" 
                      field="2fa"
                      icon={Shield}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {getFieldTitle(activeModal)}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {getFieldDescription(activeModal)}
            </p>

            {/* Email Verification Modal */}
            {activeModal === 'email' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData}
                    onChange={(e) => setEditData(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Nhập mã xác nhận"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  />
                  <button
                    onClick={sendVerificationCode}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                  >
                    Gửi mã
                  </button>
                </div>

                <button
                  onClick={verifyEmail}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-500 hover:to-blue-600 transition-all shadow-lg"
                >
                  Xác minh
                </button>
              </>
            )}

            {/* Password Verification Modal */}
            {activeModal === 'password' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại của bạn"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <button className="text-red-500 text-sm hover:text-red-600 font-medium">
                    Bạn quên mật khẩu ư?
                  </button>
                </div>

                <button
                  onClick={verifyPassword}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-500 hover:to-blue-600 transition-all shadow-lg"
                >
                  Xác nhận
                </button>
              </>
            )}

            {/* Regular Edit Modal */}
            {!['email', 'password'].includes(activeModal) && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getFieldLabel(activeModal)}
                  </label>
                  {activeModal === 'bio' ? (
                    <textarea
                      value={editData}
                      onChange={(e) => setEditData(e.target.value)}
                      placeholder={getFieldPlaceholder(activeModal)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editData}
                      onChange={(e) => setEditData(e.target.value)}
                      placeholder={getFieldPlaceholder(activeModal)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={saveChanges}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-500 hover:to-blue-600 transition-all shadow-lg"
                  >
                    Lưu lại
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoPage;