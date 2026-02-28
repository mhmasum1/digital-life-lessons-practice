import { Outlet, Link } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="w-full max-w-md bg-base-100 shadow-xl rounded-2xl border border-base-300">

                <Link
                    to="/"
                    className="block text-center font-bold text-2xl pt-5 text-base-content
                    transition-all duration-200
                    hover:text-primary hover:-translate-y-0.5"
                >
                    Digital Life Lessons
                </Link>

                <div className="p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;