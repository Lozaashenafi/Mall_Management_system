// src/api/rentals/rental.controller.js
import prisma from "../../config/prismaClient.js";
import rentalSchema from "./rental.schema.js";
import { createAuditLog } from "../../utils/audit.js";
import { stat } from "fs";

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
    if (new Date(startDate) >= new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date." });
    }

    const diffInDays =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

    if (diffInDays < 30) {
      return res.status(400).json({
        message: "Rental period must be at least 30 days.",
      });
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

export const getRentals = async (req, res) => {
  try {
    const { tenantId, roomId, status } = req.query;
    const where = {};
    if (tenantId) where.tenantId = Number(tenantId);
    if (roomId) where.roomId = Number(roomId);
    if (status) where.status = status;

    const rentals = await prisma.rental.findMany({
      where: {
        status: "Active",
      },
      include: {
        tenant: true,
        room: {
          include: {
            roomType: true,
          },
        },
        invoices: true,
      },
    });

    res.json({ success: true, rentals });
  } catch (err) {
    console.error("getRentals error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;

    const rentalId = Number(id);
    if (isNaN(rentalId)) {
      return res.status(400).json({ message: "Invalid rental ID" });
    }

    // Get the requested rental
    const rental = await prisma.rental.findUnique({
      where: { rentId: rentalId },
      include: {
        tenant: true,
        room: {
          include: {
            roomType: true,
            roomFeatures: {
              include: { featureType: true },
            },
          },
        },
        invoices: {
          include: { payments: true },
        },
        agreementDocuments: true,
        maintenanceRequests: true,
      },
    });

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Get the last expired rental for the same room
    const lastExpiredRental = await prisma.rental.findFirst({
      where: {
        roomId: rental.roomId,
        status: "Expired",
      },
      orderBy: { endDate: "desc" }, // latest expired first
      include: {
        tenant: true,
        invoices: {
          include: { payments: true },
        },
        agreementDocuments: true,
        maintenanceRequests: true,
      },
    });

    res.json({
      success: true,
      rental,
      lastExpiredRental,
    });
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
    if (new Date(value.startDate) >= new Date(value.endDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date." });
    }

    const diffInDays =
      (new Date(value.endDate) - new Date(value.startDate)) /
      (1000 * 60 * 60 * 24);

    if (diffInDays < 30) {
      return res.status(400).json({
        message: "Rental period must be at least 30 days.",
      });
    }

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

export const getRentalsByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const rentals = await prisma.rental.findMany({
      where: { tenantId: Number(tenantId), status: "Active" },
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
// ✅ renewRental controller (replace old one)
export const renewRental = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      newStartDate,
      newEndDate,
      newRentAmount,
      paymentInterval,
      paymentDueDate,
    } = req.body;

    if (!newStartDate || !newEndDate) {
      return res
        .status(400)
        .json({ message: "newStartDate and newEndDate are required" });
    }

    const oldRental = await prisma.rental.findUnique({
      where: { rentId: Number(id) },
      include: { tenant: true, room: true },
    });
    if (!oldRental)
      return res.status(404).json({ message: "Rental not found" });

    if (new Date(newStartDate) >= new Date(newEndDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    // ✅ Step 1: Expire old rental
    await prisma.rental.update({
      where: { rentId: oldRental.rentId },
      data: { status: "Expired" },
    });

    // ✅ Step 2: Create new version
    const newRental = await prisma.rental.create({
      data: {
        tenantId: oldRental.tenantId,
        roomId: oldRental.roomId,
        versionNumber: oldRental.versionNumber + 1,
        startDate: new Date(newStartDate),
        endDate: new Date(newEndDate),
        rentAmount: newRentAmount ?? oldRental.rentAmount,
        paymentDueDate: paymentDueDate ?? oldRental.paymentDueDate,
        paymentInterval: paymentInterval ?? oldRental.paymentInterval,
        status: "Active",
        selfManagedElectricity: oldRental.selfManagedElectricity,
        utilityShare: oldRental.utilityShare,
        includeWater: oldRental.includeWater,
        includeElectricity: oldRental.includeElectricity,
        includeGenerator: oldRental.includeGenerator,
        includeService: oldRental.includeService,
        previousRentId: oldRental.rentId,
      },
    });

    // ✅ Step 3: Update room status (stays Occupied)
    await prisma.room.update({
      where: { roomId: oldRental.roomId },
      data: { status: "Occupied" },
    });

    // ✅ Step 4: Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "renewed",
      tableName: "Rental",
      recordId: newRental.rentId,
      oldValue: oldRental,
      newValue: newRental,
    });

    res.json({
      success: true,
      message: "Rental renewed successfully",
      rental: newRental,
    });
  } catch (err) {
    console.error("renewRental error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
