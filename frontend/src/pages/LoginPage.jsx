import { useState , useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight } from "lucide-react";
import api from "../api/axios";
import { generateKeyPair, exportPublicKey } from "../utils/crypto.js";
import { getKeys, saveKeys } from "../utils/KeyStorage.js";
import { useAuth } from "../context/AuthContext.jsx";


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();
    const {login} = useAuth()

   const handleLogin = async (e) => {
    e.preventDefault();

    try {
        

        let { privateKey, publicKey } = await getKeys();

    if (!privateKey || !publicKey) {
    const keyPair = await generateKeyPair();

    const exportedPublicKey = await exportPublicKey(keyPair.publicKey);

    await saveKeys(keyPair.privateKey, exportedPublicKey);

    privateKey = keyPair.privateKey;
    publicKey = exportedPublicKey;
}

        const res = await api.post("/auth/login", {
            username,
            password,
            publicKey,
        });

        const { user } = res.data.data;

        
        login(user);

        navigate("/chat");

    } catch (err) {
        console.error(err.response?.data || err);
    }
};

    
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #071510 0%, #0b1e17 40%, #071510 100%)' }}>
            {/* Top radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96" style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(64,210,186,0.13), transparent)',
                pointerEvents: 'none'
            }} />

            {/* Login card with float animation */}
            <div className="relative z-10 w-full max-w-md mx-4 animate-float">
                <div
                    className="rounded-3xl p-8 sm:p-10 backdrop-blur-xl border shadow-2xl"
                    style={{
                        background: "rgba(13, 35, 24, 0.4)",
                        borderColor: "rgba(64, 210, 186, 0.2)",
                        boxShadow: "0 8px 60px rgba(64, 210, 186, 0.1), 0 2px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(64, 210, 186, 0.1)",
                    }}
                >
                    {/* Branding */}
                    <div className="text-center mb-8">
                        <h1
                            className="text-4xl font-bold mb-3"
                            style={{
                                backgroundImage: "linear-gradient(135deg, #40D2BA, #40D2BA)",
                                backgroundClip: 'text',
                                color: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 700,
                            }}
                        >
                            Layered
                        </h1>
                        <p className="text-white/55 text-sm tracking-wide" style={{ fontWeight: 400 }}>
                            Conversations, reimagined
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username */}
                        <div className="relative group">
                            <div
                                className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                                style={{ color: focusedField === "username" ? "#40D2BA" : "rgba(255, 255, 255, 0.55)" }}
                            >
                                <User className="w-4.5 h-4.5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setFocusedField("username")}
                                onBlur={() => setFocusedField(null)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/55 outline-none transition-all duration-300 border"
                                style={{
                                    background: "rgba(255, 255, 255, 0.06)",
                                    borderColor: focusedField === "username"
                                        ? "rgba(64, 210, 186, 0.4)"
                                        : "rgba(255, 255, 255, 0.1)",
                                    boxShadow: focusedField === "username"
                                        ? "0 0 20px rgba(64, 210, 186, 0.15), 0 0 6px rgba(64, 210, 186, 0.1)"
                                        : "none",
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <div
                                className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                                style={{ color: focusedField === "password" ? "#40D2BA" : "rgba(255, 255, 255, 0.55)" }}
                            >
                                <Lock className="w-4.5 h-4.5" />
                            </div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField("password")}
                                onBlur={() => setFocusedField(null)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/55 outline-none transition-all duration-300 border"
                                style={{
                                    background: "rgba(255, 255, 255, 0.06)",
                                    borderColor: focusedField === "password"
                                        ? "rgba(64, 210, 186, 0.4)"
                                        : "rgba(255, 255, 255, 0.1)",
                                    boxShadow: focusedField === "password"
                                        ? "0 0 20px rgba(64, 210, 186, 0.15), 0 0 6px rgba(64, 210, 186, 0.1)"
                                        : "none",
                                }}
                            />
                        </div>

                        {/* Forgot link */}
                        <div className="text-right">
                            <button type="button" className="text-xs transition-colors" style={{ color: 'rgba(64, 210, 186, 0.7)', fontWeight: 500 }}>
                                Forgot password?
                            </button>
                        </div>

                        {/* Login button */}
                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-[#04342C] flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                            style={{
                                background: "#40D2BA",
                                boxShadow: "0 4px 25px rgba(64, 210, 186, 0.3), 0 1px 3px rgba(0,0,0,0.06)",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.boxShadow =
                                    "0 6px 35px rgba(64, 210, 186, 0.45), 0 2px 6px rgba(0,0,0,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.boxShadow =
                                    "0 4px 25px rgba(64, 210, 186, 0.3), 0 1px 3px rgba(0,0,0,0.06)";
                            }}
                        >
                            Sign In
                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-white/55 mt-6">
                        Don't have an account?{" "}
                        <button className="text-teal-accent font-medium hover:underline" onClick={() => navigate("/register")}>
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
