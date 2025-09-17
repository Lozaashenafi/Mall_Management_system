import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, adminOnly }) => {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  // If no token → redirect
  if (!token) return <Navigate to="/login" replace />;

  // If adminOnly → check role
  if (adminOnly && !["Admin", "SuperAdmin"].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
