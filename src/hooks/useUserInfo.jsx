import { useCallback, useEffect, useState } from "react";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

// Login করলেন
//         ↓
// Firebase বলল → "এই user এর email: masum@gmail.com"
//         ↓
// useUserInfo বলল → "MongoDB তে এই email খুঁজি"
//         ↓
// MongoDB বলল → "পেয়েছি! isPremium: true, name: Masum"
//         ↓
// এখন যেকোনো component এ
// const { dbUser } = useUserInfo()
// dbUser.isPremium → true ✅
// useAuth()     → কে login করেছে জানো    (Firebase)
// axiosSecure   → তার MongoDB data আনো   (Database)

const useUserInfo = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [dbUser, setDbUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const email = user?.email;

    const fetchUser = useCallback(async () => {
        if (!email) {
            setDbUser(null);
            setLoadingUser(false);
            return;
        }

        setLoadingUser(true);
        try {
            const res = await axiosSecure.get(`/users/${email}`);
            setDbUser(res.data || null);
        } catch {
            setDbUser(null);
        } finally {
            setLoadingUser(false);
        }
    }, [email, axiosSecure]);

    //when email changes
    // Wait until auth loading is complete
    // Then fetch user info from database
    useEffect(() => {
        if (loading) return;
        fetchUser();
    }, [loading, fetchUser]);

    // premium updated event
    // Listen for premium status change event
    // Refetch user data when premium is updated
    useEffect(() => {
        window.addEventListener("premium-updated", fetchUser);

        return () => {
            window.removeEventListener("premium-updated", fetchUser);
        };
    }, [fetchUser]);

    return {
        dbUser,
        // loadingUser
        // MongoDB থেকে data আসছে কিনা। true হলে spinner দেখাও
        // if (loadingUser) return <Spinner />
        loadingUser,
        isPremium: dbUser?.isPremium === true,
        refetchUser: fetchUser,
    };
};

export default useUserInfo;


// refetchUser()   → শুধু user এর data টুকু নতুন করে আনো ⚡
// example:
// নাম save হলো → MongoDB update হলো
// কিন্তু screen এ এখনো পুরনো নাম দেখাচ্ছে
// কারণ dbUser এ পুরনো data আছে

// refetchUser() call করলে →
// MongoDB থেকে নতুন data আনবে →
// screen এ নতুন নাম দেখাবে ✅

// page reload হবে না, শুধু data update হবে


// Stripe payment হলো → MongoDB এ isPremium: true হলো
// কিন্তু app এ এখনো Free দেখাচ্ছে

// refetchUser() call করলে →
// MongoDB থেকে isPremium: true আসবে →
// app এ Premium দেখাবে ✅

// page reload ছাড়াই!
