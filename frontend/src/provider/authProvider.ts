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
        return response.data.data; 
    },
    login: async ({ resource, variables }: loginType) => {
        const response = await config.post(`/auth/${resource}`, variables);
        return response.data.data; 
    }
};

export const { register, login } = authProvider;
