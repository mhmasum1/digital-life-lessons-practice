import axios from "axios";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.init";

const axiosSecureInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

const useAxiosSecure = () => {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                axiosSecureInstance.defaults.headers.common["authorization"] =
                    `Bearer ${token}`;
            } else {
                delete axiosSecureInstance.defaults.headers.common["authorization"];
            }
        });

        return () => unsubscribe();
    }, []);

    return axiosSecureInstance;
};

export default useAxiosSecure;
