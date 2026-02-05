const benefits = [
    {
        id: 1,
        title: "Save time and pain",
        text: "Learn from others’ mistakes so you don’t have to repeat them in your own life.",
    },
    {
        id: 2,
        title: "Context, not theory",
        text: "Stories give you real situations, emotions and decisions – not just abstract tips.",
    },
    {
        id: 3,
        title: "Remember better",
        text: "We remember stories far longer than checklists, so lessons stay with you when you need them.",
    },
    {
        id: 4,
        title: "Grow your perspective",
        text: "See how different people handled career, money and relationships and expand your own options.",
    },
];

const WhyLearningMatters = () => {
    return (
        <section className="py-12 bg-[#FFF7ED]">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-semibold text-gray-900">
                        Why Learning From Life Matters
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 max-w-2xl mx-auto">
                        Life does not come with a handbook, but people’s stories are the closest thing to it.
                        When you collect lessons, you collect shortcuts.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-4">
                    {benefits.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm hover:shadow-md transition"
                        >
                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyLearningMatters;
