import React, { useState, useRef } from 'react';
import {
  Star,
  Edit,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Users,
  Heart,
  Check,
  X,
} from 'lucide-react';

const InstructorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Nguyễn Văn An',
    title: 'Senior Frontend Developer',
    avatar: 'https://via.placeholder.com/150',
    bio: 'Với hơn 8 năm kinh nghiệm trong lĩnh vực phát triển web, tôi đam mê chia sẻ kiến thức và giúp đỡ các bạn trẻ bước vào ngành IT.',
    email: 'nguyenvanan@f8.edu.vn',
    phone: '0123 456 789',
    location: 'Hà Nội, Việt Nam',
    joinDate: 'Tham gia từ 2020',
    experience: '8+ năm kinh nghiệm',
    students: '12,450',
    courses: '24',
    rating: 4.8,
    totalReviews: 2847,
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'],
    achievements: ['Top Instructor 2023', 'Most Popular Course Award', 'Excellence in Teaching'],
  });

  const [editForm, setEditForm] = useState({ ...profileData });
  const [avatarPreview, setAvatarPreview] = useState(profileData.avatar);
  const [toastVisible, setToastVisible] = useState(false);
  const fileInputRef = useRef(null);

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Validate inputs simple example
  const validate = () => {
    const errs = {};
    if (!editForm.name.trim()) errs.name = 'Tên không được để trống';
    if (!editForm.email.trim() || !/\S+@\S+\.\S+/.test(editForm.email)) errs.email = 'Email không hợp lệ';
    if (!editForm.phone.trim()) errs.phone = 'Số điện thoại không được để trống';
    if (!editForm.location.trim()) errs.location = 'Địa chỉ không được để trống';
    if (!editForm.title.trim()) errs.title = 'Chuyên môn không được để trống';
    return errs;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...profileData });
    setAvatarPreview(profileData.avatar);
    setErrors({});
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setProfileData({ ...editForm, avatar: avatarPreview });
    setIsEditing(false);
    setToastVisible(true);
    // Ẩn toast sau 3s
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleCancel = () => {
    setEditForm({ ...profileData });
    setAvatarPreview(profileData.avatar);
    setIsEditing(false);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // CSS class for editable fields
  const getEditableFieldClass = (hasError = false) => {
    return `w-full transition-all duration-200 ${
      isEditing 
        ? `border-2 ${hasError ? 'border-red-500' : 'border-gray-900'} rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white shadow-sm`
        : 'border-transparent'
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 h-64 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Toast notification */}
      {toastVisible && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeInOut z-50 flex items-center gap-2">
          <Check className="w-4 h-4" />
          Cập nhật hồ sơ thành công!
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              {/* Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className={`${isEditing ? 'ring-4 ring-gray-900 ring-opacity-20' : ''} rounded-full transition-all duration-200`}>
                    <img
                      src={avatarPreview}
                      alt={profileData.name}
                      className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                    />
                  </div>
                  {isEditing && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-110"
                        aria-label="Thay đổi ảnh đại diện"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`${getEditableFieldClass(errors.name)} text-center text-xl font-bold`}
                      placeholder="Tên"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`${getEditableFieldClass(errors.title)} text-center text-gray-600`}
                      placeholder="Chuyên môn"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>
                ) : (
                  <div className="mt-4">
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                    <p className="text-gray-600 mt-1">{profileData.title}</p>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center justify-center mt-4 space-x-2">
                  <div className="flex space-x-1">{renderStars(profileData.rating)}</div>
                  <span className="text-lg font-semibold text-gray-900">{profileData.rating}</span>
                  <span className="text-gray-500">({profileData.totalReviews} đánh giá)</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="bg-blue-50 p-3 rounded-lg mb-2">
                    <Users className="w-6 h-6 text-blue-500 mx-auto" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{profileData.students}</div>
                  <div className="text-sm text-gray-500">Học viên</div>
                </div>
                <div className="text-center">
                  <div className="bg-green-50 p-3 rounded-lg mb-2">
                    <BookOpen className="w-6 h-6 text-green-500 mx-auto" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{profileData.courses}</div>
                  <div className="text-sm text-gray-500">Khóa học</div>
                </div>
                <div className="text-center">
                  <div className="bg-red-50 p-3 rounded-lg mb-2">
                    <Heart className="w-6 h-6 text-red-500 mx-auto" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{profileData.rating}</div>
                  <div className="text-sm text-gray-500">Đánh giá</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={getEditableFieldClass(errors.email)}
                      placeholder="Email"
                    />
                  ) : (
                    <span className="text-gray-700">{profileData.email}</span>
                  )}
                </div>
                {errors.email && <p className="text-red-500 text-sm ml-8">{errors.email}</p>}

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={getEditableFieldClass(errors.phone)}
                      placeholder="Số điện thoại"
                    />
                  ) : (
                    <span className="text-gray-700">{profileData.phone}</span>
                  )}
                </div>
                {errors.phone && <p className="text-red-500 text-sm ml-8">{errors.phone}</p>}

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={getEditableFieldClass(errors.location)}
                      placeholder="Địa chỉ"
                    />
                  ) : (
                    <span className="text-gray-700">{profileData.location}</span>
                  )}
                </div>
                {errors.location && <p className="text-red-500 text-sm ml-8">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Tiểu sử</h2>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    aria-label="Chỉnh sửa hồ sơ"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="font-medium">Chỉnh sửa</span>
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="relative">
                  <textarea
                    rows={5}
                    value={editForm.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full border-2 border-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none transition-all duration-200 bg-white shadow-sm"
                    placeholder="Nhập tiểu sử"
                  />
                  <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 rounded">
                    Có thể chỉnh sửa
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{profileData.bio}</p>
              )}
            </section>

            {/* Experience and Achievements */}
            <section className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" /> Kinh nghiệm
                </h3>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={editForm.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full border-2 border-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm font-medium"
                        placeholder="Số năm kinh nghiệm"
                      />
                      <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 rounded">
                        Có thể chỉnh sửa
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editForm.joinDate}
                      onChange={(e) => handleInputChange('joinDate', e.target.value)}
                      className="w-full border-2 border-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm text-sm"
                      placeholder="Ngày tham gia"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 font-medium">{profileData.experience}</p>
                    <p className="mt-1 text-sm text-gray-500">{profileData.joinDate}</p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" /> Thành tích
                </h3>
                {isEditing ? (
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={editForm.achievements.join('\n')}
                      onChange={(e) => handleInputChange('achievements', e.target.value.split('\n').filter(item => item.trim()))}
                      className="w-full border-2 border-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none transition-all duration-200 bg-white shadow-sm"
                      placeholder="Nhập thành tích, mỗi dòng một thành tích"
                    />
                    <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 rounded">
                      Có thể chỉnh sửa
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {profileData.achievements.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Skills */}
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" /> Kỹ năng
              </h3>
              {isEditing ? (
                <div className="relative">
                  <input
                    type="text"
                    value={editForm.skills.join(', ')}
                    onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()))}
                    className="w-full border-2 border-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
                    placeholder="Nhập kỹ năng, cách nhau bởi dấu phẩy"
                  />
                  <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 rounded">
                    Có thể chỉnh sửa
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {profileData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-200 hover:shadow-md transition-shadow duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 justify-end bg-white rounded-2xl shadow-lg p-6">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 font-medium border border-gray-300"
                >
                  <X className="w-4 h-4" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
                >
                  <Check className="w-4 h-4" />
                  Lưu thay đổi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
          10%, 90% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(0.95); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default InstructorProfile;