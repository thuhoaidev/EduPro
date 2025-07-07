import { config } from "../api/axios";
type registerType = {
    resource: string;
    variables: any;
}
type loginType = {
    resource: string;
    variables: any;
}
const authProvider = {

    register: async ({ resource, variables }: registerType) => {
        const response = await config.post(`/auth/${resource}`, variables);
        // Trả về dữ liệu gốc từ API
        return response.data;
    },
    login: async ({ resource, variables }: loginType) => {
        console.log("🚀 Sending login request:", variables);
        const response = await config.post(`/auth/${resource}`, variables);
        return response.data.data; 
    }
};

export const { register, login } = authProvider;
