import { useEffect, useState } from "react";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useAdmin = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [isAdmin, setIsAdmin] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!user?.email) {
            setIsAdmin(false);
            setAdminLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            try {
                setAdminLoading(true);
                const res = await axiosSecure.get(`/users/admin/${user.email}`);
                if (!cancelled) setIsAdmin(Boolean(res?.data?.admin));
            } catch {
                if (!cancelled) setIsAdmin(false);
            } finally {
                if (!cancelled) setAdminLoading(false);
            }
        };

        load();
        return () => (cancelled = true);
    }, [user?.email, loading, axiosSecure]);

    return { isAdmin, adminLoading };
};

export default useAdmin;
