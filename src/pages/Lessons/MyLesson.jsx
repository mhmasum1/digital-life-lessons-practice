import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUserInfo from "../../hooks/useUserInfo";
import Spinner from "../../components/common/Spinner";

const MyLesson = () => {
    const { user } = useAuth();
    const { dbUser, loadingUser } = useUserInfo();
    const axiosSecure = useAxiosSecure();

    const isPremiumUser = dbUser?.isPremium === true;

    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState([]);
    const [rowLoading, setRowLoading] = useState({});

    const setThisRowLoading = (lessonId, value) => {
        setRowLoading((prev) => ({ ...prev, [lessonId]: value }));
    };

    const fetchMyLessons = useCallback(async () => {
        if (!user?.email) return;

        try {
            setLoading(true);
            const res = await axiosSecure.get(`/lessons/my?email=${user.email}`);
            setLessons(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load your lessons");
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, user?.email]);

    useEffect(() => {
        fetchMyLessons();
    }, [fetchMyLessons]);

    // Delete
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

    // Update visibility
    const handleVisibilityChange = async (lessonId, nextValue) => {
        const prevLessons = lessons;

        setLessons((prev) =>
            prev.map((l) => (l._id === lessonId ? { ...l, visibility: nextValue } : l))
        );

        try {
            setThisRowLoading(lessonId, true);
            await axiosSecure.patch(`/lessons/${lessonId}`, { visibility: nextValue });
            toast.success("Visibility updated");
        } catch (err) {
            console.error(err);
            setLessons(prevLessons);
            toast.error(err?.response?.data?.message || "Failed to update visibility");
        } finally {
            setThisRowLoading(lessonId, false);
        }
    };

    // Update access
    const handleAccessChange = async (lessonId, nextValue) => {
        if (!isPremiumUser && nextValue === "premium") {
            toast.error("Upgrade to Premium to create Premium lessons");
            return;
        }

        const prevLessons = lessons;

        setLessons((prev) =>
            prev.map((l) => (l._id === lessonId ? { ...l, accessLevel: nextValue } : l))
        );

        try {
            setThisRowLoading(lessonId, true);
            await axiosSecure.patch(`/lessons/${lessonId}`, { accessLevel: nextValue });
            toast.success("Access level updated");
        } catch (err) {
            console.error(err);
            setLessons(prevLessons);
            toast.error(err?.response?.data?.message || "Failed to update access level");
        } finally {
            setThisRowLoading(lessonId, false);
        }
    };

    if (loading || loadingUser) return <Spinner />;

    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-base-content">My Lessons</h1>

                <Link to="/dashboard/add-lesson" className="btn btn-sm btn-primary">
                    + Add Lesson
                </Link>
            </div>

            {lessons.length === 0 ? (
                <div className="border border-base-300 bg-base-200 rounded-2xl p-8 text-center">
                    <p className="text-base-content font-medium mb-2">No lessons yet.</p>
                    <p className="text-sm text-base-content/70 mb-4">
                        Create your first life lesson from “Add Lesson”.
                    </p>
                    <Link to="/dashboard/add-lesson" className="btn btn-primary btn-sm">
                        Create a lesson →
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto border border-base-300 rounded-2xl bg-base-100">
                    <table className="min-w-full text-sm">
                        <thead className="bg-base-200 text-base-content">
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
                                    <tr key={lesson._id} className="border-t border-base-300">
                                        <td className="p-3 font-medium text-base-content">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate max-w-[360px]">{lesson.title}</span>

                                                {lesson.visibility === "private" && (
                                                    <span className="badge badge-ghost badge-sm">Private</span>
                                                )}

                                                {busy && (
                                                    <span className="text-[11px] text-base-content/50">
                                                        saving...
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-3 text-base-content/80">{lesson.category || "-"}</td>

                                        <td className="p-3">
                                            <select
                                                className="select select-bordered select-xs bg-base-100 text-base-content border-base-300"
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
                                                <p className="text-[11px] text-base-content/60 mt-1">
                                                    Upgrade to Premium to set Premium access
                                                </p>
                                            )}
                                        </td>

                                        <td className="p-3">
                                            <select
                                                className="select select-bordered select-xs bg-base-100 text-base-content border-base-300"
                                                value={lesson.visibility || "public"}
                                                disabled={busy}
                                                onChange={(e) => handleVisibilityChange(lesson._id, e.target.value)}
                                            >
                                                <option value="public">public</option>
                                                <option value="private">private</option>
                                            </select>
                                        </td>

                                        <td className="p-3 text-base-content/80">{lesson.savedCount ?? 0}</td>

                                        <td className="p-3 text-base-content/80">
                                            {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : ""}
                                        </td>

                                        <td className="p-3 text-right space-x-2">
                                            <Link to={`/lessons/${lesson._id}`} className="btn btn-xs btn-outline">
                                                Details
                                            </Link>

                                            <Link
                                                to={`/dashboard/update-lesson/${lesson._id}`}
                                                className="btn btn-xs btn-outline"
                                            >
                                                Update
                                            </Link>

                                            <button
                                                disabled={busy}
                                                onClick={() => handleDelete(lesson._id)}
                                                className="btn btn-xs btn-outline btn-error disabled:opacity-60"
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