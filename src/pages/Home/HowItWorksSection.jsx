const steps = [
    {
        id: 1,
        title: "Explore Real Lessons",
        description:
            "Browse meaningful life lessons shared by real people across different categories.",
    },
    {
        id: 2,
        title: "Learn From Experience",
        description:
            "Read practical insights from success, failure, habits, study, finance, and relationships.",
    },
    {
        id: 3,
        title: "Save What Matters",
        description:
            "Bookmark valuable lessons so you can come back to them whenever you need guidance.",
    },
    {
        id: 4,
        title: "Share Your Story",
        description:
            "Contribute your own life lesson and help others grow through your experience.",
    },
];

const HowItWorksSection = () => {
    return (
        <section className="py-12 bg-base-100">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-base-content">
                        How It Works
                    </h2>
                    <p className="text-sm text-base-content/70 mt-1 max-w-2xl mx-auto">
                        Digital Life Lessons helps people learn from real-life
                        experiences in a simple and meaningful way.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className="rounded-2xl border border-base-300 bg-base-200/40 p-5 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-content text-sm font-bold mb-4">
                                {step.id}
                            </div>

                            <h3 className="text-lg font-semibold text-base-content">
                                {step.title}
                            </h3>

                            <p className="text-sm text-base-content/70 mt-2 leading-6">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;