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

const uploadTenantDocs = upload.fields([
  { name: "identificationDocument", maxCount: 1 },
  { name: "businessLicense", maxCount: 1 },
]);

router.post("/", userAuth, isAdmin, uploadTenantDocs, addTenant);
router.get("/", userAuth, isAdmin, getTenants);
router.get("/:id", userAuth, isAdmin, getTenantById);
router.put(
  "/:id",
  userAuth,
  isAdmin,
  upload.single("identificationDocument"),
  editTenant
);
router.delete("/:id", userAuth, isAdmin, deleteTenant);

export default router;
