import { isAdmin, isTenant, userAuth } from "../../middleware/auth.js";
import {
  getDashboardStats,
  getTenantDashboard,
} from "./dashboard.controller.js";
import express from "express";

const router = express.Router();

router.get("/", userAuth, isAdmin, getDashboardStats);
router.get("/:userId", userAuth, isTenant, getTenantDashboard);

export default router;
