// src/jobs/overdueCache.job.js
import cron from "node-cron";
import prisma from "../config/prismaClient.js";
import { createNotification } from "../api/notification/notification.service.js";
import { io, onlineUsers } from "../../app.js";

const checkOverdueInvoices = async () => {
  try {
    console.log("🔁 Running overdue cache job...");
    const today = new Date();

    // Get all unpaid invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["Unpaid", "Pending", "Overdue"] },
      },
      include: {
        rental: {
          include: {
            tenant: {
              include: {
                user: true,
              },
            },
            room: true,
          },
        },
        payments: {
          where: {
            status: "Confirmed",
          },
        },
      },
    });

    let updatedCount = 0;
    let overdueCount = 0;

    for (const invoice of invoices) {
      const dueDate = new Date(invoice.dueDate);
      const overdueDays = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const isOverdue = overdueDays > 0;
      const totalPaid = invoice.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const isFullyPaid = totalPaid >= invoice.totalAmount;

      let newStatus = invoice.status;

      if (isFullyPaid) {
        newStatus = "Paid";
      } else if (isOverdue) {
        newStatus = "Overdue";
        overdueCount++;
      }

      // Update invoice with current status
      await prisma.invoice.update({
        where: { invoiceId: invoice.invoiceId },
        data: {
          status: newStatus,
          isOverdue: isOverdue,
          overdueDays: isOverdue ? overdueDays : 0,
          overdueSince: isOverdue ? dueDate : null,
          lastCheckedAt: new Date(),
        },
      });

      updatedCount++;

      // Update tenant overdue status if invoice is overdue
      if (isOverdue && !isFullyPaid) {
        await updateTenantOverdueStatus(invoice.rental.tenantId);
      }

      // Send warnings for new overdue invoices
      if (isOverdue && !invoice.warningSent && !isFullyPaid) {
        await sendOverdueWarnings(invoice, overdueDays);
      }
    }

    console.log(
      `✅ Overdue cache job completed: ${updatedCount} invoices processed, ${overdueCount} overdue`
    );
    return { updated: updatedCount, overdue: overdueCount };
  } catch (error) {
    console.error("❌ Error in overdue cache job:", error);
    throw error;
  }
};

const updateTenantOverdueStatus = async (tenantId) => {
  try {
    // Calculate total overdue amount for tenant
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        rental: { tenantId },
        isOverdue: true,
        status: "Overdue",
      },
      include: {
        payments: {
          where: {
            status: "Confirmed",
          },
        },
      },
    });

    // Filter out invoices that are fully paid
    const actualOverdueInvoices = overdueInvoices.filter((invoice) => {
      const totalPaid = invoice.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      return totalPaid < invoice.totalAmount;
    });

    const totalOverdueAmount = actualOverdueInvoices.reduce(
      (sum, invoice) =>
        sum +
        (invoice.totalAmount -
          invoice.payments.reduce((pSum, p) => pSum + p.amount, 0)),
      0
    );

    const latestOverdue =
      actualOverdueInvoices.length > 0
        ? actualOverdueInvoices.sort(
            (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
          )[0]
        : null;

    await prisma.tenant.update({
      where: { tenantId },
      data: {
        hasOverdueRent: totalOverdueAmount > 0,
        totalOverdueAmount: totalOverdueAmount,
        overdueCount: { increment: actualOverdueInvoices.length > 0 ? 1 : 0 },
        lastOverdueDate: latestOverdue ? latestOverdue.dueDate : undefined,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating tenant overdue status:", error);
  }
};

const sendOverdueWarnings = async (invoice, overdueDays) => {
  try {
    const remainingAmount =
      invoice.totalAmount -
      invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    let message = "";
    let notificationType = "OverduePayment";

    // Determine message based on overdue days
    if (overdueDays === 1) {
      message = `Reminder: Your rent payment for invoice #${invoice.invoiceId} is now overdue. Please make payment of ${remainingAmount} as soon as possible.`;
    } else if (overdueDays === 7) {
      message = `Urgent: Your rent payment for invoice #${invoice.invoiceId} is 7 days overdue. Amount: ${remainingAmount}. Please contact management immediately.`;
    } else if (overdueDays === 14) {
      message = `Final Warning: Your rent payment for invoice #${invoice.invoiceId} is 14 days overdue. Amount: ${remainingAmount}. This may result in further action.`;
    } else if (overdueDays % 7 === 0) {
      message = `Overdue Alert: Your rent payment for invoice #${invoice.invoiceId} is ${overdueDays} days overdue. Amount: ${remainingAmount}.`;
    } else {
      message = `Overdue Notice: Your rent payment for invoice #${invoice.invoiceId} is ${overdueDays} days overdue. Amount: ${remainingAmount}.`;
    }

    // Send notification to tenant
    await createNotification({
      tenantId: invoice.rental.tenantId,
      userId: invoice.rental.tenant.userId,
      type: notificationType,
      message: message,
      sentVia: "System",
    });

    // Send real-time notification to tenant if online
    const tenantUserId = invoice.rental.tenant.userId;
    if (tenantUserId && onlineUsers.has(tenantUserId)) {
      onlineUsers.get(tenantUserId).forEach((socketId) => {
        io.to(socketId).emit("notification", {
          message,
          type: notificationType,
          sentVia: "System",
        });
      });
    }

    // Send alert to all admins
    const adminMessage = `Tenant ${invoice.rental.tenant.user.fullName} (Unit ${invoice.rental.room.unitNumber}) has overdue payment. Invoice #${invoice.invoiceId} is ${overdueDays} days overdue. Amount: ${invoice.totalAmount}`;

    const admins = await prisma.user.findMany({
      where: { role: { in: ["Admin", "SuperAdmin"] } },
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.userId,
        type: "OverduePayment",
        message: adminMessage,
        sentVia: "System",
      });

      // Send real-time notification to admin if online
      if (onlineUsers.has(admin.userId)) {
        onlineUsers.get(admin.userId).forEach((socketId) => {
          io.to(socketId).emit("notification", {
            message: adminMessage,
            type: "OverduePayment",
            sentVia: "System",
          });
        });
      }
    }

    // Mark warning as sent
    await prisma.invoice.update({
      where: { invoiceId: invoice.invoiceId },
      data: { warningSent: true },
    });

    console.log(
      `⚠️ Warning sent for invoice #${invoice.invoiceId}, ${overdueDays} days overdue`
    );
  } catch (error) {
    console.error("Error sending overdue warnings:", error);
  }
};

// --- Run every day at 8:00 AM (after payment reminders at 7:00 AM)
cron.schedule("0 8 * * *", checkOverdueInvoices, {
  timezone: "Africa/Addis_Ababa",
});

// --- Also run every 6 hours for more frequent checks
cron.schedule("0 */6 * * *", checkOverdueInvoices, {
  timezone: "Africa/Addis_Ababa",
});

export default checkOverdueInvoices;
