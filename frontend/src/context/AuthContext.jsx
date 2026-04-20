import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 auto-login on refresh (cookie se)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me"); // backend route banana padega
        setUser(res.data.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // 🔥 login (cookie already set by backend)
  const login = (userData) => {
    setUser(userData);
  };

  // 🔥 logout
  const logout = async () => {
    try {
      await api.post("/auth/logout"); // backend cookie clear karega
    } catch (err) {
      console.error(err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext);