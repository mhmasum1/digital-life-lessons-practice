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
                .filter((l) => l._id !== id && (l.category === category || l.emotionalTone === tone))
                .slice(0, 6);

            setSimilarLessons(similar);
        } catch {
            // no console in production
        }
    };

    const fetchAuthorStats = async (email) => {
        try {
            const res = await axiosSecure.get(`/stats/author/${email}`);
            setAuthorStats({ totalLessons: res.data?.totalLessons || 0 });
        } catch {
            setAuthorStats(null);
        }
    };

    const checkIfFavorited = async () => {
        if (!user) return;
        try {
            const res = await axiosSecure.get("/favorites");
            const favs = res.data?.favorites || [];
            const isFav = favs.some((f) => f.lesson?._id === id);
            setIsFavorited(isFav);
        } catch {
            // no console
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

                if (user && lessonData?.likes?.includes(user.email)) {
                    setIsLiked(true);
                } else {
                    setIsLiked(false);
                }

                fetchSimilarLessons(lessonData.category, lessonData.emotionalTone);
                fetchAuthorStats(lessonData.creatorEmail);
                checkIfFavorited();
            } catch {
                setLesson(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, axiosSecure, user?.email]);

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
        } catch {
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
        } catch {
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

        const reason = prompt(`Select reason:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join("\n")}`);
        if (!reason) return;

        const message = prompt("Additional details (optional):");

        try {
            await axiosSecure.post("/reports", {
                lessonId: id,
                reason: reasons[parseInt(reason, 10) - 1] || "Other",
                message: message || "",
            });
            toast.success("Report submitted. Thank you!");
        } catch {
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
        } catch {
            toast.error("Failed to post comment");
        }
    };

    if (loading) return <Spinner />;

    if (!lesson) {
        return (
            <div className="min-h-screen bg-base-200">
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4">
                        ← Back
                    </button>
                    <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
                        <p className="text-base-content">Lesson not found.</p>
                    </div>
                </div>
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

    const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : "Recently";
    const formattedUpdated = updatedAt ? new Date(updatedAt).toLocaleDateString() : formattedDate;

    const wordCount = detailsText ? detailsText.split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="bg-base-200 min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-5">
                    ← Back to lessons
                </button>

                {/* Main card */}
                <article className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 md:p-8 mb-6">
                    <header className="mb-6">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="badge badge-outline">{category}</span>
                            <span className="badge badge-outline">{emotionalTone}</span>
                            <span className={`badge ${isPremiumLesson ? "badge-warning" : "badge-success"}`}>
                                {isPremiumLesson ? "Premium" : "Free"}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-4">{title}</h1>
                    </header>

                    <div className="bg-base-200 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border border-base-300">
                        <div>
                            <p className="text-base-content/60 mb-1">Created</p>
                            <p className="font-medium text-base-content">{formattedDate}</p>
                        </div>
                        <div>
                            <p className="text-base-content/60 mb-1">Updated</p>
                            <p className="font-medium text-base-content">{formattedUpdated}</p>
                        </div>
                        <div>
                            <p className="text-base-content/60 mb-1">Visibility</p>
                            <p className="font-medium text-base-content capitalize">{visibility}</p>
                        </div>
                        <div>
                            <p className="text-base-content/60 mb-1">Reading Time</p>
                            <p className="font-medium text-base-content">{readingTime} min</p>
                        </div>
                    </div>

                    {shortDescription && (
                        <div className="alert border border-base-300 bg-base-200 text-base-content mb-6">
                            <span>
                                <span className="font-semibold text-primary">Summary:</span> {shortDescription}
                            </span>
                        </div>
                    )}

                    {isPremiumLesson && !isPremiumUser ? (
                        <div className="mt-4 border border-base-300 bg-base-200 rounded-2xl p-7 text-center">
                            <div className="text-5xl mb-3">🔒</div>
                            <p className="text-lg font-semibold text-base-content mb-2">
                                This is a Premium Life Lesson
                            </p>
                            <p className="text-sm text-base-content/70 mb-4 max-w-md mx-auto">
                                Upgrade to Premium to unlock the full story and all future premium lessons.
                            </p>
                            <Link to="/pricing" className="btn btn-primary">
                                Upgrade to Premium →
                            </Link>
                        </div>
                    ) : (
                        <section className="text-base-content leading-relaxed">
                            {detailsText ? (
                                <div className="space-y-4">
                                    {detailsText.split("\n").map((para, idx) => (
                                        <p key={idx} className="text-base-content/90">
                                            {para}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-base-content/60 italic">No detailed content provided.</p>
                            )}
                        </section>
                    )}
                </article>

                {/* Author */}
                <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-base-content">About the Author</h3>

                    <div className="flex items-center gap-4">
                        {creatorPhotoURL ? (
                            <img src={creatorPhotoURL} alt={creatorName} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                                {(creatorName?.[0] || "U").toUpperCase()}
                            </div>
                        )}

                        <div className="flex-1">
                            <h4 className="font-semibold text-base-content">{creatorName}</h4>
                            <p className="text-sm text-base-content/70">{creatorEmail}</p>
                            {authorStats && (
                                <p className="text-xs text-base-content/60 mt-1">
                                    {authorStats.totalLessons} lessons shared
                                </p>
                            )}
                        </div>

                        <Link to={`/profile/${creatorEmail}`} className="btn btn-outline btn-sm">
                            View Profile
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="rounded-xl bg-base-200 border border-base-300 p-4">
                            <p className="text-2xl font-bold text-error">❤️ {likesCount}</p>
                            <p className="text-xs text-base-content/60">Likes</p>
                        </div>
                        <div className="rounded-xl bg-base-200 border border-base-300 p-4">
                            <p className="text-2xl font-bold text-primary">🔖 {savedCount}</p>
                            <p className="text-xs text-base-content/60">Favorites</p>
                        </div>
                        <div className="rounded-xl bg-base-200 border border-base-300 p-4">
                            <p className="text-2xl font-bold text-info">👀 {views}</p>
                            <p className="text-xs text-base-content/60">Views</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 mb-6">
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleToggleFavorite}
                            className={`btn flex-1 min-w-40 ${isFavorited ? "btn-primary" : "btn-outline"}`}
                        >
                            🔖 {isFavorited ? "Saved" : "Save to Favorites"}
                        </button>

                        <button
                            onClick={handleToggleLike}
                            className={`btn flex-1 min-w-40 ${isLiked ? "btn-error" : "btn-outline"}`}
                        >
                            ❤️ {isLiked ? "Liked" : "Like"}
                        </button>

                        <button onClick={handleReport} className="btn btn-outline flex-1 min-w-40">
                            🚩 Report
                        </button>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link copied!");
                            }}
                            className="btn btn-outline flex-1 min-w-40"
                        >
                            🔗 Share
                        </button>
                    </div>
                </div>

                {/* Comments */}
                <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-base-content">Comments</h3>

                    {user ? (
                        <form onSubmit={handlePostComment} className="mb-6">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                className="textarea textarea-bordered w-full bg-base-100 text-base-content border-base-300"
                                rows={3}
                            />
                            <button type="submit" className="btn btn-primary mt-2">
                                Post Comment
                            </button>
                        </form>
                    ) : (
                        <p className="text-base-content/70 mb-6 text-sm">
                            Please{" "}
                            <Link to="/auth/login" className="link link-primary">
                                log in
                            </Link>{" "}
                            to comment.
                        </p>
                    )}

                    {comments.length === 0 ? (
                        <p className="text-base-content/60 text-sm">No comments yet. Be the first!</p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment, idx) => (
                                <div key={idx} className="border-b border-base-300 pb-3">
                                    <p className="font-medium text-sm text-base-content">{comment.userName}</p>
                                    <p className="text-base-content/80 text-sm mt-1">{comment.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Similar lessons */}
                {similarLessons.length > 0 && (
                    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6">
                        <h3 className="text-lg font-semibold mb-4 text-base-content">Similar Lessons</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {similarLessons.map((similar) => (
                                <Link
                                    key={similar._id}
                                    to={`/lessons/${similar._id}`}
                                    className="rounded-2xl border border-base-300 bg-base-100 p-4 hover:shadow-sm transition"
                                >
                                    <h4 className="font-semibold text-base-content mb-2 line-clamp-2">
                                        {similar.title}
                                    </h4>
                                    <p className="text-xs text-base-content/70 line-clamp-2 mb-3">
                                        {similar.shortDescription}
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="badge badge-outline badge-sm">{similar.category}</span>
                                        <span className="badge badge-outline badge-sm">{similar.emotionalTone}</span>
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