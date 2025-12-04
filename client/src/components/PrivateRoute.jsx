import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, adminOnly, tenantOnly, securityOnly }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Token expiration check
    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }
    // Extract role from token (handle different case variations)
    const userRole = decoded?.role || decoded?.userRole || "User";

    // Admin-only routes
    if (
      adminOnly &&
      !["Admin", "admin", "SuperAdmin", "superadmin"].includes(userRole)
    ) {
      // Redirect based on actual role
      if (userRole === "Tenant" || userRole === "tenant") {
        return <Navigate to="/tenant" replace />;
      } else if (
        userRole === "Security" ||
        userRole === "security" ||
        userRole === "SecurityOfficer"
      ) {
        return <Navigate to="/security" replace />;
      }
      return <Navigate to="/login" replace />;
    }

    // Tenant-only routes
    if (tenantOnly && !["Tenant", "tenant"].includes(userRole)) {
      // Redirect based on actual role
      if (["Admin", "admin", "SuperAdmin", "superadmin"].includes(userRole)) {
        return <Navigate to="/" replace />;
      } else if (
        userRole === "Security" ||
        userRole === "security" ||
        userRole === "SecurityOfficer"
      ) {
        return <Navigate to="/security" replace />;
      }
      return <Navigate to="/login" replace />;
    }

    // Security-only routes
    if (
      securityOnly &&
      !["Security", "security", "SecurityOfficer", "securityofficer"].includes(
        userRole
      )
    ) {
      // Redirect based on actual role
      if (["Admin", "admin", "SuperAdmin", "superadmin"].includes(userRole)) {
        return <Navigate to="/" replace />;
      } else if (userRole === "Tenant" || userRole === "tenant") {
        return <Navigate to="/tenant" replace />;
      }
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    console.error("Token decoding error:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
