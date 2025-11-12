import express from "express";
import {
  getBankTransactions,
  getBankTransactionById,
  createBankTransaction,
  transferBetweenAccounts,
} from "./bankTransaction.controller.js";
import upload from "../../middleware/multer.js";

import { userAuth, isAdmin } from "../../middleware/auth.js";

const router = express.Router();

// Bank Transactions Routes
router.get("/", userAuth, isAdmin, getBankTransactions);
router.get("/:id", userAuth, isAdmin, getBankTransactionById);
router.post(
  "/",
  userAuth,
  isAdmin,
  upload.single("receiptImage"),
  createBankTransaction
);
router.post(
  "/transfer",
  userAuth,
  isAdmin,
  upload.single("receiptImage"),
  transferBetweenAccounts
);

export default router;
