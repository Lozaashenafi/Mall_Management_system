// src/api/rentals/rental.controller.js
import prisma from "../../config/prismaClient.js";
import rentalSchema from "./rental.schema.js";

export const createRental = async (req, res) => {
  try {
    const { error, value } = rentalSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const {
      tenantId,
      roomId,
      versionNumber,
      startDate,
      endDate,
      rentAmount,
      paymentDueDate,
      paymentInterval,
      status,
    } = value;

    // Check tenant
    const tenant = await prisma.tenant.findUnique({ where: { tenantId } });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    // Check room
    const room = await prisma.room.findUnique({ where: { roomId } });
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Prevent double-booking: if room is Occupied, reject
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

    // Transaction: create rental and mark room occupied
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
        },
      });

      await tx.room.update({
        where: { roomId },
        data: { status: "Occupied" },
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
 */
export const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await prisma.rental.findUnique({
      where: { rentId: Number(id) },
      include: {
        tenant: true,
        room: { include: { roomType: true } },
        invoices: true,
        agreementDocuments: true,
        maintenanceRequests: true,
      },
    });

    if (!rental) return res.status(404).json({ message: "Rental not found" });
    res.json({ success: true, rental });
  } catch (err) {
    console.error("getRentalById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Update a rental (partial updates only)
 * - validate payload
 * - do not allow roomId change via update (complex)
 * - if status becomes Expired or Terminated, update room.status -> Vacant
 */
export const updateRental = async (req, res) => {
  try {
    const { error, value } = rentalSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;

    // Fetch existing rental
    const existing = await prisma.rental.findUnique({
      where: { rentId: Number(id) },
    });
    if (!existing) return res.status(404).json({ message: "Rental not found" });

    // Prevent changing roomId here (if needed)
    if (req.body.roomId && Number(req.body.roomId) !== existing.roomId) {
      return res
        .status(400)
        .json({ message: "Changing roomId is not allowed via this endpoint." });
    }

    // Update rental
    const updated = await prisma.rental.update({
      where: { rentId: Number(id) },
      data: value,
      include: { tenant: true, room: true },
    });

    // If rental ended/terminated, free the room
    if (
      value.status &&
      (value.status === "Expired" || value.status === "Terminated")
    ) {
      await prisma.room.update({
        where: { roomId: updated.roomId },
        data: { status: "Vacant" },
      });
    }

    res.json({ success: true, message: "Rental updated", rental: updated });
  } catch (err) {
    console.error("updateRental error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Terminate rental early (soft termination):
 * - set status = Terminated
 * - set endDate = now()
 * - free the room (status -> Vacant)
 */
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

      return updatedRental;
    });

    res.json({ success: true, message: "Rental terminated", rental: result });
  } catch (err) {
    console.error("terminateRental error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Renew a rental:
 * - Typically create a new version (increment versionNumber) OR update endDate and rentAmount
 * - Here we will update endDate, rentAmount, versionNumber++ and status Active
 */
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

/**
 * Get rentals for a specific tenant
 */
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
