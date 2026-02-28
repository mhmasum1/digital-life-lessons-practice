import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

const RootLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
            <Navbar />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default RootLayout;