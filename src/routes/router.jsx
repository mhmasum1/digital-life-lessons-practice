import { createBrowserRouter } from "react-router-dom";

import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Home from "../pages/Home/Home.jsx";
import PublicLessons from "../pages/Lessons/PublicLessons.jsx";
import LessonDetails from "../pages/Lessons/LessonDetails.jsx";
import AddLesson from "../pages/Lessons/AddLesson.jsx";
import MyLesson from "../pages/Lessons/MyLesson.jsx";
import UpdateLesson from "../pages/Lessons/UpdateLesson.jsx";

import Pricing from "../pages/Pricing/Pricing.jsx";
import PaymentSuccess from "../pages/Payment/PaymentSuccess.jsx";
import PaymentCancel from "../pages/Payment/PaymentCancel.jsx";

import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
// SocialLogin.jsx যদি আলাদা page হিসেবে route করতে চাও, তাহলে uncomment করো
// import SocialLogin from "../pages/Auth/SocialLogin.jsx";

// import UserHome from "../pages/Dashboard/UserHome.jsx";
// import AdminHome from "../pages/Dashboard/AdminHome.jsx";
// import ManageUsers from "../pages/Dashboard/ManageUsers.jsx";
import ManageLessons from "../pages/Dashborad/ManageLessons.jsx";
import ReportedLessons from "../pages/Dashborad/ReportedLessons.jsx";

import MyFavorites from "../pages/Favorites/MyFavorites.jsx";

import NotFound from "../pages/Error/NotFound.jsx";
import AccessDenied from "../pages/Error/AccessDenied.jsx";

import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import UserHome from "../pages/Dashborad/UserHome.jsx";
import AdminHome from "../pages/Dashborad/AdminHome.jsx";
import ManageUsers from "../pages/Dashborad/ManageUsers.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <NotFound />,
        children: [
            { index: true, element: <Home /> },

            // lessons
            { path: "lessons", element: <PublicLessons /> },
            {
                path: "lessons/:id",
                element: (
                    <PrivateRoute>
                        <LessonDetails />
                    </PrivateRoute>
                ),
            },

            // pricing + payment
            { path: "pricing", element: <Pricing /> },
            { path: "payment/success", element: <PaymentSuccess /> },
            { path: "payment/cancel", element: <PaymentCancel /> },

            // errors
            { path: "access-denied", element: <AccessDenied /> },
        ],
    },

    // auth layout
    {
        path: "/",
        element: <AuthLayout />,
        children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> }
        ],
    },

    // dashboard (protected)
    {
        path: "/dashboard",
        element: (
            <PrivateRoute>
                <DashboardLayout />
            </PrivateRoute>
        ),
        children: [
            // user
            { index: true, element: <UserHome /> },
            { path: "add-lesson", element: <AddLesson /> },
            { path: "my-lessons", element: <MyLesson /> },
            { path: "update-lesson/:id", element: <UpdateLesson /> },
            { path: "favorites", element: <MyFavorites /> },

            // admin
            {
                path: "admin-home",
                element: (
                    <AdminRoute>
                        <AdminHome />
                    </AdminRoute>
                ),
            },
            {
                path: "manage-users",
                element: (
                    <AdminRoute>
                        <ManageUsers />
                    </AdminRoute>
                ),
            },
            {
                path: "manage-lessons",
                element: (
                    <AdminRoute>
                        <ManageLessons />
                    </AdminRoute>
                ),
            },
            {
                path: "reported-lessons",
                element: (
                    <AdminRoute>
                        <ReportedLessons />
                    </AdminRoute>
                ),
            },
        ],
    },

    { path: "*", element: <NotFound /> },
]);

export default router;
