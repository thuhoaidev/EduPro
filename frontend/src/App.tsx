import { useRoutes } from "react-router-dom";
import "antd/dist/reset.css";
import Homepage from "./pages/Homepage";
import AdminLayout from "./pages/layout/AdminLayout";
import ClientLayout from "./pages/layout/ClientLayout";
import ProfileLayout from "./pages/layout/ProfileLayout";
import ProfileEdit from "./pages/client/Profile/ProfileEdit";
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
import { LoginPage } from "./pages/client/auth/login";
import RegisterPage from "./pages/client/auth/register";
import ForgotPassword from "./pages/client/auth/forgotPassword";
import ResetPassword from "./pages/client/auth/resetPassword";
import VerifyEmail from "./pages/verifyEmail";
import Earnings from "./pages/client/earnings/Earnings";

import InstructorRegistrationPage from "./pages/client/auth/instructorRegistrationPage";
import InstructorPendingListPage from "./pages/admin/Instructors/InstructorPendingList";
import InstructorProfileDetail from "./pages/admin/Instructors/InstructorProfileDetail";
import ModeratorLayout from "./pages/layout/ModeratorLayout";
import InstructorLayout from "./pages/layout/InstructorLayout";
import ChangePassword from "./pages/layout/ChangePassword";
import Profile from "./pages/client/Profile/Profile";

import CreateCourse from "./pages/instructor/course/CourseAdd";


import CourseManagement from "./pages/admin/section-lesson/CourseManagement";
import VideoQuizManager from "./pages/admin/section-lesson/VideoQuizManager";
import MyCourseDashboard from "./pages/admin/section-lesson/MyCourseDashboard";

import BlogModeration from "./pages/Moderator/Blogs/BlogModeration";
import CommentsModerationPage from "./pages/Moderator/Comments/CommentsModerationPage";
import ReportStatistics from "./pages/Moderator/Statistics/ReportStatistics";
import BlogWritePage from "./pages/client/blog/BlogWritePage";
import MyBlogPosts from "./pages/client/blog/MyBlogPosts";
import SavedBlogPosts from "./pages/client/blog/SavedBlogPosts";
import FeaturedPostsPage from "./pages/client/blog/FeaturedPostsPage";


const queryClient = new QueryClient();

function App() {
  const routes = [
    {
      path: "/",
      element: <ClientLayout />,
      children: [
        { index: true, element: <Homepage /> },
        { path: "verify-email/:slug/:token", element: <VerifyEmail /> },
        { path: "instructor/earnings", element: <Earnings /> },
        { path: "blog/write", element: <BlogWritePage /> },//viết blog
        { path: "blog/mine", element: <MyBlogPosts  /> },
        { path: "blog/saved", element: <SavedBlogPosts  /> },
        { path: "/featured-posts", element: <FeaturedPostsPage   /> },
      ],
    },
    {
      path: "/profile",
      element: <ProfileLayout />,
      children: [
        { path: "", element: <Profile /> },
        { path: "edit", element: <ProfileEdit /> },
        { path: "change-password", element: <ChangePassword /> },
      ],
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "users", element: <UserPage /> },
        { path: "users/:id", element: <UserDetail /> },
        { path: "instructors", element: <InstructorList /> },
        { path: "instructor-approval", element: <InstructorPendingListPage /> },

        { path: "users/instructor/:id", element: <InstructorDetail /> },
        { path: "instructor-profile/:id", element: <InstructorProfileDetail /> },

        // { path: "instructor-profile/:id", element: <InstructorProfileDetail /> },
        { path: "sectionLesson/CourseManagement", element: <CourseManagement /> },
        { path: "users/instructor/:id", element: <InstructorProfileDetail /> },

        { path: "content-approval", element: <ContentApprovalPage /> },
        { path: "reports", element: <ReportsPage /> },
        { path: "system/vouchers", element: <VouchersPage /> },
        { path: "system/notifications", element: <Notifications /> },
        { path: "statistics", element: <AdminStatistics /> },
        { path: "coupons", element: <CouponManagement /> },
        { path: "history", element: <TransactionHistory /> },
        
      ],
    },
    {
      path: "/moderator",
      element: <ModeratorLayout />,
      children: [
        { path: "blogs", element: <BlogModeration /> },
        { path: "comments", element: <CommentsModerationPage /> },
        { path: "reports", element: <ReportsPage /> },
        { path: "statistics", element: <ReportStatistics /> },
      ],
    },
    {
      path: "/instructor",
      element: <InstructorLayout />,
      children: [
        { path: "sections", element: <VideoQuizManager /> },
        { path: "lessons", element: <CourseManagement /> },
        { path: "courses/new", element: <CreateCourse /> },
        { path: "courses", element: <MyCourseDashboard /> },
      ],
    },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password/:token", element: <ResetPassword /> },
    { path: "/register/instructor", element: <InstructorRegistrationPage /> },
  ];

  const element = useRoutes(routes);
  return <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>;
}

export default App;