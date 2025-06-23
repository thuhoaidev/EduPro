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
import UserDetail from "./pages/admin/Users/UserDetail";
import ContentApprovalPage from "./pages/admin/content-approval/ContentApproval";
import ReportsPage from "./pages/admin/reports/Reports";
import LoginPage from "./pages/client/auth/login";
import RegisterPage from "./pages/client/auth/register";
import ForgotPassword from "./pages/client/auth/forgotPassword";
import ResetPassword from "./pages/client/auth/resetPassword";
import VerifyEmail from "./pages/verifyEmail";
import Earnings from "./pages/client/earnings/Earnings";

import InstructorRegistrationPage from "./pages/client/auth/instructorRegistrationPage";
import CourseManagement from "./pages/admin/section-lesson/CourseManagement";
import InstructorProfileDetail from "./pages/admin/Instructors/InstructorProfileDetail";
import ModeratorLayout from "./pages/layout/ModeratorLayout";
import InstructorLayout from "./pages/layout/InstructorLayout";
import ChangePassword from "./pages/layout/ChangePassword";
import Profile from "./pages/client/Profile/Profile";
import CategoryPage from "./pages/admin/categories/CategoryPage";
import BlogWritePage from "./pages/client/blog/BlogWritePage";
import MyBlogPosts from "./pages/client/blog/MyBlogPosts";
import SavedBlogPosts from "./pages/client/blog/SavedBlogPosts";
import FeaturedPostsPage from "./pages/client/blog/FeaturedPostsPage";
import VouchersPage from "./pages/client/VouchersPage";
import CoursesPage from './pages/client/CoursesPage';
import InstructorsPage from './pages/client/InstructorsPage';
import BlogPage from './pages/client/BlogPage';
import CartPage from './pages/client/CartPage';
import CourseDetailPage from "./pages/client/CourseDetailPage";

const queryClient = new QueryClient();

function App() {
  const routes = [
    {
      path: "/",
      element: <ClientLayout />,
      children: [
        { index: true, element: <Homepage /> },
        { path: 'verify-instructor-email/:token', element: <VerifyEmail /> },
        { path: 'instructor/earnings', element: <Earnings /> },
        { path: "blog/write", element: <BlogWritePage /> },//viết blog
        { path: "blog/mine", element: <MyBlogPosts  /> },
        { path: "blog/saved", element: <SavedBlogPosts  /> },
        { path: "/featured-posts", element: <FeaturedPostsPage   /> },
        { path: "vouchers", element: <VouchersPage /> },
        { path: "courses", element: <CoursesPage /> },
        { path: "courses/:slug", element: <CourseDetailPage /> },
        { path: "instructors", element: <InstructorsPage /> },
        { path: "blog", element: <BlogPage /> },
        { path: "cart", element: <CartPage /> },
      ]
    },
    {
      path: "/profile",
      element: <ProfileLayout />,
      children: [
        { path: "", element: <Profile /> },
        { path: 'edit', element: <ProfileEdit /> },
        { path: 'change-password', element: <ChangePassword /> },
      ]
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "users", element: <UserPage /> },
        { path: "users/:id", element: <UserDetail /> },
        { path: "categories", element: <CategoryPage /> },
        { path: "instructors", element: <InstructorList /> },
        { path: "sectionLesson/CourseManagement", element: <CourseManagement /> },
        { path: "users/instructors/pending/:id", element: <InstructorProfileDetail /> },
        { path: "content-approval", element: <ContentApprovalPage /> },
        { path: "reports", element: <ReportsPage /> },
        { path: "system/vouchers", element: <CouponManagement /> },
        { path: "history", element: <TransactionHistory /> },
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
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/reset-password/:token', element: <ResetPassword /> },
    { path: '/register/instructor', element: <InstructorRegistrationPage /> }
  ];

  const element = useRoutes(routes);

  return <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>;
}

export default App;
