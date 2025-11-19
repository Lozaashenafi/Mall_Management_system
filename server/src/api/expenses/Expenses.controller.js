import prisma from "../../config/prismaClient.js";
import utilityExpenseSchema from "./Expenses.schema.js";
import { createAuditLog } from "../../utils/audit.js";
import path from "path";
import fs from "fs";

export const getUtilityTypes = async (req, res) => {
  try {
    const types = await prisma.utilityType.findMany({
      orderBy: { name: "asc" },
    });
    res.json({
      success: true,
      utilityTypes: types,
    });
  } catch (err) {
    console.error("getUtilityTypes error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const createUtilityExpense = async (req, res) => {
  try {
    const { error, value } = utilityExpenseSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const {
      utilityTypeId,
      description,
      amount,
      date,
      createdBy,
      bankAccountId,
      account,
      Name,
    } = value;

    if (!bankAccountId)
      return res.status(400).json({ message: "Bank account is required" });

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { bankAccountId },
    });

    if (!bankAccount)
      return res.status(404).json({ message: "Bank account not found" });
    if (bankAccount.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    // Use the uploaded file path for both expense invoice and bank transaction receipt
    let invoicePath = req.file ? req.file.path : null;

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create utility expense
      const expense = await tx.utilityExpense.create({
        data: {
          utilityTypeId,
          description,
          amount,
          date: date ? new Date(date) : new Date(),
          createdBy,
          invoice: invoicePath,
        },
      });

      // 2️⃣ Create bank transaction using the same invoice as receiptImage
      const bankTransaction = await tx.bankTransaction.create({
        data: {
          bankAccount: {
            connect: { bankAccountId },
          },
          type: "Withdrawal",
          amount,
          description: `Utility Expense: ${description}`,
          account: account || null,
          name: Name || null,
          receiptImage: invoicePath, // reuse invoice
        },
      });

      // 3️⃣ Deduct balance
      await tx.bankAccount.update({
        where: { bankAccountId },
        data: { balance: bankAccount.balance - amount },
      });

      return { expense, bankTransaction };
    });

    // 4️⃣ Audit log
    await createAuditLog({
      userId: createdBy,
      action: "created",
      tableName: "UtilityExpense",
      recordId: result.expense.expenseId,
      newValue: result.expense,
    });

    res.status(201).json({
      success: true,
      message: "Utility expense and bank transaction recorded",
      expense: result.expense,
      transaction: result.bankTransaction,
    });
  } catch (err) {
    console.error("createUtilityExpense error:", err);

    // Delete uploaded file if DB operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Get all utility expenses
export const getUtilityExpenses = async (req, res) => {
  try {
    const { utilityTypeId, userId, startDate, endDate } = req.query;
    const where = {};

    if (utilityTypeId) where.utilityTypeId = Number(utilityTypeId);
    if (userId) where.createdBy = Number(userId);
    if (startDate || endDate) where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);

    const expenses = await prisma.utilityExpense.findMany({
      where,
      include: { user: true, utilityType: true },
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
      include: { user: true, utilityType: true },
    });

    if (!expense)
      return res.status(404).json({ message: "Utility expense not found" });

    res.json({ success: true, expense });
  } catch (err) {
    console.error("getUtilityExpenseById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update utility expense
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
