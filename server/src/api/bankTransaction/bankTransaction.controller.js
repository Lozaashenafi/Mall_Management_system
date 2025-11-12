import prisma from "../../config/prismaClient.js";
import bankTransactionSchema from "./bankaTransaction.schema.js";
import { createAuditLog } from "../../utils/audit.js";
import fs from "fs";

export const getBankTransactions = async (req, res) => {
  try {
    const transactions = await prisma.bankTransaction.findMany({
      orderBy: { transactionDate: "desc" },
      include: { bankAccount: true, payment: true },
    });
    res.json({ success: true, transactions });
  } catch (err) {
    console.error("getBankTransactions error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getBankTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.bankTransaction.findUnique({
      where: { transactionId: Number(id) },
      include: { bankAccount: true, payment: true },
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    res.json({ success: true, transaction });
  } catch (err) {
    console.error("getBankTransactionById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const createBankTransaction = async (req, res) => {
  try {
    const { error, value } = bankTransactionSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Handle receipt image
    if (req.file) {
      value.receiptImage = req.file.path;
    }

    // ✅ Transaction in DB: adjust account balance atomically
    const transaction = await prisma.$transaction(async (prisma) => {
      // 1️⃣ Create the bank transaction
      const createdTransaction = await prisma.bankTransaction.create({
        data: value,
      });

      // 2️⃣ Update the bank account balance if bankAccountId is provided
      if (value.bankAccountId) {
        const account = await prisma.bankAccount.findUnique({
          where: { bankAccountId: value.bankAccountId },
        });

        if (!account) throw new Error("Bank account not found");

        let newBalance = account.balance;

        if (value.type === "Deposit") {
          newBalance += value.amount;
        } else if (value.type === "Withdrawal") {
          if (value.amount > account.balance) {
            throw new Error("Insufficient balance for this transaction");
          }
          newBalance -= value.amount;
        }

        await prisma.bankAccount.update({
          where: { bankAccountId: value.bankAccountId },
          data: { balance: newBalance },
        });
      }

      return createdTransaction;
    });

    // 3️⃣ Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "BankTransaction",
      recordId: transaction.transactionId,
      newValue: transaction,
    });

    res.status(201).json({
      success: true,
      message: "Transaction recorded and balance updated",
      transaction,
    });
  } catch (err) {
    console.error("createBankTransaction error:", err);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const transferBetweenAccounts = async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    // ✅ Basic validation
    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (Number(fromAccountId) === Number(toAccountId)) {
      return res
        .status(400)
        .json({ message: "Cannot transfer to the same account" });
    }

    // ✅ Use a transaction for atomicity
    const transfer = await prisma.$transaction(async (prisma) => {
      // 1️⃣ Get both accounts
      const sender = await prisma.bankAccount.findUnique({
        where: { bankAccountId: Number(fromAccountId) },
      });
      const receiver = await prisma.bankAccount.findUnique({
        where: { bankAccountId: Number(toAccountId) },
      });

      if (!sender) throw new Error("Sender account not found");
      if (!receiver) throw new Error("Receiver account not found");

      if (sender.balance < amount) throw new Error("Insufficient funds");

      // 2️⃣ Update both balances
      await prisma.bankAccount.update({
        where: { bankAccountId: sender.bankAccountId },
        data: { balance: sender.balance - Number(amount) },
      });

      await prisma.bankAccount.update({
        where: { bankAccountId: receiver.bankAccountId },
        data: { balance: receiver.balance + Number(amount) },
      });

      // 3️⃣ Record the transaction
      const transaction = await prisma.bankTransaction.create({
        data: {
          bankAccountId: sender.bankAccountId,
          receiverAccountId: String(receiver.bankAccountId),
          receiverAccount: receiver.accountNumber,
          receiverName: receiver.accountName,
          type: "Transfer",
          amount: Number(amount),
          description:
            description ||
            `Transfer from ${sender.accountName} to ${receiver.accountName}`,
        },
      });

      return transaction;
    });

    // 4️⃣ Log the action
    await createAuditLog({
      userId: req.user.userId,
      action: "transfer",
      tableName: "BankTransaction",
      recordId: transfer.transactionId,
      newValue: transfer,
    });

    res.status(201).json({
      success: true,
      message: "Transfer completed successfully",
      transfer,
    });
  } catch (err) {
    console.error("transferBetweenAccounts error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
