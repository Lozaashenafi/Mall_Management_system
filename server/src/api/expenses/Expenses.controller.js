import prisma from "../../config/prismaClient.js";
import expenseSchema from "./Expenses.schema.js";
import { createAuditLog } from "../../utils/audit.js";

// Create a new expense
export const createExpense = async (req, res) => {
  try {
    const { error, value } = expenseSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { category, description, amount, date, recordedBy } = value;

    const user = await prisma.user.findUnique({
      where: { userId: recordedBy },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const expense = await prisma.expense.create({
      data: { category, description, amount, date: new Date(date), recordedBy },
    });

    // Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "Expense",
      recordId: expense.expenseId,
      newValue: expense,
    });

    res
      .status(201)
      .json({ success: true, message: "Expense recorded", expense });
  } catch (err) {
    console.error("createExpense error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all expenses (optional filters: category, user, date)
export const getExpenses = async (req, res) => {
  try {
    const { category, userId, startDate, endDate } = req.query;
    const where = {};

    if (category) where.category = category;
    if (userId) where.recordedBy = Number(userId);
    if (startDate || endDate) where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);

    const expenses = await prisma.expense.findMany({
      where,
      include: { user: true },
      orderBy: { date: "desc" },
    });

    res.json({ success: true, expenses });
  } catch (err) {
    console.error("getExpenses error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single expense
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({
      where: { expenseId: Number(id) },
      include: { user: true },
    });

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ success: true, expense });
  } catch (err) {
    console.error("getExpenseById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { error, value } = expenseSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const existing = await prisma.expense.findUnique({
      where: { expenseId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Expense not found" });

    const updated = await prisma.expense.update({
      where: { expenseId: Number(id) },
      data: value,
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "Expense",
      recordId: updated.expenseId,
      oldValue: existing,
      newValue: updated,
    });

    res.json({ success: true, message: "Expense updated", expense: updated });
  } catch (err) {
    console.error("updateExpense error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.expense.findUnique({
      where: { expenseId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Expense not found" });

    await prisma.expense.delete({ where: { expenseId: Number(id) } });

    await createAuditLog({
      userId: req.user.userId,
      action: "deleted",
      tableName: "Expense",
      recordId: existing.expenseId,
      oldValue: existing,
    });

    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("deleteExpense error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
