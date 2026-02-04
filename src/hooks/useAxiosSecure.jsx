import axios from "axios";

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

axiosSecure.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("fb-token");
        if (token) config.headers.authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

axiosSecure.interceptors.response.use(
    (res) => res,
    async (error) => {
        return Promise.reject(error);
    }
);

const useAxiosSecure = () => axiosSecure;
export default useAxiosSecure;
