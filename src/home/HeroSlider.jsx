import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import hero1 from "../assets/hero/hero1.webp";
import hero2 from "../assets/hero/hero2.webp";
import hero3 from "../assets/hero/hero3.webp";


const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = useMemo(
        () => [
            {
                title: "Learn Life's Most Valuable Lessons",
                subtitle:
                    "Discover wisdom from real experiences shared by people around the world.",
                image: hero1,
                cta: "/lessons",
            },
            {
                title: "Share Your Story, Inspire Others",
                subtitle:
                    "Your life experiences can guide someone through their journey.",
                image: hero2,
                cta: "/dashboard/add-lesson",
            },
            {
                title: "Build Better Habits, Transform Your Life",
                subtitle:
                    "Access practical lessons that make a real difference in daily living.",
                image: hero3,
                cta: "/lessons",
            },
        ],
        []
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative h-[420px] sm:h-[520px] lg:h-[620px]">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                            }`}
                    >
                        <div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${slide.image})` }}
                        >
                            <div className="absolute inset-0 bg-black/50" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />

                            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                                <div className="max-w-3xl text-white text-center">
                                    <p className="mb-3 text-xs sm:text-sm uppercase tracking-[0.3em] text-white/80">
                                        Digital Life Lessons
                                    </p>

                                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight">
                                        {slide.title}
                                    </h1>

                                    <p className="mt-5 text-sm sm:text-base lg:text-xl text-white/85 leading-relaxed max-w-2xl mx-auto">
                                        {slide.subtitle}
                                    </p>

                                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                        <Link
                                            to={slide.cta}
                                            className="btn btn-primary rounded-xl px-6 sm:px-8"
                                        >
                                            Explore Lessons
                                        </Link>

                                        <Link
                                            to="/pricing"
                                            className="btn btn-outline rounded-xl px-6 sm:px-8 text-white border-white hover:bg-white hover:text-black"
                                        >
                                            Go Premium
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={prevSlide}
                    className="absolute left-3 sm:left-5 lg:left-10 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur p-3 text-white transition"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={22} />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-3 sm:right-5 lg:right-10 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur p-3 text-white transition"
                    aria-label="Next slide"
                >
                    <ChevronRight size={22} />
                </button>

                <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide
                                ? "bg-white w-10"
                                : "bg-white/60 w-2.5"
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