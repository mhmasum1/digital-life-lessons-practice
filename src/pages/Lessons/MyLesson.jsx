import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUserInfo from "../../hooks/useUserInfo";
import Spinner from "../../components/common/Spinner";

const MyLesson = () => {
    const { user } = useAuth();
    const { dbUser, loadingUser } = useUserInfo(); // premium check
    const axiosSecure = useAxiosSecure();

    const isPremiumUser = dbUser?.isPremium === true;

    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState([]);
    const [rowLoading, setRowLoading] = useState({}); // { [lessonId]: true }

    const setThisRowLoading = (lessonId, value) => {
        setRowLoading((prev) => ({ ...prev, [lessonId]: value }));
    };

    const fetchMyLessons = async () => {
        try {
            setLoading(true);
            const res = await axiosSecure.get(`/lessons/my?email=${user?.email}`);
            setLessons(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load your lessons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.email) return;
        fetchMyLessons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.email]);

    // ---------- Delete ----------
    const handleDelete = async (lessonId) => {
        const ok = window.confirm("Are you sure you want to delete this lesson?");
        if (!ok) return;

        try {
            setThisRowLoading(lessonId, true);
            await axiosSecure.delete(`/lessons/my/${lessonId}`);
            setLessons((prev) => prev.filter((l) => l._id !== lessonId));
            toast.success("Lesson deleted");
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Delete failed");
        } finally {
            setThisRowLoading(lessonId, false);
        }
    };

    // ---------- Update visibility ----------
    const handleVisibilityChange = async (lessonId, nextValue) => {
        const prevLessons = lessons;

        // optimistic
        setLessons((prev) =>
            prev.map((l) => (l._id === lessonId ? { ...l, visibility: nextValue } : l))
        );

        try {
            setThisRowLoading(lessonId, true);
            await axiosSecure.patch(`/lessons/${lessonId}`, { visibility: nextValue });
            toast.success("Visibility updated");
        } catch (err) {
            console.error(err);
            setLessons(prevLessons); // rollback
            toast.error(err?.response?.data?.message || "Failed to update visibility");
        } finally {
            setThisRowLoading(lessonId, false);
        }
    };

    // ---------- Update access level ----------
    const handleAccessChange = async (lessonId, nextValue) => {
        // ✅ Premium gate: free user cannot set premium
        if (!isPremiumUser && nextValue === "premium") {
            toast.error("Upgrade to Premium to create Premium lessons");
            return;
        }

        const prevLessons = lessons;

        // optimistic
        setLessons((prev) =>
            prev.map((l) => (l._id === lessonId ? { ...l, accessLevel: nextValue } : l))
        );

        try {
            setThisRowLoading(lessonId, true);
            await axiosSecure.patch(`/lessons/${lessonId}`, { accessLevel: nextValue });
            toast.success("Access level updated");
        } catch (err) {
            console.error(err);
            setLessons(prevLessons); // rollback
            toast.error(err?.response?.data?.message || "Failed to update access level");
        } finally {
            setThisRowLoading(lessonId, false);
        }
    };

    if (loading || loadingUser) return <Spinner />;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">My Lessons</h1>
                <Link
                    to="/dashboard/add-lesson"
                    className="text-sm font-semibold px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
                >
                    + Add Lesson
                </Link>
            </div>

            {lessons.length === 0 ? (
                <div className="border border-orange-100 bg-[#FFF7ED] rounded-2xl p-8 text-center">
                    <p className="text-gray-800 font-medium mb-2">No lessons yet.</p>
                    <p className="text-sm text-gray-600 mb-4">
                        Create your first life lesson from “Add Lesson”.
                    </p>
                    <Link
                        to="/dashboard/add-lesson"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
                    >
                        Create a lesson →
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto border rounded-xl bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="bg-orange-50 text-gray-700">
                            <tr>
                                <th className="text-left p-3">Title</th>
                                <th className="text-left p-3">Category</th>
                                <th className="text-left p-3">Access</th>
                                <th className="text-left p-3">Visibility</th>
                                <th className="text-left p-3">Saved</th>
                                <th className="text-left p-3">Created</th>
                                <th className="text-right p-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lessons.map((lesson) => {
                                const busy = !!rowLoading[lesson._id];

                                return (
                                    <tr key={lesson._id} className="border-t">
                                        <td className="p-3 font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate max-w-[360px]">{lesson.title}</span>

                                                {lesson.visibility === "private" && (
                                                    <span className="badge badge-ghost badge-sm">Private</span>
                                                )}

                                                {busy && (
                                                    <span className="text-[11px] text-gray-400">saving...</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-3">{lesson.category || "-"}</td>

                                        {/* ✅ Access dropdown (premium option disabled for free users) */}
                                        <td className="p-3">
                                            <select
                                                className="border rounded-md px-2 py-1 text-xs bg-white"
                                                value={lesson.accessLevel || "free"}
                                                disabled={busy}
                                                onChange={(e) => handleAccessChange(lesson._id, e.target.value)}
                                                title={!isPremiumUser ? "Upgrade to Premium to set Premium access" : ""}
                                            >
                                                <option value="free">free</option>
                                                <option value="premium" disabled={!isPremiumUser}>
                                                    premium
                                                </option>
                                            </select>

                                            {!isPremiumUser && (
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    Upgrade to Premium to set Premium access
                                                </p>
                                            )}
                                        </td>

                                        {/* Visibility dropdown */}
                                        <td className="p-3">
                                            <select
                                                className="border rounded-md px-2 py-1 text-xs bg-white"
                                                value={lesson.visibility || "public"}
                                                disabled={busy}
                                                onChange={(e) => handleVisibilityChange(lesson._id, e.target.value)}
                                            >
                                                <option value="public">public</option>
                                                <option value="private">private</option>
                                            </select>
                                        </td>

                                        <td className="p-3">{lesson.savedCount ?? 0}</td>

                                        <td className="p-3">
                                            {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : ""}
                                        </td>

                                        <td className="p-3 text-right space-x-2">
                                            <Link
                                                to={`/lessons/${lesson._id}`}
                                                className="px-3 py-1.5 rounded-full border text-xs font-semibold hover:bg-gray-50"
                                            >
                                                Details
                                            </Link>

                                            <Link
                                                to={`/dashboard/update-lesson/${lesson._id}`}
                                                className="px-3 py-1.5 rounded-full border text-xs font-semibold hover:bg-gray-50"
                                            >
                                                Update
                                            </Link>

                                            <button
                                                disabled={busy}
                                                onClick={() => handleDelete(lesson._id)}
                                                className="px-3 py-1.5 rounded-full border text-xs font-semibold hover:bg-red-50 text-red-600 border-red-200 disabled:opacity-60"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyLesson;
