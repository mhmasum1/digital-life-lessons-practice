import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUserInfo from "../../hooks/useUserInfo";
import useAuth from "../../hooks/useAuth";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";

const LessonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { dbUser } = useUserInfo();
    const { user } = useAuth();

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [similarLessons, setSimilarLessons] = useState([]);
    const [authorStats, setAuthorStats] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const isPremiumUser = dbUser?.isPremium === true;
    const [views] = useState(Math.floor(Math.random() * 10000));

    const fetchSimilarLessons = async (category, tone) => {
        try {
            const res = await axiosSecure.get("/lessons/public");
            const allLessons = res.data?.lessons || [];

            const similar = allLessons
                .filter(
                    (l) =>
                        l._id !== id &&
                        (l.category === category || l.emotionalTone === tone)
                )
                .slice(0, 6);

            setSimilarLessons(similar);
        } catch (error) {
            console.error("Failed to fetch similar lessons:", error);
        }
    };

    const fetchAuthorStats = async (email) => {
        try {
            const res = await axiosSecure.get(`/lessons/my?email=${email}`);
            setAuthorStats({ totalLessons: res.data?.length || 0 });
        } catch (error) {
            console.error("Failed to fetch author stats:", error);
        }
    };

    const checkIfFavorited = async () => {
        if (!user) return;
        try {
            const res = await axiosSecure.get("/favorites");
            const favs = res.data?.favorites || [];
            const isFav = favs.some((f) => f.lesson?._id === id);
            setIsFavorited(isFav);
        } catch (error) {
            console.error("Failed to check favorites:", error);
        }
    };

    useEffect(() => {
        if (!id) return;

        const fetchLesson = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get(`/lessons/${id}`);
                const lessonData = res.data;

                setLesson(lessonData);

                if (user && lessonData?.likes?.includes(user.uid)) {
                    setIsLiked(true);
                }

                fetchSimilarLessons(lessonData.category, lessonData.emotionalTone);
                fetchAuthorStats(lessonData.creatorEmail);
                checkIfFavorited();
            } catch (error) {
                console.error("Failed to fetch lesson:", error);
                setLesson(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [id, axiosSecure, user]);

    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error("Please log in to save favorites");
            return;
        }

        try {
            if (isFavorited) {
                const res = await axiosSecure.get("/favorites");
                const favs = res.data?.favorites || [];
                const fav = favs.find((f) => f.lesson?._id === id);

                if (fav) {
                    await axiosSecure.delete(`/favorites/${fav._id}`);
                    setIsFavorited(false);
                    toast.success("Removed from favorites");
                }
            } else {
                await axiosSecure.post("/favorites", { lessonId: id });
                setIsFavorited(true);
                toast.success("Added to favorites!");
            }
        } catch (error) {
            console.error("Toggle favorite error:", error);
            toast.error("Failed to update favorites");
        }
    };

    const handleToggleLike = async () => {
        if (!user) {
            toast.error("Please log in to like");
            navigate("/auth/login");
            return;
        }

        try {
            await axiosSecure.patch(`/lessons/${id}/like`);

            setIsLiked((prev) => !prev);
            setLesson((prev) => ({
                ...prev,
                likesCount: (prev?.likesCount || 0) + (isLiked ? -1 : 1),
            }));

            toast.success(isLiked ? "Like removed" : "Liked!");
        } catch (error) {
            console.error("Toggle like error:", error);
            toast.error("Failed to update like");
        }
    };

    const handleReport = async () => {
        if (!user) {
            toast.error("Please log in to report");
            return;
        }

        const reasons = [
            "Inappropriate Content",
            "Hate Speech or Harassment",
            "Misleading or False Information",
            "Spam or Promotional Content",
            "Sensitive or Disturbing Content",
            "Other",
        ];

        const reason = prompt(
            `Select reason:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
        );
        if (!reason) return;

        const message = prompt("Additional details (optional):");

        try {
            await axiosSecure.post("/reports", {
                lessonId: id,
                reason: reasons[parseInt(reason) - 1] || "Other",
                message: message || "",
            });
            toast.success("Report submitted. Thank you!");
        } catch (error) {
            console.error("Report error:", error);
            toast.error("Failed to submit report");
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please log in to comment");
            return;
        }

        if (!newComment.trim()) return;

        try {
            const res = await axiosSecure.post(`/lessons/${id}/comments`, {
                comment: newComment,
            });

            setComments((prev) => [...prev, res.data]);
            setNewComment("");
            toast.success("Comment posted!");
        } catch (error) {
            console.error("Post comment error:", error);
            toast.error("Failed to post comment");
        }
    };

    if (loading) return <Spinner />;

    if (!lesson) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-orange-600 hover:underline mb-4"
                >
                    ← Back
                </button>
                <p className="text-gray-700">Lesson not found.</p>
            </div>
        );
    }

    const {
        title,
        shortDescription,
        details,
        category,
        emotionalTone,
        accessLevel,
        visibility,
        creatorName,
        creatorEmail,
        creatorPhotoURL,
        createdAt,
        updatedAt,
        savedCount = 0,
        likesCount = 0,
    } = lesson;

    const isPremiumLesson = accessLevel === "premium";
    const detailsText = (details || "").trim();

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString()
        : "Recently";

    const formattedUpdated = updatedAt
        ? new Date(updatedAt).toLocaleDateString()
        : formattedDate;

    const wordCount = detailsText ? detailsText.split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="bg-[#FFF7ED] min-h-screen py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-orange-600 hover:underline mb-6"
                >
                    ← Back to lessons
                </button>

                <article className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 md:p-8 mb-6">
                    <header className="mb-6">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200">
                                {category}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                                {emotionalTone}
                            </span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${isPremiumLesson
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}
                            >
                                {isPremiumLesson ? "Premium" : "Free"}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {title}
                        </h1>
                    </header>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                            <p className="text-gray-500 mb-1">Created</p>
                            <p className="font-medium text-gray-900">{formattedDate}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Updated</p>
                            <p className="font-medium text-gray-900">{formattedUpdated}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Visibility</p>
                            <p className="font-medium text-gray-900 capitalize">{visibility}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Reading Time</p>
                            <p className="font-medium text-gray-900">{readingTime} min</p>
                        </div>
                    </div>

                    {shortDescription && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 text-sm text-gray-800">
                            <strong className="text-orange-700">Summary:</strong>{" "}
                            {shortDescription}
                        </div>
                    )}

                    {isPremiumLesson && !isPremiumUser ? (
                        <div className="mt-4 border-2 border-dashed border-amber-300 bg-amber-50/60 rounded-xl px-6 py-8 text-center">
                            <div className="text-5xl mb-3">🔒</div>
                            <p className="text-lg font-semibold text-amber-800 mb-2">
                                This is a Premium Life Lesson
                            </p>
                            <p className="text-sm text-amber-700 mb-4 max-w-md mx-auto">
                                Upgrade to Premium to unlock the full story and all future
                                premium lessons.
                            </p>
                            <Link
                                to="/pricing"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                            >
                                Upgrade to Premium →
                            </Link>
                        </div>
                    ) : (
                        <section className="prose prose-sm md:prose-base max-w-none text-gray-800 leading-relaxed mb-6">
                            {detailsText ? (
                                detailsText.split("\n").map((para, idx) => (
                                    <p key={idx} className="mb-4">
                                        {para}
                                    </p>
                                ))
                            ) : (
                                <p className="text-gray-600 italic">
                                    No detailed content provided.
                                </p>
                            )}
                        </section>
                    )}
                </article>

                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">About the Author</h3>
                    <div className="flex items-center gap-4">
                        {creatorPhotoURL ? (
                            <img
                                src={creatorPhotoURL}
                                alt={creatorName}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold">
                                {(creatorName?.[0] || "U").toUpperCase()}
                            </div>
                        )}

                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{creatorName}</h4>
                            <p className="text-sm text-gray-600">{creatorEmail}</p>
                            {authorStats && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {authorStats.totalLessons} lessons shared
                                </p>
                            )}
                        </div>

                        <Link
                            to={`/profile/${creatorEmail}`}
                            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition"
                        >
                            View Profile
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-red-500">❤️ {likesCount}</p>
                            <p className="text-xs text-gray-600">Likes</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-500">
                                🔖 {savedCount}
                            </p>
                            <p className="text-xs text-gray-600">Favorites</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-500">👀 {views}</p>
                            <p className="text-xs text-gray-600">Views</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleToggleFavorite}
                            className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg font-medium transition ${isFavorited
                                    ? "bg-orange-500 text-white hover:bg-orange-600"
                                    : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                                }`}
                        >
                            🔖 {isFavorited ? "Saved" : "Save to Favorites"}
                        </button>

                        <button
                            onClick={handleToggleLike}
                            className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg font-medium transition ${isLiked
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                }`}
                        >
                            ❤️ {isLiked ? "Liked" : "Like"}
                        </button>

                        <button
                            onClick={handleReport}
                            className="flex-1 min-w-[140px] px-4 py-3 rounded-lg font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition"
                        >
                            🚩 Report
                        </button>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link copied!");
                            }}
                            className="flex-1 min-w-[140px] px-4 py-3 rounded-lg font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                        >
                            🔗 Share
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Comments</h3>

                    {user ? (
                        <form onSubmit={handlePostComment} className="mb-6">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                                rows="3"
                            />
                            <button
                                type="submit"
                                className="mt-2 px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition"
                            >
                                Post Comment
                            </button>
                        </form>
                    ) : (
                        <p className="text-gray-600 mb-6 text-sm">
                            Please{" "}
                            <Link
                                to="/auth/login"
                                className="text-orange-600 hover:underline"
                            >
                                log in
                            </Link>{" "}
                            to comment.
                        </p>
                    )}

                    {comments.length === 0 ? (
                        <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment, idx) => (
                                <div key={idx} className="border-b border-gray-100 pb-3">
                                    <p className="font-medium text-sm">{comment.userName}</p>
                                    <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {similarLessons.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
                        <h3 className="text-lg font-semibold mb-4">Similar Lessons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {similarLessons.map((similar) => (
                                <Link
                                    key={similar._id}
                                    to={`/lessons/${similar._id}`}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition"
                                >
                                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {similar.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                        {similar.shortDescription}
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] rounded">
                                            {similar.category}
                                        </span>
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] rounded">
                                            {similar.emotionalTone}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonDetails;
