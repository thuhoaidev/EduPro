import React from 'react';
import {
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Users,
  Heart,
  Settings,
  Globe,
  Github,
  Linkedin,
  Facebook,
  Youtube,
} from 'lucide-react';

const InstructorProfileView = () => {
  // Dữ liệu mẫu - trong thực tế sẽ lấy từ API hoặc props
  const profileData = {
    name: 'Doanh Phạm Đức (PH48812)',
    title: 'Senior Frontend Developer',
    avatar: 'https://via.placeholder.com/150',
    bio: 'Với hơn 8 năm kinh nghiệm trong lĩnh vực phát triển web, tôi đam mê chia sẻ kiến thức và giúp đỡ các bạn trẻ bước vào ngành IT. Tôi có kinh nghiệm làm việc với nhiều công nghệ khác nhau và luôn cập nhật những xu hướng mới nhất trong ngành.',
    email: 'doanhdph48812@gmail.com',
    phone: '0123 456 789',
    location: 'Ninh Bình, Việt Nam',
    joinDate: 'Tham gia từ 2020',
    experience: '8+ năm kinh nghiệm',
    students: '12,450',
    courses: '24',
    rating: 4.8,
    totalReviews: 2847,
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'HTML/CSS', 'Git'],
    achievements: ['Top Instructor 2023', 'Most Popular Course Award', 'Excellence in Teaching'],
    socialMedia: {
      website: 'https://yourwebsite.com',
      github: 'https://github.com/phamducph48812doanh',
      linkedin: 'https://linkedin.com/in/phamducph48812doanh',
      facebook: 'https://facebook.com/phamducph48812doanh',
      youtube: 'https://youtube.com/@phamducph48812doanh'
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 h-64 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              {/* Avatar and Basic Info */}
              <div className="text-center mb-6">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                />
                <div className="mt-4">
                  <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                  <p className="text-gray-600 mt-1">{profileData.title}</p>
                </div>

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
                  <span className="text-gray-700">{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-gray-700">{profileData.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-gray-700">{profileData.location}</span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên kết mạng xã hội</h3>
              <div className="space-y-3">
                <a href={profileData.socialMedia.website} className="flex items-center space-x-3 text-gray-600 hover:text-orange-500 transition-colors">
                  <Globe className="w-5 h-5" />
                  <span>Website cá nhân</span>
                </a>
                <a href={profileData.socialMedia.github} className="flex items-center space-x-3 text-gray-600 hover:text-orange-500 transition-colors">
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </a>
                <a href={profileData.socialMedia.linkedin} className="flex items-center space-x-3 text-gray-600 hover:text-orange-500 transition-colors">
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
                <a href={profileData.socialMedia.facebook} className="flex items-center space-x-3 text-gray-600 hover:text-orange-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                  <span>Facebook</span>
                </a>
                <a href={profileData.socialMedia.youtube} className="flex items-center space-x-3 text-gray-600 hover:text-orange-500 transition-colors">
                  <Youtube className="w-5 h-5" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tiểu sử</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{profileData.bio}</p>
            </section>

            {/* Experience and Achievements */}
            <section className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" /> Kinh nghiệm
                </h3>
                <div>
                  <p className="text-gray-700 font-medium">{profileData.experience}</p>
                  <p className="mt-1 text-sm text-gray-500">{profileData.joinDate}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" /> Thành tích
                </h3>
                <ul className="space-y-2">
                  {profileData.achievements.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Skills */}
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" /> Kỹ năng
              </h3>
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
            </section>

            {/* Recent Courses */}
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Khóa học gần đây</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-2">Complete React Developer Course</h4>
                  <p className="text-sm text-gray-600 mb-2">Khóa học React từ cơ bản đến nâng cao</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-500 font-medium">1,234 học viên</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-2">Node.js Masterclass</h4>
                  <p className="text-sm text-gray-600 mb-2">Xây dựng API và backend với Node.js</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-500 font-medium">892 học viên</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>4.7</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfileView;