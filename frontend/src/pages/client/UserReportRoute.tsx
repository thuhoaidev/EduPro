// src/pages/client/UserReportRoute.tsx
import React from "react";
import UserReportPage from "./UserReportPage";

const UserReportRoute: React.FC = () => {
  // Lấy user từ localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return <div>Vui lòng đăng nhập để gửi báo cáo.</div>;

  return <UserReportPage userId={user._id} />;
};

export default UserReportRoute;