import express from "express";
import { userAuth, isAdmin } from "../../middleware/auth.js";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  downloadInvoicePdf,
} from "./Invoice.controller.js";

const router = express.Router();

router.get("/", userAuth, isAdmin, getInvoices);
router.get("/:id", userAuth, isAdmin, getInvoiceById);
router.post("/", userAuth, isAdmin, createInvoice);
router.get("/:id/pdf", userAuth, downloadInvoicePdf);
router.put("/:id", userAuth, isAdmin, updateInvoice);

export default router;
