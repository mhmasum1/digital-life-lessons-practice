import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen flex bg-[#FFF7ED]">

            <aside className="w-64 bg-white shadow-lg border-r border-orange-200 hidden md:block">
                <Sidebar />
            </aside>

            <main className="flex-1 p-4 md:p-8">
                <Outlet />
            </main>

        </div>
    );
};

export default DashboardLayout;
