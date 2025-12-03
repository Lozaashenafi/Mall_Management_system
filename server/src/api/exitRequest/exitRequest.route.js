import express from "express";
import {
  // Tenant endpoints
  createExitRequest,
  getMyExitRequests,
  getExitRequestById,
  // Admin endpoints
  getAllExitRequests,
  reviewExitRequest,

  // Security officer endpoints
  getApprovedExitRequests,
  verifyExitRequest,
  getExitRequestByTracking,
} from "./exitRequest.controller.js";

import { userAuth } from "../../middleware/auth.js";

const router = express.Router();

// ====================== TENANT ROUTES ======================
router.post("/", userAuth, createExitRequest);
router.get("/tenant/:userId", userAuth, getMyExitRequests);
router.get("/:requestId", userAuth, getExitRequestById);

// ====================== ADMIN ROUTES ======================
router.get("/", userAuth, getAllExitRequests);
router.patch("/:requestId/review", userAuth, reviewExitRequest);

// ====================== SECURITY OFFICER ROUTES ======================
router.get("/security/approved", userAuth, getApprovedExitRequests);
router.patch("/:requestId/verify", userAuth, verifyExitRequest);
router.get("/tracking/:trackingNumber", userAuth, getExitRequestByTracking);

export default router;
