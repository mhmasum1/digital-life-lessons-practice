import { useEffect, useState } from "react";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";


const useUserInfo = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [dbUser, setDbUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        if (loading) return;

        if (!user?.email) {
            setDbUser(null);
            setLoadingUser(false);
            return;
        }

        const token = localStorage.getItem("access-token");
        if (!token) {
            setDbUser(null);
            setLoadingUser(false);
            return;
        }

        let cancelled = false;

        const fetchUser = async () => {
            setLoadingUser(true);
            try {
                const res = await axiosSecure.get(`/users/${user.email}`);
                if (!cancelled) setDbUser(res.data || null);
            } catch (error) {
                console.error("useUserInfo error:", error?.response?.data || error?.message);
                if (!cancelled) setDbUser(null);
            } finally {
                if (!cancelled) setLoadingUser(false);
            }
        };

        fetchUser();

        return () => {
            cancelled = true;
        };
    }, [user?.email, loading, axiosSecure]);

    const isPremium = dbUser?.isPremium === true;

    return { dbUser, loadingUser, isPremium };
};

export default useUserInfo;