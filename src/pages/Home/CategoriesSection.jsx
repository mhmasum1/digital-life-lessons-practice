import { useEffect, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const CategoriesSection = () => {
    const axiosSecure = useAxiosSecure();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axiosSecure
            .get("/stats/categories")
            .then((res) => setCategories(res.data?.categories || []))
            .catch(() => setCategories([]));
    }, [axiosSecure]);

    return (
        <section className="py-12 bg-base-100">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-base-content">
                        Browse by Category
                    </h2>
                    <p className="text-sm text-base-content/70 mt-1">
                        Discover lessons by topics that matter to you.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {categories.map((cat, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-base-300 bg-base-200/40 p-5 shadow-sm hover:shadow-md transition"
                        >
                            <h3 className="text-lg font-semibold text-base-content">
                                {cat._id}
                            </h3>

                            <p className="text-sm text-base-content/70 mt-1">
                                {cat.totalLessons} lessons
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoriesSection;