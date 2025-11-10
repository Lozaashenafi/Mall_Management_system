import prisma from "../../config/prismaClient.js";
import dayjs from "dayjs";

export const getComprehensiveReport = async (req, res) => {
  try {
    // 1️⃣ Revenue by Month
    const payments = await prisma.payment.findMany({
      where: { status: "Confirmed" },
      select: { amount: true, paymentDate: true },
    });

    const revenueByMonth = {};
    payments.forEach((p) => {
      const key = dayjs(p.paymentDate).format("YYYY-MM");
      revenueByMonth[key] = (revenueByMonth[key] || 0) + p.amount;
    });

    const monthlyRevenue = Object.entries(revenueByMonth).map(([m, t]) => ({
      month: m,
      total: t,
    }));
    // 2️⃣ Revenue by Utility Type
    const utilityRevenue = await prisma.utilityInvoice.findMany({
      where: { amount: { gt: 0 } },
      include: {
        utilityCharge: {
          include: {
            utilityType: { select: { name: true } }, // ✅ select the name of the type
          },
        },
      },
    });

    const revenueByUtilityType = utilityRevenue.reduce((acc, inv) => {
      const type = inv.utilityCharge?.utilityType?.name || "Unknown"; // ✅ get name
      acc[type] = (acc[type] || 0) + inv.amount;
      return acc;
    }, {});

    const revenueByUtilityTypeArray = Object.entries(revenueByUtilityType).map(
      ([type, total]) => ({ type, total })
    );

    // 3️⃣ Revenue Growth
    const thisMonth = dayjs().format("YYYY-MM");
    const lastMonth = dayjs().subtract(1, "month").format("YYYY-MM");
    const revenueGrowth =
      (revenueByMonth[lastMonth]
        ? (
            ((revenueByMonth[thisMonth] - revenueByMonth[lastMonth]) /
              revenueByMonth[lastMonth]) *
            100
          ).toFixed(2)
        : 0) || 0;

    const utilityCharges = await prisma.utilityCharge.findMany({
      select: {
        month: true,
        totalCost: true,
        utilityType: { select: { name: true } }, // ✅ select the name
      },
    });

    const utilitySummary = {};
    utilityCharges.forEach((u) => {
      if (!utilitySummary[u.month]) utilitySummary[u.month] = {};
      const typeName = u.utilityType?.name || "Unknown";
      utilitySummary[u.month][typeName] =
        (utilitySummary[u.month][typeName] || 0) + u.totalCost;
    });

    // 5️⃣ Utility comparison
    const totalUtilityCost =
      (
        await prisma.utilityCharge.aggregate({
          _sum: { totalCost: true },
        })
      )?._sum.totalCost || 0;
    const totalUtilityPaid =
      (
        await prisma.utilityInvoice.aggregate({
          _sum: { amount: true },
        })
      )?._sum.amount || 0;
    const utilityComparison = {
      totalCost: totalUtilityCost,
      totalPaid: totalUtilityPaid,
      difference: totalUtilityCost - totalUtilityPaid,
    };

    // 6️⃣ Try block for optional models
    let roomsWithRent = [];
    let maintenanceSummary = [];
    let notificationSummary = [];
    let renewals = 0;
    let terminations = 0;
    let avgResolveTime = { _avg: { resolveTimeHours: 0 } };
    let avgDuration = { _avg: { durationMonths: 0 } };

    if (prisma.rent) {
      const rentRevenue = await prisma.rent.groupBy({
        by: ["roomId"],
        _sum: { amount: true },
      });
      roomsWithRent = await Promise.all(
        rentRevenue.map(async (r) => {
          const room = await prisma.room.findUnique({
            where: { roomId: r.roomId },
            select: { roomNumber: true, floor: true },
          });
          return {
            roomId: r.roomId,
            roomNumber: room?.roomNumber || "N/A",
            floor: room?.floor || "N/A",
            revenue: r._sum.amount || 0,
          };
        })
      );
    }

    if (prisma.maintenance) {
      const maintenanceCounts = await prisma.maintenance.groupBy({
        by: ["status"],
        _count: { status: true },
      });
      const total = maintenanceCounts.reduce(
        (sum, i) => sum + i._count.status,
        0
      );
      const maintenances = await prisma.maintenance.findMany({
        where: { maintenanceEndDate: { not: null } },
        select: { maintenanceStartDate: true, maintenanceEndDate: true },
      });

      const durations = maintenances.map(
        (m) =>
          (new Date(m.maintenanceEndDate) - new Date(m.maintenanceStartDate)) /
          (1000 * 60 * 60)
      );

      const avgResolveTime =
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0;
    }
    const notifications = await prisma.notification.groupBy({
      by: ["sentVia", "type"],
      _count: { notificationId: true },
    });

    notificationSummary = notifications.map((n) => ({
      channel: n.sentVia, // renamed for display
      type: n.type,
      count: n._count.notificationId,
    }));

    if (prisma.rental) {
      const contractEvents = await prisma.rental.groupBy({
        by: ["status"],
        _count: { status: true },
      });
      renewals =
        contractEvents.find((c) => c.status === "Renewed")?._count.status || 0;
      terminations =
        contractEvents.find((c) => c.status === "Terminated")?._count.status ||
        0;
      avgDuration = { _avg: { durationMonths: avgDuration } };
    }

    // ✅ Final report
    const report = {
      revenue: {
        monthlyRevenue,
        revenueByUtilityType: revenueByUtilityTypeArray,
        revenueGrowth,
        totalRevenue: payments.reduce((a, p) => a + p.amount, 0),
      },
      utilities: {
        summary: utilitySummary,
        comparison: utilityComparison,
      },
      rooms: { utilization: roomsWithRent },
      maintenance: {
        summary: maintenanceSummary,
        avgResolveTime,
      },
      notifications: notificationSummary,
      contracts: {
        renewals,
        terminations,
        avgDuration: avgDuration._avg.durationMonths || 0,
      },
    };

    res.status(200).json(report);
  } catch (error) {
    console.error("Report generation failed:", error);
    res.status(500).json({
      message: "Failed to generate report",
      error: error.message,
    });
  }
};
