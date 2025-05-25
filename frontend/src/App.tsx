import { useRoutes } from "react-router-dom";
import axios from "axios";
import "antd/dist/reset.css";
import Homepage from "./pages/Homepage";
import AdminLayout from "./pages/layout/AdminLayout";
import ClientLayout from "./pages/layout/ClientLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import LearningPathTable from "./pages/admin/Category/Categories";
import CourseListPage from "./pages/admin/Course/CourseListPage";
import CourseAddPage from "./pages/admin/Course/CourseAddPage";
import CouponManagement from "./pages/admin/Discount/CouponManagement";
import TransactionHistory from "./pages/admin/Transaction/TransactionHistory";
import StudentList from "./pages/admin/Users/StudentList";
import StudentDetail from "./pages/admin/Users/StudentDetail";
import AdminDetail from "./pages/admin/Users/AdminDetail";
import AdminList from "./pages/admin/Users/AdminList";

axios.defaults.baseURL = "http://localhost:3000";

const queryClient = new QueryClient();

function App() {
  const routes = [
    {
      path: "/",
      element: <ClientLayout />,
      children: [
        { index: true, element: <Homepage /> },
      ],
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "course/Learning-Path", element: < LearningPathTable/> },
        { path: "course/list", element: < CourseListPage/> },
        { path: "course/add", element: < CourseAddPage/> },
        { path: "coupons", element: < CouponManagement/> },
        { path: "history", element: < TransactionHistory/> },
        { path: "users/student", element: < StudentList/> },
        { path: "users/student/:id", element: < StudentDetail/> },
        { path: "users/admin", element: <AdminList /> }, 
        { path: "users/admin/:id", element: <AdminDetail /> }, 
      ],
    },
  ];

  const element = useRoutes(routes);

  return <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>;
}

export default App;
