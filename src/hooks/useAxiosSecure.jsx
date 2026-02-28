import axios from "axios";
import { auth } from "../firebase/firebase.init";

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

axiosSecure.interceptors.request.use(
    async (config) => {
        const currentUser = auth.currentUser;

        if (currentUser) {
            const token = await currentUser.getIdToken(true);
            localStorage.setItem("fb-token", token);
            config.headers.authorization = `Bearer ${token}`;
        } else {
            const token = localStorage.getItem("fb-token");
            if (token) config.headers.authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosSecure.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const freshToken = await currentUser.getIdToken(true);
                    localStorage.setItem("fb-token", freshToken);
                    originalRequest.headers.authorization = `Bearer ${freshToken}`;
                    return axiosSecure(originalRequest); // retry
                }
            } catch {
                localStorage.removeItem("fb-token");
                window.location.href = "/auth/login";
            }
        }

        return Promise.reject(error);
    }
);

const useAxiosSecure = () => axiosSecure;
export default useAxiosSecure;