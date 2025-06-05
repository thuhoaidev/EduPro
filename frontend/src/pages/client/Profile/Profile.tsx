import React from "react";
import { User } from "lucide-react";

const userInfo = {
  fullName: "Hoài Thu Mai",
  username: "thumaihoai",
  avatar:
    "https://ui-avatars.com/api/?name=Hoai+Thu+Mai&background=4f8cff&color=fff&size=256",
  joined: "Tham gia F8 từ một tháng trước",
  followers: 0,
  following: 1,
};

const courses = [
  {
    title: "Lập Trình JavaScript Nâng Cao",
    subtitle: "JavaScript {.Nâng cao}",
    image:
      "https://files.fullstack.edu.vn/f8-prod/courses/12.png",
    free: true,
    students: 40782,
    lessons: 19,
    time: "8h41p",
  },
  {
    title: "HTML CSS từ Zero đến Hero",
    subtitle: "HTML, CSS từ zero đến hero",
    image:
      "https://files.fullstack.edu.vn/f8-prod/courses/2.png",
    free: true,
    students: 210789,
    lessons: 117,
    time: "29h5p",
  },
  {
    title: "Làm việc với Terminal & Ubuntu",
    subtitle: "WSL Ubuntu",
    image:
      "https://files.fullstack.edu.vn/f8-prod/courses/14/624faac11d109.png",
    free: true,
    students: 20704,
    lessons: 28,
    time: "4h59p",
  },
  {
    title: "Kiến thức nhập môn IT",
    subtitle: "Kiến Thức Nền Tảng",
    image:
      "https://files.fullstack.edu.vn/f8-prod/courses/1.png",
    free: true,
    students: 124789,
    lessons: 31,
    time: "6h30p",
  },
  {
    title: "Responsive web design",
    subtitle: "Responsive",
    image:
      "https://files.fullstack.edu.vn/f8-prod/courses/3.png",
    free: true,
    students: 78945,
    lessons: 22,
    time: "5h10p",
  },
  {
    title: "Từ cơ bản đến nâng cao",
    subtitle: "Từ cơ bản đến nâng cao",
    image:
      "https://files.fullstack.edu.vn/f8-prod/courses/7.png",
    free: true,
    students: 56789,
    lessons: 15,
    time: "3h45p",
  },
];

// Dữ liệu mẫu cho biểu đồ nhiệt hoạt động (7x18 = 126 ngày)
const heatmapData = Array.from({ length: 18 }, () =>
  Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
);

const getHeatColor = (value: number) => {
  if (value === 0) return '#f3f4f6';
  if (value === 1) return '#d2f9e5';
  if (value === 2) return '#7be3b5';
  if (value === 3) return '#34d399';
  return '#059669';
};

const Profile = () => {
  return (
    <div className="bg-[#fafbfc] min-h-screen py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-2 md:px-0">
        {/* Left: User Info */}
        <div className="w-full md:w-1/4 flex flex-col items-center md:items-start pt-2">
          <img
            src={userInfo.avatar}
            alt="avatar"
            className="w-36 h-36 rounded-full border-4 border-white shadow mb-4 object-cover"
          />
          <div className="text-2xl font-bold text-gray-900 mb-1 text-center md:text-left">
            {userInfo.fullName}
          </div>
          <div className="text-gray-500 text-base mb-3 text-center md:text-left">@{userInfo.username}</div>
          <div className="flex items-center gap-2 text-gray-600 mb-2 text-sm">
            <User size={16} />
            <span><b>{userInfo.followers}</b> người theo dõi · <b>{userInfo.following}</b> đang theo dõi</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mb-2 text-sm">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#888" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0-14a6 6 0 0 0-6 6c0 3.31 2.69 6 6 6s6-2.69 6-6a6 6 0 0 0-6-6Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>
            <span>{userInfo.joined}</span>
          </div>
        </div>
        {/* Right: Activity + Courses */}
        <div className="w-full md:w-3/4 flex flex-col gap-8">
          {/* Tab khóa học đã đăng ký */}
          <div className="bg-white rounded-xl shadow p-0">
            <div className="flex items-center gap-2 border-b border-gray-200 px-6 pt-4 pb-2">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#222" d="M4 4h16v2H4V4Zm0 4h16v2H4V8Zm0 4h16v2H4v-2Zm0 4h16v2H4v-2Zm0 4h16v2H4v-2Z"/></svg>
              <span className="text-base font-semibold text-[#222] border-b-2 border-[#1dc071] pb-1">Khóa học đã đăng ký ({courses.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-6">
              {courses.map((course, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow border border-gray-100 hover:shadow-xl transition flex flex-col gap-2 cursor-pointer"
                  style={{ minHeight: 210 }}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />
                  <div className="text-base font-semibold text-gray-900 mb-1">
                    {course.subtitle}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">{course.title}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-[#f05123]">Miễn phí</span>
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="#888" d="M16 11V7a4 4 0 1 0-8 0v4a4 4 0 1 0 8 0Zm-4 6a6 6 0 0 1-6-6V7a6 6 0 1 1 12 0v4a6 6 0 0 1-6 6Z"/></svg>
                      {course.students.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="#888" d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/></svg>
                      {course.lessons}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="#888" d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/></svg>
                      {course.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;