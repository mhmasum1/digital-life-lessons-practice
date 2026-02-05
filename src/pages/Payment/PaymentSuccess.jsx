import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
        <div className="max-w-xl mx-auto text-center py-16">
            <h2 className="text-4xl font-bold text-green-600 mb-4">
                Payment Successful 🎉
            </h2>

            <p className="text-lg mb-2">
                You are now a <span className="font-semibold">Premium</span> user!
            </p>

            {transactionId && (
                <p className="text-sm text-gray-500">
                    Transaction ID: <span className="font-mono">{transactionId}</span>
                </p>
            )}
        </div>
    );
};

export default PaymentSuccess;
