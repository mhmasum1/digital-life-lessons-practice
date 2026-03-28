// PublicLessons — Short Plan Note 📝

// কি কি Feature আছে:
// 1. Lessons Fetch         → GET /lessons/public?search=&category=&tone=&sort=&page=&limit=
// 2. Search                → title/keyword দিয়ে search করো
// 3. Debounced Search      → 400ms delay — প্রতি keystroke এ API call হয় না
// 4. Category Filter       → lessons থেকে unique categories বের করে dropdown বানাও
// 5. Tone Filter           → lessons থেকে unique tones বের করে dropdown বানাও
// 6. Sort                  → newest | mostSaved
// 7. Pagination            → page, limit, totalPages — server side pagination
// 8. Page Reset            → filter/search change হলে page 1 এ ফিরে যাও
// 9. Smart Page Numbers    → maxButtons 5 — current page এর আশেপাশে দেখাও
// 10. Reset Button         → সব filter + search + page clear করো
// 11. Premium Guard        → non-premium user কে upgrade hint দেখাও
// 12. Cleanup              → cancelled flag — memory leak prevent করো

// State যা যা লাগবে:
// lessons         → lessons array
// loading         → fetch হচ্ছে কিনা
// search          → search input value
// debouncedSearch → 400ms debounced search value
// category        → selected category
// tone            → selected tone
// sort            → "newest" | "mostSaved"
// page            → current page number
// pagination      → { total, page, limit, totalPages }

