import prisma from "../../config/prismaClient.js";
import dayjs from "dayjs";
import { createNotification } from "../notification/notification.service.js";
import path from "path";
import { generateUtilityInvoicePdf } from "../../../pdfGenerator.utility.js";

export const downloadUtilityInvoicePdf = async (req, res) => {
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

    const pdfPath = await generateUtilityInvoicePdf(invoice);
    const absolutePath = path.join(process.cwd(), pdfPath);

    res.download(absolutePath, `utility-invoice-${invoice.id}.pdf`);
  } catch (err) {
    console.error("downloadUtilityInvoicePdf error:", err);
    res.status(500).json({
      message: "Failed to generate Utility Invoice PDF",
      error: err.message,
    });
  }
};
export const getMonthlyUtilitySummary = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2025-10"
    if (!month)
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });

    const start = dayjs(`${month}-01`).startOf("month").toDate();
    const end = dayjs(start).endOf("month").toDate();

    // 1️⃣ Group expenses by utilityTypeId
    const grouped = await prisma.utilityExpense.groupBy({
      by: ["utilityTypeId"],
      _sum: { amount: true },
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // 2️⃣ Fetch all utility types
    const types = await prisma.utilityType.findMany({
      select: { id: true, name: true },
    });

    // 3️⃣ Combine data (match grouped sums with type names)
    const result = types.map((type) => {
      const match = grouped.find((g) => g.utilityTypeId === type.id);
      return {
        utilityTypeId: type.id,
        name: type.name,
        total: match ? match._sum.amount || 0 : 0,
      };
    });

    return res.json({
      month,
      utilities: result,
    });
  } catch (err) {
    console.error("Error fetching monthly utility summary:", err);
    return res.status(500).json({
      message: "Error fetching utility summary",
      error: err.message,
    });
  }
};
export const generateUtilityCharge = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month)
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });

    // Prevent duplicate generation (any charges for this month)
    const existing = await prisma.utilityCharge.findMany({ where: { month } });
    if (existing.length > 0) {
      return res
        .status(200)
        .json({ message: `Utility charges for ${month} already generated.` });
    }
    const ALLOWED_TYPES = ["Water", "Generator", "Electricity"];

    const allUtilityTypes = await prisma.utilityType.findMany({
      select: { id: true, name: true },
    });

    const utilityTypes = allUtilityTypes.filter((u) =>
      ALLOWED_TYPES.includes(u.name)
    );

    if (utilityTypes.length === 0) {
      return res.status(400).json({
        message:
          "No allowed utility types found (Water, Generator, Electricity).",
      });
    }
    // Build maps
    const utilityById = Object.fromEntries(
      utilityTypes.map((u) => [u.id, u.name])
    ); // { id: name }
    // map utilityTypeId -> rental boolean field name (include{UtilityName})
    const includeFieldByTypeId = {};
    for (const u of utilityTypes) {
      // e.g. "Water" -> "includeWater"
      includeFieldByTypeId[u.id] = `include${u.name}`;
    }

    // Date range for month
    const start = dayjs(`${month}-01`).startOf("month").toDate();
    const end = dayjs(start).endOf("month").toDate();

    // Group expenses by utilityTypeId
    const expenses = await prisma.utilityExpense.groupBy({
      by: ["utilityTypeId"],
      _sum: { amount: true },
      where: { date: { gte: start, lte: end } },
    });

    if (!expenses || expenses.length === 0) {
      return res
        .status(400)
        .json({ message: "No utility expenses found for this month" });
    }

    // Get active rentals with tenant and room (room.size)
    const rentals = await prisma.rental.findMany({
      where: { status: "Active" },
      include: {
        tenant: { include: { user: true } },
        room: true,
      },
    });
    if (!rentals || rentals.length === 0) {
      return res.status(400).json({ message: "No active rentals found" });
    }

    const tenantCharges = {};
    const allowedExpenses = expenses.filter((e) =>
      ALLOWED_TYPES.includes(utilityById[e.utilityTypeId])
    );

    // For each expense (per utility type) compute shares and accumulate
    for (const exp of allowedExpenses) {
      const utilityTypeId = exp.utilityTypeId;
      const utilityName = utilityById[utilityTypeId] || `Type-${utilityTypeId}`;
      const totalCost = Number(exp._sum.amount || 0);

      // create utilityCharge record
      const charge = await prisma.utilityCharge.create({
        data: {
          utilityTypeId,
          month,
          totalCost,
          description: `Utility charge for ${utilityName} (${month})`,
          generated: true,
        },
      });

      // eligible rentals: those with rental[includeField] === true (default true if field missing)
      const includeField = includeFieldByTypeId[utilityTypeId];
      const eligible = rentals.filter((r) => {
        // if includeField doesn't exist on rental, assume true
        if (!(includeField in r)) return true;
        return Boolean(r[includeField]);
      });

      if (eligible.length === 0) {
        // nothing to allocate; continue
        continue;
      }

      // Partition eligible into with utilityShare and without
      const withShare = eligible.filter(
        (r) =>
          typeof r.utilityShare === "number" && !Number.isNaN(r.utilityShare)
      );
      const withoutShare = eligible.filter(
        (r) =>
          !(typeof r.utilityShare === "number" && !Number.isNaN(r.utilityShare))
      );

      // Sum of explicit shares
      const sumShares = withShare.reduce(
        (s, r) => s + (r.utilityShare || 0),
        0
      );

      // If sumShares >= 1, normalize shares among withShare and set remaining = 0
      let remaining = totalCost;
      const allocations = []; // interim: { rentId, amount }

      if (withShare.length > 0) {
        if (sumShares >= 1) {
          // normalize: proportionally divide totalCost among withShare by their share weights
          const totalWeight = withShare.reduce(
            (s, r) => s + (r.utilityShare || 0),
            0
          );
          for (const r of withShare) {
            const weight = r.utilityShare || 0;
            const amt = Number((totalCost * (weight / totalWeight)).toFixed(2));
            allocations.push({ rentId: r.rentId, amount: amt });
            remaining -= amt;
          }
        } else {
          // allocate explicit shares first
          for (const r of withShare) {
            const amt = Number((totalCost * (r.utilityShare || 0)).toFixed(2));
            allocations.push({ rentId: r.rentId, amount: amt });
            remaining -= amt;
          }
        }
      }
      // Now distribute remaining among withoutShare using room.size or equal fallback
      if (remaining > 0 && withoutShare.length > 0) {
        // Check if any sizes available among withoutShare
        const totalSize = withoutShare.reduce((s, r) => {
          const sz =
            r.room && typeof r.room.size === "number" ? Number(r.room.size) : 0;
          return s + sz;
        }, 0);

        if (totalSize > 0) {
          // distribute by size
          for (const r of withoutShare) {
            const sz =
              r.room && typeof r.room.size === "number"
                ? Number(r.room.size)
                : 0;
            const amt = Number((remaining * (sz / totalSize)).toFixed(2));
            allocations.push({ rentId: r.rentId, amount: amt });
          }
        } else {
          // equal split among withoutShare
          const per = Number((remaining / withoutShare.length).toFixed(2));
          for (const r of withoutShare) {
            allocations.push({ rentId: r.rentId, amount: per });
          }
        }
      }

      // Adjust rounding: ensure allocations sum equals totalCost
      const sumAllocated = allocations.reduce((s, a) => s + a.amount, 0);
      const roundingDiff = Number((totalCost - sumAllocated).toFixed(2));
      if (Math.abs(roundingDiff) >= 0.01) {
        // apply roundingDiff to last allocation (or add one if none)
        if (allocations.length > 0) {
          allocations[allocations.length - 1].amount = Number(
            (allocations[allocations.length - 1].amount + roundingDiff).toFixed(
              2
            )
          );
        } else {
          // no allocations? skip
        }
      }

      // Append allocations to tenantCharges
      for (const a of allocations) {
        const rentId = Number(a.rentId);
        const amount = Number(a.amount);

        if (!tenantCharges[rentId]) {
          tenantCharges[rentId] = {
            details: [],
            total: 0,
            chargeIds: new Set(),
          };
        }
        tenantCharges[rentId].details.push({
          type: utilityName,
          amount,
          chargeId: charge.utilityChargeId,
        });
        tenantCharges[rentId].total = Number(
          (tenantCharges[rentId].total + amount).toFixed(2)
        );
        tenantCharges[rentId].chargeIds.add(charge.utilityChargeId);
      }
    } // end for each expense

    for (const rentIdStr of Object.keys(tenantCharges)) {
      const rentId = Number(rentIdStr);
      const data = tenantCharges[rentId];

      // Build correct perType mapping
      const perType = {};
      for (const d of data.details) {
        if (!perType[d.type]) {
          perType[d.type] = { amount: 0, chargeId: d.chargeId };
        }
        perType[d.type].amount += d.amount;
      }

      // Create correct invoices
      for (const [type, info] of Object.entries(perType)) {
        const { amount, chargeId } = info;

        if (amount <= 0) continue;

        await prisma.utilityInvoice.create({
          data: {
            rentId,
            utilityChargeId: chargeId, // <-- correct chargeId
            amount: Number(amount.toFixed(2)),
            description: `${type} charge for ${month}: ${amount.toFixed(
              2
            )} ETB`,
            status: "UNPAID",
          },
        });
      }

      // Send notification once
      const rental = rentals.find((r) => r.rentId === rentId);
      if (rental && rental.tenant) {
        await createNotification({
          tenantId: rental.tenant.tenantId,
          userId: rental.tenant.userId,
          type: "UtilityAlert",
          message: `Your utility invoices for ${month} are generated.`,
          sentVia: "System",
        });
      }
    }

    return res.status(201).json({
      message: "Utility invoices generated successfully (combined per tenant).",
    });
  } catch (err) {
    console.error("Error generating utility charges:", err);
    return res.status(500).json({
      message: "Error generating utility charges",
      error: err.message,
    });
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
                    utilityTypeId: true,
                    month: true,
                    totalCost: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    generated: true,
                    utilityType: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                      },
                    },
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

    return res.json({ tenant });
  } catch (error) {
    console.error("getInvoicesByUserId error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
