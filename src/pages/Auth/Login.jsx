import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SocialLogin from "./SocialLogin";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { signInUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogin = async (data) => {
        try {
            await signInUser(data.email, data.password);
            toast.success("Login successful");
            navigate(location?.state || "/", { replace: true });
        } catch (error) {
            console.error(error);
            toast.error(error?.message || "Login failed");
        }
    };

    return (
        <div className="card bg-base-100 w-full mx-auto max-w-sm shrink-0 shadow-2xl border border-base-300">
            <h3 className="text-2xl text-center text-base-content pt-5">
                Welcome back
            </h3>
            <p className="text-center text-base-content/70">
                Please Login
            </p>

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
                        })}
                        className="input input-bordered w-full"
                        placeholder="Email"
                    />
                    {errors.email && (
                        <p className="text-error text-sm">
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
                    {errors.password && (
                        <p className="text-error text-sm">
                            {errors.password.message}
                        </p>
                    )}

                    <div>
                        <a className="link link-hover text-base-content/70">
                            Forgot password?
                        </a>
                    </div>

                    <button className="btn btn-primary mt-3 w-full">
                        Login
                    </button>
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