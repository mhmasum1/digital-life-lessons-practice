// LessonDetails — Short Plan Note 📝

// কি কি Feature আছে:
// 1. Lesson Data Fetch        → GET /lessons/:id
// 2. Premium Guard            → locked/unlocked content
// 3. Like Toggle              → PATCH /lessons/:id/like
// 4. Favorite Toggle          → POST/DELETE /favorites
// 5. Comment List + Post      → GET/POST /lessons/:id/comments
// 6. Report                   → POST /reports
// 7. Share                    → clipboard copy
// 8. Author Info + Stats      → GET /stats/author/:email
// 9. Similar Lessons          → GET /lessons/public → filter
// 10. Reading Time Calculate  → wordCount / 200

// নতুন করে করলে এই Order এ করো:
// Step 1 → Lesson fetch + দেখাও (title, description, details)
// Step 2 → Premium Guard যোগ করো
// Step 3 → Like feature
// Step 4 → Favorite feature
// Step 5 → Comment feature
// Step 6 → Author section
// Step 7 → Similar Lessons
// Step 8 → Report + Share
// Step 9 → Reading Time + Stats

// State যা যা লাগবে:
// lesson          → lesson data
// loading         → fetch হচ্ছে কিনা
// isLiked         → like করা কিনা
// isFavorited     → save করা কিনা
// comments        → comments list
// newComment      → input value
// similarLessons  → similar lessons
// authorStats     → author এর info


import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUserInfo from "../../hooks/useUserInfo";
import useAuth from "../../hooks/useAuth";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";

