import express from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "./Expenses.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";

const router = express.Router();

// List expenses
router.get("/", userAuth, isAdmin, getExpenses);

// Get single expense
router.get("/:id", userAuth, isAdmin, getExpenseById);

// Admin-only actions
router.post("/", userAuth, isAdmin, createExpense);
router.put("/:id", userAuth, isAdmin, updateExpense);
router.delete("/:id", userAuth, isAdmin, deleteExpense);

export default router;
