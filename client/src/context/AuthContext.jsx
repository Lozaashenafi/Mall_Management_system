import React, { createContext, useState, useContext, useEffect } from "react";
import {
  loginRequest,
  registerRequest,
  editProfileRequest,
  changePasswordRequest,
} from "../services/authService";
import { toast } from "react-hot-toast";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp > currentTime) {
          setUser(JSON.parse(storedUser));
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError("");
      const data = await loginRequest(email, password);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      setError(err.message || "Login failed");
      toast.error(err.message || "Login failed"); // ✅ toast
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError("");
      const data = await registerRequest(userData);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      setError(err.message || "Registration failed");
      toast.error(err.message || "Registration failed");
      throw err;
    }
  };

  // ✅ New editProfile function
  const editProfile = async (formData) => {
    try {
      const data = await editProfileRequest(formData);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Profile updated successfully"); // ✅ toast
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Profile update failed");
      throw err;
    }
  };
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const data = await changePasswordRequest({ oldPassword, newPassword });
      toast.success(data.message || "Password updated successfully");
      return data;
    } catch (err) {
      toast.error(err.message || "Failed to change password");
      throw err;
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const isTenant = user?.role?.toLowerCase() === "tenant";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        isTenant,
        editProfile,
        changePassword,
        logout,
        error,
        setError,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
