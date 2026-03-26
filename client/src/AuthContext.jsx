import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateAuth = async () => {
      const savedToken = localStorage.getItem("ssc_token");
      const savedUser = localStorage.getItem("ssc_user");

      if (!savedToken || !savedUser) {
        setLoading(false);
        return;
      }

      setToken(savedToken);
      setUser(JSON.parse(savedUser));

      // Validate token on app load
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token invalid");
        }

        const data = await response.json();
        const normalizedUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          studentId: data.studentId,
          faculty: data.faculty,
          course: data.course,
          year: data.year,
        };

        setUser(normalizedUser);
        localStorage.setItem("ssc_user", JSON.stringify(normalizedUser));
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem("ssc_token");
        localStorage.removeItem("ssc_user");
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();
  }, []);

  const login = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("ssc_token", data.token);
    localStorage.setItem("ssc_user", JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ssc_token");
    localStorage.removeItem("ssc_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);