import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/user.service";
import type {
    UserQueryParams,
    UpdateUserRolePayload,
    UpdateUserStatusPayload,
} from "../../interfaces/Admin.interface";

export const useUsers = (params: UserQueryParams) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getAll(params).then((res) => res.data),
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.updateRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.updateStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};
