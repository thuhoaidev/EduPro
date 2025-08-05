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
import { CartProvider } from "./contexts/CartContext";
import React from "react";

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
import { VerifyInstructorEmail } from "./pages/client/auth/verifyInstructorEmail";
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
import VoucherPage from "./pages/admin/Vouchers/VouchersPage";
import CoursesPage from './pages/client/CoursesPage';
import InstructorsPage from './pages/client/InstructorsPage';
import CartPage from './pages/client/CartPage';
import CheckoutPage from './pages/client/CheckoutPage';
import OrdersPage from './pages/client/OrdersPage';
import CourseDetailPage from "./pages/client/CourseDetailPage";
import Dashboard from './pages/admin/Dashboard/Dashboard';
import AdminStatistics from './pages/admin/Statistics/AdminStatistics';
import MyCourseList from './pages/instructor/course/MyCourseList';
import MyCourseAdd from './pages/instructor/course/MyCourseAdd';
import MyLessonManager from './pages/instructor/lessons/MyLessonManager';
import MyStudentStats from './pages/instructor/students/MyStudentStats';
import MyEarnings from './pages/instructor/earnings/MyEarnings';
import CourseDetail from './pages/instructor/course/CourseDetail';
import LessonVideoPage from './pages/client/lessons/LessonVideoPage';
import LessonQuizPage from './pages/client/lessons/LessonQuizPage';
import CourseList from "./pages/instructor/course/CourseList";
import CourseEdit from "./pages/instructor/course/CourseEdit";
import AdminCourseDetail from "./pages/admin/courses/AdminCourseDetail";
import UserReportRoute from "./pages/client/UserReportRoute";

import UserProfile from "./pages/client/Profile/UserProfile";
import CheckPayment from "./pages/client/CheckPayment";
import WithdrawRequestsAdmin from "./pages/admin/earnings/Earnings";
import UserWithdrawRequestsAdmin from './pages/admin/earnings/UserWithdrawRequestsAdmin';
import InvoicesAdmin from './pages/admin/earnings/InvoicesAdmin';
import RolesPage from './pages/admin/roles/RolesPage';
import RoleDetailPage from './pages/admin/roles/RoleDetailPage';
import TestRoleUpdate from './pages/admin/roles/TestRoleUpdate';

import BlogPage from "./pages/client/BlogPage";


import ModeratorDashboard from "./pages/Moderator/Dashboard";
import BlogModeration from "./pages/Moderator/Blogs/BlogModeration";
import CommentsModerationPage from "./pages/Moderator/Comments/CommentsModerationPage";
import CoursesModerationPage from "./pages/Moderator/Courses/CoursesModerationPage";
import SimpleReportStatistics from "./pages/Moderator/SimpleReportStatistics";
import Reports from "./pages/Moderator/reports/Reports";

import UserSearchResultsPage from './pages/client/UserSearchResultsPage';
import CourseSearchResultsPage from './pages/client/CourseSearchResultsPage';

import LessonEdit from './pages/instructor/lessons/LessonEdit';
import VideoManager from './pages/instructor/videos/VideoManager';
import QuizManager from './pages/instructor/quiz/QuizManager';
import InstructorVouchersPage from './pages/instructor/vouchers/InstructorVouchersPage';
import WalletPage from "./pages/client/WalletPage";
import WalletPaymentResultPage from "./pages/client/WalletPaymentResultPage";
import MessagesPage from './pages/client/MessagesPage';
import MessagesLayout from './pages/client/MessagesLayout';
import CertificatePage from "./pages/client/CertificatePage";
import Certificates from "./pages/client/Profile/Certificates";
import SocialAuthCallback from './pages/client/auth/SocialAuthCallback';
import InstructorDashboard from './pages/instructor/Dashboard/InstructorDashboard';

