import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
                alert(response.data.message); // "Xác thực email thành công"
                navigate('/login');
            } catch (error) {
                alert(error.response?.data?.message || 'Lỗi xác thực email');
            }
        };
        verifyEmail();
    }, [token, navigate]);

    return <div>Đang xác thực email...</div>;
};

export default VerifyEmail;