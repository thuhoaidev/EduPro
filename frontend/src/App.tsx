import { useRoutes } from "react-router-dom";
import axios from "axios";
import "antd/dist/reset.css";
import Homepage from "./pages/Homepage";
import AdminLayout from "./pages/layout/AdminLayout";
import ClientLayout from "./pages/layout/ClientLayout";
import AuthLayout from "./pages/layout/AuthLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
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
import InstructorLayout from "./pages/layout/InstructorLayout";
import CourseList from "./pages/instructor/course/CourseList";
import CourseDetail from "./pages/instructor/course/CourseDetail";
import EditCourse from "./pages/instructor/course/CourseEdit";
import CreateCourse from "./pages/instructor/course/CourseAdd";
import ManageLesson from "./pages/instructor/lessons/Lesson";
import StudentListPage from "./pages/instructor/students/Students";
import StudentDetail from "./pages/instructor/students/StudentDetail";
import EarningsPage from "./pages/instructor/earnings/EarningsPage";
import CourseDiscussion from "./pages/instructor/community/Community";
import ModeratorLayout from "./pages/layout/ModeratorLayout";
import ProfilePage from "./pages/layout/ProfileForm";
import CommentsModerationPage from "./pages/Moderator/Comments/CommentsModerationPage";
import ReportStatistics from "./pages/Moderator/Statistics/ReportStatistics";
import BlogModeration from "./pages/Moderator/Blogs/BlogModeration";

axios.defaults.baseURL = "http://localhost:3000";


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

      ]
    },

    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
{ path: "users", element: < UserPage/> },
        { path: "users/:id", element: < UserDetail/> },
        { path: "instructors", element: < InstructorList/> },
        { path: "users/instructor/:id", element: < InstructorDetail/> },
        { path: "content-approval", element: < ContentApprovalPage/> },
        { path: "reports", element: < ReportsPage/> },
        { path: "system/vouchers", element: < VouchersPage/> },
        { path: "system/notifications", element: < Notifications/> },
        { path: "statistics", element: < AdminStatistics/> },
        { path: "coupons", element: < CouponManagement/> },
        { path: "history", element: < TransactionHistory/> },
      ],
    },
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
        { path: '/reset-password/:token', element: < ResetPassword /> }
      ]
    },
 {
      path: "/instructor",
      element: <InstructorLayout />,
      children: [
       { path: "courses", element: <CourseList /> },
       { path: "courses/:id", element: <CourseDetail /> },
       { path: "courses/:id/edit", element: <EditCourse /> },
       { path: "courses/new", element: <CreateCourse /> },
       { path: "lessons", element: <ManageLesson /> },
       { path: "students", element: <StudentListPage /> },
       { path: "students/:id", element: <StudentDetail /> },
       { path: "income", element: <EarningsPage /> },
       { path: "community", element: <CourseDiscussion /> },
      ],
    },
  {
      path: "/moderator",
      element: <ModeratorLayout />,
      children: [
        { path: "blogs", element: < BlogModeration/> },
        { path: "profile", element: < ProfilePage/> },
        { path: "comments", element: < CommentsModerationPage/> },
        { path: "reports", element: < ReportsPage/> },
        { path: "statistics", element: < ReportStatistics/> },
      ],
    },
    
  ];

  const element = useRoutes(routes);

  return <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>;
}

export default App;
