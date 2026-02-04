import { NavLink } from "react-router-dom";
import useAdmin from "../../hooks/useAdmin";

const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded ${isActive ? "bg-orange-200 text-orange-900" : "bg-orange-50"
    }`;

const Sidebar = () => {
    const { isAdmin, adminLoading } = useAdmin();

    if (adminLoading) return null;

    return (
        <div className="p-4 space-y-2">
            <h2 className="text-lg font-semibold mb-4">
                {isAdmin ? "Admin Dashboard" : "Dashboard Menu"}
            </h2>

            {/* Common */}
            <NavLink to="/" className={linkClass}>
                ← Back to Home
            </NavLink>

            {!isAdmin ? (
                <>
                    <NavLink to="/dashboard" className={linkClass}>
                        User Home
                    </NavLink>
                    <NavLink to="/dashboard/profile" className={linkClass}>
                        Profile
                    </NavLink>


                    <NavLink to="/dashboard/my-lessons" className={linkClass}>
                        My Lessons
                    </NavLink>

                    <NavLink to="/dashboard/add-lesson" className={linkClass}>
                        Add Lesson
                    </NavLink>

                    <NavLink to="/dashboard/favorites" className={linkClass}>
                        My Favorites
                    </NavLink>
                </>
            ) : (
                <>
                    <NavLink to="/dashboard/admin-home" className={linkClass}>
                        Admin Home
                    </NavLink>

                    <NavLink to="/dashboard/manage-users" className={linkClass}>
                        Manage Users
                    </NavLink>

                    <NavLink to="/dashboard/manage-lessons" className={linkClass}>
                        Manage Lessons
                    </NavLink>

                    <NavLink to="/dashboard/reported-lessons" className={linkClass}>
                        Reported Lessons
                    </NavLink>

                </>
            )}
        </div>
    );
};

export default Sidebar;
