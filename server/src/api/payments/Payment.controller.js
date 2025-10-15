import prisma from "../../config/prismaClient.js";
import paymentSchema from "./Pyement.schema.js";
import { createAuditLog } from "../../utils/audit.js";

// ✅ Create Payment
export const createPayment = async (req, res) => {
  try {
    const { error, value } = paymentSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { invoiceId, utilityInvoiceId, amount, method, reference } = value;

    // Validate related invoice if provided
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({ where: { invoiceId } });
      if (!invoice)
        return res.status(404).json({ message: "Invoice not found" });
    }

    if (utilityInvoiceId) {
      const utilInvoice = await prisma.utilityInvoice.findUnique({
        where: { id: utilityInvoiceId },
      });
      if (!utilInvoice)
        return res.status(404).json({ message: "Utility Invoice not found" });
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        utilityInvoiceId,
        amount,
        method,
        reference,
      },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "Payment",
      recordId: payment.id,
      newValue: payment,
    });

    res.status(201).json({ success: true, payment });
  } catch (err) {
    console.error("createPayment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ List Payments
export const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { invoice: true, utilityInvoice: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, payments });
  } catch (err) {
    console.error("getPayments error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get Payment By ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id: Number(id) },
      include: { invoice: true, utilityInvoice: true },
    });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.json({ success: true, payment });
  } catch (err) {
    console.error("getPaymentById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update Payment (ex: mark as completed)
export const updatePayment = async (req, res) => {
  try {
    const { error, value } = paymentSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const existing = await prisma.payment.findUnique({
      where: { id: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Payment not found" });

    const updated = await prisma.payment.update({
      where: { id: Number(id) },
      data: value,
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "Payment",
      recordId: updated.id,
      oldValue: existing,
      newValue: updated,
    });

    res.json({ success: true, payment: updated });
  } catch (err) {
    console.error("updatePayment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
