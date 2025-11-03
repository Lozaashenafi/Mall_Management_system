import prisma from "../../config/prismaClient.js";
import dayjs from "dayjs";
import { createNotification } from "../notification/notification.service.js";

export const getMonthlyUtilitySummary = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2025-10"
    if (!month)
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });

    const start = dayjs(`${month}-01`).startOf("month").toDate();
    const end = dayjs(start).endOf("month").toDate();

    // Sum expenses by utility type
    const grouped = await prisma.utilityExpense.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const result = grouped.map((g) => ({
      type: g.type,
      total: g._sum.amount || 0,
    }));

    return res.json({ month, utilities: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching utility summary" });
  }
};
export const generateUtilityCharge = async (req, res) => {
  try {
    const { month } = req.body;
    console.log("Received body:", req.body);

    if (!month)
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });

    // ✅ Step 0: Prevent duplicate generation
    const existingCharges = await prisma.utilityCharge.findMany({
      where: { month },
    });
    if (existingCharges.length > 0) {
      return res.status(200).json({
        message: `Utility charges for ${month} have already been generated.`,
      });
    }

    // ✅ Step 1: Group all expenses by type
    const start = dayjs(`${month}-01`).startOf("month").toDate();
    const end = dayjs(start).endOf("month").toDate();

    const expenses = await prisma.utilityExpense.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: { date: { gte: start, lte: end } },
    });

    if (expenses.length === 0)
      return res
        .status(400)
        .json({ message: "No utility expenses found for this month" });

    // ✅ Step 2: Get all active rentals
    const rentals = await prisma.rental.findMany({
      where: { status: "Active" },
      include: { tenant: { include: { user: true } }, room: true },
    });

    if (rentals.length === 0)
      return res.status(400).json({ message: "No active rentals found" });

    // ✅ Step 3: Create UtilityCharge + invoices + notifications
    const createdCharges = [];

    for (const expense of expenses) {
      const utilityType = expense.type;
      const totalCost = expense._sum.amount || 0;

      const charge = await prisma.utilityCharge.create({
        data: {
          type: utilityType,
          month,
          totalCost,
          description: `Utility charge for ${utilityType} (${month})`,
          generated: true,
        },
      });

      const eligibleRentals = rentals.filter((r) => {
        if (utilityType === "Water") return r.includeWater;
        if (utilityType === "Electricity") return r.includeElectricity;
        if (utilityType === "Generator") return r.includeGenerator;
        if (utilityType === "Service") return r.includeService;
        return true;
      });

      const share =
        eligibleRentals.length > 0 ? totalCost / eligibleRentals.length : 0;

      for (const rental of eligibleRentals) {
        const utilityInvoice = await prisma.utilityInvoice.create({
          data: {
            utilityChargeId: charge.utilityChargeId,
            rentId: rental.rentId,
            amount: parseFloat(share.toFixed(2)),
            status: "UNPAID",
          },
        });
        // ✅ Send notification to tenant (via System)
        const message = `A new ${utilityType} utility invoice for ${month} has been generated. Your share is ${share.toFixed(
          2
        )} ETB.`;
        await createNotification({
          tenantId: rental.tenant.tenantId,
          userId: rental.tenant.userId,
          type: "UtilityAlert", // or "Invoice"
          message,
          sentVia: "System",
        });
      }
    }
    return res.status(201).json({
      message:
        "Utility charges, invoices, and notifications generated successfully",
    });
  } catch (err) {
    console.error("Error generating utility charges:", err);
    return res
      .status(500)
      .json({ message: "Error generating utility charges" });
  }
};

export const getUtilityCharges = async (req, res) => {
  try {
    const charges = await prisma.utilityCharge.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(charges);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching utility charges" });
  }
};
export const TenantsInvoiceOfthisMonth = async (req, res) => {
  try {
    const { month } = req.query; // e.g., "2025-10"
    if (!month)
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });

    const invoices = await prisma.utilityInvoice.findMany({
      where: {
        utilityCharge: { month },
      },
      include: {
        rental: {
          include: {
            tenant: true,
            room: true,
          },
        },
        utilityCharge: true,
      },
    });

    return res.json(invoices);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching tenants' utility invoices" });
  }
};

export const getUtilityChargesByMonth = async (req, res) => {
  try {
    const { month } = req.query; // e.g., "2025-10"
    if (!month)
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });

    const charges = await prisma.utilityCharge.findMany({
      where: { month },
      orderBy: { createdAt: "desc" },
    });

    return res.json(charges);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching utility charges" });
  }
};

export const getUtilityInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.utilityInvoice.findUnique({
      where: { id: Number(id) },
      include: {
        rental: {
          include: {
            tenant: true,
            room: true,
          },
        },
        utilityCharge: true,
      },
    });
    if (!invoice)
      return res.status(404).json({ message: "Utility invoice not found" });
    return res.json(invoice);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching utility invoice" });
  }
};

export const getInvoicesByUserId = async (req, res) => {
  try {
    // accept userId in params, query or body
    const rawUserId = req.params.userId ?? req.query.userId ?? req.body.userId;
    if (!rawUserId) {
      return res
        .status(400)
        .json({ message: "userId is required (params, query or body)" });
    }

    const userId = parseInt(rawUserId, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: "userId must be a number" });
    }

    // find the tenant for this user
    const tenant = await prisma.tenant.findFirst({
      where: { userId },
      select: {
        tenantId: true,
        companyName: true,
        contactPerson: true,
        email: true,
        phone: true,
        rental: {
          select: {
            rentId: true,
            roomId: true,
            startDate: true,
            endDate: true,
            rentAmount: true,
            status: true,
            // include related room basic info (optional)
            room: { select: { roomId: true, unitNumber: true, floor: true } },
            // invoices and their payments
            invoices: {
              select: {
                invoiceId: true,
                invoiceDate: true,
                dueDate: true,
                baseRent: true,
                taxAmount: true,
                totalAmount: true,
                status: true,
                createdAt: true,
                payments: {
                  select: {
                    paymentId: true,
                    amount: true,
                    paymentDate: true,
                    method: true,
                    reference: true,
                    status: true,
                  },
                },
              },
              orderBy: { invoiceDate: "desc" },
            },
            // utility invoices and their payments + the utilityCharge
            utilityInvoices: {
              select: {
                id: true,
                utilityChargeId: true,
                amount: true,
                paperInvoiceNumber: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                utilityCharge: {
                  select: {
                    utilityChargeId: true,
                    type: true,
                    month: true,
                    totalCost: true,
                  },
                },
                payments: {
                  select: {
                    paymentId: true,
                    amount: true,
                    paymentDate: true,
                    method: true,
                    reference: true,
                    status: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { startDate: "desc" }, // newest rental first
        },
      },
    });

    if (!tenant) {
      return res
        .status(404)
        .json({ message: "Tenant not found for the provided userId" });
    }

    // Optionally: transform / flatten response if you prefer a different shape
    // For now we return the tenant with rentals, each containing invoices & utility invoices
    return res.json({ tenant });
  } catch (error) {
    console.error("getInvoicesByUserId error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
