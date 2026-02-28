import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen flex bg-base-200">

            <aside className="w-64 bg-base-100 shadow-lg border-r border-base-300 hidden md:block">
                <Sidebar />
            </aside>

            <main className="flex-1 p-4 md:p-8 bg-base-200">
                <Outlet />
            </main>

        </div>
    );
};

export default DashboardLayout;