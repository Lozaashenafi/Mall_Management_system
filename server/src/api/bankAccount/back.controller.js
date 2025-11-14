import prisma from "../../config/prismaClient.js";
import bankAccountSchema from "./bank.schema.js";
import { createAuditLog } from "../../utils/audit.js";

export const getBankAccounts = async (req, res) => {
  try {
    const accounts = await prisma.bankAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { transactions: true },
    });

    res.json({ success: true, accounts });
  } catch (err) {
    console.error("getBankAccounts error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getBankAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await prisma.bankAccount.findUnique({
      where: { bankAccountId: Number(id) },
      include: { transactions: true },
    });

    if (!account)
      return res.status(404).json({ message: "Bank account not found" });

    res.json({ success: true, account });
  } catch (err) {
    console.error("getBankAccountById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createBankAccount = async (req, res) => {
  try {
    const { error, value } = bankAccountSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const account = await prisma.bankAccount.create({ data: value });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "BankAccount",
      recordId: account.bankAccountId,
      newValue: account,
    });

    res
      .status(201)
      .json({ success: true, message: "Bank account created", account });
  } catch (err) {
    console.error("createBankAccount error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateBankAccount = async (req, res) => {
  try {
    const { error, value } = bankAccountSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const existing = await prisma.bankAccount.findUnique({
      where: { bankAccountId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Bank account not found" });

    const updated = await prisma.bankAccount.update({
      where: { bankAccountId: Number(id) },
      data: value,
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "BankAccount",
      recordId: updated.bankAccountId,
      oldValue: existing,
      newValue: updated,
    });

    res.json({
      success: true,
      message: "Bank account updated",
      account: updated,
    });
  } catch (err) {
    console.error("updateBankAccount error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.bankAccount.findUnique({
      where: { bankAccountId: Number(id) },
    });

    if (!existing)
      return res.status(404).json({ message: "Bank account not found" });

    if (existing.balance > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate account with non-zero balance",
      });
    }

    // Mark as inactive
    const updated = await prisma.bankAccount.update({
      where: { bankAccountId: Number(id) },
      data: { isActive: false },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "deactivated",
      tableName: "BankAccount",
      recordId: existing.bankAccountId,
      oldValue: existing,
      newValue: updated,
    });

    res.json({
      success: true,
      message: "Bank account deactivated",
      account: updated,
    });
  } catch (err) {
    console.error("deleteBankAccount error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
