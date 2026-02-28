import { useCallback, useEffect, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ReportedLessons = () => {
    const axiosSecure = useAxiosSecure();

    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const [actionLoading, setActionLoading] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosSecure.get("/admin/reported-lessons");
            setRows(res.data || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load reported lessons");
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        load();
    }, [load]);

    const openReasons = (row) => {
        setSelected(row);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelected(null);
    };

    const ignoreLessonReports = async (lessonId) => {
        const result = await Swal.fire({
            title: "Ignore all reports?",
            text: "This will keep the lesson but remove all reports.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, ignore",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
            setActionLoading(lessonId);
            await axiosSecure.delete(`/admin/reported-lessons/${lessonId}`);
            setRows((prev) => prev.filter((r) => r.lessonId !== lessonId));
            toast.success("Reports ignored");
            closeModal();
        } catch (e) {
            console.error(e);
            toast.error("Failed to ignore reports");
        } finally {
            setActionLoading(null);
        }
    };

    const deleteLessonAndReports = async (lessonId) => {
        const result = await Swal.fire({
            title: "Delete this lesson?",
            text: "This will delete the lesson and remove all reports. This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
            setActionLoading(lessonId);
            await axiosSecure.delete(`/lessons/${lessonId}`);
            await axiosSecure.delete(`/admin/reported-lessons/${lessonId}`);
            setRows((prev) => prev.filter((r) => r.lessonId !== lessonId));
            toast.success("Lesson deleted");
            closeModal();
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete lesson");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-base-content">
                    Reported / Flagged Lessons
                </h2>
                <p className="text-sm text-base-content/70">
                    Review reports, see reasons, take action.
                </p>
            </div>

            {rows.length === 0 ? (
                <p className="text-base-content/60">No reported lessons 🎉</p>
            ) : (
                <div className="overflow-x-auto bg-base-100 border border-base-300 rounded-2xl">
                    <table className="table w-full">
                        <thead className="bg-base-200 text-sm text-base-content/80">
                            <tr>
                                <th>Lesson</th>
                                <th>Category</th>
                                <th>Visibility</th>
                                <th className="text-center">Reports</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((r) => {
                                const busy = actionLoading === r.lessonId;

                                return (
                                    <tr key={r.lessonId}>
                                        <td>
                                            <p className="font-semibold text-base-content">
                                                {r.lessonTitle || "Untitled Lesson"}
                                            </p>
                                            <p className="text-xs text-base-content/60">
                                                Lesson ID: {r.lessonId}
                                            </p>
                                        </td>

                                        <td className="text-base-content">{r.category || "—"}</td>

                                        <td className="capitalize text-base-content">
                                            {r.lessonVisibility || "—"}
                                        </td>

                                        <td className="text-center font-bold text-base-content">
                                            {r.reportCount || 0}
                                        </td>

                                        <td className="text-right">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <button
                                                    onClick={() => openReasons(r)}
                                                    className="btn btn-xs btn-outline"
                                                >
                                                    View Reasons
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => deleteLessonAndReports(r.lessonId)}
                                                    className="btn btn-xs btn-error"
                                                >
                                                    {busy ? "..." : "Delete Lesson"}
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => ignoreLessonReports(r.lessonId)}
                                                    className="btn btn-xs btn-ghost"
                                                >
                                                    {busy ? "..." : "Ignore"}
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

            {/* Modal */}
            {modalOpen && selected && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-base-100 text-base-content rounded-2xl max-w-2xl w-full border border-base-300 p-5 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                                <h3 className="text-lg font-semibold">Report Reasons</h3>
                                <p className="text-sm text-base-content/70">
                                    {selected.lessonTitle || "Untitled Lesson"}
                                </p>
                            </div>
                            <button className="btn btn-sm btn-ghost" onClick={closeModal}>
                                Close
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-auto">
                            {(selected.reports || []).map((rep) => (
                                <div
                                    key={rep._id}
                                    className="border border-base-300 rounded-xl p-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm">
                                            {rep.reason || "Other"}
                                        </p>
                                        <p className="text-xs text-base-content/60">
                                            {rep.createdAt
                                                ? new Date(rep.createdAt).toLocaleString()
                                                : ""}
                                        </p>
                                    </div>

                                    {rep.message ? (
                                        <p className="text-sm mt-1 text-base-content">
                                            {rep.message}
                                        </p>
                                    ) : null}

                                    <p className="text-xs text-base-content/70 mt-2">
                                        Reporter: {rep.reporterName || "Unknown"} ({rep.reporterEmail})
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="btn btn-sm btn-error"
                                onClick={() => deleteLessonAndReports(selected.lessonId)}
                            >
                                Delete Lesson
                            </button>
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => ignoreLessonReports(selected.lessonId)}
                            >
                                Ignore Reports
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportedLessons;