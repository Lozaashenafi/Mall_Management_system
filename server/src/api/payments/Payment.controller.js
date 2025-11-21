import prisma from "../../config/prismaClient.js";
import paymentSchema from "./Pyement.schema.js";
import fs from "fs";
import { createAuditLog } from "../../utils/audit.js";
import { createNotification } from "../notification/notification.service.js";
export const createPayment = async (req, res) => {
  try {
    const { error, value } = paymentSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const {
      invoiceId,
      amount,
      method,
      reference,
      paymentDate,
      name,
      account,
      bankAccountId,
    } = value;
    let receiptFilePath = null;
    if (req.file) {
      receiptFilePath = `/uploads/${req.file.filename}`;
    }

    let rentalId = null;
    let tenantId = null;
    let invoice = null;

    // --- If invoice payment
    if (invoiceId) {
      invoice = await prisma.invoice.findUnique({
        where: { invoiceId },
        include: {
          rental: {
            include: {
              tenant: true,
              room: true,
            },
          },
        },
      });
      if (!invoice)
        return res.status(404).json({ message: "Invoice not found" });
      rentalId = invoice.rentId;
      tenantId = invoice.rental.tenantId;
    }

    let baseDate;
    let paymentInterval = "Monthly";

    if (rentalId) {
      const rental = await prisma.rental.findUnique({
        where: { rentId: rentalId },
      });

      if (rental) {
        paymentInterval = rental.paymentInterval || "Monthly";

        const lastPayment = await prisma.payment.findFirst({
          where: {
            invoice: { rentId: rentalId },
          },
          orderBy: { endDate: "desc" },
        });
        baseDate = lastPayment
          ? new Date(lastPayment.endDate)
          : new Date(rental.startDate);
      }
    } else {
      baseDate = new Date(paymentDate);
    }

    // --- Calculate new endDate based on interval
    const endDate = new Date(baseDate);
    if (paymentInterval === "Monthly") endDate.setMonth(endDate.getMonth() + 1);
    else if (paymentInterval === "Quarterly")
      endDate.setMonth(endDate.getMonth() + 3);
    else if (paymentInterval === "Yearly")
      endDate.setMonth(endDate.getMonth() + 12);
    else endDate.setMonth(endDate.getMonth() + 1);

    // Use transaction to ensure both payment and bank transaction are created together
    const result = await prisma.$transaction(async (tx) => {
      // --- Create payment
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method,
          reference,
          receiptFilePath,
          paymentDate,
          endDate,
          status: "Confirmed",
        },
      });

      // Generate meaningful description
      let description = `Payment received`;

      if (invoice) {
        const tenantName = invoice.rental.tenant.contactPerson;
        const roomNumber = invoice.rental.room.unitNumber;
        description = `Payment received from ${tenantName} for Room ${roomNumber} - ${
          reference || "Rent payment"
        }`;
      } else {
        description = `Payment received from ${name} - ${
          reference || "Utility payment"
        }`;
      }

      // --- Create bank transaction for the payment
      const bankTransaction = await tx.bankTransaction.create({
        data: {
          bankAccountId: bankAccountId,
          paymentId: payment.paymentId,
          type: "Deposit",
          amount: amount,
          description: description,
          transactionDate: new Date(paymentDate),
          receiptImage: receiptFilePath,
          account: account,
          name: name,
        },
      });

      // --- Update bank account balance
      await tx.bankAccount.update({
        where: { bankAccountId: bankAccountId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // --- Mark invoice as paid
      if (invoiceId) {
        await tx.invoice.update({
          where: { invoiceId },
          data: { status: "Paid" },
        });
      }

      return { payment, bankTransaction };
    });

    const { payment, bankTransaction } = result;

    // --- Log audit
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "Payment",
      recordId: payment.paymentId,
      newValue: payment,
    });

    // Log bank transaction audit
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "BankTransaction",
      recordId: bankTransaction.transactionId,
      newValue: bankTransaction,
    });

    if (tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { tenantId },
        include: { user: true },
      });
      const message = `A payment of ${amount} ETB has been successfully processed for your ${
        invoiceId ? "rent" : "utility"
      } invoice. You can view the details in your payment history.`;
      await createNotification({
        tenantId,
        userId: tenant.user ? tenant.user.userId : null,
        type: "PaymentConfirmation", // Changed from PaymentReminder to PaymentConfirmation
        message,
        sentVia: "System",
      });
    }

    res.status(201).json({
      success: true,
      payment,
      bankTransaction,
    });
  } catch (err) {
    console.error("createPayment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const createUtilityPayment = async (req, res) => {
  try {
    const { error, value } = paymentSchema.createUtility.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const {
      utilityInvoiceId,
      amount,
      method,
      reference,
      paymentDate,
      name,
      account,
      bankAccountId,
    } = value;

    let receiptFilePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          amount,
          method,
          reference,
          receiptFilePath,
          paymentDate,
          status: "Confirmed",
        },
      });

      const description = `Utility payment received from ${name} - ${
        reference || "Utility payment"
      }`;

      const bankTransaction = await tx.bankTransaction.create({
        data: {
          bankAccountId,
          paymentId: payment.paymentId,
          type: "Deposit",
          amount,
          description,
          transactionDate: new Date(paymentDate),
          receiptImage: receiptFilePath,
          account,
          name,
        },
      });

      await tx.bankAccount.update({
        where: { bankAccountId },
        data: { balance: { increment: amount } },
      });

      return { payment, bankTransaction };
    });

    // Extract here ✔
    const { payment, bankTransaction } = result;

    await prisma.utilityInvoice.updateMany({
      where: { id: Number(utilityInvoiceId) },
      data: {
        status: "Paid", // OR "UNPAID" → make consistent
        paymentId: payment.paymentId,
      },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "Payment",
      recordId: payment.paymentId,
      newValue: payment,
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "BankTransaction",
      recordId: bankTransaction.transactionId,
      newValue: bankTransaction,
    });

    res.status(201).json({
      success: true,
      payment,
      bankTransaction,
    });
  } catch (err) {
    console.error("createUtilityPayment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ✅ List Payments
export const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        invoice: { isNot: null }, // Only include payments that have an invoice
      },
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
      include: { invoice: true },
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
      recordId: updated.paymentId,
      oldValue: existing,
      newValue: updated,
    });

    res.json({ success: true, payment: updated });
  } catch (err) {
    console.error("updatePayment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const getPaymentRequests = async (req, res) => {
  try {
    const requests = await prisma.paymentRequest.findMany({
      include: {
        tenant: { include: { user: true } },
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, requests });
  } catch (err) {
    console.error("getPaymentRequests error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const getPaymentRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.paymentRequest.findUnique({
      where: { id: Number(id) },
      include: {
        tenant: { include: { user: true } },
        invoice: true,
      },
    });

    if (!request)
      return res.status(404).json({ message: "Payment Request not found" });

    res.json({ success: true, request });
  } catch (err) {
    console.error("getPaymentRequestById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ✅ Create Payment Request (Tenant)
export const createPaymentRequest = async (req, res) => {
  try {
    const {
      userId,
      invoiceId,
      amount,
      method,
      reference,
      paymentDate,
      bankAccountId,
      account,
      name,
    } = req.body;

    // ✅ Handle proof file if uploaded
    let proofFilePath = null;
    if (req.file) {
      proofFilePath = `/uploads/${req.file.filename}`;
    }

    // ✅ Validate required fields for bank transactions
    if (method === "Bank" && (!bankAccountId || !account || !name)) {
      return res.status(400).json({
        message:
          "Bank account ID, account number, and account name are required for bank payments",
      });
    }
    // update the invoice  status to pending
    if (invoiceId) {
      await prisma.invoice.update({
        where: { invoiceId: Number(invoiceId) },
        data: { status: "Pending" },
      });
    }

    // ✅ Validate tenant exists using userId
    const tenant = await prisma.tenant.findFirst({
      where: { userId: Number(userId) },
      include: { user: true },
    });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    // ✅ Validate bank account exists and is active
    if (bankAccountId) {
      const bankAccount = await prisma.bankAccount.findFirst({
        where: {
          bankAccountId: Number(bankAccountId),
          isActive: true,
        },
      });
      if (!bankAccount) {
        return res
          .status(404)
          .json({ message: "Bank account not found or inactive" });
      }
    }

    // ✅ Create payment request
    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        tenantId: tenant.tenantId,
        invoiceId: invoiceId ? Number(invoiceId) : null,
        amount: Number(amount),
        method,
        reference,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        proofFilePath,
        status: "Pending",
        bankAccountId: bankAccountId ? Number(bankAccountId) : null,
        account: account || null,
        name: name || null,
      },
    });

    // ✅ Log audit trail
    if (req.user && req.user.userId) {
      await createAuditLog({
        userId: req.user.userId,
        action: "created",
        tableName: "PaymentRequest",
        recordId: paymentRequest.requestId,
        newValue: paymentRequest,
      });
    }

    // ✅ Notify all Admins and SuperAdmins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["Admin", "SuperAdmin"] } },
    });

    const adminNotifications = admins.map((admin) =>
      createNotification({
        userId: admin.userId,
        tenantId: tenant.tenantId,
        type: "PaymentRequest",
        message: `Tenant ${tenant.contactPerson} requested a payment of ${amount} ETB via ${method}.`,
        sentVia: "System",
      })
    );

    await Promise.all(adminNotifications);

    res.status(201).json({
      success: true,
      message: "Payment request created successfully",
      paymentRequest,
    });
  } catch (err) {
    console.error("createPaymentRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const createUtilityPaymentRequest = async (req, res) => {
  try {
    const {
      userId,
      utilityInvoiceIds, // This will be a JSON string like "[2]"
      method,
      reference,
      paymentDate,
      bankAccountId,
      account,
      name,
    } = req.body;

    console.log("Received utilityInvoiceIds:", utilityInvoiceIds);
    console.log("Type of utilityInvoiceIds:", typeof utilityInvoiceIds);

    let proofFilePath = null;
    if (req.file) {
      proofFilePath = `/uploads/${req.file.filename}`;
    }

    // ------------ PARSE utilityInvoiceIds ------------------
    let invoiceIdsArray;

    try {
      // Parse the JSON string back to array
      if (typeof utilityInvoiceIds === "string") {
        invoiceIdsArray = JSON.parse(utilityInvoiceIds);
      } else if (Array.isArray(utilityInvoiceIds)) {
        invoiceIdsArray = utilityInvoiceIds;
      } else {
        invoiceIdsArray = [];
      }
    } catch (parseError) {
      console.error("Error parsing utilityInvoiceIds:", parseError);
      return res.status(400).json({
        message: "Invalid utilityInvoiceIds format. Expected JSON array.",
      });
    }

    // Convert to numbers and filter out invalid values
    invoiceIdsArray = invoiceIdsArray
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    console.log("Parsed invoiceIdsArray:", invoiceIdsArray);

    // ------------ VALIDATION ------------------
    if (!Array.isArray(invoiceIdsArray) || invoiceIdsArray.length === 0) {
      return res
        .status(400)
        .json({ message: "utilityInvoiceIds must be a non-empty array." });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { userId: Number(userId) },
      include: { user: true },
    });

    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    if (bankAccountId) {
      const bankAccount = await prisma.bankAccount.findFirst({
        where: { bankAccountId: Number(bankAccountId), isActive: true },
      });

      if (!bankAccount) {
        return res
          .status(404)
          .json({ message: "Bank account not found or inactive" });
      }
    }

    // ------------ FETCH ALL UTILITY INVOICES ------------
    const invoices = await prisma.utilityInvoice.findMany({
      where: {
        id: { in: invoiceIdsArray },
        paymentId: null,
      },
    });

    if (invoices.length === 0) {
      return res
        .status(404)
        .json({ message: "No unpaid utility invoices found." });
    }

    // Calculate total amount dynamically
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    // ------------ CREATE PAYMENT REQUEST ----------------
    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        tenantId: tenant.tenantId,
        amount: Number(totalAmount),
        method,
        reference,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        proofFilePath,
        status: "Pending",
        bankAccountId: bankAccountId ? Number(bankAccountId) : null,
        account: account || null,
        name: name || null,
      },
    });

    // ------------ UPDATE ALL UTILITY INVOICES --------
    await prisma.utilityInvoice.updateMany({
      where: { id: { in: invoices.map((inv) => inv.id) } },
      data: { paymentRequestId: paymentRequest.requestId, status: "Pending" },
    });

    // ------------ AUDIT LOG ----------------------------
    if (req.user && req.user.userId) {
      await createAuditLog({
        userId: req.user.userId,
        action: "created",
        tableName: "PaymentRequest",
        recordId: paymentRequest.requestId,
        newValue: paymentRequest,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Utility payment request created successfully.",
      totalInvoices: invoices.length,
      totalAmount,
      paymentRequest,
    });
  } catch (err) {
    console.error("createUtilityPaymentRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const handlePaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    // ✅ Fetch existing payment request with bank account info
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { requestId: Number(id) },
      include: {
        tenant: {
          include: {
            user: true,
            rental: {
              include: {
                room: true,
              },
            },
          },
        },
        invoice: {
          include: {
            rental: {
              include: {
                room: true,
                tenant: true,
              },
            },
          },
        },
      },
    });

    if (!paymentRequest)
      return res.status(404).json({ message: "Payment Request not found" });

    // ✅ Update status and admin note
    const updatedRequest = await prisma.paymentRequest.update({
      where: { requestId: Number(id) },
      data: { status, adminNote },
    });

    // ✅ Log audit for update
    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "PaymentRequest",
      recordId: Number(id),
      oldValue: paymentRequest,
      newValue: updatedRequest,
    });

    // ✅ If approved, create a new Payment and Bank Transaction
    if (status === "Approved") {
      const {
        invoiceId,
        amount,
        method,
        tenantId,
        reference,
        bankAccountId,
        account,
        name,
      } = paymentRequest;

      // Use transaction to ensure both payment and bank transaction are created together
      const result = await prisma.$transaction(async (tx) => {
        // Create Payment record
        const payment = await tx.payment.create({
          data: {
            invoiceId,
            amount,
            method,
            reference,
            status: "Confirmed",
            paymentDate: new Date(),
            // Calculate end date for rent payments
            ...(invoiceId && (await calculateEndDate(invoiceId, tx))),
          },
        });
        // change invoice status to paid
        if (invoiceId) {
          await prisma.invoice.update({
            where: { invoiceId: Number(invoiceId) },
            data: { status: "Paid" },
          });
        }
        // Create Bank Transaction for approved payment
        if (bankAccountId) {
          // Generate meaningful description
          let description = `Payment received from ${paymentRequest.tenant.contactPerson}`;

          if (paymentRequest.invoice) {
            const roomNumber = paymentRequest.invoice.rental.room.unitNumber;
            description = `Payment received from ${
              paymentRequest.tenant.contactPerson
            } for Room ${roomNumber} - ${reference || "Rent payment"}`;
          } else {
            description = `Payment received from ${name} (${account}) - ${
              reference || "Utility payment"
            }`;
          }

          const bankTransaction = await tx.bankTransaction.create({
            data: {
              bankAccountId: Number(bankAccountId),
              paymentId: payment.paymentId,
              type: "Deposit",
              amount: amount,
              description: description,
              transactionDate: new Date(),
              receiptImage: paymentRequest.proofFilePath,
              account: account,
              name: name,
            },
          });

          // Update bank account balance
          await tx.bankAccount.update({
            where: { bankAccountId: Number(bankAccountId) },
            data: {
              balance: {
                increment: amount,
              },
            },
          });

          // Log bank transaction audit
          await createAuditLog({
            userId: req.user.userId,
            action: "created",
            tableName: "BankTransaction",
            recordId: bankTransaction.transactionId,
            newValue: bankTransaction,
          });
        }

        // Update related invoice status
        if (invoiceId) {
          await tx.invoice.update({
            where: { invoiceId },
            data: { status: "Paid" },
          });
        }

        return { payment };
      });

      const { payment } = result;

      // Log audit for payment creation
      await createAuditLog({
        userId: req.user.userId,
        action: "created",
        tableName: "Payment",
        recordId: payment.paymentId,
        newValue: payment,
      });

      // ✅ Notify Tenant about approval
      await createNotification({
        tenantId,
        userId: paymentRequest.tenant?.user?.userId || null,
        type: "PaymentConfirmation",
        message: `Your payment request of ${amount} ETB has been approved and recorded as a payment.`,
        sentVia: "System",
      });

      return res.json({
        success: true,
        message: "Payment request approved and payment created.",
        paymentRequest: updatedRequest,
        payment,
      });
    }

    // ✅ If declined
    if (status === "Declined") {
      await createNotification({
        tenantId: paymentRequest.tenantId,
        userId: paymentRequest.tenant.user?.userId || null,
        type: "PaymentDeclined",
        message: `Your payment request of ${
          paymentRequest.amount
        } ETB has been declined by admin. Reason: ${
          adminNote || "No reason provided"
        }`,
        sentVia: "System",
      });
    }

    res.json({
      success: true,
      message: `Payment request ${status.toLowerCase()} successfully.`,
      paymentRequest: updatedRequest,
    });
  } catch (err) {
    console.error("handlePaymentRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const handleUtilityPaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    // ✅ Fetch existing payment request with related data
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { requestId: Number(id) },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        utilityInvoices: true,
        bankAccount: true,
      },
    });

    if (!paymentRequest) {
      return res.status(404).json({ message: "Payment Request not found" });
    }

    // ✅ Update status and admin note
    const updatedRequest = await prisma.paymentRequest.update({
      where: { requestId: Number(id) },
      data: { status, adminNote },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        utilityInvoices: true,
      },
    });

    // Get utility invoices associated with the payment request
    const utilityInvoices = await prisma.utilityInvoice.findMany({
      where: { paymentRequestId: Number(id) },
      include: {
        rental: {
          include: {
            tenant: true,
          },
        },
      },
    });

    // Update all utility invoices status based on the payment request status
    const utilityInvoiceStatus = status === "Approved" ? "Paid" : "Pending";

    for (const invoice of utilityInvoices) {
      await prisma.utilityInvoice.update({
        where: { id: invoice.id },
        data: { status: utilityInvoiceStatus },
      });
    }

    // If approved, create a new Payment and Bank Transaction
    if (status === "Approved") {
      const {
        amount,
        method,
        tenantId,
        reference,
        bankAccountId,
        account,
        name,
      } = paymentRequest;

      // Use transaction to ensure both payment and bank transaction are created together
      const result = await prisma.$transaction(async (tx) => {
        // Create Payment record
        const payment = await tx.payment.create({
          data: {
            amount,
            method,
            reference,
            status: "Confirmed",
            paymentDate: new Date(),
          },
        });

        // Update utility invoices with the payment ID
        await tx.utilityInvoice.updateMany({
          where: { paymentRequestId: Number(id) },
          data: {
            paymentId: payment.paymentId,
            status: "Paid",
          },
        });

        // Create Bank Transaction for approved payment
        if (bankAccountId) {
          const bankTransaction = await tx.bankTransaction.create({
            data: {
              bankAccountId: Number(bankAccountId),
              paymentId: payment.paymentId,
              type: "Deposit",
              amount: amount,
              description: `Utility payment received from ${name} (${account}) - ${
                reference || "Utility payment"
              }`,
              transactionDate: new Date(),
              receiptImage: paymentRequest.proofFilePath,
              account: account,
              name: name,
            },
          });

          // Update bank account balance
          await tx.bankAccount.update({
            where: { bankAccountId: Number(bankAccountId) },
            data: {
              balance: {
                increment: amount,
              },
            },
          });

          // Log bank transaction audit
          await createAuditLog({
            userId: req.user.userId,
            action: "created",
            tableName: "BankTransaction",
            recordId: bankTransaction.transactionId,
            newValue: bankTransaction,
          });
        }

        return { payment };
      });

      const { payment } = result;

      // Notify tenant about approval
      await createNotification({
        tenantId,
        userId: paymentRequest.tenant?.userId || null, // Fixed: access userId directly from tenant
        type: "PaymentConfirmation",
        message: `Your utility payment request of ${amount} ETB has been approved and recorded as a payment.`,
        sentVia: "System",
      });

      // Log audit for payment creation
      await createAuditLog({
        userId: req.user.userId,
        action: "created",
        tableName: "Payment",
        recordId: payment.paymentId,
        newValue: payment,
      });

      return res.json({
        success: true,
        message: "Utility payment request approved and payment created.",
        paymentRequest: updatedRequest,
        payment,
      });
    }

    // If rejected (changed from "Declined" to "Rejected" to match enum)
    if (status === "Rejected") {
      await createNotification({
        tenantId: paymentRequest.tenantId,
        userId: paymentRequest.tenant?.userId || null, // Fixed: access userId directly
        type: "PaymentDeclined",
        message: `Your utility payment request of ${
          paymentRequest.amount
        } ETB has been rejected by admin. Reason: ${
          adminNote || "No reason provided"
        }`,
        sentVia: "System",
      });
    }

    // ✅ Log audit for update
    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "PaymentRequest",
      recordId: Number(id),
      oldValue: paymentRequest,
      newValue: updatedRequest,
    });

    res.json({
      success: true,
      message: `Utility payment request ${status.toLowerCase()} successfully.`,
      paymentRequest: updatedRequest,
    });
  } catch (err) {
    console.error("handleUtilityPaymentRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Helper function to calculate end date for rent payments
async function calculateEndDate(invoiceId, tx) {
  const invoice = await tx.invoice.findUnique({
    where: { invoiceId },
    include: {
      rental: true,
    },
  });

  if (!invoice) return {};

  const rental = invoice.rental;
  let baseDate = new Date(rental.startDate);

  // Find last payment to determine base date
  const lastPayment = await tx.payment.findFirst({
    where: {
      invoice: { rentId: rental.rentId },
    },
    orderBy: { endDate: "desc" },
  });

  if (lastPayment) {
    baseDate = new Date(lastPayment.endDate);
  }

  // Calculate new end date based on payment interval
  const endDate = new Date(baseDate);
  const paymentInterval = rental.paymentInterval || "Monthly";

  if (paymentInterval === "Monthly") endDate.setMonth(endDate.getMonth() + 1);
  else if (paymentInterval === "Quarterly")
    endDate.setMonth(endDate.getMonth() + 3);
  else if (paymentInterval === "Yearly")
    endDate.setMonth(endDate.getMonth() + 12);
  else endDate.setMonth(endDate.getMonth() + 1);

  return { endDate };
}
