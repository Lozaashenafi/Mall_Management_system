import express from "express";
import { userAuth, isAdmin } from "../../middleware/auth.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
} from "./Payment.controller.js";
import upload from "../../middleware/multer.js";

const router = express.Router();

router.get("/", userAuth, isAdmin, getPayments);
router.get("/:id", userAuth, isAdmin, getPaymentById);
router.post("/", userAuth, isAdmin, upload.single("receipt"), createPayment);
router.put("/:id", userAuth, isAdmin, upload.single("receipt"), updatePayment);

export default router;
