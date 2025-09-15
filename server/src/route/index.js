import express from "express";
import authRoutes from "../api/auth/Auth.route.js";
const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);
export default router;
