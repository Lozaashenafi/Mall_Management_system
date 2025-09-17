import React, { createContext, useState, useContext, useEffect } from "react";

import { loginRequest, registerRequest } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
        localStorage.removeItem("user");
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
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (fullName, email, password) => {
    try {
      setError("");
      const data = await registerRequest({ fullName, email, password });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    login,
    register,
    logout,
    error,
    setError,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
