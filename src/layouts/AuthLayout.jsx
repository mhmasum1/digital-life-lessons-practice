import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="flex items-center justify-center bg-base-200 px-4">
            <div className="w-full  bg-base-100 shadow-xl rounded-xl ">

                <Link to="/" className="block text-center font-bold text-2xl pt-5
             transition-all duration-200
             hover:text-orange-700 hover:-translate-y-0.5">
                    Digital Life Lessons
                </Link>

                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
