import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import axios from "axios";
import SocialLogin from "./SocialLogin";
import toast from "react-hot-toast";

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { registerUser, updateUserProfile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    const handleRegistration = async (data) => {
        try {
            const profileImg = data.photo?.[0];
            if (!profileImg) {
                toast.error("Photo is required");
                return;
            }

            // 1) Register user
            await registerUser(data.email, data.password);

            // 2) Upload image to imgbb
            const key = import.meta.env.VITE_photo_host_key;
            if (!key) {
                toast.error("VITE_photo_host_key missing in .env");
                return;
            }

            const formData = new FormData();
            formData.append("image", profileImg);

            const image_API_URL = `https://api.imgbb.com/1/upload?key=${key}`;
            const uploadRes = await axios.post(image_API_URL, formData);
            const photoURL = uploadRes?.data?.data?.url || "";

            // 3) Save user in DB
            const userInfo = {
                email: data.email,
                displayName: data.name,
                photoURL,
            };
            await axiosSecure.post("/users", userInfo);

            // 4) Update firebase profile
            await updateUserProfile({
                displayName: data.name,
                photoURL,
            });

            toast.success("Registration successful!");
            navigate(location.state || "/", { replace: true });
        } catch (error) {
            console.error(error);
            toast.error(error?.message || "Registration failed");
        }
    };

    return (
        <div className="card bg-base-100 w-full mx-auto max-w-sm shrink-0 shadow-2xl border border-base-300">
            <p className="text-center pt-5 text-base-content font-semibold">
                Please Register
            </p>

            <form className="card-body" onSubmit={handleSubmit(handleRegistration)}>
                <fieldset className="fieldset space-y-2">
                    {/* Name */}
                    <label className="label">
                        <span className="label-text">Name</span>
                    </label>
                    <input
                        type="text"
                        {...register("name", { required: "Name is required" })}
                        className="input input-bordered w-full"
                        placeholder="Your Name"
                    />
                    {errors.name && (
                        <p className="text-error text-sm">{errors.name.message}</p>
                    )}

                    {/* Photo */}
                    <label className="label">
                        <span className="label-text">Photo</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        {...register("photo", { required: "Photo is required" })}
                        className="file-input file-input-bordered w-full"
                    />
                    {errors.photo && (
                        <p className="text-error text-sm">{errors.photo.message}</p>
                    )}

                    {/* Email */}
                    <label className="label">
                        <span className="label-text">Email</span>
                    </label>
                    <input
                        type="email"
                        {...register("email", { required: "Email is required" })}
                        className="input input-bordered w-full"
                        placeholder="Email"
                    />
                    {errors.email && (
                        <p className="text-error text-sm">{errors.email.message}</p>
                    )}

                    {/* Password */}
                    <label className="label">
                        <span className="label-text">Password</span>
                    </label>
                    <input
                        type="password"
                        {...register("password", {
                            required: "Password is required",
                            minLength: { value: 6, message: "Password must be 6 characters or longer" },
                            pattern: {
                                value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                                message:
                                    "Password must have at least one uppercase, one lowercase, one number, and one special character",
                            },
                        })}
                        className="input input-bordered w-full"
                        placeholder="Password"
                    />
                    {errors.password && (
                        <p className="text-error text-sm">{errors.password.message}</p>
                    )}

                    <div>
                        <a className="link link-hover text-base-content/70">
                            Forgot password?
                        </a>
                    </div>

                    <button className="btn btn-primary mt-3 w-full">
                        Register
                    </button>
                </fieldset>

                <p className="mt-4 text-sm text-base-content/70">
                    Already have an account?{" "}
                    <Link
                        state={location.state}
                        className="link link-primary"
                        to="/login"
                    >
                        Login
                    </Link>
                </p>
            </form>

            <SocialLogin />
        </div>
    );
};

export default Register;