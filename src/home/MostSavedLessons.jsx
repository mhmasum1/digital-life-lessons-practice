const MostSavedLessons = ({ lessons }) => {
    const safeLessons = Array.isArray(lessons) ? lessons : [];

    return (
        <section className="py-12 bg-[#FFF7ED]">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">Most Saved Lessons</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            The lessons people return to again and again.
                        </p>
                    </div>
                    <p className="text-xs text-gray-500">Trending</p>
                </div>

                {safeLessons.length === 0 ? (
                    <div className="rounded-2xl border border-orange-100 bg-white p-6">
                        <p className="text-sm text-gray-700">
                            No saved lessons yet. Encourage users to bookmark their favorite stories.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-3">
                        {safeLessons.map((lesson) => (
                            <div
                                key={lesson._id}
                                className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-semibold">
                                        {lesson.category || "Life Lesson"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {lesson.savedCount ?? lesson.savesCount ?? 0} saves
                                    </span>
                                </div>

                                <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                                    {lesson.title}
                                </h3>

                                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                                    {lesson.shortDescription || lesson.summary || "—"}
                                </p>

                                <p className="text-xs text-gray-500 mt-4">
                                    By {lesson.creatorName || lesson.contributorName || "Anonymous"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MostSavedLessons;
