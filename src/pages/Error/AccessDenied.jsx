import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const AccessDenied = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-white px-4">
            <div className="max-w-md w-full bg-white border border-orange-100 rounded-2xl shadow-lg p-8 text-center">

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                        <ShieldAlert className="h-8 w-8 text-orange-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Access Denied
                </h1>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6">
                    You don’t have permission to view this page.
                    Please make sure you are logged in with the correct account.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="px-5 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                    >
                        Go Home
                    </Link>

                    <Link
                        to="/login"
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                    >
                        Login Again
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
