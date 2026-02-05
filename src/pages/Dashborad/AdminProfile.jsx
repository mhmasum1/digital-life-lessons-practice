import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";

const AdminProfile = () => {
    const { user, updateUserProfile } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState(user?.displayName || "");
    const [photoFile, setPhotoFile] = useState(null);

    useEffect(() => {
        setName(user?.displayName || "");
    }, [user?.displayName]);

    useEffect(() => {
        // just for a consistent loading UX
        if (user?.email) setLoading(false);
    }, [user?.email]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user?.email) return;

        const finalName = name.trim();
        if (!finalName) return toast.error("Name is required");

        try {
            setSaving(true);

            let photoURL = user?.photoURL || "";

            // upload new photo (optional)
            if (photoFile) {
                const key = import.meta.env.VITE_photo_host_key;
                if (!key) {
                    toast.error("VITE_photo_host_key missing in .env");
                    return;
                }

                const formData = new FormData();
                formData.append("image", photoFile);

                const uploadURL = `https://api.imgbb.com/1/upload?key=${key}`;
                const uploadRes = await axios.post(uploadURL, formData);
                photoURL = uploadRes?.data?.data?.url || photoURL;
            }

            // update firebase profile
            await updateUserProfile({ displayName: finalName, photoURL });

            // update DB user (upsert)
            await axiosSecure.post("/users", {
                email: user.email,
                displayName: finalName,
                photoURL,
            });

            toast.success("Admin profile updated!");
            setPhotoFile(null);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    const avatarLetter = (user?.displayName?.[0] || user?.email?.[0] || "A").toUpperCase();

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Admin Profile</h1>
                    <p className="text-sm text-gray-600">Admin account details & settings</p>
                </div>

                <span className="badge badge-error text-white font-semibold px-3 py-3">
                    Admin
                </span>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left card */}
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                    <div className="flex items-center gap-3">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="admin avatar"
                                className="w-14 h-14 rounded-full border object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full border flex items-center justify-center font-bold">
                                {avatarLetter}
                            </div>
                        )}

                        <div className="leading-tight">
                            <p className="font-semibold">{user?.displayName || "Admin"}</p>
                            <p className="text-xs opacity-70">{user?.email}</p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border p-3">
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="text-lg font-bold">Administrator</p>
                    </div>

                    {/* Optional Summary (placeholder) */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-gray-500">Moderated</p>
                            <p className="text-xl font-bold">-</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-gray-500">Actions</p>
                            <p className="text-xl font-bold">-</p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                        *Optional stats later add করতে চাইলে backend এ admin actions log রাখতে হবে।
                    </p>
                </div>

                {/* Right form */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                    <h2 className="text-lg font-semibold mb-3">Update Admin Profile</h2>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Display Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full mt-1"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Admin name"
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
                            <p className="text-xs text-gray-500 mt-1">Optional. JPG/PNG recommended.</p>
                        </div>

                        <button disabled={saving} className="btn btn-primary btn-sm">
                            {saving ? "Updating..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