const queryClient = new QueryClient();

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Đã xảy ra lỗi!</h1>
          <p>Vui lòng tải lại trang hoặc liên hệ hỗ trợ.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const routes = [
    {
      path: "/",
      element: <ClientLayout />,
      children: [
        { index: true, element: <Homepage /> },
        { path: 'verify-email/:token', element: <VerifyEmail /> },
        { path: 'users/verify-instructor-email/:token', element: <VerifyEmail /> },
        { path: 'instructor/earnings', element: <Earnings /> },
        { path: "blog/write", element: <BlogWritePage /> },
        { path: "blog/mine", element: <MyBlogPosts  /> },
        { path: "blog/saved", element: <SavedBlogPosts  /> },
        { path: "/featured-posts", element: <FeaturedPostsPage   /> },
        { path: "vouchers", element: <VouchersPage /> },
        { path: "courses", element: <CoursesPage /> },
        { path: "courses/:slug", element: <CourseDetailPage /> },
        { path: "courses/slug/:slug", element: <CourseDetailPage /> },
        { path: "courses/id/:id", element: <CourseDetailPage /> },
        { path: "instructors", element: <InstructorsPage /> },
        { path: "blog", element: <BlogPage /> },
        {path:  "/blog/:id", element: <BlogPage />},
        { path: "/blog/post/:id", element: <BlogPage /> },
        { path: "cart", element: <CartPage /> },
        { path: "checkout", element: <CheckoutPage /> },
        { path: "orders", element: <OrdersPage /> },
        { path: "/lessons/:lessonId/video", element: <LessonVideoPage /> },
        { path: "/lessons/:lessonId/quiz", element: <LessonQuizPage /> },
        { path: "report", element: <UserReportRoute /> },
        { path: "users/:slug", element: <UserProfile /> },
        { path: "payment-result", element: <CheckPayment/> },
        { path: "orders", element: <OrdersPage /> },
        { path: "search/users", element: <UserSearchResultsPage /> },
        { path: "search/courses", element: <CourseSearchResultsPage /> },
        { path: "wallet", element: <WalletPage /> },
        { path: "wallet/payment-result", element: <WalletPaymentResultPage /> },
        { path: "certificates/:courseId", element: <CertificatePage /> },

        { path: '/social-callback', element: <SocialAuthCallback /> },
      ]
    },
    {
      path: "/profile",
      element: <ProfileLayout />,
      children: [
        { path: "", element: <Profile /> },
        { path: 'edit', element: <ProfileEdit /> },
        { path: 'change-password', element: <ChangePassword /> },
        { path: 'orders', element: <OrdersPage /> },
        { path: 'certificates', element: <Certificates /> },
      ]
    },
    {
      path: "/messages",
      element: <MessagesLayout />,
      children: [
        { path: ":userId", element: <MessagesPage /> }
      ]
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "", element: <Dashboard /> },
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
        { path: "vouchers", element: <VoucherPage />},
        { path: "statistics", element: <AdminStatistics /> },
        { path: "courses", element: <CourseList />},
        { path: "courses/:id", element: <AdminCourseDetail />},
        { path: "transactions", element: <TransactionHistory /> },
        { path: "earnings", element: <WithdrawRequestsAdmin />},
        { path: "user-withdraw-requests", element: <UserWithdrawRequestsAdmin /> },
        { path: "invoices", element: <InvoicesAdmin /> },
        { path: "roles", element: <RolesPage /> },
        { path: "roles/:id", element: <RoleDetailPage /> },
        { path: "roles/test", element: <TestRoleUpdate /> },
      ],
    },
    {
      path: "/moderator",
      element: <ModeratorLayout />,
      children: [
        { path: "", element: <ModeratorDashboard /> },
        { path: "reports", element: <Reports /> },
        { path: "blogs", element: <BlogModeration /> },
        { path: "comments", element: <CommentsModerationPage /> },
        { path: "courses", element: <CoursesModerationPage /> },
        { path: "statistics", element: <SimpleReportStatistics /> },
      ],
    },
    {
      path: "/instructor",
      element: <InstructorLayout />,
      children: [
        { index: true, element: <InstructorDashboard /> },
        { path: "courses", element: <MyCourseList /> },
        { path: "courses/create", element: <MyCourseAdd /> },
        { path: "courses/:id", element: <CourseDetail /> },
        { path: "courses/edit/:id", element: <CourseEdit /> },
        { path: "lessons", element: <MyLessonManager /> },
        { path: "lessons/edit/:id", element: <LessonEdit /> },
        { path: "students", element: <MyStudentStats /> },
        { path: "income", element: <MyEarnings /> },
        { path: "videos", element: <VideoManager /> },
        { path: "quiz", element: <QuizManager /> },
        { path: "vouchers", element: <InstructorVouchersPage /> },
      ],
    },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/reset-password/:token', element: <ResetPassword /> },
    { path: '/register/instructor', element: <InstructorRegistrationPage /> },
    { path: '/verify-instructor-email/:token', element: <VerifyInstructorEmail /> }
  ];

  const element = useRoutes(routes);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          {element}
        </CartProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}


export default App;
