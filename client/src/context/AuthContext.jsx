import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await API.get("/api/v1/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await API.post("/api/v1/auth/login", { email, password });
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await API.post("/api/v1/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await API.post("/api/v1/auth/logout");
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const { data } = await API.put("/api/v1/auth/update/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(data.user);
    return data;
  };

  const updatePassword = async (passwords) => {
    const { data } = await API.put("/api/v1/auth/update/password", passwords);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
