import express from "express";
import { userAuth, isAdmin } from "../../middleware/auth.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
} from "./Payment.controller.js";

const router = express.Router();

router.get("/", userAuth, isAdmin, getPayments);
router.get("/:id", userAuth, isAdmin, getPaymentById);
router.post("/", userAuth, isAdmin, createPayment);
router.put("/:id", userAuth, isAdmin, updatePayment);

export default router;
