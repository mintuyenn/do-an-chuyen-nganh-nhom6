// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Fetch profile khi token thay đổi
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      localStorage.setItem("token", token);

      try {
        const res = await axios.get("http://localhost:5001/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Profile response:", res.data);
        setUser(res.data.user);
      } catch (error) {
        console.error("Fetch profile error:", error.response?.data || error);
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Login: nhận { token, user } từ backend
  const login = (data) => {
    setToken(data.token);
    setUser(data.user); // data.user phải có { username, email, ... }
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line
export const useAuth = () => useContext(AuthContext);
