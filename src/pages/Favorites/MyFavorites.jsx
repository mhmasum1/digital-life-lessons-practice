import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Spinner from "../../components/common/Spinner";

const MyFavorites = () => {
    const axiosSecure = useAxiosSecure();

    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    const loadFavorites = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosSecure.get("/favorites");

            const list = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.favorites)
                    ? res.data.favorites
                    : [];

            setFavorites(list);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load favorites");
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const handleRemove = async (favoriteId) => {
        try {
            await axiosSecure.delete(`/favorites/${favoriteId}`);
            setFavorites((prev) => prev.filter((f) => f._id !== favoriteId));
            toast.success("Removed from favorites");
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove favorite");
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">My Favorites</h1>
                    <Link to="/lessons" className="text-sm text-orange-600 hover:underline">
                        Browse lessons →
                    </Link>
                </div>

                {favorites.length === 0 ? (
                    <div className="border border-orange-100 bg-[#FFF7ED] rounded-2xl p-8 text-center">
                        <p className="text-gray-800 font-medium mb-2">No favorites yet.</p>
                        <p className="text-sm text-gray-600 mb-4">
                            Save a lesson and it will appear here.
                        </p>
                        <Link
                            to="/lessons"
                            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
                        >
                            Browse Public Lessons →
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-5">
                        {favorites.map((fav) => {
                            const lesson = fav.lesson;

                            return (
                                <div
                                    key={fav._id}
                                    className="rounded-2xl border border-orange-100 bg-[#FFF7ED] p-5 shadow-sm flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <h2 className="text-base font-semibold text-gray-900 mb-1">
                                                    {lesson?.title}
                                                </h2>
                                                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                                    #{lesson?.category || "LifeLesson"}
                                                </p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full text-[11px] border bg-white border-orange-100 text-orange-700">
                                                Saved
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

                                            <span>
                                                {lesson?.createdAt
                                                    ? new Date(lesson.createdAt).toLocaleDateString()
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={`/lessons/${lesson?._id}`}
                                            className="text-xs font-semibold text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-50 transition"
                                        >
                                            See details →
                                        </Link>

                                        <button
                                            onClick={() => handleRemove(fav._id)}
                                            className="text-xs font-semibold text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-white transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyFavorites;
