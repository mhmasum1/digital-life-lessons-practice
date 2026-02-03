import { useEffect, useState } from "react";
// import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";
import useAxiosSecure from "../../hooks/useAxiosSecure";


const StatCard = ({ label, value }) => {
    return (
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
};

const AdminHome = () => {
    const axiosSecure = useAxiosSecure();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get("/admin/stats");
                if (!cancelled) setStats(res.data);
            } catch (e) {
                console.error("AdminHome stats error:", e);
                if (!cancelled) setStats(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [axiosSecure]);

    if (loading) return <Spinner />;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 mb-6">
                Platform overview & quick stats.
            </p>

            {!stats ? (
                <div className="bg-[#FFF7ED] border border-orange-100 rounded-2xl p-6">
                    <p className="text-sm text-gray-700">
                        Failed to load stats. Please try again.
                    </p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Users" value={stats.totalUsers ?? 0} />
                    <StatCard label="Total Lessons" value={stats.totalLessons ?? 0} />
                    <StatCard label="Public Lessons" value={stats.publicLessons ?? 0} />
                    <StatCard label="Total Reports" value={stats.totalReports ?? 0} />
                </div>
            )}
        </div>
    );
};

export default AdminHome;
