// MyLesson — Short Plan Note 📝
// কি কি Feature আছে:
// 1. Lessons Fetch         → GET / lessons / my ? email =
//     2. Delete Lesson         → DELETE / lessons / my /: id
// 3. Visibility Update     → PATCH / lessons /:id { visibility }
// 4. Access Level Update   → PATCH / lessons /:id { accessLevel }
// 5. Row Loading State     → প্রতিটা row এর আলাদা busy state
// 6. Optimistic Update     → UI আগে change, API পরে
// 7. Rollback              → API fail হলে আগের state ফিরিয়ে দাও
// 8. Premium Guard         → non - premium user premium select করতে পারবে না

// State যা যা লাগবে:
// lessons      → lessons array
// loading      → page loading
// rowLoading   → { lessonId: true / false } প্রতিটা row এর জন্য

// নতুন করে করলে এই Order এ করো:
// Step 1 → lessons fetch করো + table এ দেখাও
// Step 2 → Delete feature যোগ করো
// Step 3 → Visibility dropdown যোগ করো
// Step 4 → Access Level dropdown যোগ করো
// Step 5 → Row loading(busy) যোগ করো
// Step 6 → Optimistic Update + Rollback যোগ করো
// Step 7 → Premium Guard যোগ করো

// Important Patterns:
// rowLoading   → object — একটা row busy হলে বাকিগুলো normal
// Optimistic   → UI আগে → API পরে → fail হলে rollback
// Soft Delete  → database এ isDeleted: true, UI তে filter


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

    // শুধু একটা specific row কে busy/not-busy করে
    // বাকি rows এ কোনো effect নেই

    // Example:
    // setThisRowLoading("abc123", true)
    // rowLoading = { "abc123": true }
    const setThisRowLoading = (lessonId, value) => {
        setRowLoading((prev) => ({ ...prev, [lessonId]: value }));
    };

    const fetchMyLessons = useCallback(async () => {
        if (!user?.email) return;

        try {
            setLoading(true);

            // GET request — এই user এর lessons আনে
            const res = await axiosSecure.get(`/lessons/my?email=${user.email}`);

            // array হলে set করো, না হলে empty array
            setLessons(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load your lessons");
        } finally {
            setLoading(false);
        }

        // dependency — এগুলো change হলে function নতুন হবে
    }, [axiosSecure, user?.email]);

    useEffect(() => {
        fetchMyLessons();

        // component mount হলে একবার fetch করে
    }, [fetchMyLessons]);

    // Delete
    const handleDelete = async (lessonId) => {
        const ok = window.confirm("Are you sure you want to delete this lesson?");
        if (!ok) return;
        // cancel করলে বন্ধ

        try {
            // ঐ row টা busy করো
            setThisRowLoading(lessonId, true);
            // database থেকে delete
            await axiosSecure.delete(`/lessons/my/${lessonId}`);
            // state থেকেও সরিয়ে দাও — UI update
            setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
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

        // আগের state backup রাখো (error হলে rollback করবো)
        const prevLessons = lessons;

        // Optimistic update — আগেই UI change করো, API পরে

        setLessons((prev) =>
            prev.map((lesson) => (lesson._id === lessonId ? { ...lesson, visibility: nextValue } : lesson))
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

        // premium না হলে block করো
        if (!isPremiumUser && nextValue === "premium") {
            toast.error("Upgrade to Premium to create Premium lessons");
            return;
        }

        const prevLessons = lessons;

        setLessons((prev) =>
            prev.map((lesson) => (lesson._id === lessonId ? { ...lesson, accessLevel: nextValue } : lesson))
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
                                //  ↑ lessons array এর প্রতিটা item এর জন্য
                                //    একটা করে <tr> বানাবে
                                const busy = !!rowLoading[lesson._id];
                                // এই specific lesson টা কি এখন busy?
                                // delete/update হচ্ছে কিনা check করে

                                // <tr key={lesson._id} className="border-t border-base-300"></tr>
                                //↑ প্রতিটা row এর unique id
                                // React এর জন্য দরকার — কোন row কোনটা চেনে
                                //↑ উপরে border line দেখায়

                                // <span className="truncate max-w-[360px]">{lesson.title}</span>
                                //↑ database থেকে আসা title
                                //truncate — বড় title ... দিয়ে কাটে

                                return (
                                    <tr key={lesson._id} className="border-t border-base-300">


                                        {/* Title & private hole title er pase Private show korano */}

                                        <td className="p-3 font-medium text-base-content">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate max-w-[360px]">{lesson.title}</span>

                                                {lesson.visibility === "private" && (
                                                    <span className="badge badge-ghost badge-sm">Private</span>
                                                )}
                                                {/* private → badge দেখাও ✅ */}

                                                {busy && (
                                                    <span className="text-[11px] text-base-content/50">
                                                        saving...
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="p-3 text-base-content/80">{lesson.category || "-"}</td>

                                        {/* Access */}
                                        <td className="p-3">
                                            <select
                                                className="select select-bordered select-xs bg-base-100 text-base-content border-base-300"
                                                value={lesson.accessLevel || "free"}
                                                //     ↑ current value database থেকে
                                                //       null হলে default "free"
                                                disabled={busy}
                                                //  ↑ busy হলে dropdown change করা যাবে না
                                                onChange={(e) => handleAccessChange(lesson._id, e.target.value)}
                                                //  ↑ change হলে → lesson id আর নতুন value পাঠাও handler এ

                                                title={!isPremiumUser ? "Upgrade to Premium to set Premium access" : ""}
                                            //  ↑ hover করলে tooltip দেখায়
                                            >
                                                <option value="free">free</option>
                                                <option value="premium" disabled={!isPremiumUser}>
                                                    premium
                                                </option>
                                                {/* //  ↑ premium option — non-premium user এর জন্য disabled */}
                                            </select>
                                        </td>

                                        {/* Visibility */}
                                        <td className="p-3">
                                            <select
                                                className="select select-bordered select-xs bg-base-100 text-base-content border-base-300"
                                                value={lesson.visibility || "public"}
                                                // ↑ current visibility database থেকে
                                                disabled={busy}
                                                onChange={(e) => handleVisibilityChange(lesson._id, e.target.value)}
                                            //  ↑ change হলে handler call করো
                                            >
                                                <option value="public">public</option>
                                                <option value="private">private</option>
                                            </select>
                                        </td>

                                        <td className="p-3 text-base-content/80">{lesson.savedCount ?? 0}</td>

                                        <td className="p-3 text-base-content/80">
                                            {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : ""}
                                        </td>
                                        {/* //   ↑ createdAt আছে?
                                        //     হ্যাঁ → "3/26/2026" এভাবে দেখাও
                                        //     না  → empty string দেখাও */}

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