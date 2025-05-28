import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../provider/authProvider";


type useLoginParams = {
    resource: string;
}
const useLogin = ({ resource }: useLoginParams) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables) => {
            return login({ resource, variables })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [resource]
            })
        }
    })
}
export default useLogin;