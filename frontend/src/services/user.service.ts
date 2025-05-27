import axios from "axios";
import type { User, UserQueryParams, UpdateUserRolePayload, UpdateUserStatusPayload } from "../interfaces/Admin.interface";

const API = "http://localhost:3000/users";

export const userService = {
  getAll: (params?: UserQueryParams) =>
    axios.get<User[]>(API, { params }),

  updateRole: ({ userId, role }: UpdateUserRolePayload) =>
    axios.patch(`${API}/${userId}`, { role }),

  updateStatus: ({ userId, status }: UpdateUserStatusPayload) =>
    axios.patch(`${API}/${userId}`, { status }),
};
