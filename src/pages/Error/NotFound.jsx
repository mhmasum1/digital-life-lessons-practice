import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
            <div className="w-full max-w-xl bg-base-100 border border-base-300 rounded-2xl p-8 shadow-sm text-center">

                <p className="text-sm font-semibold text-primary">404 ERROR</p>

                <h1 className="text-3xl md:text-4xl font-bold text-base-content mt-2">
                    Page not found
                </h1>

                <p className="text-sm text-base-content/70 mt-3">
                    The page you’re looking for doesn’t exist or may have been moved.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/" className="btn btn-primary">
                        Go Home
                    </Link>

                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-outline"
                    >
                        Go Back
                    </button>
                </div>

                <div className="mt-7 pt-5 border-t border-base-300 text-xs text-base-content/60">
                    If you think this is a mistake, please check the URL or contact support.
                </div>
            </div>
        </div>
    );
};

export default NotFound;