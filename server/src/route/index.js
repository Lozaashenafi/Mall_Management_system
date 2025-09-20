import express from "express";
import authRoutes from "../api/auth/Auth.route.js";
const router = express.Router();
import tenantRoutes from "../api/tenants/Tenant.route.js";
// Auth routes
router.use("/auth", authRoutes);
router.use("/tenants", tenantRoutes);
export default router;
