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
  createUtilityPayment,
  getPaymentRequestById,
  createUtilityPaymentRequest,
  handleUtilityPaymentRequest,
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
router.put(
  "/utility/request/:id",
  userAuth,
  isAdmin,
  handleUtilityPaymentRequest
);
router.get("/request/:id", userAuth, getPaymentRequestById);

router.get("/:id", userAuth, isAdmin, getPaymentById);
router.post("/", userAuth, isAdmin, upload.single("receipt"), createPayment);
router.post(
  "/utility",
  userAuth,
  isAdmin,
  upload.single("receipt"),
  createUtilityPayment
);
router.post(
  "/utility/request",
  userAuth,
  upload.single("receipt"),
  createUtilityPaymentRequest
);
router.put("/:id", userAuth, isAdmin, upload.single("receipt"), updatePayment);

export default router;
