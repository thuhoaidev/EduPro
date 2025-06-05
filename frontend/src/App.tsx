import { useRoutes } from "react-router-dom";
import "antd/dist/reset.css";
import Homepage from "./pages/Homepage";
import AdminLayout from "./pages/layout/AdminLayout";
import ClientLayout from "./pages/layout/ClientLayout";
import AuthLayout from "./pages/layout/AuthLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CouponManagement from "./pages/admin/Vouchers/VouchersPage";
import TransactionHistory from "./pages/admin/Transaction/TransactionHistory";

import UserPage from "./pages/admin/Users/UserPage";
import InstructorList from "./pages/admin/Instructors/InstructorList";
import InstructorDetail from "./pages/admin/Instructors/InstructorDetail";
import UserDetail from "./pages/admin/Users/UserDetail";
import ContentApprovalPage from "./pages/admin/content-approval/ContentApproval";
import ReportsPage from "./pages/admin/reports/Reports";
import VouchersPage from "./pages/admin/Vouchers/VouchersPage";
import Notifications from "./pages/admin/Notifications/Notifications";
import AdminStatistics from "./pages/admin/Statistics/AdminStatistics";
import LoginPage from "./pages/client/auth/login";
import RegisterPage from "./pages/client/auth/register";
import ForgotPassword from "./pages/client/auth/forgotPassword";
import ResetPassword from "./pages/client/auth/resetPassword";
import VerifyEmail from "./pages/verifyEmail";
import Earnings from "./pages/client/earnings/Earnings";
import UserProfile from "./pages/client/UserProfile/UserProfile";
import InstructorProfile from "./pages/client/InstructorProfile/InstructorProfile";

import InstructorRegistrationPage from "./pages/client/auth/instructorRegistrationPage";
import CourseManagement from "./pages/admin/section-lesson/CourseManagement";
import InstructorPendingListPage from "./pages/admin/Instructors/InstructorPendingList";
import InstructorProfileDetail from "./pages/admin/Instructors/InstructorProfileDetail";
import PersonalInfoPage from "./pages/layout/PersonalInformation";
import ModeratorLayout from "./pages/layout/ModeratorLayout";
import BlogModeration from "./pages/Moderator/Blogs/BlogModeration";
import CommentsModerationPage from "./pages/Moderator/Comments/CommentsModerationPage";
import ReportStatistics from "./pages/Moderator/Statistics/ReportStatistics";
import CourseList from "./pages/instructor/course/CourseList";
import InstructorLayout from "./pages/layout/InstructorLayout";


const queryClient = new QueryClient();

function App() {
  const routes = [
    {
      path: "/",
      element: <ClientLayout />,
      children: [
        { index: true, element: <Homepage /> },
        { path: 'verify-email/:token', element: <VerifyEmail /> },
        { path: 'instructor/earnings', element: <Earnings /> },
        { path: 'user/profile', element: <UserProfile /> },
        { path: 'instructor/profile', element: <InstructorProfile /> },
        { path: 'client/PersonalInfoPage', element: <PersonalInfoPage /> },
      ]
    },

    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "users", element: < UserPage /> }, // Quản lý người dùng
        { path: "users/:id", element: < UserDetail /> }, // Chi tiết người dùng
        { path: "instructor-approval", element: <InstructorPendingListPage /> },
        { path: "instructor-profile/:id", element: <InstructorProfileDetail /> },
        { path: "sectionLesson/CourseManagement", element: < CourseManagement /> },
        { path: "instructors", element: < InstructorList /> },
        { path: "users/instructor/:id", element: < InstructorDetail /> },
        { path: "content-approval", element: < ContentApprovalPage /> },
        { path: "reports", element: < ReportsPage /> },
        { path: "system/vouchers", element: < VouchersPage /> },
        { path: "system/notifications", element: < Notifications /> },
        { path: "statistics", element: < AdminStatistics /> },
        { path: "coupons", element: < CouponManagement /> },
        { path: "history", element: < TransactionHistory /> },
      ],
    },
    {
      path: "/moderator",
      element: <ModeratorLayout />,
      children: [
        
      ],
    },
    {
      path: "/instructor",
      element: <InstructorLayout />,
      children: [
        
      ],
    },
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
        { path: '/reset-password/:token', element: < ResetPassword /> },
        { path: '/register/instructor', element: < InstructorRegistrationPage /> }
      ]
    }

  ];

  const element = useRoutes(routes);

  return <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>;
}

export default App;
