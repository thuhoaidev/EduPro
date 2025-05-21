import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { ROLES } from '../constants/roles';

const Unauthorized = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const getRedirectPath = () => {
    switch (user?.role) {
      case ROLES.ADMIN:
        return '/admin';
      case ROLES.INSTRUCTOR:
        return '/instructor';
      case ROLES.STUDENT:
        return '/user/dashboard';
      default:
        return '/';
    }
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
      extra={
        <Button type="primary" onClick={() => navigate(getRedirectPath())}>
          Quay về trang chủ
        </Button>
      }
    />
  );
};

export default Unauthorized; 