import express from "express";
import {
  deleteUtilityExpense,
  createUtilityExpense,
  updateUtilityExpense,
  getUtilityExpenseById,
  getUtilityExpenses,
  getUtilityTypes,
} from "./Expenses.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";
import upload from "../../middleware/multer.js";

const router = express.Router();

router.get("/", userAuth, isAdmin, getUtilityExpenses);
router.get("/type", getUtilityTypes);
router.get("/:id", userAuth, isAdmin, getUtilityExpenseById);
router.post(
  "/",
  userAuth,
  isAdmin,
  upload.single("invoice"),
  createUtilityExpense
);
router.put(
  "/:id",
  userAuth,
  isAdmin,
  upload.single("invoice"),
  updateUtilityExpense
);
router.delete("/:id", userAuth, isAdmin, deleteUtilityExpense);

export default router;
