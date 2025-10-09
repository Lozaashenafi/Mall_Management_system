import prisma from "../../config/prismaClient.js";
import utilityExpenseSchema from "./Expenses.schema.js";
import { createAuditLog } from "../../utils/audit.js";
import path from "path";
import fs from "fs";

// Create a new utility expense with optional file
export const createUtilityExpense = async (req, res) => {
  try {
    const { error, value } = utilityExpenseSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { type, description, amount, date, createdBy } = value;

    let invoicePath = null;
    if (req.file) {
      invoicePath = req.file.path; // multer stores file path
    }

    const expense = await prisma.utilityExpense.create({
      data: {
        type,
        description,
        amount,
        date: date ? new Date(date) : new Date(),
        createdBy,
        invoice: invoicePath,
      },
    });

    // Audit log
    await createAuditLog({
      userId: createdBy,
      action: "created",
      tableName: "UtilityExpense",
      recordId: expense.expenseId,
      newValue: expense,
    });

    res.status(201).json({
      success: true,
      message: "Utility expense recorded",
      expense,
    });
  } catch (err) {
    console.error("createUtilityExpense error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all utility expenses (filters: type, user, date)
export const getUtilityExpenses = async (req, res) => {
  try {
    const { type, userId, startDate, endDate } = req.query;
    const where = {};

    if (type) where.type = type;
    if (userId) where.createdBy = Number(userId);
    if (startDate || endDate) where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);

    const expenses = await prisma.utilityExpense.findMany({
      where,
      include: { user: true },
      orderBy: { date: "desc" },
    });

    res.json({ success: true, expenses });
  } catch (err) {
    console.error("getUtilityExpenses error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single utility expense by ID
export const getUtilityExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await prisma.utilityExpense.findUnique({
      where: { expenseId: Number(id) },
      include: { user: true },
    });

    if (!expense)
      return res.status(404).json({ message: "Utility expense not found" });

    res.json({ success: true, expense });
  } catch (err) {
    console.error("getUtilityExpenseById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update utility expense (with optional file)
export const updateUtilityExpense = async (req, res) => {
  try {
    const { error, value } = utilityExpenseSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const existing = await prisma.utilityExpense.findUnique({
      where: { expenseId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Utility expense not found" });

    let invoicePath = existing.invoice;
    if (req.file) {
      // delete old file if exists
      if (invoicePath && fs.existsSync(invoicePath)) fs.unlinkSync(invoicePath);
      invoicePath = req.file.path;
    }

    const updated = await prisma.utilityExpense.update({
      where: { expenseId: Number(id) },
      data: { ...value, invoice: invoicePath },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "UtilityExpense",
      recordId: updated.expenseId,
      oldValue: existing,
      newValue: updated,
    });

    res.json({
      success: true,
      message: "Utility expense updated",
      expense: updated,
    });
  } catch (err) {
    console.error("updateUtilityExpense error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete utility expense
export const deleteUtilityExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.utilityExpense.findUnique({
      where: { expenseId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Utility expense not found" });

    // delete invoice file if exists
    if (existing.invoice && fs.existsSync(existing.invoice))
      fs.unlinkSync(existing.invoice);

    await prisma.utilityExpense.delete({ where: { expenseId: Number(id) } });

    await createAuditLog({
      userId: req.user.userId,
      action: "deleted",
      tableName: "UtilityExpense",
      recordId: existing.expenseId,
      oldValue: existing,
    });

    res.json({ success: true, message: "Utility expense deleted" });
  } catch (err) {
    console.error("deleteUtilityExpense error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
