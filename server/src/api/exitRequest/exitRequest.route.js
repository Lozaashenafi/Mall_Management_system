import express from "express";
import {
  // Tenant endpoints
  createExitRequest,
  getMyExitRequests,

  // Admin endpoints
  getAllExitRequests,
  reviewExitRequest,

  // Security officer endpoints
  getApprovedExitRequests,
  verifyExitRequest,
  getExitRequestByTracking,
} from "./exitRequest.controller.js";

import {
  userAuth,
  isAdmin,
  isTenant,
  isSecurityOfficer,
  isAdminOrSecurity,
} from "../../middleware/auth.js";

const router = express.Router();

// ====================== TENANT ROUTES ======================
router.post("/", userAuth, isTenant, createExitRequest);
router.get("/tenant/:tenantId", userAuth, isTenant, getMyExitRequests);

// ====================== ADMIN ROUTES ======================
router.get("/", userAuth, isAdmin, getAllExitRequests);
router.patch("/:requestId/review", userAuth, isAdmin, reviewExitRequest);

// ====================== SECURITY OFFICER ROUTES ======================
router.get(
  "/security/approved",
  userAuth,
  isSecurityOfficer,
  getApprovedExitRequests
);
router.patch(
  "/:requestId/verify",
  userAuth,
  isSecurityOfficer,
  verifyExitRequest
);
router.get(
  "/tracking/:trackingNumber",
  userAuth,
  isAdminOrSecurity,
  getExitRequestByTracking
);

export default router;
