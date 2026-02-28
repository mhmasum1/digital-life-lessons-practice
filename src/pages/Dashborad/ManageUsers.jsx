import { useEffect, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";

const ManageUsers = () => {
    const axiosSecure = useAxiosSecure();
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadUsers = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get("/admin/users");
                if (!cancelled) setUsers(res.data || []);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load users");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadUsers();
        return () => {
            cancelled = true;
        };
    }, [axiosSecure]);

    // SweetAlert confirm (no hardcoded hex)
    const confirmAction = async ({ title, text, confirmText }) => {
        const result = await Swal.fire({
            title,
            text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true,
        });
        return result.isConfirmed;
    };

    const updateRole = async (u, role) => {
        const isSelf = u.email === currentUser?.email;

        if (role === "user" && isSelf) {
            return Swal.fire({
                icon: "error",
                title: "Not allowed",
                text: "You cannot demote yourself.",
            });
        }

        const actionLabel = role === "admin" ? "Promote to Admin" : "Demote to User";

        const ok = await confirmAction({
            title: `${actionLabel}?`,
            text: `This will update role for ${u.email}.`,
            confirmText: actionLabel,
        });

        if (!ok) return;

        try {
            setActionLoading(u._id);
            await axiosSecure.patch(`/admin/users/${u._id}/role`, { role });

            setUsers((prev) =>
                prev.map((x) => (x._id === u._id ? { ...x, role } : x))
            );

            await Swal.fire({
                icon: "success",
                title: "Updated!",
                text: `Role updated to ${role}.`,
                timer: 1400,
                showConfirmButton: false,
            });
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: e?.response?.data?.message || "Role update failed",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const deleteUser = async (u) => {
        const isSelf = u.email === currentUser?.email;

        if (isSelf) {
            return Swal.fire({
                icon: "error",
                title: "Not allowed",
                text: "You cannot delete yourself.",
            });
        }

        const ok = await confirmAction({
            title: "Remove this user?",
            text: `This will permanently delete ${u.email}.`,
            confirmText: "Yes, remove",
        });

        if (!ok) return;

        try {
            setActionLoading(u.email);
            await axiosSecure.delete(`/users/${u.email}`);
            setUsers((prev) => prev.filter((x) => x.email !== u.email));

            await Swal.fire({
                icon: "success",
                title: "Removed!",
                text: "User account deleted.",
                timer: 1400,
                showConfirmButton: false,
            });
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: e?.response?.data?.message || "Delete failed",
            });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-xl font-semibold text-base-content mb-4">
                Manage Users
            </h2>

            {users.length === 0 ? (
                <p className="text-base-content/60">No users found.</p>
            ) : (
                <div className="overflow-x-auto bg-base-100 rounded-2xl border border-base-300">
                    <table className="table w-full">
                        <thead className="bg-base-200 text-sm text-base-content/80">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Total Lessons</th>
                                <th>Role</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((u, idx) => {
                                const busy =
                                    actionLoading === u._id ||
                                    actionLoading === u.email;

                                const isSelf =
                                    u.email === currentUser?.email;

                                return (
                                    <tr key={u._id}>
                                        <td>{idx + 1}</td>

                                        <td className="text-base-content">
                                            {u.name || "N/A"}
                                        </td>

                                        <td className="text-base-content/70">
                                            {u.email}
                                        </td>

                                        <td className="font-semibold text-base-content">
                                            {u.lessonsCount ?? 0}
                                        </td>

                                        <td className="capitalize font-medium text-base-content">
                                            {u.role}
                                        </td>

                                        <td className="flex gap-2 justify-center">
                                            {u.role !== "admin" ? (
                                                <button
                                                    disabled={busy}
                                                    onClick={() =>
                                                        updateRole(u, "admin")
                                                    }
                                                    className="btn btn-xs btn-warning"
                                                >
                                                    {busy ? "..." : "Promote"}
                                                </button>
                                            ) : (
                                                <button
                                                    disabled={busy || isSelf}
                                                    onClick={() =>
                                                        updateRole(u, "user")
                                                    }
                                                    className="btn btn-xs btn-neutral"
                                                    title={
                                                        isSelf
                                                            ? "You cannot demote yourself"
                                                            : "Demote to user"
                                                    }
                                                >
                                                    {busy ? "..." : "Demote"}
                                                </button>
                                            )}

                                            <button
                                                disabled={busy || isSelf}
                                                onClick={() => deleteUser(u)}
                                                className="btn btn-xs btn-error"
                                                title={
                                                    isSelf
                                                        ? "You cannot delete yourself"
                                                        : "Remove user"
                                                }
                                            >
                                                {busy ? "..." : "Remove"}
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

export default ManageUsers;