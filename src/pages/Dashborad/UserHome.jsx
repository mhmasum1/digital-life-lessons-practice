import { Navigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import useAdmin from "../../hooks/useAdmin";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";

const UserHome = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { isAdmin, adminLoading } = useAdmin();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLessons: 0,
        totalFavorites: 0,
        recentLessons: [],
        last7Days: [],
    });
    const [error, setError] = useState("");

    // ✅ hooks always on top (no conditional hooks)
    useEffect(() => {
        if (!user?.email) return;

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                // ✅ Use your existing endpoints
                const [myLessonsRes, favRes] = await Promise.all([
                    axiosSecure.get(`/lessons/my?email=${user.email}`),
                    axiosSecure.get(`/favorites`),
                ]);

                if (cancelled) return;

                const myLessons = Array.isArray(myLessonsRes.data) ? myLessonsRes.data : [];
                const favorites = Array.isArray(favRes.data?.favorites) ? favRes.data.favorites : [];

                // recent 5 lessons
                const recentLessons = myLessons.slice(0, 5);

                // last 7 days chart (client-side calculate)
                const now = new Date();
                const start = new Date(now);
                start.setDate(now.getDate() - 6);
                start.setHours(0, 0, 0, 0);

                const countsMap = new Map();

                myLessons.forEach((l) => {
                    const dt = l.createdAt ? new Date(l.createdAt) : null;
                    if (!dt || isNaN(dt)) return;
                    if (dt < start) return;

                    const key = dt.toISOString().slice(0, 10);
                    countsMap.set(key, (countsMap.get(key) || 0) + 1);
                });

                const last7Days = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date(start);
                    d.setDate(start.getDate() + i);
                    const key = d.toISOString().slice(0, 10);
                    last7Days.push({ date: key, count: countsMap.get(key) || 0 });
                }

                setStats({
                    totalLessons: myLessons.length,
                    totalFavorites: favorites.length,
                    recentLessons,
                    last7Days,
                });
            } catch (e) {
                if (cancelled) return;
                setError(e?.response?.data?.message || e?.message || "Failed to load dashboard data");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [user?.email, axiosSecure]);

    const maxCount = useMemo(() => {
        const counts = (stats.last7Days || []).map((d) => d.count || 0);
        return Math.max(1, ...counts);
    }, [stats.last7Days]);

    if (adminLoading) return <Spinner />;
    if (isAdmin) return <Navigate to="/dashboard/admin-home" replace />;

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                <h1 className="text-2xl font-semibold mb-1">Welcome to your Dashboard</h1>
                <p className="text-sm text-gray-600">
                    Here you can add lessons, manage your lessons and see your favorites.
                </p>

                {error && (
                    <div className="mt-3 alert alert-error">
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Stats cards (2 cards only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                    <p className="text-sm text-gray-500">Total Lessons</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalLessons}</p>
                    <p className="text-xs text-gray-500 mt-2">Lessons you created</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                    <p className="text-sm text-gray-500">Total Favorites</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalFavorites}</p>
                    <p className="text-xs text-gray-500 mt-2">Lessons you saved</p>
                </div>
            </div>

            {/* Chart + Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Simple chart */}
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                    <h3 className="text-lg font-semibold">Last 7 Days Activity</h3>
                    <p className="text-xs text-gray-500 mb-4">Lessons created per day</p>

                    <div className="space-y-2">
                        {(stats.last7Days || []).map((d) => {
                            const width = Math.round(((d.count || 0) / maxCount) * 100);
                            return (
                                <div key={d.date} className="flex items-center gap-3">
                                    <span className="w-24 text-xs text-gray-600">{d.date}</span>
                                    <div className="flex-1 h-3 bg-gray-100 rounded">
                                        <div className="h-3 bg-orange-400 rounded" style={{ width: `${width}%` }} />
                                    </div>
                                    <span className="w-8 text-right text-xs font-semibold">{d.count || 0}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent lessons */}
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                    <h3 className="text-lg font-semibold">Recent Lessons</h3>
                    <p className="text-xs text-gray-500 mb-4">Your latest lessons</p>

                    <div className="space-y-3">
                        {stats.recentLessons?.map((l) => (
                            <div key={l._id} className="p-3 rounded-lg border border-gray-100 hover:border-orange-200">
                                <p className="font-semibold">{l.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {l.category} • {l.emotionalTone} • {l.accessLevel}
                                </p>
                            </div>
                        ))}

                        {(!stats.recentLessons || stats.recentLessons.length === 0) && (
                            <p className="text-sm text-gray-500">No lessons found yet. Create your first one!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserHome;
