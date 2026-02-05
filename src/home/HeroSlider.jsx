import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Learn Life's Most Valuable Lessons",
            subtitle: "Discover wisdom from real experiences shared by people around the world",
            bg: "from-orange-500 via-rose-500 to-pink-500",
            cta: "/lessons",
        },
        {
            title: "Share Your Story, Inspire Others",
            subtitle: "Your life experiences can guide someone through their journey",
            bg: "from-purple-500 via-fuchsia-500 to-indigo-500",
            cta: "/dashboard/add-lesson",
        },
        {
            title: "Build Better Habits, Transform Your Life",
            subtitle: "Access practical lessons that make a real difference in daily living",
            bg: "from-sky-500 via-cyan-500 to-emerald-500",
            cta: "/lessons",
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <section className="relative overflow-hidden">
            <div className="relative h-[420px] md:h-[520px]">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <div className={`h-full bg-linear-to-r ${slide.bg} relative`}>
                            <div className="absolute inset-0 bg-black/25" />

                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage:
                                        "radial-gradient(circle at 1px 1px, rgba(255,255,255,.35) 1px, transparent 0)",
                                    backgroundSize: "22px 22px",
                                }}
                            />

                            <div className="relative h-full max-w-6xl mx-auto px-4 flex items-center">
                                <div className="w-full md:w-[720px] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 md:p-10 shadow-xl">
                                    <p className="text-white/90 text-xs md:text-sm tracking-widest uppercase mb-3">
                                        Digital Life Lessons
                                    </p>

                                    <h1 className="text-white text-3xl md:text-5xl font-extrabold leading-tight">
                                        {slide.title}
                                    </h1>

                                    <p className="mt-4 text-white/90 text-sm md:text-lg leading-relaxed">
                                        {slide.subtitle}
                                    </p>

                                    <div className="mt-7 flex flex-wrap gap-3">
                                        <Link
                                            to={slide.cta}
                                            className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
                                        >
                                            Explore Lessons
                                        </Link>

                                        <Link
                                            to="/pricing"
                                            className="px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/15 transition"
                                        >
                                            Go Premium
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/40 backdrop-blur text-white p-3 rounded-full transition"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={22} />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/40 backdrop-blur text-white p-3 rounded-full transition"
                    aria-label="Next slide"
                >
                    <ChevronRight size={22} />
                </button>

                {/* dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2.5 rounded-full transition-all ${index === currentSlide ? "bg-white w-9" : "bg-white/60 w-2.5"
                                }`}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSlider;
