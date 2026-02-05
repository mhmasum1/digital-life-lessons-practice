import { useEffect, useMemo, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

const StatCard = ({ label, value }) => (
    <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
);

const MiniTable = ({ title, rows }) => (
    <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{title}</h3>
            <span className="text-xs text-gray-500">Top 6</span>
        </div>

        {rows?.length ? (
            <div className="overflow-x-auto">
                <table className="table table-sm">
                    <thead>
                        <tr className="text-xs">
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th className="text-right">Lessons</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={r._id || r.email}>
                                <td>{i + 1}</td>
                                <td className="font-medium">{r.name || "N/A"}</td>
                                <td className="text-xs opacity-70">{r.email || r._id}</td>
                                <td className="text-right font-semibold">
                                    {r.lessonsCount ?? r.totalLessons ?? 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-sm text-gray-500">No data found.</p>
        )}
    </div>
);

const GrowthCard = ({ title, data }) => {
    const chartData = useMemo(
        () => (data || []).map((d) => ({ ...d, short: d.date?.slice(5) })),
        [data]
    );

    return (
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm min-w-0">
            <h3 className="font-semibold mb-3">{title}</h3>

            {!chartData.length ? (
                <p className="text-sm text-gray-500">No chart data.</p>
            ) : (
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="short" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

const AdminHome = () => {
    const axiosSecure = useAxiosSecure();
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState(null);
    const [contributors, setContributors] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);

                const [statsRes, contribRes] = await Promise.all([
                    axiosSecure.get("/admin/stats"),
                    axiosSecure.get("/stats/top-contributors"),
                ]);

                if (cancelled) return;

                setStats(statsRes.data);

                const mapped = (contribRes.data?.contributors || []).map((c) => ({
                    _id: c._id,
                    email: c._id,
                    name: c.name,
                    lessonsCount: c.totalLessons,
                }));
                setContributors(mapped);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load admin dashboard data");
                if (!cancelled) {
                    setStats(null);
                    setContributors([]);
                }
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

    if (!stats) {
        return (
            <div className="p-6">
                <div className="bg-[#FFF7ED] border border-orange-100 rounded-2xl p-6">
                    <p className="text-sm text-gray-700">
                        Failed to load stats. Please try again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                    Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Platform overview & quick stats.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Users" value={stats.totalUsers ?? 0} />
                <StatCard label="Total Lessons" value={stats.totalLessons ?? 0} />
                <StatCard label="Public Lessons" value={stats.publicLessons ?? 0} />
                <StatCard label="Total Reports" value={stats.totalReports ?? 0} />
                <StatCard label="Today’s New Lessons" value={stats.todaysNewLessons ?? 0} />
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                    <MiniTable title="Most Active Contributors" rows={contributors} />
                </div>

                <div className="lg:col-span-2">
                    <GrowthCard
                        title="Lesson Growth (last 30 days)"
                        data={stats.lessonGrowth || []}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
