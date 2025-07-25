import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../provider/authProvider";
import { useCart } from '../../contexts/CartContext';

type useLoginParams = {
    resource: string;
};

const useLogin = ({ resource }: useLoginParams) => {
    const queryClient = useQueryClient();
    const { updateCartCount } = useCart();

    return useMutation({
        mutationFn: (variables: any) => {
            // Gửi yêu cầu login và trả về response.data.data (chứa token hoặc user info)
            console.log("🧪 Login variables:", variables);
            return login({ resource, variables });
        },
        onSuccess: async (data: any) => {
            // Lưu token vào localStorage
            if (data?.token) {
                localStorage.setItem('token', data.token);
            }
            if (data?.refreshToken) {
                localStorage.setItem('refresh_token', data.refreshToken);
            }
            
            // Lưu thông tin user nếu có
            if (data?.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                // Lưu role vào localStorage để phân quyền admin
                if (data.user.role && typeof data.user.role === 'object' && data.user.role.name) {
                    localStorage.setItem('role', data.user.role.name);
                } else if (typeof data.user.role === 'string') {
                    localStorage.setItem('role', data.user.role);
                } else if (data.user.role_id && data.user.role_id.name) {
                    localStorage.setItem('role', data.user.role_id.name);
                }
            }

            // Invalidate queries để refresh data
            queryClient.invalidateQueries({
                queryKey: [resource],
            });
            
            // Invalidate user queries
            queryClient.invalidateQueries({
                queryKey: ['user'],
            });
            // Gọi cập nhật giỏ hàng ngay sau khi đăng nhập thành công
            await updateCartCount();
        },
        onError: (error: any) => {
            // Optional: xử lý lỗi nếu cần
            console.error("Login error:", error?.response?.data || error.message);
        },
    });
};

export default useLogin;
