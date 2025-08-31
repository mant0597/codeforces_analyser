
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
        
      } catch (err) {
        console.error("Failed to parse stored user", err);
        localStorage.removeItem("user");
      }
    }

    if (storedToken && storedToken !== "undefined") {
      setToken(storedToken);
    }
  }, []);

  const login = (userData, tokenValue) => {
    if (!userData || !tokenValue) return;

    setUser(userData);
    setToken(tokenValue);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
