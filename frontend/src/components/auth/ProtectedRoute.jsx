import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { ROLES } from '../../constants/roles';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu về role và user không có quyền truy cập
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Nếu là admin, chuyển đến trang admin
    if (user?.role === ROLES.ADMIN) {
      return <Navigate to="/admin" replace />;
    }
    // Nếu là giảng viên, chuyển đến trang giảng viên
    if (user?.role === ROLES.INSTRUCTOR) {
      return <Navigate to="/instructor" replace />;
    }
    // Nếu là học viên, chuyển đến trang học viên
    if (user?.role === ROLES.STUDENT) {
      return <Navigate to="/user/dashboard" replace />;
    }
    // Mặc định chuyển đến trang unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute; 