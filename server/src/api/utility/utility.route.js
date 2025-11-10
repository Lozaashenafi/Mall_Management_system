import express from "express";
import {
  getMonthlyUtilitySummary,
  generateUtilityCharge,
  getUtilityCharges,
  TenantsInvoiceOfthisMonth,
  getUtilityChargesByMonth,
  getUtilityInvoiceById,
  getInvoicesByUserId,
  downloadUtilityInvoicePdf,
} from "./utility.controller.js";

const router = express.Router();

router.get("/summary", getMonthlyUtilitySummary);
router.get("/userinvoice/:userId", getInvoicesByUserId);
router.post("/generate", generateUtilityCharge);
router.get("/generate", getUtilityCharges);
router.get("/invoice", TenantsInvoiceOfthisMonth);
router.get("/invoice/:id", getUtilityInvoiceById);
router.get("/invoice/:id/pdf", downloadUtilityInvoicePdf);
router.get("/charges", getUtilityChargesByMonth);
export default router;
