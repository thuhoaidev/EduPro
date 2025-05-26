import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

const userService = {
  getProfile: () => api.get("/users/profile").then(res => res.data),

  updateProfile: (formData: FormData) =>
    api.put("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const res = await api.patch("/auth/change-password", data);
      return res.data;
    } catch (err: any) {
      throw err.response?.data?.message || "Đổi mật khẩu thất bại";
    }
  },
};

export default userService;
