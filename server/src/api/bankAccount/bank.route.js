import express from "express";
import {
  getBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "./back.controller.js";

import { userAuth, isAdmin } from "../../middleware/auth.js";

const router = express.Router();

// Bank Accounts Routes
router.get("/", userAuth, getBankAccounts);
router.get("/:id", userAuth, isAdmin, getBankAccountById);
router.post("/", userAuth, isAdmin, createBankAccount);
router.put("/:id", userAuth, isAdmin, updateBankAccount);
router.delete("/:id", userAuth, isAdmin, deleteBankAccount);

export default router;
