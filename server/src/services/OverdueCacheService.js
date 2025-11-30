// src/services/overdueCacheService.js - FIXED
import prisma from "../config/prismaClient.js";
import { createNotification } from "../api/notification/notification.service.js";

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
      const totalPaid =
        invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) ||
        0;
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
      if (isOverdue && !isFullyPaid && invoice.rental?.tenantId) {
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
      const totalPaid =
        invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) ||
        0;
      return totalPaid < invoice.totalAmount;
    });

    const totalOverdueAmount = actualOverdueInvoices.reduce(
      (sum, invoice) =>
        sum +
        (invoice.totalAmount -
          (invoice.payments?.reduce((pSum, p) => pSum + p.amount, 0) || 0)),
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
        overdueCount: actualOverdueInvoices.length, // FIXED
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
      (invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);

    let message = "";
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
    if (invoice.rental?.tenantId) {
      await createNotification({
        tenantId: invoice.rental.tenantId,
        type: "OverduePayment",
        message: message,
        sentVia: "System",
      });
    }

    // Send alert to admin
    const adminMessage = `Tenant ${
      invoice.rental?.tenant?.user?.fullName || "Unknown"
    } (Unit ${
      invoice.rental?.room?.unitNumber || "N/A"
    }) has overdue payment. Invoice #${
      invoice.invoiceId
    } is ${overdueDays} days overdue. Amount: ${invoice.totalAmount}`;

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

// Get cached overdue tenants
export const getOverdueTenants = async () => {
  try {
    const tenants = await prisma.tenant.findMany({
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

    console.log("Found overdue tenants:", tenants.length);
    return tenants;
  } catch (error) {
    console.error("Error in getOverdueTenants:", error);
    throw error;
  }
};

// Get most overdue tenants (by maximum overdue days)
export const getMostOverdueTenants = async () => {
  try {
    const tenants = await getOverdueTenants();

    return tenants.sort((a, b) => {
      const aInvoices = a.rental?.invoices || [];
      const bInvoices = b.rental?.invoices || [];

      const aMaxOverdue =
        aInvoices.length > 0
          ? Math.max(...aInvoices.map((inv) => inv.overdueDays || 0))
          : 0;
      const bMaxOverdue =
        bInvoices.length > 0
          ? Math.max(...bInvoices.map((inv) => inv.overdueDays || 0))
          : 0;
      return bMaxOverdue - aMaxOverdue;
    });
  } catch (error) {
    console.error("Error in getMostOverdueTenants:", error);
    throw error;
  }
};

// Get frequent overdue tenants (by overdue count)
export const getFrequentOverdueTenants = async () => {
  try {
    const tenants = await getOverdueTenants();
    return tenants.sort(
      (a, b) => (b.overdueCount || 0) - (a.overdueCount || 0)
    );
  } catch (error) {
    console.error("Error in getFrequentOverdueTenants:", error);
    throw error;
  }
};

// src/services/OverdueCacheService.js
export const getOverdueStats = async () => {
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: "Overdue", // Only overdue invoices
    },
    include: {
      rental: {
        include: {
          tenant: {
            include: { user: true },
          },
        },
      },
    },
  });

  const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => {
    return sum + (inv.totalAmount || 0);
  }, 0);

  const highestOverdueDays = Math.max(
    0,
    ...overdueInvoices.map((inv) => inv.overdueDays || 0)
  );

  // Count most frequent offender
  const tenantCounts = {};
  overdueInvoices.forEach((inv) => {
    const tenantId = inv.rental?.tenantId;
    if (!tenantId) return;
    tenantCounts[tenantId] = (tenantCounts[tenantId] || 0) + 1;
  });

  const mostFrequentOffender = Math.max(0, ...Object.values(tenantCounts));

  return {
    totalOverdueTenants: Object.keys(tenantCounts).length,
    totalOverdueAmount,
    highestOverdueDays,
    mostFrequentOffender,
    lastCacheUpdate: new Date(),
  };
};

// Get overdue invoices with details
export const getOverdueInvoices = async () => {
  try {
    const invoices = await prisma.invoice.findMany({
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

    console.log("Found overdue invoices:", invoices.length);
    return invoices;
  } catch (error) {
    console.error("Error in getOverdueInvoices:", error);
    throw error;
  }
};
