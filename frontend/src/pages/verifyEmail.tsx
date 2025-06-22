import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notification, Spin } from 'antd';
import axios from "axios";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const { slug, token } = useParams(); // ✅ lấy slug và token từ URL path
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug || !token) {
            notification.error({
                message: 'Không tìm thấy thông tin xác thực',
                placement: "topRight",
            });
            navigate('/login');
            return;
        }
        console.log("Slug:", slug);
        console.log("Token:", token);

        const verifyEmail = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${slug}/${token}`);
                notification.success({
                    message: response.data.message || "Xác thực Email thành công",
                    placement: "topRight",
                });
                navigate('/'); // ✅ sẽ redirect sau khi xác thực
            } catch (error: any) {
                console.log("erorr", error)
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
    }, [slug, token, navigate]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" style={{ fontSize: 64 }}>
                    <div style={{ padding: '50px 0' }}>
                        <div>Đang xác thực email...</div>
                    </div>
                </Spin>
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
