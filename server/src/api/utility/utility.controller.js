import prisma from "../../config/prismaClient.js";
import utilitySchema from "./utility.schema.js";
import { createAuditLog } from "../../utils/audit.js";
import { createNotification } from "../notification/notification.service.js";

export const createUtilityCharge = async (req, res) => {
  try {
    const { error, value } = utilitySchema.createCharge.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { type, month, totalCost, description } = value;

    // Check if already recorded for the same month/type
    const existing = await prisma.utilityCharge.findFirst({
      where: { type, month },
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "Charge already exists for this month and type" });

    const charge = await prisma.utilityCharge.create({
      data: { type, month, totalCost, description },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "UtilityCharge",
      recordId: charge.utilityChargeId,
      newValue: charge,
    });

    res
      .status(201)
      .json({ success: true, message: "Utility charge recorded", charge });
  } catch (err) {
    console.error("createUtilityCharge error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const distributeUtilityCost = async (req, res) => {
  try {
    const { error, value } = utilitySchema.distribute.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { utilityChargeId } = value;

    const charge = await prisma.utilityCharge.findUnique({
      where: { utilityChargeId },
    });
    if (!charge)
      return res.status(404).json({ message: "Utility charge not found" });

    // Get active rentals for the month
    const rentals = await prisma.rental.findMany({
      where: { status: "Active" },
      include: { tenant: true },
    });

    if (rentals.length === 0)
      return res
        .status(400)
        .json({ message: "No active rentals found to distribute cost" });

    const sharePerRental = charge.totalCost / rentals.length;

    const invoices = [];
    for (const rental of rentals) {
      const invoice = await prisma.utilityInvoice.create({
        data: {
          utilityChargeId: charge.utilityChargeId,
          rentId: rental.rentId,
          amount: sharePerRental,
          status: "UNPAID",
        },
      });

      invoices.push(invoice);

      // Optional: Notify tenant
      await createNotification({
        tenantId: rental.tenantId,
        type: "UtilityAlert",
        message: `A new ${charge.type} bill of $${sharePerRental.toFixed(
          2
        )} has been issued for ${charge.month}.`,
        sentVia: "System",
      });
    }

    res.json({
      success: true,
      message: `Utility cost distributed to ${rentals.length} rentals.`,
      total: charge.totalCost,
      eachShare: sharePerRental,
      invoices,
    });
  } catch (err) {
    console.error("distributeUtilityCost error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const getUtilityCharges = async (req, res) => {
  try {
    const charges = await prisma.utilityCharge.findMany({
      include: { utilityInvoices: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, charges });
  } catch (err) {
    console.error("getUtilityCharges error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const getUtilityInvoices = async (req, res) => {
  try {
    const { month, type } = req.query;
    const where = {};
    if (month) where.month = month;
    if (type) where.type = type;

    const invoices = await prisma.utilityInvoice.findMany({
      where: where,
      include: {
        rental: { include: { tenant: true, room: true } },
        utilityCharge: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, invoices });
  } catch (err) {
    console.error("getUtilityInvoices error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
