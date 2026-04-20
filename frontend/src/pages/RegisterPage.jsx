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
  <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#f0f7f0]">

    {/* Background (SAME as login) */}
    <div className="absolute inset-0">
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-emerald-200/60 to-green-100/40 blur-[100px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-lime-200/50 to-emerald-100/30 blur-[120px]" />
      <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-green-300/20 to-teal-100/20 blur-[80px]" />
      <div className="absolute bottom-[20%] left-[15%] w-[20vw] h-[20vw] rounded-full bg-white/40 blur-[60px]" />
    </div>

    {/* Card */}
    <div className="relative z-10 w-full max-w-md mx-4 animate-[float_6s_ease-in-out_infinite]">
      <div
        className="rounded-3xl p-8 sm:p-10 backdrop-blur-xl border shadow-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.45)",
          borderColor: "rgba(74, 222, 128, 0.25)",
          boxShadow:
            "0 8px 60px rgba(74, 222, 128, 0.12), 0 2px 20px rgba(0,0,0,0.04)",
        }}
      >

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Leaf className="w-7 h-7 text-emerald-500" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #059669, #34d399, #6ee7b7)",
              }}
            >
              Layered
            </h1>
          </div>
          <p className="text-emerald-700/60 text-sm">
            Create your account
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Username */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                const val = e.target.value;
                setUsername(val);
                checkUsername(val);
              }}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border bg-white/50 outline-none"
            />
          </div>

          {/* Username status */}
          {usernameStatus === "checking" && (
            <p className="text-xs text-gray-400">Checking...</p>
          )}
          {usernameStatus === "available" && (
            <p className="text-xs text-green-500">Available ✔</p>
          )}
          {usernameStatus === "taken" && (
            <p className="text-xs text-red-500">Taken ✖</p>
          )}

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                validatePasswords(val, confirmPassword);
              }}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border bg-white/50 outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                const val = e.target.value;
                setConfirmPassword(val);
                validatePasswords(password, val);
              }}
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border bg-white/50 outline-none ${
                passwordError ? "border-red-400" : ""
              }`}
            />
          </div>

          {passwordError && (
            <p className="text-xs text-red-500">{passwordError}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading || usernameStatus !== "available" || passwordError}
            className="w-full py-3.5 rounded-2xl text-white font-semibold transition hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #059669, #34d399)",
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-emerald-600 cursor-pointer"
          >
            Login
          </span>
        </p>

      </div>
    </div>

    {/* animation */}
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
    `}</style>

  </div>
);
};

export default RegisterPage;