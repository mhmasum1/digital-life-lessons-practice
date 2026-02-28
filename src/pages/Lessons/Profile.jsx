import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useUserInfo from "../../hooks/useUserInfo";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";
import axios from "axios";
import { Link } from "react-router-dom";

const Profile = () => {
    const {
        user,
        updateUserProfile,
        reauthenticateUser,
        changeUserPassword,
    } = useAuth();

    const { dbUser, loadingUser, isPremium } = useUserInfo();
    const axiosSecure = useAxiosSecure();

    const [saving, setSaving] = useState(false);
    const [myPublicLessons, setMyPublicLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(true);

    // form state
    const [name, setName] = useState(user?.displayName || dbUser?.name || "");
    const [photoFile, setPhotoFile] = useState(null);

    // password states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPass, setChangingPass] = useState(false);

    useEffect(() => {
        setName(user?.displayName || dbUser?.name || "");
    }, [user?.displayName, dbUser?.name]);

    // Load user's lessons (protected) then show only PUBLIC lessons in profile
    useEffect(() => {
        if (!user?.email) return;

        let cancelled = false;

        const load = async () => {
            setLoadingLessons(true);
            try {
                const res = await axiosSecure.get(`/lessons/my?email=${user.email}`);
                const list = Array.isArray(res.data) ? res.data : [];
                const publicOnly = list.filter(
                    (l) => l.visibility === "public" && l.isDeleted !== true
                );
                if (!cancelled) setMyPublicLessons(publicOnly);
            } catch (e) {
                if (!cancelled) {
                    console.error(e);
                    toast.error("Failed to load your public lessons");
                    setMyPublicLessons([]);
                }
            } finally {
                if (!cancelled) setLoadingLessons(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [user?.email, axiosSecure]);

    const totalCreated = useMemo(() => myPublicLessons.length, [myPublicLessons]);

    const totalSaved = useMemo(() => {
        return dbUser?.savedCount ?? dbUser?.totalFavorites ?? null;
    }, [dbUser]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user?.email) return;

        const finalName = name.trim();
        if (!finalName) return toast.error("Name is required");

        try {
            setSaving(true);

            let photoURL = user?.photoURL || dbUser?.photoURL || "";

            if (photoFile) {
                const key = import.meta.env.VITE_photo_host_key;
                if (!key) {
                    toast.error("VITE_photo_host_key missing in .env");
                    setSaving(false);
                    return;
                }

                const formData = new FormData();
                formData.append("image", photoFile);

                const uploadURL = `https://api.imgbb.com/1/upload?key=${key}`;
                const uploadRes = await axios.post(uploadURL, formData);
                photoURL = uploadRes?.data?.data?.url || photoURL;
            }

            await updateUserProfile({ displayName: finalName, photoURL });

            await axiosSecure.post("/users", {
                email: user.email,
                displayName: finalName,
                photoURL,
            });

            toast.success("Profile updated!");
            setPhotoFile(null);
        } catch (err) {
            console.error("Profile update error:", err?.response?.data || err?.message);
            toast.error(err?.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    // Password change handler
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!user?.email) return toast.error("No logged in user");
        if (!currentPassword || !newPassword || !confirmPassword) {
            return toast.error("All password fields are required");
        }
        if (newPassword.length < 6) {
            return toast.error("New password must be at least 6 characters");
        }
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match");
        }

        try {
            setChangingPass(true);

            // 1) re-auth required
            await reauthenticateUser(currentPassword);

            // 2) update password
            await changeUserPassword(newPassword);

            toast.success("Password updated successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Password update error:", err);
            toast.error(err?.message || "Failed to update password");
        } finally {
            setChangingPass(false);
        }
    };

    if (loadingUser) return <Spinner />;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-base-content">My Profile</h1>
                    <p className="text-sm text-base-content/70">
                        Manage your profile information
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {isPremium && (
                        <span className="badge badge-warning badge-sm gap-1">
                            <span>⭐</span>
                            <span className="font-semibold">Premium</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Profile card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-5">
                    <div className="flex items-center gap-3">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="avatar"
                                className="w-14 h-14 rounded-full border border-base-300 object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full border border-base-300 flex items-center justify-center font-bold text-base-content">
                                {(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                            </div>
                        )}

                        <div className="leading-tight">
                            <p className="font-semibold text-base-content">
                                {user?.displayName || dbUser?.name || "User"}
                            </p>
                            <p className="text-xs text-base-content/60">{user?.email}</p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-base-300 p-3 bg-base-200">
                            <p className="text-xs text-base-content/60">Public Lessons</p>
                            <p className="text-xl font-bold text-base-content">{totalCreated}</p>
                        </div>
                        <div className="rounded-xl border border-base-300 p-3 bg-base-200">
                            <p className="text-xs text-base-content/60">Saved</p>
                            <p className="text-xl font-bold text-base-content">{totalSaved ?? "-"}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Link to="/dashboard/add-lesson" className="btn btn-sm btn-primary w-full">
                            Add a Lesson
                        </Link>
                    </div>
                </div>

                {/* update form + password section */}
                <div className="lg:col-span-2 bg-base-100 rounded-2xl shadow-sm border border-base-300 p-5">
                    <h2 className="text-lg font-semibold mb-3 text-base-content">
                        Update Profile
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-base-content">
                                Display Name
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-base-content">
                                Photo
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="file-input file-input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
                                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-base-content/60 mt-1">
                                Optional. JPG/PNG recommended.
                            </p>
                        </div>

                        <button disabled={saving} className="btn btn-primary btn-sm">
                            {saving ? "Updating..." : "Save Changes"}
                        </button>
                    </form>

                    {/* Password update option */}
                    <div className="mt-6 border-t border-base-300 pt-5">
                        <h3 className="text-lg font-semibold text-base-content mb-3">
                            Change Password
                        </h3>

                        <form onSubmit={handleChangePassword} className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-base-content">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full mt-1"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Current password"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-base-content">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full mt-1"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New password"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-base-content">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full mt-1"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button disabled={changingPass} className="btn btn-primary btn-sm">
                                {changingPass ? "Updating..." : "Update Password"}
                            </button>

                            <p className="text-xs text-base-content/60">
                                Note: For security, Firebase may require recent login before password change.
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {/* Public lessons */}
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-base-content">
                        My Public Lessons
                    </h2>
                    <Link to="/dashboard/my-lessons" className="text-sm text-primary hover:underline">
                        Manage lessons →
                    </Link>
                </div>

                {loadingLessons ? (
                    <Spinner />
                ) : myPublicLessons.length === 0 ? (
                    <div className="border border-base-300 bg-base-200 rounded-2xl p-6 text-center">
                        <p className="font-medium mb-1 text-base-content">
                            No public lessons yet.
                        </p>
                        <p className="text-sm text-base-content/70 mb-3">
                            Make a lesson public from “My Lessons” or create a new one.
                        </p>
                        <Link to="/dashboard/add-lesson" className="btn btn-sm btn-primary">
                            Create a lesson
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myPublicLessons.map((l) => (
                            <div
                                key={l._id}
                                className="rounded-2xl border border-base-300 bg-base-100 p-4 hover:shadow-sm transition"
                            >
                                <p className="font-semibold line-clamp-2 text-base-content">
                                    {l.title}
                                </p>
                                <p className="text-xs text-base-content/60 mt-1">
                                    {l.category} • {l.emotionalTone} • {l.accessLevel}
                                </p>
                                <p className="text-sm text-base-content/80 mt-2 line-clamp-3">
                                    {l.shortDescription}
                                </p>

                                <div className="mt-3 flex gap-2">
                                    <Link to={`/lessons/${l._id}`} className="btn btn-xs">
                                        Details
                                    </Link>
                                    <Link
                                        to={`/dashboard/update-lesson/${l._id}`}
                                        className="btn btn-xs btn-outline"
                                    >
                                        Update
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;