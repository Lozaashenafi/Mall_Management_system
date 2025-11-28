// src/api/overdue/overdue.routes.js
import express from "express";
import {
  runCacheUpdate,
  getAllOverdueTenants,
  getMostOverdue,
  getFrequentOverdue,
  getOverdueStatistics,
  getAllOverdueInvoices,
} from "./overdue.controller.js";

const router = express.Router();

router.post("/cache-update", runCacheUpdate);
router.get("/tenants", getAllOverdueTenants);
router.get("/tenants/most-overdue", getMostOverdue);
router.get("/tenants/frequent", getFrequentOverdue);
router.get("/stats", getOverdueStatistics);
router.get("/invoices", getAllOverdueInvoices);

export default router;