// নতুন করে করলে এই Order এ করো:
// Step 1 → Basic fetch করো + lessons দেখাও (LessonCard)
// Step 2 → Search input যোগ করো
// Step 3 → Debounce যোগ করো search এ
// Step 4 → Category + Tone filter যোগ করো
// Step 5 → Sort dropdown যোগ করো
// Step 6 → Reset button যোগ করো
// Step 7 → Pagination যোগ করো (Prev/Next + page numbers)
// Step 8 → Smart page numbers যোগ করো
// Step 9 → Filter change এ page reset যোগ করো
// Step 10 → Premium hint যোগ করো


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

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [tone, setTone] = useState("");
    const [sort, setSort] = useState("newest");

    const [page, setPage] = useState(1);
    const limit = 9;

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
    });

    // Debounce — user type করা বন্ধ করার 400ms পরে search হবে
    // প্রতি keystroke এ API call হবে না
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(t);
        // ↑ cleanup — নতুন keystroke আসলে আগের timer বাতিল করো
    }, [search]);

    const isPremiumUser = dbUser?.isPremium === true;

    // lessons array থেকে unique categories বের করো
    // server এ আলাদা API না করে client side এ বানানো হয়েছে
    const categories = useMemo(() => {
        const set = new Set(lessons.map((l) => l.category).filter(Boolean));
        return ["", ...Array.from(set)];
    }, [lessons]);

    // lessons array থেকে unique tones বের করো
    const tones = useMemo(() => {
        const set = new Set(lessons.map((l) => l.emotionalTone).filter(Boolean));
        return ["", ...Array.from(set)];
    }, [lessons]);

    // filter/search/sort যেকোনো একটা change হলে page 1 এ ফিরে যাও
    // না হলে page 3 এ থাকলে filter করলে wrong results দেখাবে
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, category, tone, sort]);

    useEffect(() => {
        let cancelled = false;
        // ↑ component unmount হলে state set বন্ধ করতে

        const fetchLessons = async () => {
            try {
                setLoading(true);

                // URLSearchParams দিয়ে query string বানাও
                // empty value গুলো automatically skip হয়
                const params = new URLSearchParams();
                if (debouncedSearch) params.set("search", debouncedSearch);
                if (category) params.set("category", category);
                if (tone) params.set("tone", tone);
                params.set("sort", sort);
                params.set("page", String(page));
                params.set("limit", String(limit));

                const res = await axiosSecure.get(`/lessons/public?${params.toString()}`);
                const data = res.data;

                const list = Array.isArray(data?.lessons) ? data.lessons : [];
                const pag = data?.pagination || null;

                if (!cancelled) {
                    setLessons(list);
                    setPagination(
                        pag || { total: list.length, page, limit, totalPages: 1 }
                    );
                }
            } catch (error) {
                console.error("GET /lessons/public error:", error);
                if (!cancelled) {
                    setLessons([]);
                    setPagination({ total: 0, page: 1, limit, totalPages: 1 });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchLessons();
        return () => { cancelled = true; };
        // ↑ cleanup — unmount হলে cancelled = true
    }, [axiosSecure, debouncedSearch, category, tone, sort, page]);
    // ↑ এই dependency গুলো change হলে re-fetch করো

    const resetFilters = () => {
        setSearch("");
        setCategory("");
        setTone("");
        setSort("newest");
        setPage(1);
        // ↑ সব কিছু default এ ফিরিয়ে দাও
    };

    const totalPages = Math.max(1, pagination.totalPages || 1);

    // Smart pagination — current page এর আশেপাশে max 5টা button দেখাও
    const pageNumbers = useMemo(() => {
        const current = page;
        const maxButtons = 5;

        let start = Math.max(1, current - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxButtons + 1);
        }
        // ↑ শেষ page এ গেলে start adjust করো

        const arr = [];
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
    }, [page, totalPages]);

    if (loading) return <Spinner />;

    return (
        <div className="min-h-screen bg-base-100">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-semibold text-base-content text-center mb-2">
                        Browse Public Life Lessons
                    </h1>
                    <p className="text-sm text-base-content/70 text-center max-w-2xl mx-auto">
                        Discover real-life experiences, reflections and wisdom shared by the community.
                    </p>

                    {!isPremiumUser && (
                        <p className="mt-3 text-[11px] text-center inline-block mx-auto px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            Some lessons are Premium only – upgrade to unlock full access.
                        </p>
                        // ↑ non-premium user কে upgrade hint দেখাও
                    )}
                </header>

                {/* Search + Filter + Sort */}
                <div className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-base-content">Search</label>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                // ↑ search state update — debounce এ যাবে
                                placeholder="Search by title / keyword..."
                                className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-base-content">Category</label>
                            <select
                                className="select select-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">All</option>
                                {categories.filter(Boolean).map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                                {/* ↑ lessons থেকে বের করা unique categories */}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-base-content">Emotional Tone</label>
                            <select
                                className="select select-bordered w-full mt-1 bg-base-100 text-base-content border-base-300"
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                            >
                                <option value="">All</option>
                                {tones.filter(Boolean).map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-base-content">Sort</label>
                            <select
                                className="select select-sm select-bordered bg-base-100 text-base-content border-base-300"
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
                    <p className="text-sm text-base-content/70 text-center mt-10">
                        No public lessons found.
                    </p>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 gap-5">
                            {lessons.map((lesson) => (
                                <LessonCard
                                    key={lesson._id}
                                    lesson={lesson}
                                    isPremiumUser={isPremiumUser}
                                // ↑ card এ premium lock দেখানোর জন্য pass করো
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs text-base-content/60">
                                Page <span className="font-semibold">{page}</span> of{" "}
                                <span className="font-semibold">{totalPages}</span> • Total{" "}
                                <span className="font-semibold">{pagination.total}</span>
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    className="btn btn-sm btn-outline"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Prev
                                </button>

                                {/* প্রথম page টা range এর বাইরে থাকলে আলাদা দেখাও */}
                                {pageNumbers[0] > 1 && (
                                    <>
                                        <button className="btn btn-sm btn-outline" onClick={() => setPage(1)}>
                                            1
                                        </button>
                                        <span className="text-base-content/40 px-1">…</span>
                                    </>
                                )}

                                {pageNumbers.map((p) => (
                                    <button
                                        key={p}
                                        className={`btn btn-sm ${p === page ? "btn-active" : "btn-outline"}`}
                                        // ↑ current page → btn-active, বাকি → btn-outline
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}

                                {/* শেষ page টা range এর বাইরে থাকলে আলাদা দেখাও */}
                                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                                    <>
                                        <span className="text-base-content/40 px-1">…</span>
                                        <button className="btn btn-sm btn-outline" onClick={() => setPage(totalPages)}>
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button
                                    className="btn btn-sm btn-outline"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PublicLessons;