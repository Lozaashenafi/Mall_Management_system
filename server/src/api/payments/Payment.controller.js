import prisma from "../../config/prismaClient.js";
import paymentSchema from "./Pyement.schema.js";
import fs from "fs";
import { createAuditLog } from "../../utils/audit.js";

export const createPayment = async (req, res) => {
  try {
    const { error, value } = paymentSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const {
      invoiceId,
      utilityInvoiceId,
      amount,
      method,
      reference,
      paymentDate,
    } = value;
    let receiptFilePath = null;
    if (req.file) {
      receiptFilePath = `/uploads/${req.file.filename}`;
    }

    let rentalId = null;
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { invoiceId },
        include: { rental: true },
      });
      if (!invoice)
        return res.status(404).json({ message: "Invoice not found" });
      rentalId = invoice.rentId;
    }

    if (utilityInvoiceId) {
      const utilInvoice = await prisma.utilityInvoice.findUnique({
        where: { id: utilityInvoiceId },
      });
      if (!utilInvoice)
        return res.status(404).json({ message: "Utility Invoice not found" });
    }

    let baseDate;
    let paymentInterval = "Monthly";

    if (rentalId) {
      const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
      });

      if (rental) {
        paymentInterval = rental.paymentInterval || "Monthly";

        // Find last payment for this rental
        const lastPayment = await prisma.payment.findFirst({
          where: { rentalId },
          orderBy: { endDate: "desc" },
        });

        baseDate = lastPayment
          ? new Date(lastPayment.endDate)
          : new Date(rental.startDate);
      }
    } else {
      baseDate = new Date(paymentDate); // fallback if no rental found
    }

    // --- Calculate new endDate based on interval
    const endDate = new Date(baseDate);
    if (paymentInterval === "Monthly") endDate.setMonth(endDate.getMonth() + 1);
    else if (paymentInterval === "Quarterly")
      endDate.setMonth(endDate.getMonth() + 3);
    else if (paymentInterval === "Yearly")
      endDate.setMonth(endDate.getMonth() + 12);
    else endDate.setMonth(endDate.getMonth() + 1);

    // --- Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        utilityInvoiceId,
        amount,
        method,
        reference,
        receiptFilePath,
        paymentDate,
        endDate,
        status: "Confirmed",
        rentalId,
      },
    });

    // --- Mark invoice as paid
    if (invoiceId) {
      await prisma.invoice.update({
        where: { invoiceId },
        data: { status: "Paid" },
      });
    }

    // --- Log audit
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
      include: {
        invoice: {
          include: {
            rental: {
              include: { tenant: true, room: true },
            },
          },
        },
        utilityInvoice: true,
      },
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
      where: { paymentId: Number(id) },
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
      where: { paymentId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Payment not found" });

    let receiptFilePath = existing.receiptFilePath;
    if (req.file) {
      // delete old file if new one uploaded
      if (receiptFilePath && fs.existsSync(`.${receiptFilePath}`)) {
        fs.unlinkSync(`.${receiptFilePath}`);
      }
      receiptFilePath = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.payment.update({
      where: { paymentId: Number(req.params.id) },
      data: { ...value, receiptFilePath },
      include: {
        invoice: {
          include: {
            rental: {
              include: {
                tenant: true,
                room: true,
              },
            },
          },
        },
      },
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
