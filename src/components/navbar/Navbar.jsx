import React from "react";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useRole from "../../hooks/useRole";
import useUserInfo from "../../hooks/useUserInfo";

const NavBar = () => {
    const { user, logOut } = useAuth();
    const { role, roleLoading } = useRole();
    const { isPremium, loadingUser } = useUserInfo();

    const handleLogOut = async () => {
        try {
            await logOut();
        } catch (error) {
            console.log(error);
        }
    };

    // ✅ decide dashboard path based on role
    const dashboardPath = role === "admin" ? "/dashboard/admin-home" : "/dashboard";

    const commonLinks = (
        <>
            <li>
                <NavLink to="/" end>
                    Home
                </NavLink>
            </li>
            <li>
                <NavLink to="/lessons">Lessons</NavLink>
            </li>
            <li>
                <NavLink to="/pricing">Pricing</NavLink>
            </li>
        </>
    );

    const userLinks = (
        <>
            <li>
                <NavLink to={dashboardPath}>Dashboard</NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/favorites">Favorites</NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/my-lessons">My Lessons</NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/add-lesson">Add Lesson</NavLink>
            </li>
        </>
    );

    const adminLinks = (
        <>
            <li>
                <NavLink to="/dashboard/admin-home">Admin Home</NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/manage-users">Manage Users</NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/manage-lessons">Manage Lessons</NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/reported-lessons">Reported Lessons</NavLink>
            </li>
        </>
    );

    const links = (
        <>
            {commonLinks}

            {user && (
                <>
                    {/* role loading থাকলে menu flicker avoid */}
                    {!roleLoading && role === "admin" ? adminLinks : userLinks}
                </>
            )}
        </>
    );

    return (
        <div className="navbar bg-base-100 shadow-sm px-2">
            {/* left */}
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
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
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-64 p-2 shadow"
                    >
                        {links}
                    </ul>
                </div>

                {/* logo */}
                <Link to="/" className="btn btn-ghost text-xl">
                    DIG LIFE
                </Link>
            </div>

            {/* center */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">{links}</ul>
            </div>

            {/* right */}
            <div className="navbar-end gap-3">
                {/* ✅ Premium badge */}
                {user && !loadingUser && isPremium && (
                    <div className="badge badge-warning gap-1">
                        <span>⭐</span>
                        <span className="font-semibold">Premium</span>
                    </div>
                )}

                {/* ✅ Admin badge */}
                {user && !roleLoading && role === "admin" && (
                    <div className="badge badge-info font-semibold">Admin</div>
                )}

                {/* Avatar */}
                {user && (
                    <div className="flex items-center gap-2">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="profile"
                                className="w-10 h-10 rounded-full object-cover border"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    e.currentTarget.src = "https://i.ibb.co/4pDNDk1/avatar.png";
                                }}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full border flex items-center justify-center font-semibold">
                                {(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                            </div>
                        )}

                        <div className="hidden sm:block leading-tight">
                            <p className="text-sm font-semibold">{user?.displayName || "User"}</p>
                            <p className="text-xs opacity-60">{user?.email}</p>
                        </div>
                    </div>
                )}

                {/* Auth buttons */}
                {user ? (
                    <button onClick={handleLogOut} className="btn btn-outline">
                        Log Out
                    </button>
                ) : (
                    <Link className="btn" to="/login">
                        Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default NavBar;
