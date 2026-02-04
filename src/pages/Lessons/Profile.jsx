import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useUserInfo from "../../hooks/useUserInfo";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";
import axios from "axios";
import { Link } from "react-router-dom";

const Profile = () => {
    const { user, updateUserProfile } = useAuth();
    const { dbUser, loadingUser, isPremium } = useUserInfo();
    const axiosSecure = useAxiosSecure();

    const [saving, setSaving] = useState(false);
    const [myPublicLessons, setMyPublicLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(true);

    // form state
    const [name, setName] = useState(user?.displayName || dbUser?.name || "");
    const [photoFile, setPhotoFile] = useState(null);

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
                const publicOnly = list.filter((l) => l.visibility === "public" && l.isDeleted !== true);
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

    const totalCreated = useMemo(() => {
        // dbUser থেকে stats না থাকলে fallback: public lessons length
        return myPublicLessons.length;
    }, [myPublicLessons]);

    const totalSaved = useMemo(() => {
        // তোমার stats endpoint ব্যবহার করলে এখানে বসাতে পারো
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

            // ✅ if user selected new photo -> upload to imgbb
            if (photoFile) {
                const key = import.meta.env.VITE_photo_host_key; // your env key name
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

            // ✅ Update Firebase profile
            await updateUserProfile({
                displayName: finalName,
                photoURL,
            });

            // ✅ Update DB user (upsert)
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

    if (loadingUser) return <Spinner />;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">My Profile</h1>
                    <p className="text-sm text-gray-600">Manage your profile information</p>
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
                {/* Left: info */}
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                    <div className="flex items-center gap-3">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="avatar"
                                className="w-14 h-14 rounded-full border object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full border flex items-center justify-center font-bold">
                                {(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                            </div>
                        )}

                        <div className="leading-tight">
                            <p className="font-semibold">{user?.displayName || dbUser?.name || "User"}</p>
                            <p className="text-xs opacity-70">{user?.email}</p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-gray-500">Public Lessons</p>
                            <p className="text-xl font-bold">{totalCreated}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-gray-500">Saved</p>
                            <p className="text-xl font-bold">{totalSaved ?? "-"}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Link to="/dashboard/add-lesson" className="btn btn-sm btn-primary w-full">
                            Add a Lesson
                        </Link>
                    </div>
                </div>

                {/* Right: update form */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                    <h2 className="text-lg font-semibold mb-3">Update Profile</h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Display Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full mt-1"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="file-input file-input-bordered w-full mt-1"
                                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Optional. JPG/PNG recommended.
                            </p>
                        </div>

                        <button disabled={saving} className="btn btn-primary btn-sm">
                            {saving ? "Updating..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Public lessons */}
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">My Public Lessons</h2>
                    <Link to="/dashboard/my-lessons" className="text-sm text-orange-600 hover:underline">
                        Manage lessons →
                    </Link>
                </div>

                {loadingLessons ? (
                    <Spinner />
                ) : myPublicLessons.length === 0 ? (
                    <div className="border border-orange-100 bg-[#FFF7ED] rounded-xl p-6 text-center">
                        <p className="font-medium mb-1">No public lessons yet.</p>
                        <p className="text-sm text-gray-600 mb-3">
                            Make a lesson public from “My Lessons” or create a new one.
                        </p>
                        <Link to="/dashboard/add-lesson" className="btn btn-sm btn-primary">
                            Create a lesson
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myPublicLessons.map((l) => (
                            <div key={l._id} className="rounded-xl border p-4 hover:shadow-sm transition">
                                <p className="font-semibold line-clamp-2">{l.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {l.category} • {l.emotionalTone} • {l.accessLevel}
                                </p>
                                <p className="text-sm text-gray-700 mt-2 line-clamp-3">{l.shortDescription}</p>

                                <div className="mt-3 flex gap-2">
                                    <Link to={`/lessons/${l._id}`} className="btn btn-xs">
                                        Details
                                    </Link>
                                    <Link to={`/dashboard/update-lesson/${l._id}`} className="btn btn-xs btn-outline">
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
