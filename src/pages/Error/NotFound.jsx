import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center px-4">
            <div className="w-full max-w-xl bg-white border border-orange-100 rounded-2xl p-8 shadow-sm text-center">
                <p className="text-sm font-semibold text-orange-600">404 ERROR</p>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                    Page not found
                </h1>

                <p className="text-sm text-gray-600 mt-3">
                    The page you’re looking for doesn’t exist or may have been moved.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/" className="btn bg-orange-500 hover:bg-orange-600 text-white">
                        Go Home
                    </Link>

                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-outline border-orange-200 text-gray-800 hover:bg-orange-50"
                    >
                        Go Back
                    </button>
                </div>

                <div className="mt-7 pt-5 border-t border-orange-100 text-xs text-gray-500">
                    If you think this is a mistake, please check the URL or contact support.
                </div>
            </div>
        </div>
    );
};

export default NotFound;
