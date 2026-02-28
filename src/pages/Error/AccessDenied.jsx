import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const AccessDenied = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="max-w-md w-full bg-base-100 border border-base-300 rounded-2xl shadow-lg p-8 text-center">

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-error/15 flex items-center justify-center">
                        <ShieldAlert className="h-8 w-8 text-error" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-base-content mb-2">
                    Access Denied
                </h1>

                {/* Description */}
                <p className="text-sm text-base-content/70 mb-6">
                    You don’t have permission to view this page.
                    Please make sure you are logged in with the correct account.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/" className="btn btn-primary btn-sm">
                        Go Home
                    </Link>

                    <Link to="/auth/login" className="btn btn-outline btn-sm">
                        Login Again
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;