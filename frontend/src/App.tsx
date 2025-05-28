import { Route, Routes } from "react-router-dom";
import SigninPage from "./pages/auth/login";
import SignupPage from "./pages/auth/register";

function App() {
  return (
    <>

<<<<<<< Updated upstream
      <Routes>
        <Route path="login" element={<SigninPage />} />
        <Route path="register" element={<SignupPage />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </>
  );
=======
        { path: 'instructor/earnings', element: <Earnings /> },

      ],
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
    }

  ];

  const element = useRoutes(routes);

  return <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>;
>>>>>>> Stashed changes
}

export default App;
