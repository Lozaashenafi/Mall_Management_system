import express from "express";
import {
  createMaintenance,
  getAllMaintenances,
  updateMaintenance,
  deleteMaintenance,
  createMaintenanceRequest,
  getTenantRequests,
  updateRequestStatus,
} from "./Maintenance.controller.js";
import { userAuth, isAdmin, isTenant } from "../../middleware/auth.js";

const router = express.Router();

// Maintenance (Admin)
router.post("/", userAuth, isAdmin, createMaintenance);
router.get("/", userAuth, isAdmin, getAllMaintenances);
router.put("/:id", userAuth, isAdmin, updateMaintenance);
router.delete("/:id", userAuth, isAdmin, deleteMaintenance);

// Maintenance Requests (Tenant )
router.post("/request", userAuth, isTenant, createMaintenanceRequest);
router.get("/requests/:tenantId", userAuth, isTenant, getTenantRequests);
router.put("/requests/:id", userAuth, isTenant, updateRequestStatus);

export default router;
