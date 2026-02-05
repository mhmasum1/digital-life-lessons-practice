import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useRole from "../../hooks/useRole";
import useUserInfo from "../../hooks/useUserInfo";

const NavBar = () => {
    const { user, logOut } = useAuth();
    const { role, roleLoading } = useRole();
    const { isPremium, loadingUser } = useUserInfo();
    const navigate = useNavigate();

    const isAdmin = !!user && !roleLoading && role === "admin";

    const linkClass = ({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-orange-600" : "text-gray-700 hover:text-orange-600"
        }`;

    const goProtected = (path) => {
        if (!user?.email) return navigate("/login");
        navigate(path);
    };

    const handleLogOut = async () => {
        try {
            await logOut();
            navigate("/login");
        } catch (err) {
            console.log(err);
        }
    };

    const avatarLetter = (user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase();

    return (
        <div className="navbar bg-base-100 shadow-sm px-3">
            {/* LEFT: logo + mobile menu */}
            <div className="navbar-start">
                {/* Mobile dropdown */}
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden btn-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>

                    {/* Mobile menu items */}
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-60 p-2 shadow">
                        <li>
                            <NavLink to="/" end className={linkClass}>
                                Home
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/lessons" className={linkClass}>
                                Public Lessons
                            </NavLink>
                        </li>

                        {/* USER links */}
                        {user && !isAdmin && (
                            <>
                                <li>
                                    <button
                                        className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                        onClick={() => goProtected("/pricing")}
                                    >
                                        Pricing / Upgrade
                                    </button>
                                </li>

                                <li>
                                    <button
                                        className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                        onClick={() => goProtected("/dashboard/add-lesson")}
                                    >
                                        Add Lesson
                                    </button>
                                </li>

                                <li>
                                    <button
                                        className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                        onClick={() => goProtected("/dashboard/my-lessons")}
                                    >
                                        My Lessons
                                    </button>
                                </li>

                                <li>
                                    <button
                                        className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                        onClick={() => goProtected("/dashboard")}
                                    >
                                        Dashboard
                                    </button>
                                </li>
                            </>
                        )}

                        {/* ADMIN links */}
                        {user && isAdmin && (
                            <li>
                                <button
                                    className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                    onClick={() => goProtected("/dashboard/admin")}
                                >
                                    Admin Dashboard
                                </button>
                            </li>
                        )}
                    </ul>
                </div>

                <Link to="/" className="btn btn-ghost text-xl">
                    DIG LIFE
                </Link>
            </div>

            {/* CENTER: desktop menu */}
            <div className="navbar-center hidden lg:flex">
                <ul className="flex items-center gap-1">
                    <li>
                        <NavLink to="/" end className={linkClass}>
                            Home
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/lessons" className={linkClass}>
                            Public Lessons
                        </NavLink>
                    </li>

                    {/* USER links */}
                    {user && !isAdmin && (
                        <>
                            <li>
                                <button
                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                    onClick={() => goProtected("/pricing")}
                                >
                                    Pricing / Upgrade
                                </button>
                            </li>

                            <li>
                                <button
                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                    onClick={() => goProtected("/dashboard/add-lesson")}
                                >
                                    Add Lesson
                                </button>
                            </li>

                            <li>
                                <button
                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                    onClick={() => goProtected("/dashboard/my-lessons")}
                                >
                                    My Lessons
                                </button>
                            </li>

                            <li>
                                <button
                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                    onClick={() => goProtected("/dashboard")}
                                >
                                    Dashboard
                                </button>
                            </li>
                        </>
                    )}

                    {/* ADMIN links */}
                    {user && isAdmin && (
                        <li>
                            <button
                                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                onClick={() => goProtected("/dashboard/admin")}
                            >
                                Admin Dashboard
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            {/* RIGHT: badges + auth */}
            <div className="navbar-end gap-2">
                {/* Premium badge only for normal user */}
                {user && !isAdmin && !loadingUser && isPremium && (
                    <div className="badge badge-warning gap-1 px-2 py-1 text-xs">
                        <span>⭐</span>
                        <span className="font-semibold">Premium</span>
                    </div>
                )}

                {/* Admin badge */}
                {user && isAdmin && (
                    <div className="badge badge-error px-2 py-1 text-xs text-white font-semibold">
                        Admin
                    </div>
                )}

                {/* If not logged in */}
                {!user ? (
                    <div className="flex items-center gap-2">
                        <Link className="btn btn-primary btn-sm" to="/login">
                            Login
                        </Link>
                        <Link className="btn btn-outline btn-sm" to="/register">
                            Signup
                        </Link>
                    </div>
                ) : (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm flex items-center gap-2">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="avatar"
                                    className="w-9 h-9 rounded-full object-cover border"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full border flex items-center justify-center font-semibold">
                                    {avatarLetter}
                                </div>
                            )}
                            <span className="hidden md:inline text-sm font-semibold">
                                {user?.displayName || (isAdmin ? "Admin" : "User")}
                            </span>
                        </div>

                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-64 p-3 shadow">
                            <li className="px-2 py-1">
                                <p className="font-semibold">{user?.displayName || (isAdmin ? "Admin" : "User")}</p>
                                <p className="text-xs opacity-60">{user?.email}</p>
                            </li>

                            <div className="divider my-1" />

                            {/* Profile */}
                            <li>
                                <button
                                    onClick={() =>
                                        navigate(isAdmin ? "/dashboard/admin/profile" : "/dashboard/profile")
                                    }
                                >
                                    {isAdmin ? "Admin Profile" : "Profile"}
                                </button>
                            </li>

                            {/* Dashboard */}
                            <li>
                                <button
                                    disabled={roleLoading}
                                    onClick={() => navigate(isAdmin ? "/dashboard/admin" : "/dashboard")}
                                >
                                    {isAdmin ? "Admin Dashboard" : "Dashboard"}
                                </button>
                            </li>

                            <div className="divider my-1" />

                            <li>
                                <button onClick={handleLogOut} className="text-red-600">
                                    Log out
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NavBar;
