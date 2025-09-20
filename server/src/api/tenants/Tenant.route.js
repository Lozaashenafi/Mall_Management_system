import express from "express";
import {
  addTenant,
  getTenants,
  getTenantById,
  editTenant,
  deleteTenant,
} from "./Tenant.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";
import upload from "../../middleware/multer.js";

const router = express.Router();

// CRUD routes for tenants
router.post(
  "/",
  userAuth,
  isAdmin,
  upload.single("identificationDocument"),
  addTenant
);
router.get("/", userAuth, isAdmin, getTenants);
router.get("/:id", userAuth, isAdmin, getTenantById);
router.put("/:id", userAuth, isAdmin, editTenant);
router.delete("/:id", userAuth, isAdmin, deleteTenant);

export default router;
