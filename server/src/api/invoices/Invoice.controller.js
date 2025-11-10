import prisma from "../../config/prismaClient.js";
import invoiceSchema from "./Invoice.schema.js";
import { createAuditLog } from "../../utils/audit.js";
import { createNotification } from "../notification/notification.service.js";
import { generateInvoicePdf } from "../../../pdfService.js";
import path from "path";

export const downloadInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceId: Number(id) },
      include: { rental: { include: { tenant: true, room: true } } },
    });

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const pdfPath = await generateInvoicePdf(invoice);
    const absolutePath = path.join(process.cwd(), pdfPath);

    res.download(absolutePath, `invoice-${invoice.invoiceId}.pdf`);
  } catch (err) {
    console.error("downloadInvoicePdf error:", err);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: err.message });
  }
};
// ✅ Create Manual Invoice
export const createInvoice = async (req, res) => {
  try {
    const { error, value } = invoiceSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const {
      rentId,
      paperInvoiceNumber,
      invoiceDate,
      dueDate,
      baseRent,
      taxPercentage,
      taxAmount,
      totalAmount,
      paymentInterval,
    } = value;

    // Check rental existence with tenant and associated user
    const rental = await prisma.rental.findUnique({
      where: { rentId },
      include: {
        tenant: { include: { user: true } },
      },
    });
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    // --- Update rental with the new paymentInterval
    if (paymentInterval) {
      await prisma.rental.update({
        where: { rentId },
        data: { paymentInterval },
      });
    }
    // Insert invoice
    const invoice = await prisma.invoice.create({
      data: {
        rentId,
        paperInvoiceNumber,
        invoiceDate,
        dueDate,
        baseRent,
        taxPercentage,
        taxAmount,
        totalAmount,
        status: "Unpaid",
      },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "Invoice",
      recordId: invoice.invoiceId,
      newValue: invoice,
    });
    // --- Notification to tenant + user
    if (rental.tenant) {
      await createNotification({
        tenantId: rental.tenant.tenantId,
        userId: rental.tenant.user ? rental.tenant.user.userId : null,
        type: "Invoice",
        message: `A new invoice  of ${totalAmount} ETB has been generated. Please note that it is due by ${dueDate.toDateString()}`,
        sentVia: "System",
      });
    }
    res.status(201).json({ success: true, invoice });
  } catch (err) {
    console.error("createInvoice error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ List invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { rental: { include: { tenant: true, room: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, invoices });
  } catch (err) {
    console.error("getInvoices error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get specific invoice
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceId: Number(id) },
      include: {
        rental: { include: { tenant: true, room: true } },
        payments: true,
      },
    });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ success: true, invoice });
  } catch (err) {
    console.error("getInvoiceById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { error, value } = invoiceSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const existing = await prisma.invoice.findUnique({
      where: { invoiceId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Invoice not found" });

    const updated = await prisma.invoice.update({
      where: { invoiceId: Number(id) },
      data: value,
      include: { rental: { include: { tenant: true, room: true } } },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "Invoice",
      recordId: updated.invoiceId,
      oldValue: existing,
      newValue: updated,
    });

    res.json({ success: true, invoice: updated });
  } catch (err) {
    console.error("updateInvoice error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
