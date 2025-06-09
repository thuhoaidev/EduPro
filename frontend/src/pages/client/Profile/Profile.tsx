import React, { useEffect, useState } from "react";
import { config } from "../../../api/axios";
type UserType = {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  isInstructor: boolean;
  created_at: string;
  followers_count: number;
  following_count: number;
  has_registered_instructor: boolean;
  instructorInfo?: {
    is_approved: boolean;
  };
};

type CourseType = {
  _id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  price: number;
  students: number;
  lessons: number;
  totalTime: string;
};

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("user", user)
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userRes = await config.get("/auth/me");
        setUser(userRes.data.user);

        const mockCourses: CourseType[] = [
          {
            _id: "1",
            title: "Lập trình React từ cơ bản đến nâng cao",
            subtitle: "Khóa học React chuyên sâu",
            thumbnail: "https://placehold.co/400x200?text=React",
            price: 499000,
            students: 1240,
            lessons: 30,
            totalTime: "12 giờ",
          },
          {
            _id: "2",
            title: "Thiết kế UI/UX với Figma",
            subtitle: "Khóa học Figma",
            thumbnail: "https://placehold.co/400x200?text=Figma",
            price: 0,
            students: 850,
            lessons: 18,
            totalTime: "7 giờ",
          },
          {
            _id: "3",
            title: "Node.js & Express cơ bản",
            subtitle: "Backend với Node.js",
            thumbnail: "https://placehold.co/400x200?text=Node.Js",
            price: 399000,
            students: 930,
            lessons: 25,
            totalTime: "9.5 giờ",
          },
        ];

        setCourses(mockCourses);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!user) return <div className="p-10 text-center text-red-500">Không thể tải thông tin người dùng.</div>;

  return (
    <div className="bg-gradient-to-b from-gray-100 to-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 px-4">
        {/* Sidebar Profile */}
        <div className="w-full md:w-1/4 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center md:items-start text-center md:text-left">
          <img
            src={
              user.avatar?.startsWith("http")
                ? user.avatar
                : user.avatar
                  ? `http://localhost:5000/uploads/avatars/${user.avatar}`
                  : "https://www.gravatar.com/avatar/?d=mp&s=128"
            }
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover"
            crossOrigin="anonymous"
          />


          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500">@{user.email.split("@")[0]}</p>
          <div className="text-sm text-gray-600 mt-4 space-y-2">
            <p><b>{user.followers_count}</b> người theo dõi · <b>{user.following_count}</b> đang theo dõi</p>
            <p>Tham gia từ {new Date(user.created_at).toLocaleDateString("vi-VN")}</p>
            <p>
              {user.isInstructor ? (
                <span className="text-green-600">✔ Giảng viên được phê duyệt</span>
              ) : user.has_registered_instructor ? (
                <span className="text-yellow-600">⏳ Đang chờ duyệt giảng viên</span>
              ) : (
                <span className="text-gray-400 italic">Chưa đăng ký làm giảng viên</span>
              )}
            </p>
          </div>
        </div>

        {/* Course List */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Khóa học đã đăng ký ({courses.length})
            </h3>

            {courses.length === 0 ? (
              <p className="text-gray-500 text-sm">Bạn chưa đăng ký khóa học nào.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-gray-50 hover:bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition duration-200 p-3 cursor-pointer"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-36 object-cover rounded-lg mb-3"
                    />
                    <h4 className="text-base font-semibold text-gray-800 mb-1">{course.subtitle}</h4>
                    <p className="text-sm text-gray-500 mb-2">{course.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-[#f05123]">
                        {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}₫`}
                      </span>
                      <span>👥 {course.students.toLocaleString()} HV</span>
                      <span>📚 {course.lessons} bài</span>
                      <span>⏱ {course.totalTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
