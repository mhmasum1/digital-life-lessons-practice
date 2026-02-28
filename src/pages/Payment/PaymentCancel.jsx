import { Link } from "react-router-dom";

const PaymentCancelled = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-base-200 px-4">
            <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-8 text-center max-w-xl w-full">

                <div className="text-error text-5xl mb-4">❌</div>

                <h2 className="text-2xl font-bold text-base-content mb-3">
                    Payment Cancelled
                </h2>

                <p className="text-sm text-base-content/70 mb-6">
                    Your payment was cancelled. No charges were made.
                    You can try again anytime.
                </p>

                <Link to="/pricing" className="btn btn-primary btn-sm">
                    Try Again
                </Link>
            </div>
        </div>
    );
};

export default PaymentCancelled;