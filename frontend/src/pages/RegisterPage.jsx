import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  generateKeyPair,
  exportPublicKey
} from "../utils/crypto";
import { getKeys, saveKeys } from "../utils/KeyStorage";
import { User, Lock, ArrowRight, Leaf } from "lucide-react";

let debounceTimer;

const RegisterPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [usernameStatus, setUsernameStatus] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  // username check
  const checkUsername = (value) => {
    clearTimeout(debounceTimer);

    const trimmed = value.trim();
    if (!trimmed) {
      setUsernameStatus(null);
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        setUsernameStatus("checking");

        const res = await api.get(
          `/auth/check-username?username=${trimmed}`
        );

        const available = res.data.data.available;
        setUsernameStatus(available ? "available" : "taken");

      } catch (err) {
        console.error(err);
        setUsernameStatus(null);
      }
    }, 500);
  };

  // password validation
  const validatePasswords = (pass, confirm) => {
    if (!confirm) return setPasswordError("");

    if (pass !== confirm) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  // register
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      if (!username || !password || !confirmPassword) return;
      if (passwordError) return;
      if (usernameStatus !== "available") return;

      setLoading(true);

      // 🔐 get or generate keys
      let { privateKey, publicKey } = await getKeys();

      if (!privateKey || !publicKey) {
        const keyPair = await generateKeyPair();

        const exportedPublicKey = await exportPublicKey(keyPair.publicKey);

        await saveKeys(keyPair.privateKey, exportedPublicKey);

        publicKey = exportedPublicKey;
      }

      // API call
      await api.post("/auth/register", {
        username,
        password,
        publicKey,
      });

      navigate("/");

    } catch (err) {
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #071510 0%, #0b1e17 40%, #071510 100%)' }}>

    {/* Top radial glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(64,210,186,0.13), transparent)',
        pointerEvents: 'none'
    }} />

    {/* Card */}
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
          <h1 className="text-4xl font-bold mb-3" style={{
                backgroundImage: "linear-gradient(135deg, #40D2BA, #40D2BA)",
                backgroundClip: 'text',
                color: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
            }}>
              Layered
            </h1>
          <p className="text-white/55 text-sm" style={{ fontWeight: 400 }}>
            Create your account
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Username */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55 w-4 h-4" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                const val = e.target.value;
                setUsername(val);
                checkUsername(val);
              }}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border text-white placeholder:text-white/55 outline-none transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>

          {/* Username status */}
          {usernameStatus === "checking" && (
            <p className="text-xs text-white/55">Checking...</p>
          )}
          {usernameStatus === "available" && (
            <p className="text-xs text-teal-accent">Available ✔</p>
          )}
          {usernameStatus === "taken" && (
            <p className="text-xs text-red-400">Taken ✖</p>
          )}

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55 w-4 h-4" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                validatePasswords(val, confirmPassword);
              }}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border text-white placeholder:text-white/55 outline-none transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55 w-4 h-4" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                const val = e.target.value;
                setConfirmPassword(val);
                validatePasswords(password, val);
              }}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border text-white placeholder:text-white/55 outline-none transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                borderColor: passwordError ? "rgba(244, 63, 94, 0.5)" : "rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>

          {passwordError && (
            <p className="text-xs text-red-400">{passwordError}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading || usernameStatus !== "available" || passwordError}
            className="w-full py-3.5 rounded-2xl text-[#04342C] font-semibold transition hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: "#40D2BA",
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-xs text-white/55 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-teal-accent cursor-pointer hover:underline"
            style={{ fontWeight: 500 }}
          >
            Login
          </span>
        </p>

      </div>
    </div>

  </div>
);
};

export default RegisterPage;