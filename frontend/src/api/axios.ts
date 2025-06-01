
import axios from "axios";

export const config = axios.create({
    baseURL: "http://localhost:5000/api", 
    headers: {
        "Content-Type": "application/json"
    }
});
config.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (err) => Promise.reject(err)
);
