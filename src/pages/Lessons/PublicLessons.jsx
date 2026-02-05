import { useEffect, useMemo, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUserInfo from "../../hooks/useUserInfo";
import Spinner from "../../components/common/Spinner";
import LessonCard from "../../components/lessons/LessonCard";

const PublicLessons = () => {
    const axiosSecure = useAxiosSecure();
    const { dbUser } = useUserInfo();

    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ controls
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [tone, setTone] = useState("");
    const [sort, setSort] = useState("newest"); // newest | mostSaved

    // debounce typing
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    const isPremiumUser = dbUser?.isPremium === true;

    const categories = useMemo(() => {
        const set = new Set(lessons.map((l) => l.category).filter(Boolean));
        return ["", ...Array.from(set)];
    }, [lessons]);

    const tones = useMemo(() => {
        const set = new Set(lessons.map((l) => l.emotionalTone).filter(Boolean));
        return ["", ...Array.from(set)];
    }, [lessons]);

    useEffect(() => {
        let cancelled = false;

        const fetchLessons = async () => {
            try {
                setLoading(true);

                const params = new URLSearchParams();
                if (debouncedSearch) params.set("search", debouncedSearch);
                if (category) params.set("category", category);
                if (tone) params.set("tone", tone);
                params.set("sort", sort);

                const res = await axiosSecure.get(`/lessons/public?${params.toString()}`);
                const data = res.data;

                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.lessons)
                        ? data.lessons
                        : [];

                if (!cancelled) setLessons(list);
            } catch (error) {
                console.error("GET /lessons/public error:", error);
                if (!cancelled) setLessons([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchLessons();
        return () => {
            cancelled = true;
        };
    }, [axiosSecure, debouncedSearch, category, tone, sort]);

    const resetFilters = () => {
        setSearch("");
        setCategory("");
        setTone("");
        setSort("newest");
    };

    if (loading) return <Spinner />;

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-2">
                        Browse Public Life Lessons
                    </h1>
                    <p className="text-sm text-gray-600 text-center max-w-2xl mx-auto">
                        Discover real-life experiences, reflections and wisdom shared by the community.
                    </p>

                    {!isPremiumUser && (
                        <p className="mt-3 text-[11px] text-center inline-block mx-auto px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                            Some lessons are Premium only – upgrade to unlock full access.
                        </p>
                    )}
                </header>

                {/* ✅ Search + Filter + Sort */}
                <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Search</label>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title / keyword..."
                                className="input input-bordered w-full mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Category</label>
                            <select
                                className="select select-bordered w-full mt-1"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">All</option>
                                {categories
                                    .filter(Boolean)
                                    .map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Emotional Tone</label>
                            <select
                                className="select select-bordered w-full mt-1"
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                            >
                                <option value="">All</option>
                                {tones
                                    .filter(Boolean)
                                    .map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Sort</label>
                            <select
                                className="select select-sm select-bordered"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="newest">Newest</option>
                                <option value="mostSaved">Most Saved</option>
                            </select>
                        </div>

                        <button onClick={resetFilters} className="btn btn-sm btn-outline md:ml-auto">
                            Reset
                        </button>
                    </div>
                </div>

                {lessons.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center mt-10">
                        No public lessons found.
                    </p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-5">
                        {lessons.map((lesson) => (
                            <LessonCard key={lesson._id} lesson={lesson} isPremiumUser={isPremiumUser} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicLessons;
