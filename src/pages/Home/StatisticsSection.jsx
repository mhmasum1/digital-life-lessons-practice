const StatisticsSection = ({ stats }) => {
    const items = [
        {
            id: 1,
            title: "Total Lessons",
            value: stats?.totalLessons || 0,
            suffix: "+",
        },
        {
            id: 2,
            title: "Public Lessons",
            value: stats?.publicLessons || 0,
            suffix: "+",
        },
        {
            id: 3,
            title: "Total Contributors",
            value: stats?.totalContributors || 0,
            suffix: "+",
        },
        {
            id: 4,
            title: "Total Users",
            value: stats?.totalUsers || 0,
            suffix: "+",
        },
    ];

    return (
        <section className="py-12 bg-base-100">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-base-content">
                        Platform Statistics
                    </h2>
                    <p className="text-sm text-base-content/70 mt-1">
                        Real numbers showing our growing learning community.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-base-300 bg-base-200/40 p-5 shadow-sm hover:shadow-md transition text-center"
                        >
                            <h3 className="text-2xl md:text-3xl font-bold text-primary">
                                {item.value}
                                {item.suffix}
                            </h3>
                            <p className="mt-2 text-sm text-base-content/70 font-medium">
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatisticsSection;