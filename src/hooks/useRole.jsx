import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useRole = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: role = "user", isLoading } = useQuery({
        queryKey: ["role", user?.email],
        enabled: !!user?.email, // 🔑 very important
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/${user.email}`);
            return res.data?.role || "user";
        },
    });

    return { role, roleLoading: isLoading };
};

export default useRole;
