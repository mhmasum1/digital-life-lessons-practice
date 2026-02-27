import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import logo from "../../assets/Logo.webp";

const Footer = () => {
    return (
        <footer className="bg-base-200 border-t border-base-300 py-10 mt-10 text-base-content">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="Digital Life Lessons"
                            className="h-10 w-10 rounded-2xl object-contain"
                        />
                        <div>
                            <h2 className="font-semibold text-lg text-base-content">
                                Digital Life Lessons
                            </h2>
                            <p className="text-xs text-base-content/60">
                                Learn • Share • Grow
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-base-content mb-3">
                            Contact Info
                        </h3>
                        <p className="text-sm text-base-content/70">
                            Email: support@digitallessons.com
                        </p>
                        <p className="text-sm text-base-content/70">
                            Phone: +880 1234-567890
                        </p>
                        <p className="text-sm text-base-content/70">
                            Dhaka, Bangladesh
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-base-content mb-3">
                            Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm text-base-content/70">
                            <li>
                                <Link to="/" className="hover:text-primary transition">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/lessons" className="hover:text-primary transition">
                                    Public Lessons
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-primary transition">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="hover:text-primary transition">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-primary transition">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-10 border-t border-base-300 pt-5">
                    <p className="text-base-content/60 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} Digital Life Lessons. All rights reserved.
                    </p>

                    <div className="flex gap-4 text-xl text-base-content/60">
                        <span className="cursor-pointer transition hover:text-primary">
                            <FaFacebook />
                        </span>

                        <span className="cursor-pointer transition hover:text-primary">
                            <FaTwitter />
                        </span>

                        <span className="cursor-pointer transition hover:text-primary">
                            <FaInstagram />
                        </span>

                        <span className="cursor-pointer transition hover:text-primary">
                            <FaYoutube />
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;