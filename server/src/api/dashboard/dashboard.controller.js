import prisma from "../../config/prismaClient.js";
import { startOfMonth, endOfMonth } from "date-fns";

export const getDashboardStats = async (req, res) => {
  try {
    // --- 1️⃣ Room Status Distribution ---
    const roomStatusCounts = await prisma.room.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const rooms = roomStatusCounts.reduce(
      (acc, curr) => {
        acc.data[curr.status] = curr._count.status;
        acc.total += curr._count.status;
        return acc;
      },
      { title: "Room Status Distribution", data: {}, total: 0 }
    );

    // --- 2️⃣ Rental Status Summary ---
    const rentalStatusCounts = await prisma.rental.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const rentals = rentalStatusCounts.reduce(
      (acc, curr) => {
        acc.data[curr.status] = curr._count.status;
        acc.total += curr._count.status;
        return acc;
      },
      { title: "Rental Status Summary", data: {}, total: 0 }
    );

    // --- 3️⃣ Invoice Status Summary ---
    const invoiceStatusCounts = await prisma.invoice.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const invoices = invoiceStatusCounts.reduce(
      (acc, curr) => {
        acc.data[curr.status] = curr._count.status;
        acc.total += curr._count.status;
        return acc;
      },
      { title: "Invoice Status Summary", data: {}, total: 0 }
    );
    const totalRevenue = await prisma.invoice.aggregate({
      _sum: { totalAmount: true },
    });

    // --- 4️⃣ Maintenance Status Summary ---
    const maintenanceStatusCounts = await prisma.maintenance.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const maintenance = maintenanceStatusCounts.reduce(
      (acc, curr) => {
        acc.data[curr.status] = curr._count.status;
        acc.total += curr._count.status;
        return acc;
      },
      { title: "Maintenance Status Summary", data: {}, total: 0 }
    );

    // --- 5️⃣ Monthly Revenue Trend (optional, last 6 months) ---
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const firstDay = startOfMonth(
        new Date(now.getFullYear(), now.getMonth() - i, 1)
      );
      const lastDay = endOfMonth(firstDay);
      const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          paymentDate: { gte: firstDay, lte: lastDay },
          status: "Confirmed",
        },
      });
      months.push({
        month: firstDay.toLocaleString("default", { month: "short" }),
        revenue: totalRevenue._sum.amount || 0,
      });
    }

    // --- Combine all ---
    const dashboardData = {
      rooms,
      rentals,
      invoices,
      maintenance,
      revenueTrend: months,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats", error });
  }
};
export const getTenantDashboard = async (req, res) => {
  try {
    const userId = Number(req.user?.id || req.params.userId);
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    // 🧾 1. Outstanding Balance (sum of unpaid invoices for this user's tenant)
    const unpaidInvoices = await prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "Unpaid",
        rental: {
          tenant: {
            userId: userId,
          },
        },
      },
    });
    const outstandingBalance = unpaidInvoices._sum.totalAmount || 0;

    // 💰 2. Payments Made (count confirmed payments belonging to this user's tenant)
    const paymentsMade = await prisma.payment.count({
      where: {
        status: "Confirmed",
        invoice: {
          rental: {
            tenant: {
              userId: userId,
            },
          },
        },
      },
    });

    // 🛠️ 3. Active Maintenance Requests (Pending or InProgress for this tenant)
    const activeRequests = await prisma.maintenance.count({
      where: {
        room: {
          rental: {
            some: {
              tenant: { userId: userId },
            },
          },
        },
        status: { in: ["Pending", "InProgress"] },
      },
    });

    // 🔔 4. Unread Notifications
    const unreadNotifications = await prisma.notification.count({
      where: { userId, status: "UNREAD" },
    });

    // 📄 5. Lease Info (active rental for this user's tenant)
    const activeLease = await prisma.rental.findFirst({
      where: {
        tenant: { userId: userId },
        status: "Active",
      },
      select: {
        endDate: true,
        status: true,
      },
    });

    // 📊 6. Payment Trend (last few months)
    const recentPayments = await prisma.payment.findMany({
      where: {
        status: "Confirmed",
        invoice: {
          rental: {
            tenant: {
              userId: userId,
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
      select: { amount: true, createdAt: true },
    });

    const trendMap = {};
    recentPayments.forEach((p) => {
      const month = new Date(p.createdAt).toLocaleString("default", {
        month: "short",
      });
      trendMap[month] = (trendMap[month] || 0) + p.amount;
    });
    const paymentTrend = Object.entries(trendMap).map(([month, amount]) => ({
      month,
      amount,
    }));

    // 🧰 7. Maintenance Status Breakdown
    const maintenanceCounts = await prisma.maintenance.groupBy({
      by: ["status"],
      _count: { status: true },
      where: {
        room: {
          rental: {
            some: {
              tenant: { userId: userId },
            },
          },
        },
      },
    });

    const maintenanceStatus = maintenanceCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    // ✅ Final Response
    res.json({
      userId,
      outstandingBalance,
      paymentsMade,
      activeRequests,
      unreadNotifications,
      leaseStatus: activeLease?.status || "Inactive",
      leaseEnd: activeLease?.endDate || null,
      paymentTrend,
      maintenanceStatus,
    });
  } catch (error) {
    console.error("Error fetching tenant dashboard:", error);
    res.status(500).json({ message: "Failed to load tenant dashboard" });
  }
};
