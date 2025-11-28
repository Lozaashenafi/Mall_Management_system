// src/services/overdueCacheService.js
import prisma from "../config/prismaClient.js";
import { createNotification } from "../api/notification/notification.service.js"; // Adjust path as needed

export const cacheInvoicesAndDueDates = async () => {
  try {
    console.log("Starting invoice cache update...");
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
      `Invoice cache updated: ${updatedCount} invoices processed, ${overdueCount} overdue`
    );
    return { updated: updatedCount, overdue: overdueCount };
  } catch (error) {
    console.error("Error in cacheInvoicesAndDueDates:", error);
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
    // Send warning to tenant using your notification service
    const tenantMessage = getTenantWarningMessage(overdueDays, invoice);

    await createNotification({
      tenantId: invoice.rental.tenantId,
      type: "OverduePayment",
      message: tenantMessage,
      sentVia: "System",
    });

    // Send alert to admin using your notification service
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
    }

    // Mark warning as sent
    await prisma.invoice.update({
      where: { invoiceId: invoice.invoiceId },
      data: { warningSent: true },
    });

    console.log(
      `Warning sent for invoice #${invoice.invoiceId}, ${overdueDays} days overdue`
    );
  } catch (error) {
    console.error("Error sending overdue warnings:", error);
  }
};

const getTenantWarningMessage = (overdueDays, invoice) => {
  const remainingAmount =
    invoice.totalAmount -
    invoice.payments.reduce((sum, p) => sum + p.amount, 0);

  if (overdueDays === 1) {
    return `Reminder: Your rent payment for invoice #${invoice.invoiceId} is now overdue. Please make payment of ${remainingAmount} as soon as possible.`;
  } else if (overdueDays === 7) {
    return `Urgent: Your rent payment for invoice #${invoice.invoiceId} is 7 days overdue. Amount: ${remainingAmount}. Please contact management immediately.`;
  } else if (overdueDays === 14) {
    return `Final Warning: Your rent payment for invoice #${invoice.invoiceId} is 14 days overdue. Amount: ${remainingAmount}. This may result in further action.`;
  } else if (overdueDays % 7 === 0) {
    return `Overdue Alert: Your rent payment for invoice #${invoice.invoiceId} is ${overdueDays} days overdue. Amount: ${remainingAmount}.`;
  } else {
    return `Overdue Notice: Your rent payment for invoice #${invoice.invoiceId} is ${overdueDays} days overdue. Amount: ${remainingAmount}.`;
  }
};

// Get cached overdue tenants
export const getOverdueTenants = async () => {
  return await prisma.tenant.findMany({
    where: { hasOverdueRent: true },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          profilePicture: true,
        },
      },
      rental: {
        include: {
          room: {
            select: { unitNumber: true, floor: true },
          },
          invoices: {
            where: {
              isOverdue: true,
              status: "Overdue",
            },
            include: {
              payments: {
                where: { status: "Confirmed" },
              },
            },
            orderBy: { overdueDays: "desc" },
          },
        },
      },
    },
    orderBy: { totalOverdueAmount: "desc" },
  });
};

// Get most overdue tenants (by maximum overdue days)
export const getMostOverdueTenants = async () => {
  const tenants = await getOverdueTenants();

  return tenants.sort((a, b) => {
    const aMaxOverdue =
      a.rental.invoices.length > 0
        ? Math.max(...a.rental.invoices.map((inv) => inv.overdueDays || 0))
        : 0;
    const bMaxOverdue =
      b.rental.invoices.length > 0
        ? Math.max(...b.rental.invoices.map((inv) => inv.overdueDays || 0))
        : 0;
    return bMaxOverdue - aMaxOverdue;
  });
};

// Get frequent overdue tenants (by overdue count)
export const getFrequentOverdueTenants = async () => {
  const tenants = await getOverdueTenants();
  return tenants.sort((a, b) => b.overdueCount - a.overdueCount);
};

// Get statistics
export const getOverdueStats = async () => {
  const overdueTenants = await getOverdueTenants();

  const totalOverdueAmount = overdueTenants.reduce(
    (sum, tenant) => sum + tenant.totalOverdueAmount,
    0
  );

  const allOverdueInvoices = overdueTenants.flatMap((tenant) =>
    tenant.rental.invoices.map((invoice) => ({
      ...invoice,
      tenantName: tenant.user.fullName,
    }))
  );

  const highestOverdueDays =
    allOverdueInvoices.length > 0
      ? Math.max(...allOverdueInvoices.map((inv) => inv.overdueDays || 0))
      : 0;

  const mostFrequentCount =
    overdueTenants.length > 0
      ? Math.max(...overdueTenants.map((tenant) => tenant.overdueCount || 0))
      : 0;

  return {
    totalOverdueTenants: overdueTenants.length,
    totalOverdueAmount: totalOverdueAmount,
    highestOverdueDays: highestOverdueDays,
    totalOverdueInvoices: allOverdueInvoices.length,
    mostFrequentOffender: mostFrequentCount,
    lastCacheUpdate: new Date(),
  };
};

// Get overdue invoices with details
export const getOverdueInvoices = async () => {
  return await prisma.invoice.findMany({
    where: {
      isOverdue: true,
      status: "Overdue",
    },
    include: {
      rental: {
        include: {
          tenant: {
            include: {
              user: {
                select: { fullName: true, email: true, phone: true },
              },
            },
          },
          room: {
            select: { unitNumber: true, floor: true },
          },
        },
      },
      payments: {
        where: { status: "Confirmed" },
      },
    },
    orderBy: { overdueDays: "desc" },
  });
};
