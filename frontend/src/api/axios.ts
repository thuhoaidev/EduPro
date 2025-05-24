
import axios from "axios";

export const config = axios.create({
    baseURL: "http://localhost:5000/api", 
    headers: {
        "Content-Type": "application/json"
    }
});
