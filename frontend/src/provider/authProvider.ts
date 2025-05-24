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
        return {
            data: response.data
        }
    },
    login: async ({ resource, variables }: loginType) => {
        const response = await config.post(`/auth/${resource}`, variables);
        return {
            data: response.data
        }
    }
};

export const { register, login } = authProvider;
