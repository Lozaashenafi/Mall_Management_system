// src/api/rentals/rental.routes.js
import express from "express";
import {
  createRental,
  getRentals,
  getRentalById,
  updateRental,
  terminateRental,
  renewRental,
  getRentalsByTenant,
} from "./rental.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";

const router = express.Router();

// Public (or protected) list — protect as you need
router.get("/", userAuth, isAdmin, getRentals); // admin-only list
router.get("/tenant/:tenantId", userAuth, getRentalsByTenant); // tenant can see own rentals

router.get("/:id", userAuth, getRentalById);

// admin only actions
router.post("/", userAuth, isAdmin, createRental);
router.put("/:id", userAuth, isAdmin, updateRental);
router.post("/:id/terminate", userAuth, isAdmin, terminateRental);
router.post("/:id/renew", userAuth, isAdmin, renewRental);

export default router;
