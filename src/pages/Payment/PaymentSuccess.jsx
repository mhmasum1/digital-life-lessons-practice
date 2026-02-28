import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const [transactionId, setTransactionId] = useState("");
    const sessionId = searchParams.get("session_id");
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        if (!sessionId) return;

        axiosSecure
            .patch(`/payment-success?session_id=${sessionId}`)
            .then((res) => {
                setTransactionId(res.data.transactionId || "");
                window.dispatchEvent(new Event("premium-updated"));
            })
            .catch((err) => console.error(err));
    }, [sessionId, axiosSecure]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-base-200 px-4">
            <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-8 text-center max-w-xl w-full">

                <div className="text-success text-5xl mb-4">🎉</div>

                <h2 className="text-3xl font-bold text-base-content mb-3">
                    Payment Successful
                </h2>

                <p className="text-base text-base-content/80 mb-4">
                    You are now a <span className="font-semibold text-primary">Premium</span> user!
                </p>

                {transactionId && (
                    <p className="text-sm text-base-content/60 mb-6">
                        Transaction ID:{" "}
                        <span className="font-mono bg-base-200 px-2 py-1 rounded">
                            {transactionId}
                        </span>
                    </p>
                )}

                <Link to="/dashboard" className="btn btn-primary btn-sm">
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;