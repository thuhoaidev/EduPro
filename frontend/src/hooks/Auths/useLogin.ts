import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../provider/authProvider";

type useLoginParams = {
    resource: string;
};

const useLogin = ({ resource }: useLoginParams) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: any) => {
            // Gửi yêu cầu login và trả về response.data.data (chứa token hoặc user info)
            return login({ resource, variables });
        },
        onSuccess: (data: any) => {

            queryClient.invalidateQueries({
                queryKey: [resource],
            });
        },
        onError: (error: any) => {
            // Optional: xử lý lỗi nếu cần
            console.error("Login error:", error?.response?.data || error.message);
        },
    });
};

export default useLogin;
