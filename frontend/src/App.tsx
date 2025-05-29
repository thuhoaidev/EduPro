import React from "react";
import { useRoutes } from "react-router-dom";
import axios from "axios";
import "antd/dist/reset.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layouts
import AdminLayout from "./pages/layout/AdminLayout";
import ClientLayout from "./pages/layout/ClientLayout";
import AuthLayout from "./pages/layout/AuthLayout";

// Client Pages
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/client/auth/login";
import RegisterPage from "./pages/client/auth/register";
import ForgotPassword from "./pages/client/auth/forgotPassword";
import ResetPassword from "./pages/client/auth/resetPassword";
import VerifyEmail from "./pages/verifyEmail";
import Earnings from "./pages/client/earnings/Earnings";

// Admin Pages
import UserPage from "./pages/admin/Users/UserPage";
import UserDetail from "./pages/admin/Users/UserDetail";
import InstructorList from "./pages/admin/Instructors/InstructorList";
import InstructorDetail from "./pages/admin/Instructors/InstructorDetail";
import ApproveInstructors from "./pages/admin/Instructors/InstructorApproval";
import ContentApprovalPage from "./pages/admin/content-approval/ContentApproval";
import ReportsPage from "./pages/admin/reports/Reports";
import VouchersPage from "./pages/admin/Vouchers/VouchersPage";
import CouponManagement from "./pages/admin/Vouchers/VouchersPage";
import Notifications from "./pages/admin/Notifications/Notifications";
import TransactionHistory from "./pages/admin/Transaction/TransactionHistory";
import AdminStatistics from "./pages/admin/Statistics/AdminStatistics";
import InstructorApprovalDetail from "./pages/admin/Instructors/InstructorApprovalDetail";

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
        { path: "verify-email/:token", element: <VerifyEmail /> },
        { path: "instructor/earnings", element: <Earnings /> },
      ],
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "users", element: <UserPage /> },
        { path: "users/:id", element: <UserDetail /> },
        { path: "instructors", element: <InstructorList /> },
        { path: "users/instructor/:id", element: <InstructorDetail /> },
        { path: "instructor-approval", element: <ApproveInstructors /> },
        { path: "content-approval", element: <ContentApprovalPage /> },
        { path: "reports", element: <ReportsPage /> },
        { path: "system/vouchers", element: <VouchersPage /> },
        { path: "system/notifications", element: <Notifications /> },
        { path: "statistics", element: <AdminStatistics /> },
        { path: "coupons", element: <CouponManagement /> },
        { path: "history", element: <TransactionHistory /> },
        { path: "users/instructor-approval/:id", element: <InstructorApprovalDetail /> },

      ],
    },
    {
      element: <AuthLayout />,
      children: [
        { path: "/login", element: <LoginPage /> },
        { path: "/register", element: <RegisterPage /> },
        { path: "/forgot-password", element: <ForgotPassword /> },
        { path: "/reset-password/:token", element: <ResetPassword /> },
      ],
    },
  ];

  const element = useRoutes(routes);

  return (
    <QueryClientProvider client={queryClient}>
      {element}
    </QueryClientProvider>
  );
}

export default App;
