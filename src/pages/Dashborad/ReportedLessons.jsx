import { useEffect, useState } from "react";
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

    const load = async () => {
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
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [axiosSecure]);

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
            confirmButtonColor: "#6b7280",
        });

        if (!result.isConfirmed) return;

        try {
            setActionLoading(lessonId);
            await axiosSecure.delete(`/admin/reported-lessons/${lessonId}`);
            setRows(prev => prev.filter(r => r.lessonId !== lessonId));
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
            confirmButtonColor: "#ef4444",
        });

        if (!result.isConfirmed) return;

        try {
            setActionLoading(lessonId);
            await axiosSecure.delete(`/lessons/${lessonId}`);
            await axiosSecure.delete(`/admin/reported-lessons/${lessonId}`);
            setRows(prev => prev.filter(r => r.lessonId !== lessonId));
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
        <div className="p-6 space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Reported / Flagged Lessons</h2>
                <p className="text-sm text-gray-600">Review reports, see reasons, take action.</p>
            </div>

            {rows.length === 0 ? (
                <p className="text-gray-500">No reported lessons 🎉</p>
            ) : (
                <div className="overflow-x-auto bg-white border rounded-xl">
                    <table className="table w-full">
                        <thead className="bg-orange-50 text-sm">
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
                                            <p className="font-semibold">{r.lessonTitle || "Untitled Lesson"}</p>
                                            <p className="text-xs opacity-60">Lesson ID: {r.lessonId}</p>
                                        </td>
                                        <td>{r.category || "—"}</td>
                                        <td className="capitalize">{r.lessonVisibility || "—"}</td>
                                        <td className="text-center font-bold">{r.reportCount || 0}</td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <button
                                                    onClick={() => openReasons(r)}
                                                    className="btn btn-xs bg-gray-900 text-white"
                                                >
                                                    View Reasons
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => deleteLessonAndReports(r.lessonId)}
                                                    className="btn btn-xs bg-red-500 text-white"
                                                >
                                                    {busy ? "..." : "Delete Lesson"}
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() => ignoreLessonReports(r.lessonId)}
                                                    className="btn btn-xs bg-gray-200"
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
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-xl max-w-2xl w-full border p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                                <h3 className="text-lg font-semibold">Report Reasons</h3>
                                <p className="text-sm text-gray-600">{selected.lessonTitle || "Untitled Lesson"}</p>
                            </div>
                            <button className="btn btn-sm" onClick={closeModal}>Close</button>
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-auto">
                            {(selected.reports || []).map((rep) => (
                                <div key={rep._id} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm">
                                            {rep.reason || "Other"}
                                        </p>
                                        <p className="text-xs opacity-60">
                                            {rep.createdAt ? new Date(rep.createdAt).toLocaleString() : ""}
                                        </p>
                                    </div>

                                    {rep.message ? (
                                        <p className="text-sm mt-1">{rep.message}</p>
                                    ) : null}

                                    <p className="text-xs opacity-70 mt-2">
                                        Reporter: {rep.reporterName || "Unknown"} ({rep.reporterEmail})
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="btn btn-sm bg-red-500 text-white"
                                onClick={() => deleteLessonAndReports(selected.lessonId)}
                            >
                                Delete Lesson
                            </button>
                            <button
                                className="btn btn-sm bg-gray-200"
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
