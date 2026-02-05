import { useEffect, useMemo, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Badge = ({ children, className = "" }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
        {children}
    </span>
);

const emptyForm = {
    title: "",
    shortDescription: "",
    details: "",
    category: "",
    emotionalTone: "",
    accessLevel: "free",
    visibility: "public",
};

const ManageLessons = () => {
    const axiosSecure = useAxiosSecure();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [stats, setStats] = useState({ total: 0, public: 0, private: 0, flagged: 0 });
    const [lessons, setLessons] = useState([]);

    // filters
    const [visibility, setVisibility] = useState("all"); // all/public/private
    const [flagged, setFlagged] = useState("all"); // all/true/false
    const [category, setCategory] = useState("");

    // edit modal
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState(null); // lesson object
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const categories = useMemo(() => {
        const set = new Set(lessons.map((l) => l.category).filter(Boolean));
        return ["", ...Array.from(set)];
    }, [lessons]);

    const confirmAction = async ({ title, text, confirmText, confirmColor = "#f97316", icon = "warning" }) => {
        const result = await Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: "Cancel",
            confirmButtonColor: confirmColor,
            cancelButtonColor: "#64748b",
            reverseButtons: true,
            focusCancel: true,
        });
        return result.isConfirmed;
    };

    const successToast = (title, text) =>
        Swal.fire({
            icon: "success",
            title,
            text,
            timer: 1400,
            showConfirmButton: false,
        });

    const load = async () => {
        try {
            setLoading(true);
            const res = await axiosSecure.get(
                `/admin/lessons?visibility=${visibility}&flagged=${flagged}&category=${encodeURIComponent(category)}`
            );

            setStats(res.data?.stats || { total: 0, public: 0, private: 0, flagged: 0 });
            setLessons(res.data?.lessons || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load lessons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [axiosSecure, visibility, flagged, category]);

    const toggleVisibility = async (lesson) => {
        const isPublic = lesson.visibility === "public";
        const nextLabel = isPublic ? "Make Private" : "Publish";

        const ok = await confirmAction({
            title: `${nextLabel}?`,
            text: `This will change visibility for "${lesson.title}".`,
            confirmText: nextLabel,
            confirmColor: "#111827",
        });
        if (!ok) return;

        try {
            setActionLoading(lesson._id);
            const res = await axiosSecure.patch(`/admin/lessons/${lesson._id}/toggle-visibility`);
            const next = res.data?.visibility;

            setLessons((prev) =>
                prev.map((l) => (l._id === lesson._id ? { ...l, visibility: next || l.visibility } : l))
            );
            await successToast("Updated!", `Visibility is now ${next || (isPublic ? "private" : "public")}.`);
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "Failed", text: "Failed to update visibility" });
        } finally {
            setActionLoading(null);
        }
    };

    const setFeatured = async (lesson, featured) => {
        const actionLabel = featured ? "Feature" : "Unfeature";
        const ok = await confirmAction({
            title: `${actionLabel} this lesson?`,
            text: `This will ${featured ? "add" : "remove"} "${lesson.title}" from featured list.`,
            confirmText: actionLabel,
            confirmColor: "#f97316",
        });
        if (!ok) return;

        try {
            setActionLoading(lesson._id);
            await axiosSecure.patch(`/admin/lessons/${lesson._id}/featured`, { featured });
            setLessons((prev) => prev.map((l) => (l._id === lesson._id ? { ...l, isFeatured: featured } : l)));
            await successToast("Updated!", featured ? "Marked as featured." : "Removed from featured.");
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "Failed", text: "Failed to update featured" });
        } finally {
            setActionLoading(null);
        }
    };

    const setReviewed = async (lesson, reviewed) => {
        const actionLabel = reviewed ? "Mark Reviewed" : "Unreview";
        const ok = await confirmAction({
            title: `${actionLabel}?`,
            text: `This will ${reviewed ? "mark" : "unmark"} "${lesson.title}" as reviewed.`,
            confirmText: actionLabel,
            confirmColor: "#2563eb",
        });
        if (!ok) return;

        try {
            setActionLoading(lesson._id);
            await axiosSecure.patch(`/admin/lessons/${lesson._id}/reviewed`, { reviewed });
            setLessons((prev) => prev.map((l) => (l._id === lesson._id ? { ...l, isReviewed: reviewed } : l)));
            await successToast("Updated!", reviewed ? "Marked reviewed." : "Unreviewed.");
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "Failed", text: "Failed to update reviewed" });
        } finally {
            setActionLoading(null);
        }
    };

    const deleteLesson = async (lesson) => {
        const ok = await confirmAction({
            title: "Delete this lesson?",
            text: `This will soft delete "${lesson.title}".`,
            confirmText: "Yes, delete",
            confirmColor: "#ef4444",
        });
        if (!ok) return;

        try {
            setActionLoading(lesson._id);
            await axiosSecure.delete(`/lessons/${lesson._id}`); // admin soft delete ✅
            setLessons((prev) => prev.filter((l) => l._id !== lesson._id));
            await successToast("Deleted!", "Lesson removed successfully.");
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "Failed", text: "Failed to delete lesson" });
        } finally {
            setActionLoading(null);
        }
    };

    // ====== EDIT MODAL ======
    const openEdit = (lesson) => {
        setEditing(lesson);
        setForm({
            title: lesson.title || "",
            shortDescription: lesson.shortDescription || "",
            details: lesson.details || "",
            category: lesson.category || "",
            emotionalTone: lesson.emotionalTone || "",
            accessLevel: lesson.accessLevel || "free",
            visibility: lesson.visibility || "public",
        });
        setEditOpen(true);
    };

    const closeEdit = () => {
        if (saving) return;
        setEditOpen(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const updateForm = (key, value) => setForm((p) => ({ ...p, [key]: value }));

    const saveEdit = async (e) => {
        e.preventDefault();
        if (!editing?._id) return;

        const payload = {
            title: form.title.trim(),
            shortDescription: form.shortDescription.trim(),
            details: form.details || "",
            category: form.category || "Self-Growth",
            emotionalTone: form.emotionalTone || "Reflective",
            accessLevel: form.accessLevel,
            visibility: form.visibility,
        };

        if (!payload.title) return toast.error("Title is required");
        if (!payload.shortDescription) return toast.error("Short description is required");

        const ok = await confirmAction({
            title: "Save changes?",
            text: "This will update the lesson details.",
            confirmText: "Save",
            confirmColor: "#16a34a",
            icon: "question",
        });
        if (!ok) return;

        try {
            setSaving(true);
            await axiosSecure.patch(`/lessons/${editing._id}`, payload); // ✅ owner/admin allowed

            setLessons((prev) =>
                prev.map((l) => (l._id === editing._id ? { ...l, ...payload } : l))
            );

            await successToast("Saved!", "Lesson updated successfully.");
            closeEdit();
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Update failed",
                text: err?.response?.data?.message || "Failed to update lesson",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">Manage Lessons</h2>
                    <p className="text-sm text-gray-600">Moderate lessons, feature content, and mark reviewed.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white border rounded-xl p-3">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-3">
                        <p className="text-xs text-gray-500">Public</p>
                        <p className="text-lg font-bold">{stats.public}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-3">
                        <p className="text-xs text-gray-500">Private</p>
                        <p className="text-lg font-bold">{stats.private}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-3">
                        <p className="text-xs text-gray-500">Flagged</p>
                        <p className="text-lg font-bold">{stats.flagged}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium">Visibility</span>
                    <select
                        className="select select-sm select-bordered"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium">Flagged</span>
                    <select
                        className="select select-sm select-bordered"
                        value={flagged}
                        onChange={(e) => setFlagged(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="true">Flagged only</option>
                        <option value="false">Not flagged</option>
                    </select>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium">Category</span>
                    <select
                        className="select select-sm select-bordered"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c || "All"}
                            </option>
                        ))}
                    </select>
                </div>

                <button onClick={load} className="btn btn-sm btn-outline md:ml-auto">
                    Refresh
                </button>
            </div>

            {/* Table */}
            {lessons.length === 0 ? (
                <p className="text-gray-500">No lessons found.</p>
            ) : (
                <div className="overflow-x-auto bg-white border rounded-xl">
                    <table className="table w-full">
                        <thead className="bg-orange-50 text-sm">
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Visibility</th>
                                <th>Featured</th>
                                <th>Reviewed</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lessons.map((lesson) => {
                                const busy = actionLoading === lesson._id || (editOpen && editing?._id === lesson._id && saving);
                                const isPublic = lesson.visibility === "public";

                                return (
                                    <tr key={lesson._id}>
                                        <td>
                                            <p className="font-semibold">{lesson.title}</p>
                                            <p className="text-xs opacity-70">{lesson.creatorEmail}</p>
                                        </td>
                                        <td>{lesson.category || "—"}</td>
                                        <td>
                                            {isPublic ? (
                                                <Badge className="bg-green-100 text-green-800">Public</Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800">Private</Badge>
                                            )}
                                        </td>
                                        <td>
                                            {lesson.isFeatured ? (
                                                <Badge className="bg-orange-100 text-orange-800">Yes</Badge>
                                            ) : (
                                                <span className="text-sm text-gray-500">No</span>
                                            )}
                                        </td>
                                        <td>
                                            {lesson.isReviewed ? (
                                                <Badge className="bg-blue-100 text-blue-800">Reviewed</Badge>
                                            ) : (
                                                <span className="text-sm text-gray-500">—</span>
                                            )}
                                        </td>

                                        <td className="text-right">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <button
                                                    disabled={busy}
                                                    onClick={() => openEdit(lesson)}
                                                    className="btn btn-xs bg-slate-700 text-white"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => toggleVisibility(lesson)}
                                                    className="btn btn-xs bg-gray-900 text-white"
                                                >
                                                    {busy ? "..." : isPublic ? "Make Private" : "Publish"}
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => setFeatured(lesson, !lesson.isFeatured)}
                                                    className="btn btn-xs bg-orange-500 text-white"
                                                >
                                                    {busy ? "..." : lesson.isFeatured ? "Unfeature" : "Feature"}
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => setReviewed(lesson, !lesson.isReviewed)}
                                                    className="btn btn-xs bg-blue-600 text-white"
                                                >
                                                    {busy ? "..." : lesson.isReviewed ? "Unreview" : "Mark Reviewed"}
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => deleteLesson(lesson)}
                                                    className="btn btn-xs bg-red-500 text-white"
                                                >
                                                    {busy ? "..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ===== Edit Modal ===== */}
            {editOpen && editing && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={closeEdit}>
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full border p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Edit Lesson</h3>
                                <p className="text-sm text-gray-600">{editing.creatorEmail}</p>
                            </div>
                            <button className="btn btn-sm" onClick={closeEdit} disabled={saving}>
                                Close
                            </button>
                        </div>

                        <form onSubmit={saveEdit} className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    className="input input-bordered w-full mt-1"
                                    value={form.title}
                                    onChange={(e) => updateForm("title", e.target.value)}
                                    placeholder="Lesson title"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Short Description</label>
                                <textarea
                                    className="textarea textarea-bordered w-full mt-1"
                                    value={form.shortDescription}
                                    onChange={(e) => updateForm("shortDescription", e.target.value)}
                                    placeholder="Short description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Details</label>
                                <textarea
                                    className="textarea textarea-bordered w-full mt-1"
                                    value={form.details}
                                    onChange={(e) => updateForm("details", e.target.value)}
                                    placeholder="Full details (optional)"
                                    rows={5}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <input
                                        className="input input-bordered w-full mt-1"
                                        value={form.category}
                                        onChange={(e) => updateForm("category", e.target.value)}
                                        placeholder="e.g. Productivity"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Emotional Tone</label>
                                    <input
                                        className="input input-bordered w-full mt-1"
                                        value={form.emotionalTone}
                                        onChange={(e) => updateForm("emotionalTone", e.target.value)}
                                        placeholder="e.g. Reflective"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium">Access Level</label>
                                    <select
                                        className="select select-bordered w-full mt-1"
                                        value={form.accessLevel}
                                        onChange={(e) => updateForm("accessLevel", e.target.value)}
                                    >
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Visibility</label>
                                    <select
                                        className="select select-bordered w-full mt-1"
                                        value={form.visibility}
                                        onChange={(e) => updateForm("visibility", e.target.value)}
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" className="btn btn-sm" onClick={closeEdit} disabled={saving}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-sm bg-green-600 text-white" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>

                            <p className="text-xs text-gray-500">
                                *Only lesson owners & admin can edit/delete (enforced by backend).
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLessons;
