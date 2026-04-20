import { useState , useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, Leaf } from "lucide-react";
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
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#f0f7f0]">
            {/* Organic background layers */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-emerald-200/60 to-green-100/40 blur-[100px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-lime-200/50 to-emerald-100/30 blur-[120px]" />
                <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-green-300/20 to-teal-100/20 blur-[80px]" />
                <div className="absolute bottom-[20%] left-[15%] w-[20vw] h-[20vw] rounded-full bg-white/40 blur-[60px]" />
                {/* Faint leaf shapes */}
                <div className="absolute top-[10%] right-[30%] w-32 h-32 rounded-[60%_40%_70%_30%] bg-emerald-300/10 rotate-45 blur-sm" />
                <div className="absolute bottom-[25%] left-[10%] w-24 h-24 rounded-[60%_40%_70%_30%] bg-green-400/8 -rotate-12 blur-sm" />
            </div>

            {/* Login card with float animation */}
            <div className="relative z-10 w-full max-w-md mx-4 animate-[float_6s_ease-in-out_infinite]">
                <div
                    className="rounded-3xl p-8 sm:p-10 backdrop-blur-xl border shadow-2xl"
                    style={{
                        background: "rgba(255, 255, 255, 0.45)",
                        borderColor: "rgba(74, 222, 128, 0.25)",
                        boxShadow:
                            "0 8px 60px rgba(74, 222, 128, 0.12), 0 2px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
                    }}
                >
                    {/* Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-3">
                            <Leaf className="w-7 h-7 text-emerald-500" strokeWidth={2.5} />
                            <h1
                                className="text-4xl font-bold bg-clip-text text-transparent"
                                style={{
                                    backgroundImage: "linear-gradient(135deg, #059669, #34d399, #6ee7b7)",
                                    fontFamily: "'Space Grotesk', sans-serif",
                                }}
                            >
                                Layered
                            </h1>
                        </div>
                        <p className="text-emerald-700/60 text-sm tracking-wide">
                            Conversations, reimagined
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username */}
                        <div className="relative group">
                            <div
                                className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                                style={{ color: focusedField === "username" ? "#10b981" : "#9ca3af" }}
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
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-300 border"
                                style={{
                                    background: "rgba(255, 255, 255, 0.5)",
                                    borderColor:
                                        focusedField === "username"
                                            ? "rgba(16, 185, 129, 0.5)"
                                            : "rgba(209, 213, 219, 0.4)",
                                    boxShadow:
                                        focusedField === "username"
                                            ? "0 0 20px rgba(16, 185, 129, 0.15), 0 0 6px rgba(16, 185, 129, 0.1)"
                                            : "none",
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <div
                                className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                                style={{ color: focusedField === "password" ? "#10b981" : "#9ca3af" }}
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
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-300 border"
                                style={{
                                    background: "rgba(255, 255, 255, 0.5)",
                                    borderColor:
                                        focusedField === "password"
                                            ? "rgba(16, 185, 129, 0.5)"
                                            : "rgba(209, 213, 219, 0.4)",
                                    boxShadow:
                                        focusedField === "password"
                                            ? "0 0 20px rgba(16, 185, 129, 0.15), 0 0 6px rgba(16, 185, 129, 0.1)"
                                            : "none",
                                }}
                            />
                        </div>

                        {/* Forgot link */}
                        <div className="text-right">
                            <button type="button" className="text-xs text-emerald-600/70 hover:text-emerald-600 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        {/* Login button */}
                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                            style={{
                                background: "linear-gradient(135deg, #059669, #34d399, #a7f3d0)",
                                boxShadow: "0 4px 25px rgba(16, 185, 129, 0.3), 0 1px 3px rgba(0,0,0,0.06)",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.boxShadow =
                                    "0 6px 35px rgba(16, 185, 129, 0.45), 0 2px 6px rgba(0,0,0,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.boxShadow =
                                    "0 4px 25px rgba(16, 185, 129, 0.3), 0 1px 3px rgba(0,0,0,0.06)";
                            }}
                        >
                            Sign In
                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        Don't have an account?{" "}
                        <button className="text-emerald-600 font-medium hover:underline" onClick={() => navigate("/register")}>
                            Create one
                        </button>
                    </p>
                </div>
            </div>

            {/* Float keyframe */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
        </div>
    );
};

export default Login;
