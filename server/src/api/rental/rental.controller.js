// src/api/rentals/rental.controller.js
import prisma from "../../config/prismaClient.js";
import rentalSchema from "./rental.schema.js";
import { createAuditLog } from "../../utils/audit.js";

export const createRental = async (req, res) => {
  try {
    const { error, value } = rentalSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const {
      tenantId,
      roomId,
      startDate,
      endDate,
      rentAmount,
      paymentDueDate,
      paymentInterval,
      status,
      selfManagedElectricity,
      utilityShare,
      includeWater,
      includeGenerator,
      includeElectricity,
      includeService,
    } = value;

    const tenant = await prisma.tenant.findUnique({ where: { tenantId } });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const room = await prisma.room.findUnique({ where: { roomId } });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.status === "Occupied") {
      return res.status(400).json({
        message:
          "Room is currently occupied. Choose another room or end existing rental.",
      });
    }
    if (room.status === "Maintenance") {
      return res
        .status(400)
        .json({ message: "Room is under maintenance. Choose another room." });
    }

    const lastRental = await prisma.rental.findFirst({
      where: { roomId, tenantId },
      orderBy: { versionNumber: "desc" },
    });
    const versionNumber = lastRental ? lastRental.versionNumber + 1 : 1;
    // Apply force rule before create
    const includeElectricityFinal =
      selfManagedElectricity === true ? false : includeElectricity ?? true;

    const result = await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.create({
        data: {
          tenantId,
          roomId,
          versionNumber,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          rentAmount,
          paymentDueDate,
          paymentInterval,
          status,
          selfManagedElectricity: selfManagedElectricity ?? false,
          utilityShare: utilityShare ?? null,
          includeWater: includeWater ?? true,
          includeElectricity: includeElectricityFinal,
          includeGenerator: includeGenerator ?? true,
          includeService: includeService ?? true,
        },
      });

      await tx.room.update({
        where: { roomId },
        data: { status: "Occupied" },
      });

      await createAuditLog({
        userId: req.user.userId,
        action: "created",
        tableName: "Rental",
        recordId: rental.rentId,
        newValue: rental,
      });

      return rental;
    });

    res
      .status(201)
      .json({ success: true, message: "Rental created", rental: result });
  } catch (err) {
    console.error("createRental error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get all rentals (with optional filters: tenantId, roomId, status)
 */
export const getRentals = async (req, res) => {
  try {
    const { tenantId, roomId, status } = req.query;
    const where = {};
    if (tenantId) where.tenantId = Number(tenantId);
    if (roomId) where.roomId = Number(roomId);
    if (status) where.status = status;

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        tenant: true,
        room: { include: { roomType: true } },
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, rentals });
  } catch (err) {
    console.error("getRentals error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get rental by id
 */ // GET /rentals/:id
export const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure rentId is a number
    const rentalId = Number(id);
    if (isNaN(rentalId)) {
      return res.status(400).json({ message: "Invalid rental ID" });
    }

    const rental = await prisma.rental.findUnique({
      where: { rentId: rentalId },
      include: {
        tenant: true,
        room: {
          include: {
            roomType: true, // includes typeName and typeDescription
            roomFeatures: {
              include: { featureType: true }, // includes name, description
            },
          },
        },
        invoices: {
          include: { payments: true }, // nested payments for each invoice
        },
        agreementDocuments: true,
        maintenanceRequests: true,
      },
    });

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    res.json({ success: true, rental });
  } catch (err) {
    console.error("getRentalById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateRental = async (req, res) => {
  try {
    const { error, value } = rentalSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;

    const existing = await prisma.rental.findUnique({
      where: { rentId: Number(id) },
    });
    if (!existing) return res.status(404).json({ message: "Rental not found" });

    const updateData = {};
    if (value.startDate) updateData.startDate = new Date(value.startDate);
    if (value.endDate) updateData.endDate = new Date(value.endDate);
    if (value.rentAmount !== undefined)
      updateData.rentAmount = Number(value.rentAmount);
    if (value.paymentDueDate !== undefined)
      updateData.paymentDueDate = Number(value.paymentDueDate);
    if (value.paymentInterval)
      updateData.paymentInterval = value.paymentInterval;

    // ✅ NEW FIELDS
    if (value.selfManagedElectricity !== undefined)
      updateData.selfManagedElectricity = value.selfManagedElectricity;
    if (value.utilityShare !== undefined)
      updateData.utilityShare = value.utilityShare;
    if (value.includeWater !== undefined)
      updateData.includeWater = value.includeWater;
    if (value.includeGenerator !== undefined)
      updateData.includeGenerator = value.includeGenerator;
    if (value.includeService !== undefined)
      updateData.includeService = value.includeService;
    if (value.includeElectricity !== undefined)
      updateData.includeElectricity = value.includeElectricity;

    if (value.selfManagedElectricity === true) {
      updateData.includeElectricity = false;
    }

    const updated = await prisma.rental.update({
      where: { rentId: Number(id) },
      data: updateData,
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "Rental",
      recordId: updated.rentId,
      oldValue: existing,
      newValue: updated,
    });

    res.json({ success: true, message: "Rental updated", rental: updated });
  } catch (err) {
    console.error("updateRental error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const terminateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await prisma.rental.findUnique({
      where: { rentId: Number(id) },
    });
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    if (rental.status === "Terminated") {
      return res.status(400).json({ message: "Rental already terminated" });
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updatedRental = await tx.rental.update({
        where: { rentId: Number(id) },
        data: { status: "Terminated", endDate: now },
      });

      await tx.room.update({
        where: { roomId: rental.roomId },
        data: { status: "Vacant" },
      });

      // ✅ Audit log
      await createAuditLog({
        userId: req.user.userId,
        action: "terminated",
        tableName: "Rental",
        recordId: updatedRental.rentId,
        oldValue: rental,
        newValue: updatedRental,
      });

      return updatedRental;
    });

    res.json({ success: true, message: "Rental terminated", rental: result });
  } catch (err) {
    console.error("terminateRental error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const renewRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { newEndDate, newRentAmount } = req.body;
    if (!newEndDate)
      return res.status(400).json({ message: "newEndDate is required" });

    const rental = await prisma.rental.findUnique({
      where: { rentId: Number(id) },
    });
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    const updated = await prisma.rental.update({
      where: { rentId: Number(id) },
      data: {
        endDate: new Date(newEndDate),
        ...(newRentAmount !== undefined && {
          rentAmount: Number(newRentAmount),
        }),
        versionNumber: rental.versionNumber + 1,
        status: "Active",
      },
    });

    res.json({ success: true, message: "Rental renewed", rental: updated });
  } catch (err) {
    console.error("renewRental error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getRentalsByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const rentals = await prisma.rental.findMany({
      where: { tenantId: Number(tenantId) },
      include: { room: { include: { roomType: true } } },
      orderBy: { startDate: "desc" },
    });
    res.json({ success: true, rentals });
  } catch (err) {
    console.error("getRentalsByTenant error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// get tenant active rental
export const getActiveRentalByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const rental = await prisma.rental.findFirst({
      where: { tenantId: Number(tenantId), status: "Active" },
      include: { room },
      orderBy: { startDate: "desc" },
    });
    res.json({ success: true, rental });
  } catch (err) {
    console.error("getActiveRentalByTenant error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
