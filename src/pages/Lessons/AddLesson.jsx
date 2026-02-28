import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useUserInfo from "../../hooks/useUserInfo";
import useAxiosSecure from "../../hooks/useAxiosSecure";

import Lottie from "lottie-react";
import successAnim from "../../assets/lottie/Success.json";

const AddLesson = () => {
    const { user } = useAuth();
    const { dbUser, loadingUser } = useUserInfo();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const isPremiumUser = dbUser?.isPremium === true;

    const [submitting, setSubmitting] = useState(false);

    // form state
    const [accessLevel, setAccessLevel] = useState("free");
    const [visibility, setVisibility] = useState("public");

    // Lottie modal state
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (!isPremiumUser && accessLevel === "premium") {
            setAccessLevel("free");
        }
    }, [isPremiumUser, accessLevel]);

    if (!user?.email) {
        return <Navigate to="/auth/login" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.email) return;

        if (!isPremiumUser && accessLevel === "premium") {
            toast.error("Upgrade to Premium to create Premium lessons");
            return;
        }

        const form = e.target;

        const lessonData = {
            title: form.title.value.trim(),
            shortDescription: form.shortDescription.value.trim(),
            details: form.details.value.trim(),
            category: form.category.value,
            emotionalTone: form.emotionalTone.value,
            accessLevel,
            visibility,

            creatorEmail: user.email,
            creatorName: user.displayName || dbUser?.name || "Anonymous",
            creatorPhotoURL: user.photoURL || dbUser?.photoURL || "",
        };

        try {
            setSubmitting(true);
            const res = await axiosSecure.post("/lessons", lessonData);

            if (res.data?.insertedId) {
                toast.success("Lesson added successfully!");
                form.reset();
                setAccessLevel("free");
                setVisibility("public");

                setShowSuccess(true);

                setTimeout(() => {
                    setShowSuccess(false);
                    navigate("/dashboard/my-lessons", { replace: true });
                }, 1600);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error("Add lesson error:", err);
            toast.error(err?.response?.data?.message || "Failed to save lesson.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingUser) {
        return (
            <div className="text-center py-10">
                <p className="text-sm text-base-content/70">Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 relative">
            {showSuccess && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-base-100 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-base-300 text-center">
                        <div className="mx-auto w-44">
                            <Lottie animationData={successAnim} loop={false} />
                        </div>
                        <p className="mt-2 font-semibold text-base-content">Saved!</p>
                        <p className="text-xs text-base-content/70">Redirecting to My Lessons…</p>
                    </div>
                </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-base-content mb-6">
                Share a Life Lesson
            </h1>
            <p className="text-sm text-base-content/70 mb-6">
                Write a real story, insight or experience that could help other students and learners.
            </p>

            {!isPremiumUser && (
                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <p className="font-semibold text-base-content">Premium lesson is locked</p>
                    <p className="text-sm text-base-content/70 mt-1">
                        Upgrade to Premium to create paid lessons (Premium access level).
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/pricing")}
                        className="btn btn-sm btn-primary mt-3"
                    >
                        View Pricing
                    </button>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5 bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm"
            >
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                        Lesson title <span className="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
                        placeholder="e.g. How I Learned to Handle Failure in University"
                    />
                </div>

                {/* Short Description */}
                <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                        Short description (preview) <span className="text-error">*</span>
                    </label>
                    <textarea
                        name="shortDescription"
                        rows={2}
                        required
                        className="textarea textarea-bordered w-full bg-base-100 text-base-content border-base-300"
                        placeholder="2–3 lines summary that will appear on the card."
                    />
                </div>

                {/* Full Details */}
                <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                        Full story / lesson details
                    </label>
                    <textarea
                        name="details"
                        rows={5}
                        className="textarea textarea-bordered w-full bg-base-100 text-base-content border-base-300"
                        placeholder="Write the full lesson, what happened, what you felt and what you learned."
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-base-content mb-1">
                            Category
                        </label>
                        <select
                            name="category"
                            className="select select-bordered w-full bg-base-100 text-base-content border-base-300"
                            defaultValue="Self-Growth"
                        >
                            <option>Self-Growth</option>
                            <option>Productivity</option>
                            <option>Relationships</option>
                            <option>Mental Health</option>
                            <option>Career</option>
                            <option>Study Skills</option>
                            <option>Money & Finance</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-base-content mb-1">
                            Emotional tone
                        </label>
                        <select
                            name="emotionalTone"
                            className="select select-bordered w-full bg-base-100 text-base-content border-base-300"
                            defaultValue="Reflective"
                        >
                            <option>Reflective</option>
                            <option>Hopeful</option>
                            <option>Motivational</option>
                            <option>Calm</option>
                            <option>Sad</option>
                            <option>Grateful</option>
                            <option>Neutral</option>
                        </select>
                    </div>
                </div>

                {/* Access level */}
                <div>
                    <p className="block text-sm font-medium text-base-content mb-1">Access level</p>

                    <div className="flex flex-wrap gap-5 text-sm text-base-content/80">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                className="radio radio-primary"
                                type="radio"
                                name="accessLevel"
                                value="free"
                                checked={accessLevel === "free"}
                                onChange={() => setAccessLevel("free")}
                            />
                            <span>Free lesson</span>
                        </label>

                        <label
                            className={`inline-flex items-center gap-2 ${!isPremiumUser ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                                }`}
                            title={!isPremiumUser ? "Upgrade to Premium to create Premium lessons" : ""}
                        >
                            <input
                                className="radio radio-primary"
                                type="radio"
                                name="accessLevel"
                                value="premium"
                                checked={accessLevel === "premium"}
                                onChange={() => {
                                    if (!isPremiumUser) {
                                        toast.error("Upgrade to Premium to create Premium lessons");
                                        return;
                                    }
                                    setAccessLevel("premium");
                                }}
                                disabled={!isPremiumUser}
                            />
                            <span>Premium lesson</span>
                            {!isPremiumUser && (
                                <span className="text-[11px] text-base-content/60">(Locked)</span>
                            )}
                        </label>
                    </div>
                </div>

                {/* Visibility */}
                <div>
                    <p className="block text-sm font-medium text-base-content mb-1">Visibility</p>

                    <div className="flex flex-wrap gap-5 text-sm text-base-content/80">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                className="radio radio-primary"
                                type="radio"
                                name="visibility"
                                value="public"
                                checked={visibility === "public"}
                                onChange={() => setVisibility("public")}
                            />
                            <span>Public – show on Browse Public Life Lessons</span>
                        </label>

                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                className="radio radio-primary"
                                type="radio"
                                name="visibility"
                                value="private"
                                checked={visibility === "private"}
                                onChange={() => setVisibility("private")}
                            />
                            <span>Private – only you can see</span>
                        </label>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                    <button type="submit" disabled={submitting} className="btn btn-primary w-full md:w-auto">
                        {submitting ? "Saving..." : "Save Lesson"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddLesson;