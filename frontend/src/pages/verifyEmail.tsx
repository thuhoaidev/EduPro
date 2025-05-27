import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notification, Spin } from 'antd';
// import axios from 'axios';
import { config } from "../api/axios";
const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                setLoading(true);
                const response = await config.get(`/auth/verify-email/${token}`);
                notification.success({
                    message: response.data.message || "Xác thực Email thành công",
                    // description: "Mật khẩu đã được đặt lại. Bạn sẽ được chuyển hướng.",
                    placement: "topRight",
                });
                // alert(response.data.message); // "Xác thực email thành công"
                navigate('/login');
            } catch (error: any) {
                notification.error({
                    message: error.response?.data?.message || 'Lỗi xác thực email',
                    // description: "Lỗi xác thực Email",
                    placement: "topRight",
                });
                // alert(error.response?.data?.message || 'Lỗi xác thực email');
            }
            // finally {
            //     setLoading(false);
            // }
        };
        verifyEmail();
    }, [token, navigate]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" tip="Đang xác thực email..." style={{ fontSize: 64 }} />
            </div>
        );
    }
}

export default VerifyEmail;