import { NavLink } from "react-router-dom";
import useAdmin from "../../hooks/useAdmin";

const Sidebar = () => {
    const { isAdmin, adminLoading } = useAdmin();

    if (adminLoading) return null;

    return (
        <div className="p-4 h-full bg-base-100 text-base-content">
            <h2 className="text-lg font-semibold mb-4">
                {isAdmin ? "Admin Dashboard" : "Dashboard Menu"}
            </h2>

            <ul className="menu menu-sm gap-1">

                {/* Common */}
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive ? "active text-primary font-semibold" : ""
                        }
                    >
                        ← Back to Home
                    </NavLink>
                </li>

                {!isAdmin ? (
                    <>
                        <li>
                            <NavLink to="/dashboard">User Home</NavLink>
                        </li>

                        <li>
                            <NavLink to="/dashboard/profile">Profile</NavLink>
                        </li>

                        <li>
                            <NavLink to="/dashboard/my-lessons">My Lessons</NavLink>
                        </li>

                        <li>
                            <NavLink to="/dashboard/add-lesson">Add Lesson</NavLink>
                        </li>

                        <li>
                            <NavLink to="/dashboard/favorites">My Favorites</NavLink>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <NavLink to="/dashboard/admin">Admin Home</NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/admin/manage-users">Manage Users</NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/admin/manage-lessons">Manage Lessons</NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/admin/reported-lessons">Reported Lessons</NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/admin/profile">Admin Profile</NavLink>
                        </li>
                    </>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;