import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";

const LessonCard = ({ lesson, isPremiumUser }) => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    const isPremiumLesson = lesson?.accessLevel === "premium";
    const isLocked = isPremiumLesson && !isPremiumUser;

    const handleSave = async () => {
        if (!user) {
            toast.error("Please login to save lessons");
            return;
        }

        try {
            await axiosSecure.post("/favorites", { lessonId: lesson._id });
            toast.success("Saved to favorites");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save lesson");
        }
    };

    return (
        <div
            className={`relative rounded-2xl border border-orange-100 bg-[#FFF7ED] p-5 shadow-sm flex flex-col justify-between ${isLocked ? "overflow-hidden" : ""
                }`}
        >
            {/*  blur overlay for locked premium */}
            {isLocked && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center text-center px-4">
                    <p className="text-sm font-semibold text-amber-800 mb-1">
                        🔒 Premium Lesson
                    </p>
                    <p className="text-xs text-amber-700 mb-3">
                        Upgrade to Premium to read the full story and other premium lessons.
                    </p>
                    <Link
                        to="/pricing"
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition"
                    >
                        Go to Pricing →
                    </Link>
                </div>
            )}

            {/* Card content */}
            <div className={isLocked ? "opacity-40 pointer-events-none" : ""}>

                <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                            {lesson?.title}
                        </h2>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                            #{lesson?.category || "LifeLesson"}
                        </p>
                    </div>

                    <span
                        className={`px-2 py-0.5 rounded-full text-[11px] border ${isPremiumLesson
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                    >
                        {isPremiumLesson ? "Premium" : "Free"}
                    </span>
                </div>

                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {lesson?.shortDescription}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-2">
                        {lesson?.creatorPhotoURL ? (
                            <img
                                src={lesson.creatorPhotoURL}
                                alt={lesson.creatorName}
                                className="h-7 w-7 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-7 w-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-semibold">
                                {(lesson?.creatorName?.[0] || "U").toUpperCase()}
                            </div>
                        )}
                        <span>{lesson?.creatorName || "Anonymous"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span>{lesson?.emotionalTone || "Neutral"}</span>
                        <span>•</span>
                        <span>
                            {lesson?.createdAt
                                ? new Date(lesson.createdAt).toLocaleDateString()
                                : ""}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleSave}
                        className="text-xs font-semibold text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-white transition"
                    >
                        Save
                    </button>

                    <Link
                        to={`/lessons/${lesson?._id}`}
                        className="text-xs font-semibold text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-50 transition"
                    >
                        See details →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LessonCard;
