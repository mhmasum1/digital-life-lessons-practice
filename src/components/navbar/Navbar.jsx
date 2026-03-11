import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useRole from "../../hooks/useRole";
import useUserInfo from "../../hooks/useUserInfo";
import logo from "../../assets/Logo.webp";

const NavBar = () => {
    const { user, logOut } = useAuth();
    const { role, roleLoading } = useRole();
    const { isPremium, loadingUser } = useUserInfo();
    const navigate = useNavigate();

    const isAdmin = !!user && !roleLoading && role === "admin";

    const linkClass = ({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition ${isActive
            ? "text-primary"
            : "text-base-content/70 hover:text-primary"
        }`;

    const actionBtnClass =
        "px-3 py-2 text-sm font-medium text-base-content/70 hover:text-primary transition";

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

    const avatarLetter = (
        user?.displayName?.[0] ||
        user?.email?.[0] ||
        "U"
    ).toUpperCase();

    const handleToggleTheme = () => {
        const root = document.documentElement;
        const current = root.getAttribute("data-theme") || "light";
        const next = current === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    };

    const savedTheme =
        (typeof window !== "undefined" && localStorage.getItem("theme")) || "light";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/95 backdrop-blur">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="min-h-16 sm:min-h-[72px] grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center">
                    <div className="min-w-0 flex items-center justify-start">
                        <div className="dropdown lg:hidden">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-sm px-2 mr-1"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h8m-8 6h16"
                                    />
                                </svg>
                            </div>

                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content mt-3 z-[60] w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow"
                            >
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

                                <li>
                                    <NavLink to="/contact" className={linkClass}>
                                        Contact Us
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/about" className={linkClass}>
                                        About
                                    </NavLink>
                                </li>

                                {user && !isAdmin && (
                                    <>
                                        <li>
                                            <button
                                                className={actionBtnClass}
                                                onClick={() => goProtected("/pricing")}
                                            >
                                                Pricing
                                            </button>
                                        </li>

                                        <li>
                                            <button
                                                className={actionBtnClass}
                                                onClick={() =>
                                                    goProtected("/dashboard/add-lesson")
                                                }
                                            >
                                                Add Lesson
                                            </button>
                                        </li>

                                        <li>
                                            <button
                                                className={actionBtnClass}
                                                onClick={() =>
                                                    goProtected("/dashboard/my-lessons")
                                                }
                                            >
                                                My Lessons
                                            </button>
                                        </li>

                                        <li>
                                            <button
                                                className={actionBtnClass}
                                                onClick={() => goProtected("/dashboard")}
                                            >
                                                Dashboard
                                            </button>
                                        </li>
                                    </>
                                )}

                                {user && isAdmin && (
                                    <li>
                                        <button
                                            className={actionBtnClass}
                                            onClick={() => goProtected("/dashboard/admin")}
                                        >
                                            Admin Dashboard
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <Link to="/" className="flex items-center gap-2 min-w-0">
                            <img
                                src={logo}
                                alt="Digital Life Lessons"
                                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain shrink-0"
                            />
                            <span className="hidden sm:block text-base lg:text-lg font-bold tracking-tight text-base-content whitespace-nowrap">
                                Digital Life <span className="text-primary">Lessons</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center justify-center">
                        <ul className="flex items-center gap-1 xl:gap-2">
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

                            <li>
                                <NavLink to="/contact" className={linkClass}>
                                    Contact Us
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to="/about" className={linkClass}>
                                    About
                                </NavLink>
                            </li>

                            {user && !isAdmin && (
                                <>
                                    <li>
                                        <button
                                            className={actionBtnClass}
                                            onClick={() => goProtected("/pricing")}
                                        >
                                            Pricing
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            className={actionBtnClass}
                                            onClick={() =>
                                                goProtected("/dashboard/add-lesson")
                                            }
                                        >
                                            Add Lesson
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            className={actionBtnClass}
                                            onClick={() =>
                                                goProtected("/dashboard/my-lessons")
                                            }
                                        >
                                            My Lessons
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            className={actionBtnClass}
                                            onClick={() => goProtected("/dashboard")}
                                        >
                                            Dashboard
                                        </button>
                                    </li>
                                </>
                            )}

                            {user && isAdmin && (
                                <li>
                                    <button
                                        className={actionBtnClass}
                                        onClick={() => goProtected("/dashboard/admin")}
                                    >
                                        Admin Dashboard
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleToggleTheme}
                            className="btn btn-outline btn-xs sm:btn-sm"
                            aria-label="Toggle theme"
                            title="Toggle theme"
                        >
                            <span className="hidden sm:inline">Theme</span>
                            <span className="sm:hidden">🌓</span>
                        </button>

                        {user && !isAdmin && !loadingUser && isPremium && (
                            <div className="badge badge-warning gap-1 px-2 py-1 text-xs">
                                <span>⭐</span>
                            </div>
                        )}

                        {user && isAdmin && (
                            <div className="badge badge-error px-2 py-1 text-xs text-white font-semibold">
                                Admin
                            </div>
                        )}

                        {!user ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                                <Link
                                    className="btn btn-primary btn-xs sm:btn-sm px-3 sm:px-4"
                                    to="/login"
                                >
                                    Login
                                </Link>
                                <Link
                                    className="btn btn-outline btn-xs sm:btn-sm px-3 sm:px-4"
                                    to="/register"
                                >
                                    Signup
                                </Link>
                            </div>
                        ) : (
                            <div className="dropdown dropdown-end">
                                <div
                                    tabIndex={0}
                                    role="button"
                                    className="btn btn-ghost btn-sm flex items-center gap-2 px-2 sm:px-3"
                                >
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="avatar"
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-base-300"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-base-300 flex items-center justify-center font-semibold">
                                            {avatarLetter}
                                        </div>
                                    )}

                                    <span className="hidden md:inline text-sm font-semibold text-base-content max-w-[120px] truncate">
                                        {user?.displayName || (isAdmin ? "Admin" : "User")}
                                    </span>
                                </div>

                                <ul
                                    tabIndex={0}
                                    className="menu menu-sm dropdown-content mt-3 z-[60] w-64 rounded-box border border-base-300 bg-base-100 p-3 shadow"
                                >
                                    <li className="px-2 py-1">
                                        <p className="font-semibold">
                                            {user?.displayName || (isAdmin ? "Admin" : "User")}
                                        </p>
                                        <p className="text-xs opacity-60 break-all">
                                            {user?.email}
                                        </p>
                                    </li>

                                    <div className="divider my-1" />

                                    <li>
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    isAdmin
                                                        ? "/dashboard/admin/profile"
                                                        : "/dashboard/profile"
                                                )
                                            }
                                        >
                                            {isAdmin ? "Admin Profile" : "Profile"}
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            disabled={roleLoading}
                                            onClick={() =>
                                                navigate(
                                                    isAdmin
                                                        ? "/dashboard/admin"
                                                        : "/dashboard"
                                                )
                                            }
                                        >
                                            {isAdmin ? "Admin Dashboard" : "Dashboard"}
                                        </button>
                                    </li>

                                    <div className="divider my-1" />

                                    <li>
                                        <button
                                            onClick={handleLogOut}
                                            className="text-error"
                                        >
                                            Log out
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {typeof window !== "undefined" &&
                        !document.documentElement.getAttribute("data-theme") && (
                            <script
                                dangerouslySetInnerHTML={{
                                    __html: `document.documentElement.setAttribute("data-theme", "${savedTheme}");`,
                                }}
                            />
                        )}
                </div>
            </div>
        </header>
    );
};

export default NavBar;