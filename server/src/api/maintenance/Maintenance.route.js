import express from "express";
import {
  createMaintenance,
  getAllMaintenances,
  updateMaintenance,
  deleteMaintenance,
  deleteMaintenanceRequest,
  createMaintenanceRequest,
  getTenantRequests,
  updateRequestStatus,
  getTenantsRequests,
  getGeneralMaintenances,
} from "./Maintenance.controller.js";
import { userAuth, isAdmin, isTenant } from "../../middleware/auth.js";

const router = express.Router();

// Maintenance (Admin)
router.post("/", userAuth, isAdmin, createMaintenance);
router.get("/", userAuth, isAdmin, getAllMaintenances);
router.get("/general/", userAuth, isAdmin, getGeneralMaintenances);
router.put("/:id", userAuth, isAdmin, updateMaintenance);
router.delete("/:id", userAuth, isAdmin, deleteMaintenance);
router.get("/request", userAuth, isAdmin, getTenantsRequests);
router.put("/requests/:id", userAuth, isAdmin, updateRequestStatus);

// Maintenance Requests (Tenant )
router.post("/request", userAuth, isTenant, createMaintenanceRequest);
router.get("/requests/:userId", userAuth, isTenant, getTenantRequests);
router.delete(
  "/requests/:requestId",
  userAuth,
  isTenant,
  deleteMaintenanceRequest
);

export default router;
