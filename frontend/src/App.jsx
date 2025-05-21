import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, selectIsAuthenticated } from './store/slices/authSlice';
import { ROLES } from './constants/roles';
import { Provider } from 'react-redux';
import { store } from './store';

// Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public Pages
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Protected Pages
import Profile from './pages/user/Profile';
import Dashboard from './pages/user/Dashboard';
import MyCourses from './pages/user/MyCourses';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorCourses from './pages/instructor/Courses';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            
            {/* Student routes */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
              <Route path="/user/dashboard" element={<Dashboard />} />
              <Route path="/user/profile" element={<Profile />} />
              <Route path="/user/my-courses" element={<MyCourses />} />
            </Route>

            {/* Instructor routes */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]} />}>
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/instructor/courses" element={<InstructorCourses />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
            </Route>

            {/* Common routes */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App; 