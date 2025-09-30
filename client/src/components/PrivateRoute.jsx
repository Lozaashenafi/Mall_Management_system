import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, adminOnly, tenantOnly }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }

    // Admin-only
    if (adminOnly && !["Admin", "SuperAdmin"].includes(decoded?.role)) {
      return <Navigate to="/tenant" replace />;
    }

    // Tenant-only
    if (tenantOnly && decoded?.role !== "Tenant") {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
