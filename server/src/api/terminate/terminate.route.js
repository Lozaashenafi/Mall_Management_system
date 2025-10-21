import express from "express";

import { userAuth, isAdmin, isTenant } from "../../middleware/auth.js";
import {
  addTerminateRequest,
  getTerminateRequest,
  getTerminateRequestsByUserId,
  editTerminateRequest,
  deleteTerminateRequest,
  adminUpdateTerminateRequestStatus,
  // addTerminateRequestByAdmin,
} from "./terminate.controller.js";

const router = express.Router();

router.post("/", userAuth, isTenant, addTerminateRequest);
router.get("/:id", userAuth, isTenant, getTerminateRequestsByUserId);
router.get("/", userAuth, isAdmin, getTerminateRequest);
router.put("/:id", userAuth, isTenant, editTerminateRequest);
router.delete("/:id", userAuth, isTenant, deleteTerminateRequest);
router.put("/admin/:id", userAuth, isAdmin, adminUpdateTerminateRequestStatus);
// router.post("/admin/:id", userAuth, isAdmin, addTerminateRequestByAdmin);

export default router;
