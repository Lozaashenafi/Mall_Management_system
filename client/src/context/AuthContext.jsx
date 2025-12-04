import { createContext, useState, useContext, useEffect } from "react";
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
      setError(""); // Clear previous errors

      // Input validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const data = await loginRequest(email, password);

      // Validate response structure
      if (!data || !data.user || !data.token) {
        throw new Error("Invalid response from server");
      }

      setUser(data.user);

      // Consider using a more secure storage method
      // For sensitive data, especially tokens
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      // Role-based data handling
      if (data.user.role?.toLowerCase() === "tenant") {
        if (data.user.rentals) {
          localStorage.setItem("rentals", JSON.stringify(data.user.rentals));
        }
      }

      return data;
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Only throw if you want calling code to handle it too
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

  const editProfile = async (formData) => {
    try {
      const data = await editProfileRequest(formData);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Profile updated successfully");
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
    localStorage.removeItem("rentals");
    localStorage.removeItem("assignedProperty");
  };

  // Role check helper functions
  const isTenant = user?.role?.toLowerCase() === "tenant";
  const isSecurityOfficer = user?.role?.toLowerCase() === "securityofficer";
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isSuperAdmin = user?.role?.toLowerCase() === "superadmin";

  // Combined role check functions
  const isStaff = () => {
    const role = user?.role?.toLowerCase();
    return (
      role === "securityofficer" || role === "admin" || role === "superadmin"
    );
  };

  const hasAdminAccess = () => {
    const role = user?.role?.toLowerCase();
    return role === "admin" || role === "superadmin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        // Individual role checkers
        isTenant,
        isSecurityOfficer,
        isAdmin,
        isSuperAdmin,
        isStaff: isStaff(),
        hasAdminAccess: hasAdminAccess(),
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
