import axios from "axios";
import { auth } from "../firebase/firebase.init";

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

axiosSecure.interceptors.request.use(
    async (config) => {
        const currentUser = auth.currentUser;

        if (currentUser) {
            const token = await currentUser.getIdToken();
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


// token expire হল ❌
// API call করলেন → server 401 দিল
// → interceptor ধরল → নতুন token নিল → আবার try করল ✅
// → user কিছুই বুঝল না, কাজ হয়ে গেল
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
                    return axiosSecure(originalRequest);
                }
            } catch {
                localStorage.removeItem("fb-token");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

const useAxiosSecure = () => axiosSecure;
export default useAxiosSecure;