const LessonDetails = () => {

    // hooks
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { dbUser } = useUserInfo();
    const { user } = useAuth();

    // states
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
    // random fake view count
    // setter নেই — কখনো change হবে না

    // Similar Lessons Fetch  
    const fetchSimilarLessons = async (category, tone) => {
        try {
            const res = await axiosSecure.get("/lessons/public");
            // সব public lessons আনো
            const allLessons = res.data?.lessons || [];
            // lessons array নাও, না থাকলে []

            const similar = allLessons
                .filter((l) => l._id !== id && (l.category === category || l.emotionalTone === tone))
                .slice(0, 6);
            // নিজেকে বাদ দাও
            // same category অথবা same tone
            // সর্বোচ্চ ৬টা রাখো


            setSimilarLessons(similar);
            // state এ store করো

        } catch {
            // no console in production
        }
    };

    // Author Stats Fetch 
    const fetchAuthorStats = async (email) => {
        try {
            const res = await axiosSecure.get(`/stats/author/${email}`);
            // এই author এর stats আনো
            setAuthorStats({ totalLessons: res.data?.totalLessons || 0 });
            // totalLessons store করো
            // না থাকলে 0
        } catch {
            setAuthorStats(null);
        }
    };

    // Favorite Check
    const checkIfFavorited = async () => {
        if (!user) return;
        try {
            const res = await axiosSecure.get("/favorites");
            // এই user এর সব favorites আনো
            const favs = res.data?.favorites || [];
            // favorites array নাও
            const isFav = favs.some((f) => f.lesson?._id === id);
            // এই lesson টা favorites এ আছে কিনা check
            // some() — যেকোনো একটা match হলে true
            setIsFavorited(isFav);
            // true অথবা false set করো
        } catch {
            // no console
        }
    };

    // Main useEffect — সব fetch এখান থেকে শুরু
    useEffect(() => {
        if (!id) return;

        const fetchLesson = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get(`/lessons/${id}`);
                // এই lesson এর data আনো
                const lessonData = res.data;
                // response data নাও

                setLesson(lessonData);

                if (user && lessonData?.likes?.includes(user.email)) {
                    setIsLiked(true);
                    // likes array তে এই user এর email আছে → liked
                } else {
                    setIsLiked(false);
                    // নেই → not liked
                }

                fetchSimilarLessons(lessonData.category, lessonData.emotionalTone);
                // lesson এর category আর tone দিয়ে similar খোঁজো

                fetchAuthorStats(lessonData.creatorEmail);
                // author এর email দিয়ে stats আনো
                checkIfFavorited();
                // favorite check করো
            } catch {
                setLesson(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, axiosSecure, user?.email]);
    // id বা user change হলে re-run

    // Favorite Toggle
    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error("Please log in to save favorites");
            return;
        }

        try {
            if (isFavorited) {
                // already favorited → remove করো

                const res = await axiosSecure.get("/favorites");
                // সব favorites আনো
                const favs = res.data?.favorites || [];
                const fav = favs.find((f) => f.lesson?._id === id);
                // এই lesson এর favorite record খোঁজো

                if (fav) {
                    await axiosSecure.delete(`/favorites/${fav._id}`);
                    // database থেকে delete করো
                    setIsFavorited(false);
                    // state update করো  
                    toast.success("Removed from favorites");
                }
            } else {
                // favorited না → add করো

                await axiosSecure.post("/favorites", { lessonId: id });
                // database এ add করো
                setIsFavorited(true);
                // state update করো 
                toast.success("Added to favorites!");
            }
        } catch {
            toast.error("Failed to update favorites");
        }
    };

    // Like Toggle-Optimistic UI
    const handleToggleLike = async () => {
        if (!user) {
            toast.error("Please log in to like");
            navigate("/auth/login");
            return;
            // login না থাকলে login page এ পাঠাও
        }

        try {
            await axiosSecure.patch(`/lessons/${id}/like`);
            // server এ like toggle করো

            setIsLiked((prev) => !prev);
            // true → false, false → true

            setLesson((prev) => ({
                ...prev,
                // আগের সব data রাখো
                likesCount: (prev?.likesCount || 0) + (isLiked ? -1 : 1),
            }));
            // isLiked ছিল true → unlike → -1
            // isLiked ছিল false → like → +1

            // Optimistic Update — API এর আগেই UI change ✅
            toast.success(isLiked ? "Like removed" : "Liked!");
            // isLiked অনুযায়ী message
        } catch {
            toast.error("Failed to update like");
        }
    };

    // Report  
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
        // report এর কারণ গুলো

        const reason = prompt(`Select reason:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join("\n")}`);
        // browser popup — number type করে reason select করে
        // "1" → Inappropriate Content
        if (!reason) return;

        const message = prompt("Additional details (optional):");
        // extra details নেওয়া — optional

        try {
            await axiosSecure.post("/reports", {
                lessonId: id,
                reason: reasons[parseInt(reason, 10) - 1] || "Other",
                // "1" → reasons[0] → "Inappropriate Content"
                // invalid হলে "Other"
                message: message || "",
                // message না থাকলে empty string
            });
            toast.success("Report submitted. Thank you!");
        } catch {
            toast.error("Failed to submit report");
        }
    };

    // Comment Post

    const handlePostComment = async (e) => {
        e.preventDefault();
        // page reload বন্ধ  

        if (!user) {
            toast.error("Please log in to comment");
            return;
        }

        if (!newComment.trim()) return;
        // empty comment block করো

        try {
            const res = await axiosSecure.post(`/lessons/${id}/comments`, {
                comment: newComment,
                // comment text পাঠাও
            });

            setComments((prev) => [...prev, res.data]);
            // নতুন comment list এর শেষে যোগ করো
            // page reload ছাড়াই দেখাবে ✅
            setNewComment("");
            // input clear করো
            toast.success("Comment posted!");
        } catch {
            toast.error("Failed to post comment");
        }
    };


    //  Loading + Not Found Check
    if (loading) return <Spinner />;
    // data আসার আগে spinner দেখাও


    if (!lesson) {
        return (
            <div className="min-h-screen bg-base-200">
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4">
                        ← Back
                    </button>
                    <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
                        <p className="text-base-content">Lesson not found.</p>
                         // lesson null হলে not found দেখাও
                    </div>
                </div>
            </div>
        );
    }


    // Destructuring — lesson থেকে data বের করা
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
        savedCount = 0, // না থাকলে default 0
        likesCount = 0, // না থাকলে default 0
    } = lesson;
    // lesson object থেকে সব field বের করো
    // বারবার lesson.title লেখা লাগবে না

    const isPremiumLesson = accessLevel === "premium";
    // lesson premium কিনা
    const detailsText = (details || "").trim();
    // details না থাকলে empty string
    // trim — আগে পরে space সরাও

    const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : "Recently";
    // timestamp → "2/27/2026"
    // না থাকলে "Recently"
    const formattedUpdated = updatedAt ? new Date(updatedAt).toLocaleDateString() : formattedDate;
    // updated date, না থাকলে created date

    const wordCount = detailsText ? detailsText.split(/\s+/).length : 0;
    // space দিয়ে split → word count
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    // 200 words/minute reading speed
    // wordCount=400 → 2 min
    // Math.max(1,...) → minimum 1 min



    // JSX — Main Card
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
                        // "\n" দিয়ে split করে প্রতিটা paragraph আলাদা করো
                    )}
                </article>

                {/* Author Section */}
                <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-base-content">About the Author</h3>

                    <div className="flex items-center gap-4">
                        {creatorPhotoURL ? (
                            <img src={creatorPhotoURL} alt={creatorName} className="w-16 h-16 rounded-full object-cover" />
                            // photo থাকলে দেখাও
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                                {(creatorName?.[0] || "U").toUpperCase()}
                            </div>
                            // photo না থাকলে নামের প্রথম letter দেখাও
                            // creatorName না থাকলে "U"
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

                        <Link to={`/dashboard/profile`} className="btn btn-outline btn-sm">
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
                        {/* // favorited → "Saved" + primary color
                        // not favorited → "Save to Favorites" + outline */}

                        <button
                            onClick={handleToggleLike}
                            className={`btn flex-1 min-w-40 ${isLiked ? "btn-error" : "btn-outline"}`}
                        >
                            ❤️ {isLiked ? "Liked" : "Like"}
                        </button>
                        {/* // liked → "Liked" + red color
                        // not liked → "Like" + outline */}

                        <button onClick={handleReport} className="btn btn-outline flex-1 min-w-40">
                            🚩 Report
                        </button>
                        {/*  // report popup খুলবে */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                // current URL clipboard এ copy করো
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
                                    // click করলে ঐ lesson এ যাবে
                                    className="rounded-2xl border border-base-300 bg-base-100 p-4 hover:shadow-sm transition"
                                >
                                    <h4 className="font-semibold text-base-content mb-2 line-clamp-2">
                                        {similar.title}
                                    </h4>
                                    {/* // line-clamp-2 — ২ লাইনের বেশি হলে কাটবে */}
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