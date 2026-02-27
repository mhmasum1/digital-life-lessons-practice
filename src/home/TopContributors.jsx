const TopContributors = ({ contributors }) => {
    const safe = Array.isArray(contributors) ? contributors : [];

    return (
        <section className="py-12 bg-base-100">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-base-content">Top Contributors</h2>
                        <p className="text-sm text-base-content/70 mt-1">
                            Most active members sharing real stories.
                        </p>
                    </div>
                    <p className="text-xs text-base-content/60">Top 6</p>
                </div>

                {safe.length === 0 ? (
                    <div className="rounded-2xl border border-base-300 bg-base-200/40 p-6">
                        <p className="text-sm text-base-content/80">No contributors yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {safe.map((user) => {
                            const name = user.name || "Unknown";
                            const photo = user.photoURL || user.avatar || "";
                            const email = user.email || user._id || "";
                            const lessons = user.totalLessons ?? user.lessonsCount ?? 0;
                            const saves = user.totalSaves ?? 0;

                            return (
                                <div
                                    key={user._id}
                                    className="rounded-2xl border border-base-300 bg-base-200/40 p-5 shadow-sm hover:shadow-md transition"
                                >
                                    <div className="flex items-center gap-3">
                                        {photo ? (
                                            <img
                                                src={photo}
                                                alt={name}
                                                className="h-11 w-11 rounded-full object-cover border border-base-300"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="h-11 w-11 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
                                                {(name?.[0] || "U").toUpperCase()}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-base-content truncate">
                                                {name}
                                            </p>
                                            <p className="text-xs text-base-content/60 truncate">{email}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4 flex-wrap">
                                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-base-100 text-base-content border border-base-300 font-semibold">
                                            {lessons} lessons
                                        </span>
                                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-base-100 text-base-content border border-base-300 font-semibold">
                                            {saves} saves
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TopContributors;