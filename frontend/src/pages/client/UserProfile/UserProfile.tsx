import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Lock, Mail, Phone, MapPin, Calendar, Save, Eye, EyeOff, Check, X, Upload } from 'lucide-react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


// API Service
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  setAuthToken(token) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // User Profile APIs
  async getUserProfile() {
    return this.request('/api/auth/use-me');
  }

  async updateUserProfile(data) {
  return this.request('/api/auth/update-me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}


  async changePassword(passwordData) {
    return this.request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request('api/auth/upload-avatar', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }
}

const apiService = new ApiService();

const UserProfile = () => {
  // State cho thông tin người dùng
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    avatar: null,
    avatarUrl: ''
  });

  // State cho form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State cho UI
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const fileInputRef = useRef(null);

  // Load user profile khi component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Load thông tin user từ API
  const loadUserProfile = async () => {
    try {
      setIsPageLoading(true);
      const response = await apiService.getUserProfile();
      
      if (response.success) {
        const userData = response.data;
        setUserInfo({
          fullName: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          birthDate: userData.birth_date || '',
          avatar: null,
          avatarUrl: userData.avatar_url || ''
        });
        
        if (userData.avatar_url) {
          setAvatarPreview(userData.avatar_url);
        }
      }
    } catch (error) {
      console.error('Load profile error:', error);
      showNotification('Không thể tải thông tin người dùng', 'error');
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Bỏ kiểm tra kích thước file

  // Kiểm tra định dạng file
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    showNotification('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF)', 'error');
    return;
  }

  // Preview ảnh trước khi upload
  const reader = new FileReader();
  reader.onload = (e) => {
    setAvatarPreview(e.target.result);
  };
  reader.readAsDataURL(file);

  // Upload ảnh lên server
  try {
    setIsUploadingAvatar(true);
    const response = await apiService.uploadAvatar(file);
     console.log('Upload response:', response);
    if (response.success) {
      setUserInfo(prev => ({ 
        ...prev, 
        avatar: file,
        avatarUrl: response.data.avatar_url 
      }));
      showNotification('Cập nhật ảnh đại diện thành công!', 'success');
    } else {
      throw new Error(response.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
    showNotification('Không thể cập nhật ảnh đại diện', 'error');
    // Revert preview on error
    setAvatarPreview(userInfo.avatarUrl || null);
  } finally {
    setIsUploadingAvatar(false);
  }
};


  // Hiển thị thông báo
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Cập nhật thông tin cá nhân
  const handleUpdateProfile = async () => {
    setIsLoading(true);

    try {
      // Validate dữ liệu
      if (!userInfo.fullName.trim()) {
        showNotification('Vui lòng nhập họ và tên', 'error');
        return;
      }

      if (!userInfo.email.trim()) {
        showNotification('Vui lòng nhập email', 'error');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userInfo.email)) {
        showNotification('Email không hợp lệ', 'error');
        return;
      }

      const updateData = {
        full_name: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.phone,
        address: userInfo.address,
        birth_date: userInfo.birthDate
      };

      const response = await apiService.updateUserProfile(updateData);
      
      if (response.success) {
        showNotification('Cập nhật thông tin thành công!', 'success');
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      showNotification(error.message || 'Có lỗi xảy ra khi cập nhật thông tin', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    // Validate form
    if (!passwordForm.currentPassword) {
      showNotification('Vui lòng nhập mật khẩu hiện tại', 'error');
      return;
    }

    if (!passwordForm.newPassword) {
      showNotification('Vui lòng nhập mật khẩu mới', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const passwordData = {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword
      };

      const response = await apiService.changePassword(passwordData);
      
      if (response.success) {
        showNotification('Đổi mật khẩu thành công!', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Change password error:', error);
      showNotification(error.message || 'Có lỗi xảy ra khi đổi mật khẩu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state cho toàn trang
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b bg-gray-50">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User size={20} />
                  Thông tin cá nhân
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock size={20} />
                  Đổi mật khẩu
                </div>
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Tab Thông tin cá nhân */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Avatar Section */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden shadow-lg">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-white" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isUploadingAvatar ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera size={20} />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Ảnh đại diện tối đa 5MB, định dạng JPG, PNG, GIF
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} />
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={userInfo.fullName}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập email"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} />
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} />
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={userInfo.birthDate}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} />
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={userInfo.address}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={20} />
                    )}
                    {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab Đổi mật khẩu */}
            {activeTab === 'password' && (
              <div className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} />
                    Mật khẩu hiện tại *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} />
                    Mật khẩu mới *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập mật khẩu mới"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} />
                    Xác nhận mật khẩu mới *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Lưu ý:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Mật khẩu phải có ít nhất 6 ký tự</li>
                    <li>• Nên sử dụng kết hợp chữ và số</li>
                    <li>• Không chia sẻ mật khẩu với người khác</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lock size={20} />
                  )}
                  {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;