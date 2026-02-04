import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAdmin from "../hooks/useAdmin";
import Spinner from "../components/common/Spinner";

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const { isAdmin, adminLoading } = useAdmin();

    if (loading || adminLoading) return <Spinner />;

    if (!user?.email) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/access-denied" replace />;
    }

    return children;
};

export default AdminRoute;
