const FeaturedLessons = ({ lessons }) => {
    const safeLessons = Array.isArray(lessons) ? lessons : [];

    return (
        <section className="py-12 bg-white">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">Featured Life Lessons</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Curated by our team from the most impactful stories.
                        </p>
                    </div>
                    <p className="text-xs text-gray-500">Handpicked</p>
                </div>

                {safeLessons.length === 0 ? (
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-6">
                        <p className="text-sm text-gray-700">
                            No featured lessons yet. Admin can feature lessons from the dashboard.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-3">
                        {safeLessons.map((lesson) => (
                            <div
                                key={lesson._id}
                                className="rounded-2xl border border-orange-100 bg-[#FFF7ED]/60 p-5 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-semibold">
                                        {lesson.category || "Life Lesson"}
                                    </span>

                                    {lesson.accessLevel === "premium" ? (
                                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-white text-orange-700 border border-orange-100 font-semibold">
                                            Premium
                                        </span>
                                    ) : null}
                                </div>

                                <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                                    {lesson.title}
                                </h3>

                                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                                    {lesson.shortDescription || lesson.summary || "—"}
                                </p>

                                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                                    <span className="truncate">
                                        By {lesson.creatorName || lesson.contributorName || "Anonymous"}
                                    </span>
                                    <span>{lesson.savedCount ?? lesson.savesCount ?? 0} saves</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedLessons;
