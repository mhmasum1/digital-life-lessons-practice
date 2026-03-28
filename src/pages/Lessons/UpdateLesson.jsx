// UpdateLesson — Short Plan Note 📝

// কি কি Feature আছে:
// 1. Lesson Fetch          → GET /lessons/:id → form এ data fill করো
// 2. Lesson Update         → PATCH /lessons/:id {formData}
// 3. Controlled Inputs     → সব input formData state থেকে value নেয়
// 4. handleChange          → একটাই function সব input এর জন্য কাজ করে
// 5. Premium Guard         → non-premium user premium access select করতে পারবে না
// 6. Cancel Button         → navigate(-1) → আগের page এ ফিরে যাও
// 7. Auto Redirect         → update success → /dashboard/my-lessons এ যাও

// State যা যা লাগবে:
// formData  → সব input এর value একসাথে object এ
// loading   → lesson fetch হচ্ছে কিনা
// saving    → form submit হচ্ছে কিনা

// নতুন করে করলে এই Order এ করো:
// Step 1 → URL থেকে id নাও (useParams)
// Step 2 → GET /lessons/:id → formData state fill করো
// Step 3 → Form বানাও controlled inputs দিয়ে
// Step 4 → handleChange যোগ করো — সব input এর জন্য
// Step 5 → handleSubmit → PATCH request → redirect
// Step 6 → Premium Guard → premium option disabled করো
// Step 7 → Cancel button → navigate(-1)


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUserInfo from "../../hooks/useUserInfo";


const UpdateLesson = () => {
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const { dbUser } = useUserInfo();

    const isPremiumUser = dbUser?.isPremium === true;

    const [formData, setFormData] = useState({
        title: "",
        shortDescription: "",
        details: "",
        category: "Self-Growth",
        emotionalTone: "Reflective",
        accessLevel: "free",
        visibility: "public",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        axiosSecure
            .get(`/lessons/${id}`)
            .then((res) => {
                const lesson = res.data || {};
                setFormData({
                    title: lesson.title || "",
                    shortDescription: lesson.shortDescription || "",
                    details: lesson.details || "",
                    category: lesson.category || "Self-Growth",
                    emotionalTone: lesson.emotionalTone || "Reflective",
                    accessLevel: lesson.accessLevel || "free",
                    visibility: lesson.visibility || "public",
                });
            })
            .catch((err) => {
                console.error("Load lesson for update error:", err);
            })
            .finally(() => setLoading(false));
    }, [axiosSecure, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axiosSecure.patch(`/lessons/${id}`, formData);
            navigate("/dashboard/my-lessons");
        } catch (err) {
            console.error("Update lesson error:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto">
                <p className="text-sm text-base-content/70">Loading lesson...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-base-content mb-4">
                Update Life Lesson
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300"
            >
                <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                        Lesson title <span className="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="input input-bordered w-full text-sm bg-base-100 text-base-content border-base-300"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                        Short description (preview) <span className="text-error">*</span>
                    </label>
                    <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="textarea textarea-bordered w-full text-sm bg-base-100 text-base-content border-base-300"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                        Full story / lesson details
                    </label>
                    <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        rows={6}
                        className="textarea textarea-bordered w-full text-sm bg-base-100 text-base-content border-base-300"
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-base-content mb-1">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="select select-bordered w-full text-sm bg-base-100 text-base-content border-base-300"
                        >
                            <option>Self-Growth</option>
                            <option>Productivity</option>
                            <option>Digital Wellbeing</option>
                            <option>Mental Health</option>
                            <option>Relationships</option>
                            <option>Career & Study</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-base-content mb-1">
                            Emotional tone
                        </label>
                        <select
                            name="emotionalTone"
                            value={formData.emotionalTone}
                            onChange={handleChange}
                            className="select select-bordered w-full text-sm bg-base-100 text-base-content border-base-300"
                        >
                            <option>Reflective</option>
                            <option>Hopeful</option>
                            <option>Motivational</option>
                            <option>Calm</option>
                            <option>Vulnerable</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-base-content mb-1">
                            Access level
                        </label>
                        <select
                            name="accessLevel"
                            value={formData.accessLevel}
                            onChange={handleChange}
                            className="select select-bordered w-full text-sm bg-base-100 text-base-content border-base-300"
                        >
                            <option value="free">Free</option>
                            <option value="premium" disabled={!isPremiumUser}>Premium</option>
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-base-content mb-1">
                            Visibility
                        </label>
                        <select
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleChange}
                            className="select select-bordered w-full text-sm bg-base-100 text-base-content border-base-300"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-ghost btn-sm"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary btn-sm"
                    >
                        {saving ? "Updating..." : "Update Lesson"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateLesson;