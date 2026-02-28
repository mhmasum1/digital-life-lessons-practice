import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SocialLogin from "./SocialLogin";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { useState } from "react";

const Login = () => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    const { signInUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    //Firebase login error state
    const [authError, setAuthError] = useState("");

    const handleLogin = async (data) => {
        setAuthError(""); // reset previous error

        try {
            await signInUser(data.email, data.password);
            toast.success("Login successful");
            navigate(location?.state || "/", { replace: true });
        } catch (error) {
            console.error(error);

            const code = error?.code;

            if (code === "auth/user-not-found") {
                setAuthError("User not found");
            } else if (
                code === "auth/wrong-password" ||
                code === "auth/invalid-credential"
            ) {
                setAuthError("Incorrect email or password");
            } else if (code === "auth/too-many-requests") {
                setAuthError("Too many attempts. Try again later.");
            } else {
                setAuthError("Login failed. Please try again.");
            }

            toast.error("Login failed");
        }
    };

    const handleDemoLogin = async () => {
        setAuthError("");

        try {
            const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
            const demoPass = import.meta.env.VITE_DEMO_PASSWORD;

            setValue("email", demoEmail);
            setValue("password", demoPass);

            await signInUser(demoEmail, demoPass);
            toast.success("Demo login successful");
            navigate(location?.state || "/", { replace: true });
        } catch (error) {
            console.error(error);
            setAuthError("Demo login failed");
            toast.error("Demo login failed");
        }
    };

    return (
        <div className="card bg-base-100 w-full mx-auto max-w-sm shrink-0 shadow-2xl border border-base-300">
            <h3 className="text-2xl text-center text-base-content pt-5">
                Welcome back
            </h3>
            <p className="text-center text-base-content/70">Please Login</p>

            <form className="card-body" onSubmit={handleSubmit(handleLogin)}>
                <fieldset className="fieldset space-y-2">
                    {/* Email */}
                    <label className="label">
                        <span className="label-text">Email</span>
                    </label>

                    <input
                        type="email"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Please enter a valid email",
                            },
                        })}
                        className="input input-bordered w-full"
                        placeholder="Email"
                    />

                    {errors.email && (
                        <p className="text-error text-xs mt-1">
                            {errors.email.message}
                        </p>
                    )}

                    {/* Password */}
                    <label className="label">
                        <span className="label-text">Password</span>
                    </label>

                    <input
                        type="password"
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters",
                            },
                        })}
                        className="input input-bordered w-full"
                        placeholder="Password"
                    />

                    {/* Validation OR Firebase error */}
                    {errors.password ? (
                        <p className="text-error text-xs mt-1">
                            {errors.password.message}
                        </p>
                    ) : authError ? (
                        <p className="text-error text-xs mt-1">{authError}</p>
                    ) : null}

                    <div>
                        <a className="link link-hover text-base-content/70">
                            Forgot password?
                        </a>
                    </div>

                    <button className="btn btn-primary mt-3 w-full">
                        Login
                    </button>

                    {/* Demo Buttons */}
                    <div className="mt-2 space-y-2">
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="btn btn-outline w-full"
                        >
                            Demo Login
                        </button>
                    </div>
                </fieldset>

                <p className="text-sm text-base-content/70 mt-4">
                    New to Digital Life Lessons?
                    <Link
                        state={location.state}
                        className="link link-primary ml-2"
                        to="/register"
                    >
                        Register
                    </Link>
                </p>
            </form>

            <SocialLogin />
        </div>
    );
};

export default Login;