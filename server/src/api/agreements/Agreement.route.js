import express from "express";
import { generateAgreement } from "./Agreement.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";

const router = express.Router();

// Generate a new rental agreement for a tenant
router.get("/:rentId/generate", userAuth, isAdmin, generateAgreement);

export default router;
