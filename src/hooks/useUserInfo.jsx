import { useEffect, useState } from "react";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useUserInfo = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [dbUser, setDbUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const fetchUser = async () => {
        if (!user?.email) {
            setDbUser(null);
            setLoadingUser(false);
            return;
        }

        setLoadingUser(true);
        try {
            const res = await axiosSecure.get(`/users/${user.email}`);
            setDbUser(res.data || null);
        } catch (e) {
            setDbUser(null);
        } finally {
            setLoadingUser(false);
        }
    };

    useEffect(() => {
        if (loading) return;
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.email, loading]);

    // ✅ payment success হলে event fire করলে premium instantly update হবে
    useEffect(() => {
        const handler = () => fetchUser();
        window.addEventListener("premium-updated", handler);
        return () => window.removeEventListener("premium-updated", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.email]);

    const isPremium = dbUser?.isPremium === true;

    return { dbUser, loadingUser, isPremium };
};

export default useUserInfo;
