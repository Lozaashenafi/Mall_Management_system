import express from "express";
import authRoutes from "../api/auth/Auth.route.js";
const router = express.Router();
import tenantRoutes from "../api/tenants/Tenant.route.js";
import roomRoutes from "../api/rooms/Room.route.js";
import auditLogRoutes from "./auditLog.routes.js";
// Auth routes
router.use("/auth", authRoutes);
router.use("/tenants", tenantRoutes);
router.use("/rooms", roomRoutes);
router.use("/audit", auditLogRoutes);
export default router;
