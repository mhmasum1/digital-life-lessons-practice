import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import successAnim from "../../assets/lottie/Success.json";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Contact = () => {
    const axiosSecure = useAxiosSecure();

    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setSubmitting(true);

            const payload = {
                name: data.name.trim(),
                email: data.email.trim(),
                subject: data.subject.trim(),
                message: data.message.trim(),
                createdAt: new Date(),
                status: "new",
            };

            const res = await axiosSecure.post("/contact-messages", payload);

            if (res.data?.insertedId || res.data?.success) {
                toast.success("Message sent successfully!");
                reset();

                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 1600);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error("Contact submit error:", err);
            toast.error(err?.response?.data?.message || "Failed to send message.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 relative">
            {showSuccess && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-base-100 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-base-300 text-center">
                        <div className="mx-auto w-44">
                            <Lottie animationData={successAnim} loop={false} />
                        </div>
                        <p className="mt-2 font-semibold text-base-content">Sent!</p>
                        <p className="text-xs text-base-content/70">Thanks for contacting us…</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* LEFT: Contact Info */}
                <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
                    <h2 className="text-2xl font-semibold mb-4 text-center text-base-content">
                        Contact Info
                    </h2>

                    <div className="space-y-2 text-center text-base text-base-content/80">
                        <p>
                            <span className="font-medium text-base-content">Email:</span>{" "}
                            support@digitallessons.com
                        </p>
                        <p>
                            <span className="font-medium text-base-content">Phone:</span>{" "}
                            +880 1234-567890
                        </p>
                        <p>Dhaka, Bangladesh</p>
                    </div>

                    <div className="mt-6 text-sm text-base-content/70 text-center">
                        We usually reply within 24–48 hours.
                    </div>
                </div>

                {/* RIGHT: Contact Form */}
                <div className="bg-base-100 rounded-2xl shadow p-8 border border-base-300">
                    <h3 className="text-xl font-semibold mb-6 text-base-content">
                        Send us a message
                    </h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-base-content mb-1">
                                Name <span className="text-error">*</span>
                            </label>
                            <input
                                className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
                                placeholder="Your name"
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: { value: 3, message: "Min 3 characters" },
                                })}
                            />
                            {errors.name && (
                                <p className="text-error text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-base-content mb-1">
                                Email <span className="text-error">*</span>
                            </label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
                                placeholder="Your email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email format",
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-error text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-base-content mb-1">
                                Subject <span className="text-error">*</span>
                            </label>
                            <input
                                className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
                                placeholder="Subject"
                                {...register("subject", {
                                    required: "Subject is required",
                                    minLength: { value: 5, message: "Min 5 characters" },
                                })}
                            />
                            {errors.subject && (
                                <p className="text-error text-sm mt-1">{errors.subject.message}</p>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-base-content mb-1">
                                Message <span className="text-error">*</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full min-h-32 bg-base-100 text-base-content border-base-300"
                                placeholder="Write your message..."
                                {...register("message", {
                                    required: "Message is required",
                                    minLength: { value: 10, message: "Min 10 characters" },
                                })}
                            />
                            {errors.message && (
                                <p className="text-error text-sm mt-1">{errors.message.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button className="btn btn-primary w-full" disabled={submitting}>
                            {submitting ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;