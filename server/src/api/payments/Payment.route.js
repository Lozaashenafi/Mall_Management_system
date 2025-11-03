import express from "express";
import { userAuth, isAdmin, isTenant } from "../../middleware/auth.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  createPaymentRequest,
  updatePayment,
  getPaymentRequests,
  handlePaymentRequest,
  getPaymentRequestById,
} from "./Payment.controller.js";
import upload from "../../middleware/multer.js";

const router = express.Router();

router.get("/", userAuth, isAdmin, getPayments);
router.post(
  "/request",
  userAuth,
  isTenant,
  upload.single("proofFile"),
  createPaymentRequest
);
router.get("/request", userAuth, isAdmin, getPaymentRequests);
router.put("/request/:id", userAuth, isAdmin, handlePaymentRequest);
router.get("/request/:id", userAuth, getPaymentRequestById);

router.get("/:id", userAuth, isAdmin, getPaymentById);
router.post("/", userAuth, isAdmin, upload.single("receipt"), createPayment);
router.put("/:id", userAuth, isAdmin, upload.single("receipt"), updatePayment);

export default router;
