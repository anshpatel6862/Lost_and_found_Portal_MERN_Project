import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Page reload par check karo ki login hai ya nahi
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser)); // User data wapas object banao
      } catch (error) {
        console.error("Error parsing user data", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // --- LOGIN FUNCTION ---
  const login = (token, userData) => {
    // 1. Local Storage me sahi se save karo
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData)); // User object ko string bana kar save karo

    // 2. State update karo
    setUser(userData);
  };

  // --- LOGOUT FUNCTION ---
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};