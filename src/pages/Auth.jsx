import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signin, signup } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import robotImg from "../assets/robot.png";

export default function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const isSignupDefault = location.pathname === "/signup";
    const [mode, setMode] = useState(isSignupDefault ? "signup" : "login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const primaryGrey = "#5F7482";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res =
                mode === "login"
                    ? await signin({ email, password })
                    : await signup({ name, email, password });

            login(res.data);
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.detail || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* LEFT – ROBOT IMAGE */}
            <div className="hidden md:block w-1/2 relative">
                <img
                    src={robotImg}
                    alt="Hevar Robot"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>


            {/* RIGHT – AUTH FORM */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-semibold text-[#3A4A55] mb-2">
                        Hello guys 👋
                    </h1>
                    <h2 className="text-xl text-[#3A4A55] mb-8">
                        Hevar this side
                    </h2>

                    {/* Tabs */}
                    <div className="flex gap-8 mb-8">
                        {["login", "signup"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setMode(tab)}
                                className={`pb-2 text-lg ${mode === tab
                                    ? "border-b-2 text-[#3A4A55]"
                                    : "text-[#9AA6AE]"
                                    }`}
                                style={{
                                    borderColor:
                                        mode === tab ? primaryGrey : "transparent",
                                }}
                            >
                                {tab === "login" ? "Login" : "SignUp"}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === "signup" && (
                            <input
                                className="w-full border-b border-[#C7D0D6] px-2 py-2 outline-none
             text-[#3A4A55] placeholder-[#9AA6AE]"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        )}

                        <input
                            className="w-full border-b border-[#C7D0D6] px-2 py-2 outline-none
             text-[#3A4A55] placeholder-[#9AA6AE]"
                            placeholder="Enter your email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="relative">
                            <input
                                className="w-full border-b border-[#C7D0D6] px-2 py-2 pr-8 outline-none
             text-[#3A4A55] placeholder-[#9AA6AE]"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer
             text-[#9AA6AE]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                👁️
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-md text-white text-lg"
                            style={{ backgroundColor: primaryGrey }}
                        >
                            {loading
                                ? "Please wait..."
                                : mode === "login"
                                    ? "Login"
                                    : "Sign Up"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
