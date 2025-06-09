import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { notification, Spin } from 'antd';
import axios from "axios";

const VerifyEmail = () => {
    const { slug, token } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra slug và token từ URL
        if (!token || !slug) {
            notification.error({
                message: 'Không tìm thấy thông tin xác thực',
                placement: "topRight",
            });
            navigate('/login');
            return;
        }

        const verifyEmail = async () => {
            try {
                setLoading(true);
                // Sử dụng axios trực tiếp thay vì config để không cần token
                const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${slug}/${token}`);
                notification.success({
                    message: response.data.message || "Xác thực Email thành công",
                    placement: "topRight",
                });
                // Lưu token mới vào localStorage
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                // Chuyển hướng đến trang chủ sau khi xác thực thành công
                navigate('/');
            } catch (error: any) {
                notification.error({
                    message: error.response?.data?.message || 'Lỗi xác thực email',
                    placement: "topRight",
                });
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        verifyEmail();
    }, [token, location, navigate]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" tip="Đang xác thực email..." style={{ fontSize: 64 }} />
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: 40 }}>
            <h2>Xác thực Email</h2>
            <p>Vui lòng đợi trong khi chúng tôi xác thực email của bạn...</p>
        </div>
    );
}

export default VerifyEmail;