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
      taxPercentage: taxFromClient,
      paymentInterval,
    } = value;

    const DEFAULT_TAX = 15;
    const DEFAULT_WITHHOLDING = 3;

    // ✅ Step 1: Fetch rental and tenant
    const rental = await prisma.rental.findUnique({
      where: { rentId },
      include: {
        tenant: { include: { user: true } },
      },
    });

    if (!rental) return res.status(404).json({ message: "Rental not found" });

    // ✅ Step 2: Update paymentInterval if provided
    const interval = paymentInterval || rental.paymentInterval || "Monthly";
    if (paymentInterval && paymentInterval !== rental.paymentInterval) {
      await prisma.rental.update({
        where: { rentId },
        data: { paymentInterval },
      });
    }

    // ✅ Step 3: Calculate rent amount based on interval
    let rentAmount = Number(rental.rentAmount);
    if (interval === "Quarterly") rentAmount *= 3;
    if (interval === "Yearly") rentAmount *= 12;

    // ✅ Step 4: Calculate tax/base/withholding
    const taxPct = Number(taxFromClient ?? DEFAULT_TAX);

    let baseRent, taxAmount, withholdingAmount, totalAmount;

    if (rental.includeTax) {
      baseRent = rentAmount / (1 + taxPct / 100);
      taxAmount = rentAmount - baseRent;
    } else {
      baseRent = rentAmount;
      taxAmount = baseRent * (taxPct / 100);
    }

    const withholdingRate = baseRent >= 10000 ? DEFAULT_WITHHOLDING : 0;
    withholdingAmount = baseRent * (withholdingRate / 100);

    totalAmount = rental.includeTax
      ? rentAmount - withholdingAmount
      : baseRent + taxAmount - withholdingAmount;

    // ✅ Step 5: Round all numbers to 2 decimals
    baseRent = parseFloat(baseRent.toFixed(2));
    taxAmount = parseFloat(taxAmount.toFixed(2));
    withholdingAmount = parseFloat(withholdingAmount.toFixed(2));
    totalAmount = parseFloat(totalAmount.toFixed(2));

    // ✅ Step 6: Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        rentId,
        paperInvoiceNumber,
        invoiceDate,
        dueDate,
        baseRent,
        taxPercentage: taxPct,
        taxAmount,
        withholdingRate,
        withholdingAmount,
        totalAmount,
        status: "Unpaid",
      },
    });

    // ✅ Step 7: Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "Invoice",
      recordId: invoice.invoiceId,
      newValue: invoice,
    });

    // ✅ Step 8: Notification
    if (rental.tenant) {
      await createNotification({
        tenantId: rental.tenant.tenantId,
        userId: rental.tenant.user ? rental.tenant.user.userId : null,
        type: "Invoice",
        message: `A new invoice of ${totalAmount.toFixed(
          2
        )} ETB has been generated. It’s due by ${new Date(
          dueDate
        ).toDateString()}.`,
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
export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!invoiceId)
      return res.status(400).json({ message: "Invoice ID is required" });

    // ✅ Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceId: parseInt(invoiceId) },
    });

    if (!existingInvoice)
      return res.status(404).json({ message: "Invoice not found" });

    // ✅ Prevent deletion if invoice is paid
    if (existingInvoice.status === "Paid") {
      return res.status(400).json({
        message: "Paid invoices cannot be deleted",
      });
    }

    // ✅ Delete invoice
    const deletedInvoice = await prisma.invoice.delete({
      where: { invoiceId: parseInt(invoiceId) },
    });

    // ✅ Optional: Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "deleted",
      tableName: "Invoice",
      recordId: deletedInvoice.invoiceId,
      oldValue: deletedInvoice,
    });

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
      invoice: deletedInvoice,
    });
  } catch (err) {
    console.error("deleteInvoice error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
