import { Link } from "react-router-dom";

const FeaturedLessons = ({ lessons }) => {
    const safeLessons = Array.isArray(lessons) ? lessons : [];

    return (
        <section className="py-12 bg-base-100">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-base-content">
                            Featured Life Lessons
                        </h2>
                        <p className="text-sm text-base-content/70 mt-1">
                            Curated by our team from the most impactful stories.
                        </p>
                    </div>
                    <p className="text-xs text-base-content/60">Handpicked</p>
                </div>

                {safeLessons.length === 0 ? (
                    <div className="rounded-2xl border border-base-300 bg-base-200/40 p-6">
                        <p className="text-sm text-base-content/80">
                            No featured lessons yet. Admin can feature lessons from the
                            dashboard.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {safeLessons.map((lesson) => (
                            <div
                                key={lesson._id}
                                className="rounded-2xl border border-base-300 bg-base-200/40 p-5 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-base-100 text-base-content border border-base-300 font-semibold">
                                        {lesson.category || "Life Lesson"}
                                    </span>

                                    {lesson.accessLevel === "premium" ? (
                                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-base-100 text-base-content border border-base-300 font-semibold">
                                            Premium
                                        </span>
                                    ) : null}
                                </div>

                                <h3 className="text-base font-semibold text-base-content line-clamp-2">
                                    {lesson.title}
                                </h3>

                                <p className="text-sm text-base-content/70 mt-2 line-clamp-3">
                                    {lesson.shortDescription || lesson.summary || "—"}
                                </p>

                                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-base-content/60">
                                    <span className="truncate">
                                        By {lesson.creatorName || lesson.contributorName || "Anonymous"}
                                    </span>
                                    <span>{lesson.savedCount ?? lesson.savesCount ?? 0} saves</span>
                                </div>

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

export default FeaturedLessons;