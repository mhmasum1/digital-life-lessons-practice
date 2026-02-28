import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUserInfo from "../../hooks/useUserInfo";

const Pricing = () => {
    const { user } = useAuth();
    const { dbUser, loadingUser } = useUserInfo();
    const axiosSecure = useAxiosSecure();

    if (!user?.email) {
        return <Navigate to="/" replace />;
    }

    const isPremium = dbUser?.isPremium === true;

    const handleUpgrade = async () => {
        try {
            const res = await axiosSecure.post("/create-checkout-session", {
                email: user.email,
                plan: "premium_lifetime",
            });
            const url = res.data?.url;
            if (url) window.location.href = url;
        } catch (error) {
            console.error("Checkout error:", error);
        }
    };

    if (loadingUser) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <p className="text-sm text-base-content/70">Loading your plan information...</p>
            </div>
        );
    }

    if (isPremium) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-semibold text-base-content mb-3">
                    You are already a Premium member ⭐
                </h1>
                <p className="text-sm text-base-content/70">
                    Enjoy lifetime access to all premium features and lessons.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold text-base-content text-center mb-8">Pricing</h1>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* Free Plan */}
                <div className="border border-base-300 rounded-2xl p-6 bg-base-100">
                    <h2 className="text-xl font-semibold text-base-content mb-2">Free Plan</h2>
                    <p className="text-sm text-base-content/70 mb-4">
                        Basic access for trying the platform.
                    </p>

                    <ul className="text-sm text-base-content/80 space-y-2">
                        <li>• Access to free lessons</li>
                        <li>• Save limited favorites</li>
                        <li>• Community features (basic)</li>
                        <li>• Standard listing</li>
                        <li>• Basic search & filters</li>
                        <li>• Email support</li>
                    </ul>
                </div>

                {/* Premium Plan */}
                <div className="border-2 border-primary/60 rounded-2xl p-6 bg-base-200 shadow-md">
                    <h2 className="text-xl font-semibold text-base-content mb-2">
                        Premium Plan <span className="text-primary">⭐</span>
                    </h2>

                    <p className="text-sm text-base-content/70 mb-4">
                        One-time payment, lifetime access to all premium features.
                    </p>

                    <p className="text-3xl font-bold text-base-content mb-4">
                        ৳1500{" "}
                        <span className="text-sm font-normal text-base-content/70">/ lifetime</span>
                    </p>

                    <ul className="text-sm text-base-content/80 space-y-2 mb-6">
                        <li>• Unlimited lesson access</li>
                        <li>• Create premium lessons</li>
                        <li>• Ad-free learning experience</li>
                        <li>• Priority listing for your lessons</li>
                        <li>• Advanced analytics & dashboard</li>
                        <li>• Priority support</li>
                        <li>• Early access to new features</li>
                        <li>• Lifetime access, no monthly fees</li>
                    </ul>

                    <button onClick={handleUpgrade} className="btn btn-primary w-full">
                        Upgrade to Premium
                    </button>
                </div>
            </div>

            <p className="text-xs text-base-content/60 text-center max-w-md mx-auto">
                Payment is processed securely via Stripe (test mode). After successful payment, your
                account will be upgraded automatically.
            </p>
        </div>
    );
};

export default Pricing;