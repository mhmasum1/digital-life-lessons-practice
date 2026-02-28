import { Link } from "react-router-dom";

const About = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center">
                <p className="text-sm font-semibold text-primary tracking-wide">ABOUT</p>

                <h1 className="text-3xl md:text-4xl font-extrabold text-base-content mt-2">
                    Digital Life Lessons
                </h1>

                <p className="text-base-content/70 mt-4 max-w-2xl mx-auto leading-relaxed">
                    A simple platform to capture life experiences as lessons, keep them organized, and
                    share meaningful wisdom with the community.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link to="/lessons" className="btn btn-primary">
                        Explore Public Lessons
                    </Link>
                    <Link to="/dashboard/add-lesson" className="btn btn-outline btn-primary">
                        Create a Lesson
                    </Link>
                </div>
            </div>

            {/* Mission / Vision */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-base-content">Mission</h2>
                    <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
                        Help people preserve personal wisdom through reflection and structured life lessons—so
                        valuable insights aren’t lost over time.
                    </p>
                </div>

                <div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-base-content">Vision</h2>
                    <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
                        Build a respectful community where lessons are shared without judgment and learning
                        becomes a daily habit.
                    </p>
                </div>
            </div>

            {/* Key points */}
            <div className="mt-10 rounded-xl border border-base-300 bg-base-200 p-6">
                <h3 className="font-bold text-base-content">What you can do here</h3>
                <ul className="mt-3 space-y-2 text-sm text-base-content/80">
                    <li>• Create lessons with category and emotional tone</li>
                    <li>• Keep lessons private or share them publicly</li>
                    <li>• Save favorites and engage with reactions/comments</li>
                    <li>• Upgrade to Premium to access premium lessons</li>
                </ul>
            </div>

            {/* Quote */}
            <div className="mt-10 text-center">
                <p className="text-sm text-base-content/70">
                    “Growth begins with reflection. Wisdom grows when it is shared.”
                </p>
            </div>
        </div>
    );
};

export default About;