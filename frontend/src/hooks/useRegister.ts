import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "../provider/authProvider";

type useRegisterParams = {
  resource: string;
};

// ✅ Định nghĩa kiểu dữ liệu cho biến được truyền vào mutate
type RegisterPayload = {
  email: string;
  password: string;
  captchaToken: string;
};

const useRegister = ({ resource }: useRegisterParams) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, RegisterPayload>({
    mutationFn: (variables) => {
      return register({ resource, variables });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [resource],
      });
    },
  });
};

export default useRegister;
