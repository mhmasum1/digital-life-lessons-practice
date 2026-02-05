import { useCallback, useEffect, useState } from "react";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useUserInfo = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [dbUser, setDbUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const email = user?.email;

    const fetchUser = useCallback(async () => {
        if (!email) {
            setDbUser(null);
            setLoadingUser(false);
            return;
        }

        setLoadingUser(true);
        try {
            const res = await axiosSecure.get(`/users/${email}`);
            setDbUser(res.data || null);
        } catch (e) {
            setDbUser(null);
        } finally {
            setLoadingUser(false);
        }
    }, [email, axiosSecure]);

    //when email changes
    useEffect(() => {
        if (loading) return;

        let cancelled = false;

        const run = async () => {
            if (!cancelled) await fetchUser();
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [loading, fetchUser]);

    // premium updated event
    useEffect(() => {
        const handler = () => fetchUser();
        window.addEventListener("premium-updated", handler);
        return () => window.removeEventListener("premium-updated", handler);
    }, [fetchUser]);

    return {
        dbUser,
        loadingUser,
        isPremium: dbUser?.isPremium === true,
        refetchUser: fetchUser,
    };
};

export default useUserInfo;
