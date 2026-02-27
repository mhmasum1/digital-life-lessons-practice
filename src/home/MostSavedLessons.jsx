import { Link } from "react-router-dom";

const MostSavedLessons = ({ lessons }) => {
    const safeLessons = Array.isArray(lessons) ? lessons : [];

    return (
        <section className="py-12 bg-base-200">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-base-content">Most Saved Lessons</h2>
                        <p className="text-sm text-base-content/70 mt-1">
                            The lessons people return to again and again.
                        </p>
                    </div>
                    <p className="text-xs text-base-content/60">Trending</p>
                </div>

                {safeLessons.length === 0 ? (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
                        <p className="text-sm text-base-content/80">
                            No saved lessons yet. Encourage users to bookmark their favorite stories.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {safeLessons.map((lesson) => (
                            <div
                                key={lesson._id}
                                className="rounded-2xl bg-base-100 border border-base-300 p-5 shadow-sm hover:shadow-md transition flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-base-100 text-base-content border border-base-300 font-semibold">
                                        {lesson.category || "Life Lesson"}
                                    </span>
                                    <span className="text-xs text-base-content/60">
                                        {lesson.savedCount ?? lesson.savesCount ?? 0} saves
                                    </span>
                                </div>

                                <h3 className="text-base font-semibold text-base-content line-clamp-2">
                                    {lesson.title}
                                </h3>

                                <p className="text-sm text-base-content/70 mt-2 line-clamp-3">
                                    {lesson.shortDescription || lesson.summary || "—"}
                                </p>

                                <p className="text-xs text-base-content/60 mt-4">
                                    By {lesson.creatorName || lesson.contributorName || "Anonymous"}
                                </p>

                                <Link
                                    to={`/lessons/${lesson._id}`}
                                    className="btn btn-primary btn-sm w-full mt-4"
                                >
                                    Details
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MostSavedLessons;