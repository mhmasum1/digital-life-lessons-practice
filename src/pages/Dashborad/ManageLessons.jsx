import { useCallback, useEffect, useMemo, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// DaisyUI-ish badge (theme safe)
const Badge = ({ children, variant = "neutral" }) => {
    const cls =
        variant === "success"
            ? "badge badge-success badge-sm"
            : variant === "warning"
                ? "badge badge-warning badge-sm"
                : variant === "info"
                    ? "badge badge-info badge-sm"
                    : variant === "error"
                        ? "badge badge-error badge-sm"
                        : "badge badge-ghost badge-sm";

    return <span className={cls}>{children}</span>;
};

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
    const [visibility, setVisibility] = useState("all");
    const [flagged, setFlagged] = useState("all");
    const [category, setCategory] = useState("");

    // edit modal
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const categories = useMemo(() => {
        const set = new Set(lessons.map((l) => l.category).filter(Boolean));
        return ["", ...Array.from(set)];
    }, [lessons]);

    // SweetAlert2 confirm (theme safe: don't force hex colors)
    const confirmAction = useCallback(async ({ title, text, confirmText, icon = "warning" }) => {
        const result = await Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true,
        });
        return result.isConfirmed;
    }, []);

    const successToast = useCallback(async (title, text) => {
        await Swal.fire({
            icon: "success",
            title,
            text,
            timer: 1400,
            showConfirmButton: false,
        });
    }, []);

    const failToast = useCallback((title, text) => {
        Swal.fire({ icon: "error", title, text });
    }, []);

    const load = useCallback(async () => {
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
    }, [axiosSecure, visibility, flagged, category]);

    useEffect(() => {
        load();
    }, [load]);

    const openEdit = useCallback((lesson) => {
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
    }, []);

    const closeEdit = useCallback(() => {
        if (saving) return;
        setEditOpen(false);
        setEditing(null);
        setForm(emptyForm);
    }, [saving]);

    const updateForm = (key, value) => setForm((p) => ({ ...p, [key]: value }));

    const runAction = useCallback(
        async ({ lesson, confirm, request, onSuccess, successMsg, failMsg }) => {
            const ok = await confirmAction(confirm);
            if (!ok) return;

            try {
                setActionLoading(lesson._id);

                const res = await request();
                await onSuccess?.(res);

                if (successMsg) await successToast(successMsg.title, successMsg.text);
            } catch (e) {
                console.error(e);
                failToast(failMsg?.title || "Failed", failMsg?.text || "Action failed");
            } finally {
                setActionLoading(null);
            }
        },
        [confirmAction, failToast, successToast]
    );

    const toggleVisibility = useCallback(
        async (lesson) => {
            const isPublic = lesson.visibility === "public";
            const nextLabel = isPublic ? "Make Private" : "Publish";

            await runAction({
                lesson,
                confirm: {
                    title: `${nextLabel}?`,
                    text: `This will change visibility for "${lesson.title}".`,
                    confirmText: nextLabel,
                },
                request: () => axiosSecure.patch(`/admin/lessons/${lesson._id}/toggle-visibility`),
                onSuccess: (res) => {
                    const next = res.data?.visibility;
                    setLessons((prev) =>
                        prev.map((l) => (l._id === lesson._id ? { ...l, visibility: next || l.visibility } : l))
                    );
                },
                successMsg: { title: "Updated!", text: "Visibility updated." },
                failMsg: { title: "Failed", text: "Failed to update visibility" },
            });
        },
        [axiosSecure, runAction]
    );

    const setFeatured = useCallback(
        async (lesson, featured) => {
            const actionLabel = featured ? "Feature" : "Unfeature";

            await runAction({
                lesson,
                confirm: {
                    title: `${actionLabel} this lesson?`,
                    text: `This will ${featured ? "add" : "remove"} "${lesson.title}" from featured list.`,
                    confirmText: actionLabel,
                },
                request: () => axiosSecure.patch(`/admin/lessons/${lesson._id}/featured`, { featured }),
                onSuccess: () => {
                    setLessons((prev) => prev.map((l) => (l._id === lesson._id ? { ...l, isFeatured: featured } : l)));
                },
                successMsg: { title: "Updated!", text: featured ? "Marked as featured." : "Removed from featured." },
                failMsg: { title: "Failed", text: "Failed to update featured" },
            });
        },
        [axiosSecure, runAction]
    );

    const setReviewed = useCallback(
        async (lesson, reviewed) => {
            const actionLabel = reviewed ? "Mark Reviewed" : "Unreview";

            await runAction({
                lesson,
                confirm: {
                    title: `${actionLabel}?`,
                    text: `This will ${reviewed ? "mark" : "unmark"} "${lesson.title}" as reviewed.`,
                    confirmText: actionLabel,
                },
                request: () => axiosSecure.patch(`/admin/lessons/${lesson._id}/reviewed`, { reviewed }),
                onSuccess: () => {
                    setLessons((prev) => prev.map((l) => (l._id === lesson._id ? { ...l, isReviewed: reviewed } : l)));
                },
                successMsg: { title: "Updated!", text: reviewed ? "Marked reviewed." : "Unreviewed." },
                failMsg: { title: "Failed", text: "Failed to update reviewed" },
            });
        },
        [axiosSecure, runAction]
    );

    const deleteLesson = useCallback(
        async (lesson) => {
            await runAction({
                lesson,
                confirm: {
                    title: "Delete this lesson?",
                    text: `This will soft delete "${lesson.title}".`,
                    confirmText: "Yes, delete",
                    icon: "warning",
                },
                request: () => axiosSecure.delete(`/lessons/${lesson._id}`),
                onSuccess: () => {
                    setLessons((prev) => prev.filter((l) => l._id !== lesson._id));
                },
                successMsg: { title: "Deleted!", text: "Lesson removed successfully." },
                failMsg: { title: "Failed", text: "Failed to delete lesson" },
            });
        },
        [axiosSecure, runAction]
    );

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
            icon: "question",
        });
        if (!ok) return;

        try {
            setSaving(true);
            await axiosSecure.patch(`/lessons/${editing._id}`, payload);

            setLessons((prev) => prev.map((l) => (l._id === editing._id ? { ...l, ...payload } : l)));
            await successToast("Saved!", "Lesson updated successfully.");
            closeEdit();
        } catch (err) {
            console.error(err);
            failToast("Update failed", err?.response?.data?.message || "Failed to update lesson");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-base-content">Manage Lessons</h2>
                    <p className="text-sm text-base-content/70">
                        Moderate lessons, feature content, and mark reviewed.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-base-100 border border-base-300 rounded-xl p-3">
                        <p className="text-xs text-base-content/60">Total</p>
                        <p className="text-lg font-bold text-base-content">{stats.total}</p>
                    </div>
                    <div className="bg-base-100 border border-base-300 rounded-xl p-3">
                        <p className="text-xs text-base-content/60">Public</p>
                        <p className="text-lg font-bold text-base-content">{stats.public}</p>
                    </div>
                    <div className="bg-base-100 border border-base-300 rounded-xl p-3">
                        <p className="text-xs text-base-content/60">Private</p>
                        <p className="text-lg font-bold text-base-content">{stats.private}</p>
                    </div>
                    <div className="bg-base-100 border border-base-300 rounded-xl p-3">
                        <p className="text-xs text-base-content/60">Flagged</p>
                        <p className="text-lg font-bold text-base-content">{stats.flagged}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium text-base-content">Visibility</span>
                    <select
                        className="select select-sm select-bordered bg-base-100 text-base-content border-base-300"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium text-base-content">Flagged</span>
                    <select
                        className="select select-sm select-bordered bg-base-100 text-base-content border-base-300"
                        value={flagged}
                        onChange={(e) => setFlagged(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="true">Flagged only</option>
                        <option value="false">Not flagged</option>
                    </select>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium text-base-content">Category</span>
                    <select
                        className="select select-sm select-bordered bg-base-100 text-base-content border-base-300"
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
                <p className="text-base-content/60">No lessons found.</p>
            ) : (
                <div className="overflow-x-auto bg-base-100 border border-base-300 rounded-xl">
                    <table className="table w-full">
                        <thead className="bg-base-200 text-sm text-base-content/80">
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
                                const busy =
                                    actionLoading === lesson._id ||
                                    (editOpen && editing?._id === lesson._id && saving);

                                const isPublic = lesson.visibility === "public";

                                return (
                                    <tr key={lesson._id}>
                                        <td>
                                            <p className="font-semibold text-base-content">{lesson.title}</p>
                                            <p className="text-xs text-base-content/60">{lesson.creatorEmail}</p>
                                        </td>

                                        <td className="text-base-content">{lesson.category || "—"}</td>

                                        <td>{isPublic ? <Badge variant="success">Public</Badge> : <Badge>Private</Badge>}</td>

                                        <td>
                                            {lesson.isFeatured ? (
                                                <Badge variant="warning">Yes</Badge>
                                            ) : (
                                                <span className="text-sm text-base-content/60">No</span>
                                            )}
                                        </td>

                                        <td>
                                            {lesson.isReviewed ? (
                                                <Badge variant="info">Reviewed</Badge>
                                            ) : (
                                                <span className="text-sm text-base-content/60">—</span>
                                            )}
                                        </td>

                                        <td className="text-right">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <button
                                                    disabled={busy}
                                                    onClick={() => openEdit(lesson)}
                                                    className="btn btn-xs btn-outline"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => toggleVisibility(lesson)}
                                                    className="btn btn-xs btn-neutral"
                                                >
                                                    {busy ? "..." : isPublic ? "Make Private" : "Publish"}
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => setFeatured(lesson, !lesson.isFeatured)}
                                                    className="btn btn-xs btn-warning"
                                                >
                                                    {busy ? "..." : lesson.isFeatured ? "Unfeature" : "Feature"}
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => setReviewed(lesson, !lesson.isReviewed)}
                                                    className="btn btn-xs btn-info"
                                                >
                                                    {busy ? "..." : lesson.isReviewed ? "Unreview" : "Mark Reviewed"}
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => deleteLesson(lesson)}
                                                    className="btn btn-xs btn-error"
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

            {/* Edit Modal */}
            {editOpen && editing && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                    onClick={closeEdit}
                >
                    <div
                        className="bg-base-100 text-base-content rounded-2xl max-w-2xl w-full border border-base-300 p-5 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Edit Lesson</h3>
                                <p className="text-sm text-base-content/70">{editing.creatorEmail}</p>
                            </div>
                            <button className="btn btn-sm btn-ghost" onClick={closeEdit} disabled={saving}>
                                Close
                            </button>
                        </div>

                        <form onSubmit={saveEdit} className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
                                    value={form.title}
                                    onChange={(e) => updateForm("title", e.target.value)}
                                    placeholder="Lesson title"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Short Description</label>
                                <textarea
                                    className="textarea textarea-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
                                    value={form.shortDescription}
                                    onChange={(e) => updateForm("shortDescription", e.target.value)}
                                    placeholder="Short description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Details</label>
                                <textarea
                                    className="textarea textarea-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
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
                                        className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
                                        value={form.category}
                                        onChange={(e) => updateForm("category", e.target.value)}
                                        placeholder="e.g. Productivity"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Emotional Tone</label>
                                    <input
                                        className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
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
                                        className="select select-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
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
                                        className="select select-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
                                        value={form.visibility}
                                        onChange={(e) => updateForm("visibility", e.target.value)}
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" className="btn btn-sm btn-ghost" onClick={closeEdit} disabled={saving}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-sm btn-success" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLessons;