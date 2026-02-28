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
            className={`relative rounded-2xl border p-5 shadow-sm flex flex-col justify-between
    bg-base-200 border-base-300 ${isLocked ? "overflow-hidden" : ""}`}
        >
            {isLocked && (
                <div className="absolute inset-0 bg-base-100/60 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center text-center px-4">
                    <p className="text-sm font-semibold text-primary mb-1">🔒 Premium Lesson</p>
                    <p className="text-xs text-base-content/70 mb-3">
                        Upgrade to Premium to read the full story and other premium lessons.
                    </p>
                    <Link to="/pricing" className="btn btn-sm btn-primary">
                        Go to Pricing →
                    </Link>
                </div>
            )}

            <div className={isLocked ? "opacity-40 pointer-events-none" : ""}>
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                        <h2 className="text-base font-semibold text-base-content mb-1 line-clamp-2">
                            {lesson?.title}
                        </h2>
                        <p className="text-[11px] uppercase tracking-wide text-base-content/50">
                            #{lesson?.category || "LifeLesson"}
                        </p>
                    </div>

                    <span
                        className={`badge badge-outline text-[11px]
          ${isPremiumLesson ? "badge-warning" : "badge-success"}`}
                    >
                        {isPremiumLesson ? "Premium" : "Free"}
                    </span>
                </div>

                <p className="text-sm text-base-content/80 mb-3 line-clamp-3">
                    {lesson?.shortDescription}
                </p>

                <div className="flex items-center justify-between text-xs text-base-content/60 mb-3">
                    <div className="flex items-center gap-2">
                        {lesson?.creatorPhotoURL ? (
                            <img
                                src={lesson.creatorPhotoURL}
                                alt={lesson.creatorName}
                                className="h-7 w-7 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-7 w-7 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-semibold">
                                {(lesson?.creatorName?.[0] || "U").toUpperCase()}
                            </div>
                        )}
                        <span className="text-base-content/80">{lesson?.creatorName || "Anonymous"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span>{lesson?.emotionalTone || "Neutral"}</span>
                        <span>•</span>
                        <span>{lesson?.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button onClick={handleSave} className="btn btn-sm btn-outline">
                        Save
                    </button>

                    <Link to={`/lessons/${lesson?._id}`} className="btn btn-sm btn-primary btn-outline">
                        See details →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LessonCard;